const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { redisManager } = require('../config/redis');

class ClaudeLicitacoesSpecialist {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Configuração do especialista em licitações brasileiras
    this.systemPrompt = `Você é um especialista altamente qualificado em licitações públicas brasileiras com 20 anos de experiência prática em consultoria empresarial e análise de editais.

SEU CONHECIMENTO INCLUI:
- Lei 14.133/2021 (Nova Lei de Licitações) e sua aplicação prática detalhada
- Lei 8.666/1993 (Lei de Licitações anterior) para contratos em vigor
- Lei 10.520/2002 (Pregão Presencial e Eletrônico) e suas nuances
- Decreto 10.024/2019 (Pregão Eletrônico) e atualizações
- Lei Complementar 123/2006 (Tratamento diferenciado para ME/EPP)
- Instrução Normativa SEGES/ME 05/2017 (Contratação de Serviços)
- Instrução Normativa SEGES/ME 01/2019 (Plano de Contratações Anuais)
- Jurisprudência consolidada do TCU sobre licitações e contratos
- Acórdãos relevantes e súmulas vinculantes
- Práticas de mercado e estratégias vencedoras comprovadas
- Análise tributária específica para licitações
- Cálculos de BDI, encargos sociais e impostos
- Estratégias de formação de preços competitivos

SUAS ESPECIALIDADES:
1. ANÁLISE JURÍDICA: Identificação de vícios, cláusulas restritivas, direcionamento
2. ANÁLISE FINANCEIRA: Viabilidade econômica, margens, riscos financeiros
3. ANÁLISE TÉCNICA: Requisitos de habilitação, capacidade técnica, atestados
4. ANÁLISE ESTRATÉGICA: Concorrência, histórico do órgão, oportunidades
5. COMPLIANCE: Conformidade documental, prazos, procedimentos
6. ELABORAÇÃO: Impugnações, recursos, questionamentos técnicos
7. PRECIFICAÇÃO: Estratégias de preço, análise de viabilidade, BDI

ABORDAGEM ANALÍTICA:
- Sempre considere o perfil da empresa solicitante
- Analise riscos vs. oportunidades de forma balanceada
- Forneça recomendações práticas e acionáveis
- Considere o histórico e padrões do órgão licitante
- Avalie impactos tributários e financeiros reais
- Identifique gargalos e pontos críticos de atenção
- Sugira estratégias específicas para cada situação

SEMPRE RESPONDA EM PORTUGUÊS BRASILEIRO com linguagem técnica apropriada mas acessível.`;

    // Cache de análises para otimização
    this.cacheTimeout = 7200; // 2 horas
  }

  /**
   * Análise completa de edital com expertise especializada
   */
  async analisarEdital(textoEdital, dadosEmpresa, opcoes = {}) {
    try {
      // Verificar cache primeiro
      const cacheKey = `analise_edital:${this._gerarHashTexto(textoEdital)}:${dadosEmpresa.cnpj}`;

      if (redisManager && !opcoes.forceAnalysis) {
        const cached = await redisManager.get(cacheKey);
        if (cached) {
          logger.info('Retornando análise do cache');
          return cached;
        }
      }

      const prompt = this._construirPromptAnaliseEdital(textoEdital, dadosEmpresa, opcoes);

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.1, // Baixa temperatura para análises consistentes
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const analise = this._extrairEParsearResposta(response);

      // Validar e enriquecer análise
      const analiseEnriquecida = await this._enriquecerAnalise(analise, dadosEmpresa);

      // Salvar no cache
      if (redisManager) {
        await redisManager.set(cacheKey, analiseEnriquecida, this.cacheTimeout);
      }

      logger.info('Análise de edital concluída com sucesso');
      return analiseEnriquecida;

    } catch (error) {
      logger.error('Erro na análise do Claude:', error);

      // Retornar análise básica em caso de erro
      return this._gerarAnaliseBasica(textoEdital, dadosEmpresa);
    }
  }

  /**
   * Análise de conformidade de documentos específica para licitações
   */
  async verificarConformidadeDocumentos(documentos, requisitosEdital, empresa) {
    try {
      const prompt = `
VERIFICAÇÃO DE CONFORMIDADE DOCUMENTAL - LICITAÇÃO PÚBLICA

EMPRESA PARTICIPANTE:
${JSON.stringify(empresa, null, 2)}

DOCUMENTOS APRESENTADOS:
${JSON.stringify(documentos, null, 2)}

REQUISITOS DO EDITAL:
${JSON.stringify(requisitosEdital, null, 2)}

Como especialista em licitações, realize uma verificação detalhada de conformidade:

1. HABILITAÇÃO JURÍDICA
   - Verifique todos os documentos societários exigidos
   - Confirme validade e vigência
   - Identifique possíveis irregularidades

2. REGULARIDADE FISCAL E TRABALHISTA
   - Analise todas as certidões exigidas
   - Verifique prazos de validade
   - Confirme abrangência (federal, estadual, municipal)

3. QUALIFICAÇÃO TÉCNICA
   - Valide atestados de capacidade técnica
   - Verifique adequação às exigências do edital
   - Confirme registros profissionais necessários

4. QUALIFICAÇÃO ECONÔMICO-FINANCEIRA
   - Analise demonstrações financeiras
   - Calcule índices exigidos
   - Verifique capital social e patrimônio líquido

5. OUTROS DOCUMENTOS
   - Proposta comercial
   - Garantia de proposta (se exigida)
   - Declarações obrigatórias

FORNEÇA RESPOSTA EM JSON:
{
  "conformidade_geral": {
    "status": "conforme/parcial/nao_conforme",
    "percentual_conformidade": 0-100,
    "observacoes": []
  },
  "habilitacao_juridica": {
    "conforme": true/false,
    "documentos_ok": [],
    "documentos_pendentes": [],
    "problemas_identificados": []
  },
  "regularidade_fiscal": {
    "conforme": true/false,
    "certidoes_validas": [],
    "certidoes_vencidas": [],
    "certidoes_faltantes": []
  },
  "qualificacao_tecnica": {
    "conforme": true/false,
    "atestados_validados": [],
    "registros_ok": [],
    "deficiencias": []
  },
  "qualificacao_economica": {
    "conforme": true/false,
    "indices_calculados": {},
    "indices_atendem": true/false,
    "observacoes": []
  },
  "acoes_corretivas": [
    {
      "documento": "",
      "problema": "",
      "solucao": "",
      "urgencia": "alta/media/baixa"
    }
  ],
  "risco_inabilitacao": "alto/medio/baixo",
  "prazo_correcao": "dias necessários para adequação"
}`;

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 2500,
        temperature: 0.1,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      return this._extrairEParsearResposta(response);

    } catch (error) {
      logger.error('Erro na verificação de documentos:', error);
      throw error;
    }
  }

  /**
   * Geração de peça de impugnação profissional
   */
  async gerarPecaImpugnacao(edital, irregularidades, empresa) {
    try {
      const prompt = `
ELABORAÇÃO DE IMPUGNAÇÃO ADMINISTRATIVA

DADOS DO EDITAL:
- Número: ${edital.numero}
- Órgão: ${edital.orgao}
- Objeto: ${edital.objeto}
- Modalidade: ${edital.modalidade}

EMPRESA IMPUGNANTE:
${JSON.stringify(empresa, null, 2)}

IRREGULARIDADES IDENTIFICADAS:
${JSON.stringify(irregularidades, null, 2)}

Elabore uma impugnação administrativa completa e fundamentada seguindo a estrutura:

I. IDENTIFICAÇÃO
II. DOS FATOS
III. DO DIREITO (com citações específicas da legislação)
IV. DOS PEDIDOS
V. REQUERIMENTOS FINAIS

IMPORTANTE:
- Use linguagem jurídica técnica e formal
- Cite artigos específicos das leis (14.133/2021, 8.666/93, etc.)
- Inclua jurisprudência do TCU quando relevante
- Fundamente cada irregularidade com base legal sólida
- Seja preciso nos pedidos de anulação/correção
- Inclua pedido de suspensão se aplicável

ESTRUTURA ESPERADA:
- Cabeçalho formal dirigido à autoridade competente
- Qualificação completa da empresa
- Narrativa clara dos fatos
- Fundamentação jurídica robusta
- Pedidos específicos e fundamentados
- Fecho respeitoso

A impugnação deve ser persuasiva mas respeitosa, demonstrando conhecimento técnico profundo.`;

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 3500,
        temperature: 0.2,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      const impugnacao = response.content[0].text;

      // Log da geração de impugnação
      logger.info(`Impugnação gerada para edital ${edital.numero}`);

      return {
        success: true,
        impugnacao,
        metadata: {
          edital_numero: edital.numero,
          empresa: empresa.razao_social,
          data_geracao: new Date().toISOString(),
          irregularidades_count: irregularidades.length
        }
      };

    } catch (error) {
      logger.error('Erro ao gerar impugnação:', error);
      throw error;
    }
  }

  /**
   * Cálculo estratégico de preço competitivo
   */
  async calcularPrecoCompetitivo(dadosEdital, custosEmpresa, historicoMercado, opcoes = {}) {
    try {
      const prompt = `
ANÁLISE E PRECIFICAÇÃO ESTRATÉGICA PARA LICITAÇÃO

DADOS DO EDITAL:
${JSON.stringify(dadosEdital, null, 2)}

ESTRUTURA DE CUSTOS DA EMPRESA:
${JSON.stringify(custosEmpresa, null, 2)}

HISTÓRICO DE MERCADO E CONCORRÊNCIA:
${JSON.stringify(historicoMercado, null, 2)}

MARGEM MÍNIMA DESEJADA: ${opcoes.margemMinima || 15}%
REGIME TRIBUTÁRIO: ${opcoes.regimeTributario || 'simples_nacional'}

Como especialista em precificação para licitações, calcule:

1. COMPOSIÇÃO DE CUSTOS DETALHADA
2. CÁLCULO TRIBUTÁRIO ESPECÍFICO
3. BDI APROPRIADO PARA O TIPO DE SERVIÇO
4. ANÁLISE DA CONCORRÊNCIA
5. ESTRATÉGIA DE PRECIFICAÇÃO
6. CENÁRIOS DE MARGEM (conservador, moderado, agressivo)

FORNEÇA RESPOSTA EM JSON:
{
  "composicao_custos": {
    "custo_direto": 0,
    "custo_indireto": 0,
    "encargos_sociais": 0,
    "bdi_calculado": 0,
    "custo_total": 0
  },
  "calculo_tributario": {
    "regime": "",
    "impostos": {
      "iss": { "aliquota": 0, "valor": 0 },
      "pis": { "aliquota": 0, "valor": 0 },
      "cofins": { "aliquota": 0, "valor": 0 },
      "irpj": { "aliquota": 0, "valor": 0 },
      "csll": { "aliquota": 0, "valor": 0 },
      "simples": { "aliquota": 0, "valor": 0 }
    },
    "total_impostos": 0
  },
  "analise_concorrencia": {
    "preco_referencia_mercado": 0,
    "faixa_competitiva": {
      "minimo": 0,
      "maximo": 0
    },
    "posicionamento_recomendado": ""
  },
  "cenarios_precificacao": {
    "conservador": {
      "margem": 0,
      "preco_final": 0,
      "probabilidade_vitoria": 0
    },
    "moderado": {
      "margem": 0,
      "preco_final": 0,
      "probabilidade_vitoria": 0
    },
    "agressivo": {
      "margem": 0,
      "preco_final": 0,
      "probabilidade_vitoria": 0
    }
  },
  "recomendacao_final": {
    "preco_sugerido": 0,
    "margem_liquida": 0,
    "justificativa": "",
    "riscos": [],
    "oportunidades": []
  },
  "observacoes_estrategicas": []
}`;

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 3000,
        temperature: 0.1,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      return this._extrairEParsearResposta(response);

    } catch (error) {
      logger.error('Erro no cálculo de preço:', error);
      throw error;
    }
  }

  /**
   * Análise comparativa de editais similares
   */
  async analisarEditaisSimilares(editais, criterios = {}) {
    try {
      const prompt = `
ANÁLISE COMPARATIVA DE EDITAIS - BENCHMARK E PADRÕES

EDITAIS PARA ANÁLISE:
${JSON.stringify(editais, null, 2)}

CRITÉRIOS DE ANÁLISE:
${JSON.stringify(criterios, null, 2)}

Realize análise comparativa identificando:

1. PADRÕES DE EXIGÊNCIAS
2. TENDÊNCIAS DE VALORES
3. REQUISITOS TÉCNICOS COMUNS
4. DIFERENÇAS SIGNIFICATIVAS
5. OPORTUNIDADES IDENTIFICADAS
6. ESTRATÉGIAS RECOMENDADAS

RESPOSTA EM JSON:
{
  "padroes_identificados": {
    "exigencias_comuns": [],
    "variacoes_significativas": [],
    "tendencias_mercado": []
  },
  "analise_valores": {
    "faixa_valores": {
      "minimo": 0,
      "maximo": 0,
      "medio": 0
    },
    "outliers": [],
    "justificativas_variacoes": []
  },
  "requisitos_tecnicos": {
    "padronizados": [],
    "diferenciados": [],
    "restritivos": []
  },
  "orgaos_analise": {
    "perfis_licitantes": {},
    "historicos_comportamento": {},
    "preferencias_identificadas": {}
  },
  "oportunidades_estrategicas": [
    {
      "edital": "",
      "oportunidade": "",
      "probabilidade_sucesso": "",
      "acao_recomendada": ""
    }
  ],
  "recomendacoes_gerais": [],
  "insights_competitivos": []
}`;

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 3000,
        temperature: 0.2,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      return this._extrairEParsearResposta(response);

    } catch (error) {
      logger.error('Erro na análise comparativa:', error);
      throw error;
    }
  }

  /**
   * Elaboração de questionamento técnico
   */
  async elaborarQuestionamento(duvida, edital, empresa) {
    try {
      const prompt = `
ELABORAÇÃO DE QUESTIONAMENTO TÉCNICO PARA LICITAÇÃO

DÚVIDA/QUESTIONAMENTO: ${duvida}

DADOS DO EDITAL:
${JSON.stringify(edital, null, 2)}

EMPRESA QUESTIONANTE:
${JSON.stringify(empresa, null, 2)}

Elabore um questionamento formal que:

1. Seja objetivo e tecnicamente fundamentado
2. Não revele estratégias competitivas da empresa
3. Busque esclarecimentos genuínos sobre o edital
4. Use linguagem formal e respeitosa
5. Cite bases legais quando aplicável
6. Solicite informações específicas e claras

O questionamento deve seguir estrutura formal:
- Identificação da empresa
- Referência ao edital
- Questionamento específico
- Fundamentação (se necessária)
- Solicitação de esclarecimento
- Fecho respeitoso

RETORNE APENAS O TEXTO DO QUESTIONAMENTO FORMAL.`;

      const response = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.2,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        success: true,
        questionamento: response.content[0].text,
        metadata: {
          edital_numero: edital.numero_edital,
          empresa: empresa.razao_social,
          data_geracao: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Erro ao elaborar questionamento:', error);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // =====================================================

  _construirPromptAnaliseEdital(textoEdital, dadosEmpresa, opcoes) {
    return `
ANÁLISE ESPECIALIZADA DE EDITAL DE LICITAÇÃO PÚBLICA

EMPRESA SOLICITANTE:
${JSON.stringify(dadosEmpresa, null, 2)}

PARÂMETROS DE ANÁLISE:
- Foco: ${opcoes.foco || 'completa'}
- Margem mínima aceitável: ${opcoes.margemMinima || 15}%
- Incluir análise de risco: ${opcoes.incluirRiscos !== false}
- Análise tributária: ${opcoes.analiseTributaria !== false}

TEXTO COMPLETO DO EDITAL:
${textoEdital}

Realize uma análise COMPLETA e ESTRUTURADA deste edital, fornecendo resposta no formato JSON especificado:

{
  "resumo_executivo": {
    "objeto_simplificado": "descrição clara em até 100 caracteres",
    "valor_estimado": 0,
    "complexidade": "baixa/média/alta",
    "recomendacao": "participar/analisar_melhor/nao_participar",
    "justificativa_recomendacao": "explicação técnica da recomendação",
    "pontos_criticos": ["lista dos principais pontos de atenção"]
  },

  "dados_principais": {
    "numero_edital": "",
    "numero_processo": "",
    "modalidade": "",
    "tipo_licitacao": "",
    "criterio_julgamento": "",
    "orgao_nome": "",
    "uasg": "",
    "data_abertura": "",
    "hora_abertura": "",
    "local_disputa": "",
    "prazo_execucao": "",
    "prazo_vigencia": "",
    "permite_subcontratacao": true/false,
    "participacao_consorcio": true/false,
    "beneficios_me_epp": true/false
  },

  "analise_juridica": {
    "conformidade_legal": {
      "status": "conforme/irregular/duvidoso",
      "observacoes": ["lista de observações jurídicas"]
    },
    "possibilidades_impugnacao": [
      {
        "clausula_irregularidade": "",
        "fundamentacao_legal": "",
        "probabilidade_sucesso": "alta/média/baixa",
        "impacto_competitividade": "alto/médio/baixo"
      }
    ],
    "restricoes_competitividade": [],
    "riscos_juridicos": []
  },

  "requisitos_habilitacao": {
    "juridica": {
      "documentos_exigidos": [],
      "empresa_atende": true/false,
      "pendencias": [],
      "observacoes": []
    },
    "fiscal_trabalhista": {
      "certidoes_exigidas": [],
      "empresa_atende": true/false,
      "pendencias": [],
      "observacoes": []
    },
    "qualificacao_tecnica": {
      "atestados_exigidos": [],
      "registros_necessarios": [],
      "equipe_tecnica_exigida": [],
      "empresa_atende": true/false,
      "pendencias": [],
      "gap_analysis": []
    },
    "qualificacao_economica": {
      "capital_social_minimo": 0,
      "patrimonio_liquido_minimo": 0,
      "indices_exigidos": {
        "liquidez_geral": 0,
        "liquidez_corrente": 0,
        "grau_endividamento": 0
      },
      "garantia_proposta": {
        "exigida": true/false,
        "percentual": 0,
        "valor_estimado": 0,
        "modalidades_aceitas": []
      },
      "empresa_atende": true/false,
      "pendencias": []
    }
  },

  "analise_tributaria": {
    "regime_aplicavel": "",
    "impostos_incidentes": {
      "iss": {"aliquota": 0, "valor_estimado": 0},
      "pis": {"aliquota": 0, "valor_estimado": 0},
      "cofins": {"aliquota": 0, "valor_estimado": 0},
      "irpj": {"aliquota": 0, "valor_estimado": 0},
      "csll": {"aliquota": 0, "valor_estimado": 0},
      "inss": {"aliquota": 0, "valor_estimado": 0},
      "simples": {"aliquota": 0, "valor_estimado": 0}
    },
    "beneficios_fiscais_aplicaveis": [],
    "desoneracoes_possiveis": [],
    "carga_tributaria_total_percentual": 0,
    "carga_tributaria_valor": 0,
    "observacoes_fiscais": []
  },

  "estrategia_competitiva": {
    "analise_concorrencia": {
      "nivel_concorrencia_esperado": "baixo/médio/alto",
      "principais_competidores_potenciais": [],
      "historico_orgao": "",
      "preco_referencia_mercado": 0
    },
    "diferenciais_competitivos_necessarios": [],
    "pontos_atencao_competitiva": [],
    "estrategia_preco": {
      "faixa_competitiva": {"minimo": 0, "maximo": 0},
      "margem_sugerida": 0,
      "desconto_maximo_seguro": 0,
      "preco_alvo": 0
    },
    "estrategia_apresentacao": []
  },

  "riscos_identificados": [
    {
      "categoria": "juridico/financeiro/operacional/reputacional/tecnico",
      "descricao": "",
      "probabilidade": "alta/média/baixa",
      "impacto": "alto/médio/baixo",
      "mitigacao": "",
      "criticidade": "critica/alta/media/baixa"
    }
  ],

  "oportunidades": [
    {
      "tipo": "financeira/estrategica/comercial/tecnica",
      "descricao": "",
      "potencial_ganho": "",
      "como_explorar": "",
      "probabilidade_concretizacao": "alta/média/baixa"
    }
  ],

  "cronograma_acoes": [
    {
      "acao": "",
      "responsavel_sugerido": "",
      "prazo_limite": "",
      "prioridade": "critica/alta/media/baixa",
      "dependencias": []
    }
  ],

  "documentos_preparar": {
    "urgentes": [],
    "importantes": [],
    "podem_aguardar": [],
    "terceiros": []
  },

  "investimento_necessario": {
    "garantia_proposta": 0,
    "custos_documentacao": 0,
    "custos_preparacao_proposta": 0,
    "custos_participacao": 0,
    "total_investimento": 0
  },

  "score_viabilidade": {
    "score_final": 0,
    "detalhamento": {
      "atratividade_financeira": 0,
      "capacidade_tecnica_empresa": 0,
      "conformidade_documental": 0,
      "nivel_risco": 0,
      "competitividade_mercado": 0,
      "historico_orgao": 0
    },
    "classificacao": "excelente/muito_bom/bom/regular/ruim"
  },

  "parecer_final": {
    "decisao_recomendada": "participar/nao_participar/analisar_melhor",
    "justificativas_tecnicas": [],
    "condicoes_participacao": [],
    "proximos_passos_prioritarios": [],
    "observacoes_estrategicas": []
  }
}

IMPORTANTE:
- Seja preciso nos cálculos financeiros e tributários
- Considere especificamente o perfil da empresa solicitante
- Identifique TODOS os riscos relevantes
- Forneça recomendações práticas e acionáveis
- Base suas análises na legislação vigente
- Considere o contexto atual do mercado brasileiro`;
  }

  _extrairEParsearResposta(response) {
    try {
      const content = response.content[0].text;

      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Se não conseguir extrair JSON, retornar texto
      return { texto_resposta: content };

    } catch (error) {
      logger.error('Erro ao parsear resposta do Claude:', error);
      return {
        erro: 'Erro ao processar resposta',
        resposta_original: response.content[0].text
      };
    }
  }

  async _enriquecerAnalise(analise, dadosEmpresa) {
    try {
      // Adicionar metadados
      analise.metadata = {
        empresa_id: dadosEmpresa.id || null,
        data_analise: new Date().toISOString(),
        versao_analise: '1.0',
        modelo_claude: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229'
      };

      // Validar e corrigir scores
      if (analise.score_viabilidade && analise.score_viabilidade.detalhamento) {
        const scores = Object.values(analise.score_viabilidade.detalhamento);
        const scoresValidos = scores.filter(s => typeof s === 'number' && s >= 0 && s <= 100);

        if (scoresValidos.length > 0) {
          analise.score_viabilidade.score_final = Math.round(
            scoresValidos.reduce((sum, score) => sum + score, 0) / scoresValidos.length
          );
        }
      }

      // Adicionar classificação de risco geral
      if (analise.riscos_identificados && Array.isArray(analise.riscos_identificados)) {
        const riscosAltos = analise.riscos_identificados.filter(r =>
          r.probabilidade === 'alta' && r.impacto === 'alto'
        );

        analise.classificacao_risco_geral = riscosAltos.length > 2 ? 'alto' :
                                           riscosAltos.length > 0 ? 'medio' : 'baixo';
      }

      return analise;

    } catch (error) {
      logger.error('Erro ao enriquecer análise:', error);
      return analise; // Retorna análise original se houver erro
    }
  }

  _gerarAnaliseBasica(textoEdital, dadosEmpresa) {
    return {
      resumo_executivo: {
        objeto_simplificado: "Análise básica - Claude indisponível",
        complexidade: "media",
        recomendacao: "analisar_melhor",
        justificativa_recomendacao: "Análise automática não disponível, revisão manual necessária"
      },
      score_viabilidade: {
        score_final: 50,
        classificacao: "regular"
      },
      parecer_final: {
        decisao_recomendada: "analisar_melhor",
        observacoes_estrategicas: ["Sistema de IA temporariamente indisponível", "Recomenda-se análise manual detalhada"]
      },
      erro: "Análise com IA não disponível",
      metadata: {
        data_analise: new Date().toISOString(),
        modo_fallback: true
      }
    };
  }

  _gerarHashTexto(texto) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(texto.substring(0, 1000)).digest('hex');
  }

  // =====================================================
  // MÉTODOS DE UTILIDADE E ESTATÍSTICAS
  // =====================================================

  async obterEstatisticasUso(empresaId) {
    try {
      if (!redisManager) return null;

      const stats = await redisManager.hgetall(`claude_stats:${empresaId}`);
      return {
        total_analises: parseInt(stats.total_analises || 0),
        analises_hoje: parseInt(stats.analises_hoje || 0),
        impugnacoes_geradas: parseInt(stats.impugnacoes_geradas || 0),
        questionamentos_elaborados: parseInt(stats.questionamentos_elaborados || 0),
        ultimo_uso: stats.ultimo_uso || null
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }

  async incrementarEstatisticas(empresaId, tipo) {
    try {
      if (!redisManager) return;

      const hoje = new Date().toISOString().split('T')[0];
      const key = `claude_stats:${empresaId}`;

      await redisManager.hset(key, 'ultimo_uso', new Date().toISOString());
      await redisManager.hset(key, `${tipo}_total`, (await redisManager.hget(key, `${tipo}_total`) || 0) + 1);
      await redisManager.hset(key, `${tipo}_${hoje}`, (await redisManager.hget(key, `${tipo}_${hoje}`) || 0) + 1);

    } catch (error) {
      logger.error('Erro ao incrementar estatísticas:', error);
    }
  }
}

module.exports = ClaudeLicitacoesSpecialist;