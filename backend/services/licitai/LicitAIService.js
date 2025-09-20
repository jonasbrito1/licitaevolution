const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');

class LicitAIService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4000;

    // Prompts especializados
    this.prompts = {
      analiseCompleta: this.getAnaliseCompletaPrompt(),
      consultaGeral: this.getConsultaGeralPrompt(),
      analiseDocumento: this.getAnaliseDocumentoPrompt(),
      estrategiaParticipacao: this.getEstrategiaParticipacaoPrompt(),
      riscoCompliance: this.getRiscoCompliancePrompt(),
      previsaoMercado: this.getPrevisaoMercadoPrompt()
    };
  }

  /**
   * Análise completa e especializada de edital
   */
  async analisarEditalCompleto(editalData, empresaData, historicoData = null) {
    try {
      logger.info('🤖 LicitAI: Iniciando análise completa do edital');

      const prompt = this.prompts.analiseCompleta
        .replace('{EDITAL_DATA}', JSON.stringify(editalData, null, 2))
        .replace('{EMPRESA_DATA}', JSON.stringify(empresaData, null, 2))
        .replace('{HISTORICO_DATA}', JSON.stringify(historicoData, null, 2));

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const analise = this.parseAnaliseCompleta(response.content[0].text);

      logger.info('✅ LicitAI: Análise completa concluída');
      return analise;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na análise completa:', error);
      throw new Error('Erro na análise do LicitAI: ' + error.message);
    }
  }

  /**
   * Consulta geral sobre licitações - Chat inteligente
   */
  async consultaGeral(pergunta, contexto = null) {
    try {
      logger.info('💬 LicitAI: Processando consulta geral');

      const prompt = this.prompts.consultaGeral
        .replace('{PERGUNTA}', pergunta)
        .replace('{CONTEXTO}', contexto ? JSON.stringify(contexto, null, 2) : 'Nenhum contexto específico');

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const resposta = this.parseConsultaGeral(response.content[0].text);

      logger.info('✅ LicitAI: Consulta geral processada');
      return resposta;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na consulta geral:', error);
      throw new Error('Erro na consulta do LicitAI: ' + error.message);
    }
  }

  /**
   * Análise específica de documento PDF/texto
   */
  async analisarDocumento(textoDocumento, tipoAnalise = 'geral') {
    try {
      logger.info('📄 LicitAI: Analisando documento');

      const prompt = this.prompts.analiseDocumento
        .replace('{TEXTO_DOCUMENTO}', textoDocumento)
        .replace('{TIPO_ANALISE}', tipoAnalise);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const analise = this.parseAnaliseDocumento(response.content[0].text);

      logger.info('✅ LicitAI: Análise de documento concluída');
      return analise;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na análise de documento:', error);
      throw new Error('Erro na análise de documento: ' + error.message);
    }
  }

  /**
   * Estratégia específica de participação
   */
  async gerarEstrategiaParticipacao(editalData, empresaData, concorrencia = null) {
    try {
      logger.info('🎯 LicitAI: Gerando estratégia de participação');

      const prompt = this.prompts.estrategiaParticipacao
        .replace('{EDITAL_DATA}', JSON.stringify(editalData, null, 2))
        .replace('{EMPRESA_DATA}', JSON.stringify(empresaData, null, 2))
        .replace('{CONCORRENCIA_DATA}', JSON.stringify(concorrencia, null, 2));

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const estrategia = this.parseEstrategiaParticipacao(response.content[0].text);

      logger.info('✅ LicitAI: Estratégia de participação gerada');
      return estrategia;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na geração de estratégia:', error);
      throw new Error('Erro na geração de estratégia: ' + error.message);
    }
  }

  /**
   * Análise de riscos e compliance
   */
  async analisarRiscoCompliance(editalData, empresaData) {
    try {
      logger.info('⚠️ LicitAI: Analisando riscos e compliance');

      const prompt = this.prompts.riscoCompliance
        .replace('{EDITAL_DATA}', JSON.stringify(editalData, null, 2))
        .replace('{EMPRESA_DATA}', JSON.stringify(empresaData, null, 2));

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const analise = this.parseRiscoCompliance(response.content[0].text);

      logger.info('✅ LicitAI: Análise de riscos concluída');
      return analise;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na análise de riscos:', error);
      throw new Error('Erro na análise de riscos: ' + error.message);
    }
  }

  /**
   * Previsão de mercado e tendências
   */
  async preverTendenciasMercado(segmento, periodo = '6 meses') {
    try {
      logger.info('📈 LicitAI: Prevendo tendências de mercado');

      const prompt = this.prompts.previsaoMercado
        .replace('{SEGMENTO}', segmento)
        .replace('{PERIODO}', periodo);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const previsao = this.parsePrevisaoMercado(response.content[0].text);

      logger.info('✅ LicitAI: Previsão de tendências concluída');
      return previsao;

    } catch (error) {
      logger.error('❌ LicitAI: Erro na previsão de mercado:', error);
      throw new Error('Erro na previsão de mercado: ' + error.message);
    }
  }

  // ==================== PROMPTS ESPECIALIZADOS ====================

  getAnaliseCompletaPrompt() {
    return `
Você é o LicitAI, um especialista em licitações públicas com mais de 20 anos de experiência.
Analise completamente este edital considerando todos os aspectos técnicos, financeiros, jurídicos e estratégicos.

DADOS DO EDITAL:
{EDITAL_DATA}

DADOS DA EMPRESA:
{EMPRESA_DATA}

HISTÓRICO DE PARTICIPAÇÕES:
{HISTORICO_DATA}

Forneça uma análise EXTREMAMENTE detalhada e estratégica em formato JSON:

{
  "resumo_executivo": "Análise concisa em 3-4 frases sobre a viabilidade",
  "score_viabilidade": 85,
  "recomendacao_principal": "participar|analisar_mais|nao_participar",

  "analise_detalhada": {
    "adequacao_objeto": "Análise da adequação do objeto à empresa",
    "analise_financeira": "Viabilidade econômica detalhada",
    "analise_tecnica": "Complexidade e requisitos técnicos",
    "analise_juridica": "Aspectos legais e documentação",
    "analise_prazo": "Viabilidade dos prazos propostos",
    "analise_concorrencia": "Estimativa de competitividade"
  },

  "pontos_criticos": [
    {"ponto": "descrição", "tipo": "risco|oportunidade", "impacto": "alto|medio|baixo"}
  ],

  "estrategia_recomendada": {
    "abordagem": "Estratégia principal recomendada",
    "diferenciais": ["diferencial 1", "diferencial 2"],
    "precificacao": "Estratégia de preços",
    "parcerias": "Necessidade de parcerias",
    "cronograma": "Cronograma de preparação"
  },

  "riscos_identificados": [
    {"risco": "descrição", "probabilidade": "alta|media|baixa", "mitigacao": "como mitigar"}
  ],

  "documentacao_necessaria": [
    {"documento": "nome", "complexidade": "alta|media|baixa", "prazo_obter": "dias"}
  ],

  "previsao_resultado": {
    "probabilidade_sucesso": 75,
    "fatores_sucesso": ["fator 1", "fator 2"],
    "fatores_risco": ["risco 1", "risco 2"]
  },

  "insights_especiais": [
    "Insight estratégico específico baseado na experiência"
  ]
}

IMPORTANTE: Base sua análise em conhecimento real sobre licitações públicas brasileiras.
`;
  }

  getConsultaGeralPrompt() {
    return `
Você é o LicitAI, um consultor especialista em licitações públicas brasileiras com vasta experiência prática.
Responda à seguinte pergunta de forma didática, prática e acionável.

PERGUNTA DO USUÁRIO:
{PERGUNTA}

CONTEXTO ADICIONAL:
{CONTEXTO}

Forneça uma resposta em formato JSON:

{
  "resposta_principal": "Resposta clara e direta à pergunta",
  "explicacao_detalhada": "Explicação técnica e detalhada",
  "dicas_praticas": [
    "Dica prática 1",
    "Dica prática 2"
  ],
  "referencias_legais": [
    {"lei": "Nome da lei", "artigo": "artigo específico", "relevancia": "como se aplica"}
  ],
  "exemplos_praticos": [
    "Exemplo real e aplicável"
  ],
  "proximos_passos": [
    "Ação recomendada 1",
    "Ação recomendada 2"
  ],
  "alertas_importantes": [
    "Alerta ou cuidado especial"
  ]
}

Seja preciso, didático e forneça valor prático real.
`;
  }

  getAnaliseDocumentoPrompt() {
    return `
Você é o LicitAI, especialista em análise de documentos de licitação.
Analise este documento e extraia informações estratégicas.

DOCUMENTO:
{TEXTO_DOCUMENTO}

TIPO DE ANÁLISE: {TIPO_ANALISE}

Forneça análise em formato JSON:

{
  "tipo_documento": "edital|contrato|termo_referencia|outro",
  "resumo_conteudo": "Resumo do conteúdo principal",

  "informacoes_extraidas": {
    "valor_estimado": 0,
    "prazo_execucao": "prazo",
    "modalidade": "tipo de licitação",
    "criterio_julgamento": "critério",
    "requisitos_principais": ["requisito 1", "requisito 2"]
  },

  "pontos_atencao": [
    {"ponto": "descrição", "tipo": "risco|oportunidade|neutro"}
  ],

  "clausulas_criticas": [
    {"clausula": "texto da cláusula", "impacto": "explicação do impacto"}
  ],

  "recomendacoes": [
    "Recomendação estratégica baseada no documento"
  ],

  "score_clareza": 85,
  "complexidade_juridica": "alta|media|baixa"
}

Seja meticuloso na análise e identifique detalhes importantes.
`;
  }

  getEstrategiaParticipacaoPrompt() {
    return `
Você é o LicitAI, consultor estratégico em licitações.
Desenvolva uma estratégia específica de participação para este edital.

DADOS DO EDITAL:
{EDITAL_DATA}

DADOS DA EMPRESA:
{EMPRESA_DATA}

ANÁLISE DA CONCORRÊNCIA:
{CONCORRENCIA_DATA}

Desenvolva estratégia em formato JSON:

{
  "estrategia_principal": "Nome da estratégia",
  "abordagem_geral": "Descrição da abordagem",

  "vantagens_competitivas": [
    {"vantagem": "descrição", "como_explorar": "estratégia"}
  ],

  "estrategia_tecnica": {
    "diferenciacao": "Como se diferenciar tecnicamente",
    "propostas_valor": ["proposta 1", "proposta 2"],
    "inovacoes": ["inovação sugerida"]
  },

  "estrategia_comercial": {
    "posicionamento_preco": "premium|competitivo|economico",
    "margem_recomendada": 15,
    "fatores_precificacao": ["fator 1", "fator 2"]
  },

  "cronograma_preparacao": [
    {"atividade": "nome", "prazo_dias": 5, "responsavel": "area"}
  ],

  "recursos_necessarios": {
    "equipe": ["perfil 1", "perfil 2"],
    "investimento": 0,
    "parcerias": ["tipo de parceria"]
  },

  "plano_mitigacao": [
    {"risco": "descrição", "acao": "ação mitigadora"}
  ],

  "kpis_sucesso": [
    {"indicador": "nome", "meta": "valor esperado"}
  ]
}

Seja estratégico e forneça um plano executável.
`;
  }

  getRiscoCompliancePrompt() {
    return `
Você é o LicitAI, especialista em compliance e gestão de riscos em licitações.
Analise os riscos e aspectos de compliance deste edital.

DADOS DO EDITAL:
{EDITAL_DATA}

DADOS DA EMPRESA:
{EMPRESA_DATA}

Forneça análise completa em formato JSON:

{
  "score_risco_geral": 65,
  "nivel_compliance": "alto|medio|baixo",

  "riscos_identificados": [
    {
      "categoria": "financeiro|tecnico|juridico|reputacional",
      "risco": "descrição do risco",
      "probabilidade": "alta|media|baixa",
      "impacto": "alto|medio|baixo",
      "mitigacao": "estratégia de mitigação"
    }
  ],

  "requisitos_compliance": [
    {
      "requisito": "descrição",
      "status_empresa": "atende|nao_atende|parcial",
      "acao_necessaria": "o que fazer para atender"
    }
  ],

  "documentacao_compliance": [
    {
      "documento": "nome do documento",
      "obrigatorio": true,
      "prazo_validade": "6 meses",
      "status": "ok|vencido|inexistente"
    }
  ],

  "alertas_criticos": [
    "Alerta importante sobre compliance"
  ],

  "recomendacoes_acao": [
    {
      "prioridade": "alta|media|baixa",
      "acao": "descrição da ação",
      "prazo": "prazo para execução"
    }
  ],

  "impacto_nao_compliance": [
    "Consequência de não atender requisitos"
  ]
}

Seja rigoroso na análise de compliance e riscos.
`;
  }

  getPrevisaoMercadoPrompt() {
    return `
Você é o LicitAI, analista de mercado especializado em licitações públicas brasileiras.
Forneça previsões e tendências para o segmento solicitado.

SEGMENTO: {SEGMENTO}
PERÍODO DE ANÁLISE: {PERIODO}

Forneça previsão em formato JSON:

{
  "tendencias_macro": [
    {
      "tendencia": "descrição da tendência",
      "impacto": "alto|medio|baixo",
      "oportunidades": ["oportunidade 1", "oportunidade 2"]
    }
  ],

  "previsao_volume": {
    "crescimento_esperado": "15%",
    "setores_aquecidos": ["setor 1", "setor 2"],
    "setores_retraidos": ["setor 1"]
  },

  "mudancas_regulatorias": [
    {
      "mudanca": "descrição",
      "impacto_empresas": "como afeta as empresas",
      "prazo_implementacao": "quando"
    }
  ],

  "oportunidades_emergentes": [
    "Oportunidade estratégica identificada"
  ],

  "recomendacoes_estrategicas": [
    "Recomendação para posicionamento"
  ],

  "indicadores_monitorar": [
    {
      "indicador": "nome",
      "relevancia": "por que monitorar",
      "fonte": "onde acompanhar"
    }
  ]
}

Base suas previsões em conhecimento real do mercado brasileiro.
`;
  }

  // ==================== PARSERS ====================

  parseAnaliseCompleta(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultAnaliseCompleta();
    }
  }

  parseConsultaGeral(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultConsultaGeral();
    }
  }

  parseAnaliseDocumento(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultAnaliseDocumento();
    }
  }

  parseEstrategiaParticipacao(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultEstrategiaParticipacao();
    }
  }

  parseRiscoCompliance(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultRiscoCompliance();
    }
  }

  parsePrevisaoMercado(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Formato de resposta inválido');
    } catch (error) {
      return this.getDefaultPrevisaoMercado();
    }
  }

  // ==================== FALLBACKS ====================

  getDefaultAnaliseCompleta() {
    return {
      resumo_executivo: "Análise temporariamente indisponível. Tente novamente em alguns instantes.",
      score_viabilidade: 50,
      recomendacao_principal: "analisar_mais",
      analise_detalhada: {},
      pontos_criticos: [],
      estrategia_recomendada: {},
      riscos_identificados: [],
      documentacao_necessaria: [],
      previsao_resultado: {},
      insights_especiais: []
    };
  }

  getDefaultConsultaGeral() {
    return {
      resposta_principal: "Serviço temporariamente indisponível. Tente novamente em alguns instantes.",
      explicacao_detalhada: "",
      dicas_praticas: [],
      referencias_legais: [],
      exemplos_praticos: [],
      proximos_passos: [],
      alertas_importantes: []
    };
  }

  getDefaultAnaliseDocumento() {
    return {
      tipo_documento: "outro",
      resumo_conteudo: "Análise temporariamente indisponível.",
      informacoes_extraidas: {},
      pontos_atencao: [],
      clausulas_criticas: [],
      recomendacoes: [],
      score_clareza: 50,
      complexidade_juridica: "media"
    };
  }

  getDefaultEstrategiaParticipacao() {
    return {
      estrategia_principal: "Análise manual recomendada",
      abordagem_geral: "Serviço temporariamente indisponível.",
      vantagens_competitivas: [],
      estrategia_tecnica: {},
      estrategia_comercial: {},
      cronograma_preparacao: [],
      recursos_necessarios: {},
      plano_mitigacao: [],
      kpis_sucesso: []
    };
  }

  getDefaultRiscoCompliance() {
    return {
      score_risco_geral: 50,
      nivel_compliance: "medio",
      riscos_identificados: [],
      requisitos_compliance: [],
      documentacao_compliance: [],
      alertas_criticos: [],
      recomendacoes_acao: [],
      impacto_nao_compliance: []
    };
  }

  getDefaultPrevisaoMercado() {
    return {
      tendencias_macro: [],
      previsao_volume: {},
      mudancas_regulatorias: [],
      oportunidades_emergentes: [],
      recomendacoes_estrategicas: [],
      indicadores_monitorar: []
    };
  }
}

module.exports = LicitAIService;