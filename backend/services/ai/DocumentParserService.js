const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');
const { Anthropic } = require('@anthropic-ai/sdk');

class DocumentParserService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4000;
  }

  /**
   * Analisa documento PDF de edital usando Claude AI
   */
  async parseEditalDocument(filePath, editalId) {
    try {
      logger.info(`📄 Iniciando análise do documento: ${filePath}`);

      // Verificar se arquivo existe
      const exists = await this.fileExists(filePath);
      if (!exists) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      // Para PDFs, precisamos extrair texto primeiro
      const textContent = await this.extractTextFromPDF(filePath);

      // Analisar conteúdo com Claude AI
      const parsedData = await this.analyzeDocumentContent(textContent, editalId);

      logger.info(`✅ Documento analisado com sucesso: ${filePath}`);
      return parsedData;

    } catch (error) {
      logger.error(`❌ Erro ao analisar documento ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se arquivo existe
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrai texto de PDF (simulação - em produção usar biblioteca como pdf2pic + OCR)
   */
  async extractTextFromPDF(filePath) {
    try {
      // TODO: Implementar extração real de PDF
      // Por enquanto, retorna texto simulado
      logger.info(`📖 Extraindo texto do PDF: ${filePath}`);

      // Em produção, usar bibliotecas como:
      // - pdf-parse para PDFs com texto
      // - pdf2pic + tesseract.js para PDFs escaneados
      // - pdfjs-dist para análise mais detalhada

      return `
EDITAL DE LICITAÇÃO Nº XXX/2024
PROCESSO ADMINISTRATIVO Nº XXX

OBJETO: Contratação de empresa especializada para prestação de serviços de desenvolvimento de sistema de gestão empresarial.

MODALIDADE: Pregão Eletrônico

VALOR ESTIMADO: R$ 250.000,00

PRAZO DE EXECUÇÃO: 12 (doze) meses

DOCUMENTOS EXIGIDOS:
- Certidão de regularidade fiscal
- Comprovação de capacidade técnica
- Atestado de capacidade operacional

CRITÉRIO DE JULGAMENTO: Menor preço global

DATA DE ABERTURA: 15/02/2024 às 14:00h

QUESTIONAMENTOS: Até 5 dias úteis antes da abertura
IMPUGNAÇÕES: Até 3 dias úteis antes da abertura

PARTICIPAÇÃO ME/EPP: Permitida
SUBCONTRATAÇÃO: Permitida até 30%
CONSÓRCIO: Não permitido
      `;

    } catch (error) {
      logger.error('Erro ao extrair texto do PDF:', error);
      throw error;
    }
  }

  /**
   * Analisa conteúdo do documento com Claude AI
   */
  async analyzeDocumentContent(textContent, editalId) {
    const prompt = `
Analise este edital de licitação e extraia todas as informações estruturadas:

TEXTO DO EDITAL:
${textContent}

Extraia e organize as seguintes informações em formato JSON:

{
  "identificacao": {
    "numero_edital": "número do edital",
    "numero_processo": "número do processo",
    "modalidade": "tipo de modalidade",
    "orgao": "nome do órgão"
  },
  "objeto": {
    "descricao": "descrição completa do objeto",
    "tipo_servico": "categoria do serviço",
    "especificacoes_tecnicas": ["especificação 1", "especificação 2"]
  },
  "valores": {
    "valor_estimado": 0,
    "valor_minimo": 0,
    "valor_maximo": 0,
    "moeda": "BRL"
  },
  "datas_importantes": {
    "data_publicacao": "YYYY-MM-DD",
    "data_abertura": "YYYY-MM-DD HH:mm",
    "data_questionamento": "YYYY-MM-DD",
    "data_impugnacao": "YYYY-MM-DD",
    "data_entrega_documentos": "YYYY-MM-DD"
  },
  "prazos": {
    "prazo_execucao": "prazo de execução",
    "prazo_vigencia": "prazo de vigência",
    "local_execucao": "local de execução"
  },
  "requisitos": {
    "documentos_exigidos": ["documento 1", "documento 2"],
    "qualificacao_tecnica": ["requisito 1", "requisito 2"],
    "qualificacao_economica": ["requisito 1", "requisito 2"],
    "habilitacao_juridica": ["requisito 1", "requisito 2"]
  },
  "configuracoes": {
    "criterio_julgamento": "critério de julgamento",
    "permite_subcontratacao": true/false,
    "percentual_subcontratacao": 0,
    "participacao_consorcio": true/false,
    "permite_me_epp": true/false,
    "tipo_licitacao": "tipo específico"
  },
  "contato": {
    "responsavel": "nome do responsável",
    "telefone": "telefone",
    "email": "email",
    "endereco": "endereço completo"
  },
  "anexos": {
    "termo_referencia": "URL ou nome do arquivo",
    "minuta_contrato": "URL ou nome do arquivo",
    "planilha_custos": "URL ou nome do arquivo"
  }
}

IMPORTANTE: Extraia apenas informações que estão explicitamente no texto. Se uma informação não estiver disponível, use null.`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);

        // Validar e complementar dados
        return this.validateAndEnhanceParsedData(parsedData, editalId);
      }

      throw new Error('Resposta inválida do Claude AI na análise do documento');
    } catch (error) {
      logger.error('Erro ao analisar conteúdo do documento:', error);
      return this.getDefaultParsedData(editalId);
    }
  }

  /**
   * Valida e complementa dados extraídos
   */
  validateAndEnhanceParsedData(parsedData, editalId) {
    try {
      // Validações básicas
      const validated = {
        edital_id: editalId,
        numero_edital: parsedData.identificacao?.numero_edital || null,
        numero_processo: parsedData.identificacao?.numero_processo || null,
        modalidade: parsedData.identificacao?.modalidade || 'não_identificado',
        orgao_nome: parsedData.identificacao?.orgao || null,

        objeto: parsedData.objeto?.descricao || null,
        tipo_servico: parsedData.objeto?.tipo_servico || null,
        especificacoes_tecnicas: parsedData.objeto?.especificacoes_tecnicas || [],

        valor_estimado: this.parseNumericValue(parsedData.valores?.valor_estimado),
        valor_minimo: this.parseNumericValue(parsedData.valores?.valor_minimo),
        valor_maximo: this.parseNumericValue(parsedData.valores?.valor_maximo),

        data_publicacao: this.parseDate(parsedData.datas_importantes?.data_publicacao),
        data_abertura: this.parseDateTime(parsedData.datas_importantes?.data_abertura),
        data_questionamento: this.parseDate(parsedData.datas_importantes?.data_questionamento),
        data_impugnacao: this.parseDate(parsedData.datas_importantes?.data_impugnacao),
        data_entrega_documentos: this.parseDate(parsedData.datas_importantes?.data_entrega_documentos),

        prazo_execucao: parsedData.prazos?.prazo_execucao || null,
        prazo_vigencia: parsedData.prazos?.prazo_vigencia || null,
        local_execucao: parsedData.prazos?.local_execucao || null,

        documentos_exigidos: parsedData.requisitos?.documentos_exigidos || [],
        requisitos_habilitacao: {
          qualificacao_tecnica: parsedData.requisitos?.qualificacao_tecnica || [],
          qualificacao_economica: parsedData.requisitos?.qualificacao_economica || [],
          habilitacao_juridica: parsedData.requisitos?.habilitacao_juridica || []
        },

        criterio_julgamento: parsedData.configuracoes?.criterio_julgamento || null,
        permite_subcontratacao: parsedData.configuracoes?.permite_subcontratacao || false,
        percentual_subcontratacao: parsedData.configuracoes?.percentual_subcontratacao || 0,
        participacao_consorcio: parsedData.configuracoes?.participacao_consorcio || false,
        permite_me_epp: parsedData.configuracoes?.permite_me_epp || true,
        tipo_licitacao: parsedData.configuracoes?.tipo_licitacao || null,

        orgao_contato: {
          responsavel: parsedData.contato?.responsavel || null,
          telefone: parsedData.contato?.telefone || null,
          email: parsedData.contato?.email || null,
          endereco: parsedData.contato?.endereco || null
        },

        arquivos_anexos: parsedData.anexos || {},

        // Metadados da análise
        analise_metadata: {
          data_analise: new Date().toISOString(),
          versao_parser: '1.0',
          confiabilidade: this.calculateConfidenceScore(parsedData)
        }
      };

      return validated;
    } catch (error) {
      logger.error('Erro ao validar dados extraídos:', error);
      return this.getDefaultParsedData(editalId);
    }
  }

  /**
   * Converte valor numérico
   */
  parseNumericValue(value) {
    if (!value) return null;

    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      // Remove formatação brasileira (R$, pontos, vírgulas)
      const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  /**
   * Converte data
   */
  parseDate(dateString) {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  /**
   * Converte data e hora
   */
  parseDateTime(dateTimeString) {
    if (!dateTimeString) return null;

    try {
      const date = new Date(dateTimeString);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Calcula score de confiabilidade da análise
   */
  calculateConfidenceScore(parsedData) {
    let score = 0;
    const maxScore = 10;

    // Verificar presença de campos importantes
    if (parsedData.identificacao?.numero_edital) score += 1;
    if (parsedData.identificacao?.modalidade) score += 1;
    if (parsedData.objeto?.descricao) score += 2;
    if (parsedData.valores?.valor_estimado) score += 1;
    if (parsedData.datas_importantes?.data_abertura) score += 2;
    if (parsedData.requisitos?.documentos_exigidos?.length > 0) score += 1;
    if (parsedData.configuracoes?.criterio_julgamento) score += 1;
    if (parsedData.prazos?.prazo_execucao) score += 1;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Dados padrão em caso de erro na análise
   */
  getDefaultParsedData(editalId) {
    return {
      edital_id: editalId,
      numero_edital: null,
      numero_processo: null,
      modalidade: 'não_identificado',
      orgao_nome: null,
      objeto: null,
      tipo_servico: null,
      especificacoes_tecnicas: [],
      valor_estimado: null,
      valor_minimo: null,
      valor_maximo: null,
      data_publicacao: null,
      data_abertura: null,
      data_questionamento: null,
      data_impugnacao: null,
      data_entrega_documentos: null,
      prazo_execucao: null,
      prazo_vigencia: null,
      local_execucao: null,
      documentos_exigidos: [],
      requisitos_habilitacao: {
        qualificacao_tecnica: [],
        qualificacao_economica: [],
        habilitacao_juridica: []
      },
      criterio_julgamento: null,
      permite_subcontratacao: false,
      percentual_subcontratacao: 0,
      participacao_consorcio: false,
      permite_me_epp: true,
      tipo_licitacao: null,
      orgao_contato: {
        responsavel: null,
        telefone: null,
        email: null,
        endereco: null
      },
      arquivos_anexos: {},
      analise_metadata: {
        data_analise: new Date().toISOString(),
        versao_parser: '1.0',
        confiabilidade: 0,
        erro: 'Falha na análise automática'
      }
    };
  }

  /**
   * Analisa múltiplos documentos de um edital
   */
  async parseMultipleDocuments(documentPaths, editalId) {
    try {
      logger.info(`📚 Analisando ${documentPaths.length} documentos do edital ${editalId}`);

      const results = await Promise.allSettled(
        documentPaths.map(filePath => this.parseEditalDocument(filePath, editalId))
      );

      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      if (failed.length > 0) {
        logger.warn(`⚠️ ${failed.length} documentos falharam na análise`);
      }

      logger.info(`✅ ${successful.length} documentos analisados com sucesso`);
      return {
        successful: successful,
        failed: failed,
        summary: this.mergeParsedDocuments(successful)
      };

    } catch (error) {
      logger.error('Erro ao analisar múltiplos documentos:', error);
      throw error;
    }
  }

  /**
   * Consolida dados de múltiplos documentos
   */
  mergeParsedDocuments(parsedDocuments) {
    if (parsedDocuments.length === 0) {
      return null;
    }

    if (parsedDocuments.length === 1) {
      return parsedDocuments[0];
    }

    // Combinar dados de múltiplos documentos
    const merged = { ...parsedDocuments[0] };

    for (let i = 1; i < parsedDocuments.length; i++) {
      const doc = parsedDocuments[i];

      // Combinar arrays
      merged.especificacoes_tecnicas = [
        ...new Set([...merged.especificacoes_tecnicas, ...doc.especificacoes_tecnicas])
      ];

      merged.documentos_exigidos = [
        ...new Set([...merged.documentos_exigidos, ...doc.documentos_exigidos])
      ];

      // Combinar objetos
      merged.requisitos_habilitacao = {
        qualificacao_tecnica: [
          ...new Set([
            ...merged.requisitos_habilitacao.qualificacao_tecnica,
            ...doc.requisitos_habilitacao.qualificacao_tecnica
          ])
        ],
        qualificacao_economica: [
          ...new Set([
            ...merged.requisitos_habilitacao.qualificacao_economica,
            ...doc.requisitos_habilitacao.qualificacao_economica
          ])
        ],
        habilitacao_juridica: [
          ...new Set([
            ...merged.requisitos_habilitacao.habilitacao_juridica,
            ...doc.requisitos_habilitacao.habilitacao_juridica
          ])
        ]
      };

      // Combinar anexos
      merged.arquivos_anexos = { ...merged.arquivos_anexos, ...doc.arquivos_anexos };

      // Usar valores não nulos
      Object.keys(doc).forEach(key => {
        if (doc[key] !== null && merged[key] === null) {
          merged[key] = doc[key];
        }
      });
    }

    return merged;
  }
}

module.exports = DocumentParserService;