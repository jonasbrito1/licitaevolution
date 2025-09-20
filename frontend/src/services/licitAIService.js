import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class LicitAIService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/licitai`,
      timeout: 30000, // 30 segundos para análises
    });

    // Interceptador para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptador para tratamento de erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirecionar para login ou renovar token
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Análise completa de edital
   */
  async analisarEditalCompleto(editalData, empresaData, historicoData = null) {
    try {
      const response = await this.api.post('/analyze/complete', {
        editalData,
        empresaData,
        historicoData
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na análise completa do edital');
    }
  }

  /**
   * Consulta geral via chat
   */
  async consultaGeral(pergunta, contexto = null) {
    try {
      const response = await this.api.post('/chat/consult', {
        pergunta,
        contexto
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na consulta geral');
    }
  }

  /**
   * Análise de documento com upload
   */
  async analisarDocumento(arquivo, tipoAnalise = 'geral') {
    try {
      const formData = new FormData();
      formData.append('document', arquivo);
      formData.append('tipoAnalise', tipoAnalise);

      const response = await this.api.post('/analyze/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minuto para upload e processamento
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na análise do documento');
    }
  }

  /**
   * Estratégia de participação
   */
  async gerarEstrategiaParticipacao(editalData, empresaData, concorrentes = null) {
    try {
      const response = await this.api.post('/analyze/strategy', {
        editalData,
        empresaData,
        concorrentes
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na geração de estratégia');
    }
  }

  /**
   * Análise de conformidade e riscos
   */
  async analisarRiscosConformidade(editalData, empresaData) {
    try {
      const response = await this.api.post('/analyze/compliance', {
        editalData,
        empresaData
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na análise de conformidade');
    }
  }

  /**
   * Previsão de tendências de mercado
   */
  async preverTendenciasMercado(setorEconomico, regiao = null, historicoLicitacoes = null) {
    try {
      const response = await this.api.post('/analyze/market', {
        setorEconomico,
        regiao,
        historicoLicitacoes
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro na análise de tendências');
    }
  }

  /**
   * Buscar histórico de análises
   */
  async buscarHistorico(page = 1, limit = 10, type = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (type) {
        params.append('type', type);
      }

      const response = await this.api.get(`/history?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar histórico');
    }
  }

  /**
   * Buscar estatísticas do LicitAI
   */
  async buscarEstatisticas() {
    try {
      const response = await this.api.get('/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar estatísticas');
    }
  }

  /**
   * Validar dados de edital
   */
  validarDadosEdital(editalData) {
    const camposObrigatorios = [
      'numero',
      'objeto',
      'modalidade',
      'valor_estimado',
      'prazo_entrega',
      'data_abertura'
    ];

    const camposFaltantes = camposObrigatorios.filter(
      campo => !editalData[campo] || editalData[campo] === ''
    );

    if (camposFaltantes.length > 0) {
      throw new Error(
        `Campos obrigatórios faltantes no edital: ${camposFaltantes.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validar dados da empresa
   */
  validarDadosEmpresa(empresaData) {
    const camposObrigatorios = [
      'cnpj',
      'razao_social',
      'porte_empresa',
      'ramo_atividade'
    ];

    const camposFaltantes = camposObrigatorios.filter(
      campo => !empresaData[campo] || empresaData[campo] === ''
    );

    if (camposFaltantes.length > 0) {
      throw new Error(
        `Campos obrigatórios faltantes na empresa: ${camposFaltantes.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Formatar dados do edital para análise
   */
  formatarDadosEdital(editalData) {
    return {
      numero: editalData.numero,
      objeto: editalData.objeto,
      modalidade: editalData.modalidade,
      valor_estimado: parseFloat(editalData.valor_estimado || 0),
      prazo_entrega: editalData.prazo_entrega,
      data_abertura: editalData.data_abertura,
      criterio_julgamento: editalData.criterio_julgamento || 'menor_preco',
      reserva_me_epp: editalData.reserva_me_epp || false,
      exigencias_tecnicas: editalData.exigencias_tecnicas || [],
      documentos_habilitacao: editalData.documentos_habilitacao || [],
      local_execucao: editalData.local_execucao || '',
      orgao: editalData.orgao || '',
      categoria: editalData.categoria || ''
    };
  }

  /**
   * Formatar dados da empresa para análise
   */
  formatarDadosEmpresa(empresaData) {
    return {
      cnpj: empresaData.cnpj,
      razao_social: empresaData.razao_social,
      nome_fantasia: empresaData.nome_fantasia || '',
      porte_empresa: empresaData.porte_empresa,
      ramo_atividade: empresaData.ramo_atividade,
      capital_social: parseFloat(empresaData.capital_social || 0),
      ano_fundacao: empresaData.ano_fundacao,
      experiencia_anos: empresaData.experiencia_anos || 0,
      certificacoes: empresaData.certificacoes || [],
      contratos_anteriores: empresaData.contratos_anteriores || [],
      capacidade_tecnica: empresaData.capacidade_tecnica || {},
      situacao_fiscal: empresaData.situacao_fiscal || 'regular'
    };
  }

  /**
   * Tratamento de erros centralizado
   */
  handleError(error, mensagemPadrao = 'Erro na operação') {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error(mensagemPadrao);
  }

  /**
   * Verificar status do serviço LicitAI
   */
  async verificarStatus() {
    try {
      const response = await this.api.get('/stats');
      return {
        status: 'online',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obter modelos de análise disponíveis
   */
  getModelosAnalise() {
    return [
      {
        id: 'complete',
        nome: 'Análise Completa',
        descricao: 'Análise detalhada com estratégias e recomendações',
        tempo_estimado: '2-3 minutos'
      },
      {
        id: 'document',
        nome: 'Análise de Documentos',
        descricao: 'Processamento e análise de documentos PDF',
        tempo_estimado: '1-2 minutos'
      },
      {
        id: 'strategy',
        nome: 'Estratégia de Participação',
        descricao: 'Estratégias personalizadas para licitação',
        tempo_estimado: '2-4 minutos'
      },
      {
        id: 'compliance',
        nome: 'Análise de Conformidade',
        descricao: 'Verificação de riscos e conformidade',
        tempo_estimado: '1-2 minutos'
      },
      {
        id: 'market',
        nome: 'Tendências de Mercado',
        descricao: 'Previsões e análises de mercado',
        tempo_estimado: '3-5 minutos'
      }
    ];
  }
}

export default new LicitAIService();