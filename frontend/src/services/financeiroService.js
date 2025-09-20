import api from './api';

const financeiroService = {
  // Dashboard Financeiro
  buscarDashboard: async () => {
    try {
      const response = await api.get('/financeiro/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar dashboard financeiro' };
    }
  },

  // Transações Financeiras
  listarTransacoes: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/transacoes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar transações' };
    }
  },

  buscarTransacao: async (id) => {
    try {
      const response = await api.get(`/financeiro/transacoes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar transação' };
    }
  },

  criarTransacao: async (transacaoData) => {
    try {
      const response = await api.post('/financeiro/transacoes', transacaoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar transação' };
    }
  },

  atualizarTransacao: async (id, transacaoData) => {
    try {
      const response = await api.put(`/financeiro/transacoes/${id}`, transacaoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao atualizar transação' };
    }
  },

  excluirTransacao: async (id) => {
    try {
      const response = await api.delete(`/financeiro/transacoes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao excluir transação' };
    }
  },

  // Contas a Pagar
  listarContasPagar: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/contas-pagar', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar contas a pagar' };
    }
  },

  criarContaPagar: async (contaData) => {
    try {
      const response = await api.post('/financeiro/contas-pagar', contaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar conta a pagar' };
    }
  },

  pagarConta: async (id, pagamentoData) => {
    try {
      const response = await api.post(`/financeiro/contas-pagar/${id}/pagar`, pagamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao efetuar pagamento' };
    }
  },

  // Contas a Receber
  listarContasReceber: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/contas-receber', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar contas a receber' };
    }
  },

  criarContaReceber: async (contaData) => {
    try {
      const response = await api.post('/financeiro/contas-receber', contaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar conta a receber' };
    }
  },

  receberConta: async (id, recebimentoData) => {
    try {
      const response = await api.post(`/financeiro/contas-receber/${id}/receber`, recebimentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao efetuar recebimento' };
    }
  },

  // Fluxo de Caixa
  buscarFluxoCaixa: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/fluxo-caixa', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar fluxo de caixa' };
    }
  },

  buscarProjecaoFluxoCaixa: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/fluxo-caixa/projecao', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar projeção de fluxo de caixa' };
    }
  },

  // Orçamentos
  listarOrcamentos: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/orcamentos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar orçamentos' };
    }
  },

  buscarOrcamento: async (id) => {
    try {
      const response = await api.get(`/financeiro/orcamentos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar orçamento' };
    }
  },

  criarOrcamento: async (orcamentoData) => {
    try {
      const response = await api.post('/financeiro/orcamentos', orcamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar orçamento' };
    }
  },

  atualizarOrcamento: async (id, orcamentoData) => {
    try {
      const response = await api.put(`/financeiro/orcamentos/${id}`, orcamentoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao atualizar orçamento' };
    }
  },

  aprovarOrcamento: async (id) => {
    try {
      const response = await api.post(`/financeiro/orcamentos/${id}/aprovar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao aprovar orçamento' };
    }
  },

  // Categorias Financeiras
  listarCategorias: async () => {
    try {
      const response = await api.get('/financeiro/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar categorias' };
    }
  },

  criarCategoria: async (categoriaData) => {
    try {
      const response = await api.post('/financeiro/categorias', categoriaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar categoria' };
    }
  },

  // Centros de Custo
  listarCentrosCusto: async () => {
    try {
      const response = await api.get('/financeiro/centros-custo');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar centros de custo' };
    }
  },

  criarCentroCusto: async (centroData) => {
    try {
      const response = await api.post('/financeiro/centros-custo', centroData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar centro de custo' };
    }
  },

  // Relatórios Financeiros
  buscarRelatorioResultado: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/relatorios/resultado', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar relatório de resultado' };
    }
  },

  buscarRelatorioBalanco: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/relatorios/balanco', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar balanço' };
    }
  },

  buscarRelatorioFluxoCaixa: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/relatorios/fluxo-caixa', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar relatório de fluxo de caixa' };
    }
  },

  // Conciliação Bancária
  listarConciliacoes: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/conciliacoes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar conciliações' };
    }
  },

  criarConciliacao: async (conciliacaoData) => {
    try {
      const response = await api.post('/financeiro/conciliacoes', conciliacaoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar conciliação' };
    }
  },

  // Contratos Financeiros
  listarContratosFinanceiros: async (params = {}) => {
    try {
      const response = await api.get('/financeiro/contratos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar contratos financeiros' };
    }
  },

  criarContratoFinanceiro: async (contratoData) => {
    try {
      const response = await api.post('/financeiro/contratos', contratoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar contrato financeiro' };
    }
  },

  // Análise Financeira por Edital
  buscarAnaliseEdital: async (editalId) => {
    try {
      const response = await api.get(`/financeiro/analise/edital/${editalId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar análise financeira do edital' };
    }
  },

  calcularViabilidadeFinanceira: async (editalId, parametros = {}) => {
    try {
      const response = await api.post(`/financeiro/analise/viabilidade/${editalId}`, parametros);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao calcular viabilidade financeira' };
    }
  }
};

export default financeiroService;