const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');
const { Edital, AnaliseEdital } = require('../../models');

class AIAnalysisService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4000;
  }

  /**
   * Analisa um edital completo usando Claude AI
   */
  async analyzeEdital(editalId, userId) {
    try {
      logger.info(`🤖 Iniciando análise IA do edital ${editalId}`);

      const edital = await Edital.findByPk(editalId);
      if (!edital) {
        throw new Error('Edital não encontrado');
      }

      // Estruturar dados do edital para análise
      const editalData = this.prepareEditalData(edital);

      // Executar análises em paralelo
      const [
        scoreViabilidade,
        analiseCompleta,
        riscosIdentificados,
        oportunidades,
        recomendacoes
      ] = await Promise.all([
        this.calculateViabilityScore(editalData),
        this.performCompleteAnalysis(editalData),
        this.identifyRisks(editalData),
        this.identifyOpportunities(editalData),
        this.generateRecommendations(editalData)
      ]);

      // Salvar análise no banco
      const analise = await AnaliseEdital.create({
        id: require('crypto').randomUUID().replace(/-/g, ''),
        edital_id: editalId,
        usuario_id: userId,
        score_final: scoreViabilidade.score_final,
        score_financeiro: scoreViabilidade.score_financeiro,
        score_tecnico: scoreViabilidade.score_tecnico,
        score_documental: scoreViabilidade.score_documental,
        score_prazo: scoreViabilidade.score_prazo,
        score_risco: scoreViabilidade.score_risco,
        score_concorrencia: scoreViabilidade.score_concorrencia,
        analise_completa: analiseCompleta,
        pontos_fortes: analiseCompleta.pontos_fortes || [],
        pontos_fracos: analiseCompleta.pontos_fracos || [],
        recomendacoes: recomendacoes,
        observacoes: analiseCompleta.observacoes
      });

      // Atualizar edital com score
      await edital.update({
        score_viabilidade: scoreViabilidade.score_final,
        analise_ia: analiseCompleta,
        riscos_identificados: riscosIdentificados,
        oportunidades: oportunidades
      });

      logger.info(`✅ Análise IA concluída para edital ${editalId}`);
      return analise;

    } catch (error) {
      logger.error(`❌ Erro na análise IA do edital ${editalId}:`, error);
      throw error;
    }
  }

  /**
   * Prepara dados do edital para análise
   */
  prepareEditalData(edital) {
    return {
      numero_edital: edital.numero_edital,
      orgao_nome: edital.orgao_nome,
      modalidade: edital.modalidade,
      objeto: edital.objeto,
      valor_estimado: edital.valor_estimado,
      data_abertura: edital.data_abertura,
      data_questionamento: edital.data_questionamento,
      data_impugnacao: edital.data_impugnacao,
      prazo_execucao: edital.prazo_execucao,
      prazo_vigencia: edital.prazo_vigencia,
      permite_subcontratacao: edital.permite_subcontratacao,
      participacao_consorcio: edital.participacao_consorcio,
      permite_me_epp: edital.permite_me_epp,
      documentos_exigidos: edital.documentos_exigidos,
      requisitos_habilitacao: edital.requisitos_habilitacao
    };
  }

  /**
   * Calcula score de viabilidade usando IA
   */
  async calculateViabilityScore(editalData) {
    const prompt = `
Analise este edital e forneça scores de 0-100 para cada critério:

DADOS DO EDITAL:
${JSON.stringify(editalData, null, 2)}

Avalie os seguintes critérios:
1. FINANCEIRO (0-100): Viabilidade econômica, valor compatível com mercado
2. TÉCNICO (0-100): Complexidade técnica, requisitos exigidos
3. DOCUMENTAL (0-100): Facilidade para atender documentação exigida
4. PRAZO (0-100): Adequação dos prazos de execução e entrega
5. RISCO (0-100): Nível de risco do projeto (100 = baixo risco)
6. CONCORRÊNCIA (0-100): Estimativa de competitividade

Responda APENAS em formato JSON:
{
  "score_financeiro": 85,
  "score_tecnico": 92,
  "score_documental": 78,
  "score_prazo": 88,
  "score_risco": 75,
  "score_concorrencia": 82,
  "score_final": 83,
  "justificativa": "Explicação breve dos scores"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Resposta inválida do Claude AI');
    } catch (error) {
      logger.error('Erro ao calcular score de viabilidade:', error);
      return this.getDefaultScores();
    }
  }

  /**
   * Realiza análise completa do edital
   */
  async performCompleteAnalysis(editalData) {
    const prompt = `
Realize uma análise completa e estratégica deste edital:

DADOS DO EDITAL:
${JSON.stringify(editalData, null, 2)}

Forneça uma análise estruturada considerando:
1. Características do edital e órgão
2. Adequação à empresa (considere empresa de tecnologia/consultoria)
3. Potencial de lucro e crescimento
4. Facilidade de execução
5. Riscos envolvidos

Responda em formato JSON:
{
  "resumo_executivo": "Análise concisa em 2-3 frases",
  "pontos_fortes": ["vantagem 1", "vantagem 2", "vantagem 3"],
  "pontos_fracos": ["desvantagem 1", "desvantagem 2"],
  "analise_detalhada": {
    "objeto_adequacao": "análise da adequação do objeto",
    "valor_atratividade": "análise do valor e atratividade",
    "prazo_viabilidade": "análise dos prazos",
    "orgao_confiabilidade": "análise do órgão"
  },
  "observacoes": "Observações importantes adicionais"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Resposta inválida do Claude AI');
    } catch (error) {
      logger.error('Erro na análise completa:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Identifica riscos do edital
   */
  async identifyRisks(editalData) {
    const prompt = `
Identifique os principais riscos neste edital:

DADOS DO EDITAL:
${JSON.stringify(editalData, null, 2)}

Categorize os riscos por:
- FINANCEIRO: Riscos relacionados a pagamento, fluxo de caixa
- TÉCNICO: Riscos de execução, tecnologia, recursos
- JURÍDICO: Riscos contratuais, legais, penalidades
- MERCADO: Riscos de concorrência, preço, posicionamento

Responda em JSON:
{
  "riscos_financeiros": [{"risco": "descrição", "probabilidade": "alta/média/baixa", "impacto": "alto/médio/baixo"}],
  "riscos_tecnicos": [],
  "riscos_juridicos": [],
  "riscos_mercado": [],
  "nivel_risco_geral": "alto/médio/baixo"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Resposta inválida do Claude AI');
    } catch (error) {
      logger.error('Erro na identificação de riscos:', error);
      return { riscos_financeiros: [], riscos_tecnicos: [], riscos_juridicos: [], riscos_mercado: [], nivel_risco_geral: "médio" };
    }
  }

  /**
   * Identifica oportunidades do edital
   */
  async identifyOpportunities(editalData) {
    const prompt = `
Identifique oportunidades estratégicas neste edital:

DADOS DO EDITAL:
${JSON.stringify(editalData, null, 2)}

Analise oportunidades de:
- CRESCIMENTO: Expansão de mercado, novos clientes
- COMPETITIVA: Vantagens sobre concorrentes
- FINANCEIRA: Rentabilidade, fluxo de caixa
- ESTRATÉGICA: Posicionamento, networking, experiência

Responda em JSON:
{
  "oportunidades_crescimento": ["oportunidade 1", "oportunidade 2"],
  "oportunidades_competitivas": [],
  "oportunidades_financeiras": [],
  "oportunidades_estrategicas": [],
  "potencial_geral": "alto/médio/baixo"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Resposta inválida do Claude AI');
    } catch (error) {
      logger.error('Erro na identificação de oportunidades:', error);
      return { oportunidades_crescimento: [], oportunidades_competitivas: [], oportunidades_financeiras: [], oportunidades_estrategicas: [], potencial_geral: "médio" };
    }
  }

  /**
   * Gera recomendações estratégicas
   */
  async generateRecommendations(editalData) {
    const prompt = `
Com base na análise deste edital, forneça recomendações estratégicas:

DADOS DO EDITAL:
${JSON.stringify(editalData, null, 2)}

Gere recomendações específicas para:
1. DECISÃO: Participar ou não do edital
2. ESTRATÉGIA: Como abordar a participação
3. PREPARAÇÃO: O que preparar para ter sucesso
4. PRECIFICAÇÃO: Estratégia de preços
5. PARCERIAS: Necessidade de parcerias ou consórcios

Responda em JSON:
{
  "decisao_recomendada": "participar/não_participar/analisar_mais",
  "justificativa_decisao": "Razão principal da recomendação",
  "estrategia_participacao": "Como abordar este edital",
  "acoes_preparacao": ["ação 1", "ação 2", "ação 3"],
  "estrategia_precificacao": "Recomendação de precificação",
  "parcerias_sugeridas": "Tipo de parceria recomendada",
  "prioridade": "alta/média/baixa"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Resposta inválida do Claude AI');
    } catch (error) {
      logger.error('Erro na geração de recomendações:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Scores padrão em caso de erro
   */
  getDefaultScores() {
    return {
      score_financeiro: 50,
      score_tecnico: 50,
      score_documental: 50,
      score_prazo: 50,
      score_risco: 50,
      score_concorrencia: 50,
      score_final: 50,
      justificativa: "Análise automática indisponível"
    };
  }

  /**
   * Análise padrão em caso de erro
   */
  getDefaultAnalysis() {
    return {
      resumo_executivo: "Análise automática indisponível",
      pontos_fortes: [],
      pontos_fracos: [],
      analise_detalhada: {},
      observacoes: "Erro na análise IA"
    };
  }

  /**
   * Recomendações padrão em caso de erro
   */
  getDefaultRecommendations() {
    return {
      decisao_recomendada: "analisar_mais",
      justificativa_decisao: "Análise manual necessária",
      estrategia_participacao: "Avaliação manual requerida",
      acoes_preparacao: ["Análise manual do edital"],
      estrategia_precificacao: "Calcular manualmente",
      parcerias_sugeridas: "Avaliar necessidade",
      prioridade: "média"
    };
  }
}

module.exports = AIAnalysisService;