const logger = require('../../utils/logger');
const ScoringAlgorithms = require('./ScoringAlgorithms');

class StrategicRecommendationEngine {
  constructor() {
    this.scoringEngine = new ScoringAlgorithms();
    this.decisionThresholds = {
      participar: 75,      // Score >= 75: Recomenda participar
      analisar_mais: 60,   // Score 60-74: Analisar mais detalhadamente
      nao_participar: 60   // Score < 60: Não recomenda participar
    };
  }

  /**
   * Gera recomendação estratégica completa para um edital
   */
  async generateStrategicRecommendation(editalData, empresaProfile = null, analiseIA = null) {
    try {
      logger.info(`🎯 Gerando recomendação estratégica para edital ${editalData.numero_edital}`);

      // Calcular scores detalhados
      const scores = this.scoringEngine.calculateAllScores(editalData, empresaProfile);

      // Gerar decisão principal
      const decisao = this.generateDecision(scores, editalData, empresaProfile);

      // Gerar estratégias específicas
      const estrategias = this.generateParticipationStrategies(editalData, empresaProfile, scores, analiseIA);

      // Gerar plano de ação
      const planoAcao = this.generateActionPlan(editalData, empresaProfile, decisao, scores);

      // Gerar análise de precificação
      const precificacao = this.generatePricingStrategy(editalData, empresaProfile, scores);

      // Gerar recomendações de parcerias
      const parcerias = this.generatePartnershipRecommendations(editalData, empresaProfile, scores);

      // Gerar cronograma estratégico
      const cronograma = this.generateStrategicTimeline(editalData, decisao);

      // Calcular ROI estimado
      const roiAnalysis = this.calculateROIAnalysis(editalData, empresaProfile, scores);

      const recomendacao = {
        // Decisão principal
        decisao_recomendada: decisao.recomendacao,
        confianca_decisao: decisao.confianca,
        justificativa_principal: decisao.justificativa,

        // Scores detalhados
        scores: scores,
        fatores_decisivos: decisao.fatores_decisivos,

        // Estratégias
        estrategia_participacao: estrategias.estrategia_principal,
        estrategias_alternativas: estrategias.alternativas,
        vantagens_competitivas: estrategias.vantagens,

        // Plano de ação
        acoes_imediatas: planoAcao.imediatas,
        acoes_preparacao: planoAcao.preparacao,
        acoes_pos_decisao: planoAcao.pos_decisao,

        // Precificação
        estrategia_precificacao: precificacao.estrategia,
        margem_recomendada: precificacao.margem,
        preco_competitivo: precificacao.preco_sugerido,
        fatores_precificacao: precificacao.fatores,

        // Parcerias
        necessidade_parceria: parcerias.necessaria,
        tipos_parceria: parcerias.tipos,
        criterios_selecao: parcerias.criterios,

        // Cronograma
        cronograma_estrategico: cronograma,

        // Análise financeira
        roi_estimado: roiAnalysis.roi_percentual,
        retorno_investimento: roiAnalysis.retorno_valor,
        periodo_retorno: roiAnalysis.periodo_meses,
        analise_financeira: roiAnalysis.detalhes,

        // Metadados
        data_analise: new Date().toISOString(),
        versao_engine: '1.0',
        prioridade: this.calculatePriority(scores, decisao, roiAnalysis)
      };

      logger.info(`✅ Recomendação estratégica gerada: ${decisao.recomendacao}`);
      return recomendacao;

    } catch (error) {
      logger.error('Erro ao gerar recomendação estratégica:', error);
      throw error;
    }
  }

  /**
   * Gera decisão principal baseada nos scores
   */
  generateDecision(scores, editalData, empresaProfile) {
    const scoreFinal = scores.final;
    let recomendacao, confianca, justificativa;
    const fatoresDecisivos = [];

    // Determinar recomendação baseada no score
    if (scoreFinal >= this.decisionThresholds.participar) {
      recomendacao = 'participar';
      confianca = Math.min(95, 60 + (scoreFinal - 75));
      justificativa = 'Edital apresenta alta viabilidade e adequação ao perfil da empresa';
    } else if (scoreFinal >= this.decisionThresholds.analisar_mais) {
      recomendacao = 'analisar_mais';
      confianca = 40 + (scoreFinal - 60);
      justificativa = 'Edital requer análise mais detalhada antes da decisão final';
    } else {
      recomendacao = 'nao_participar';
      confianca = 60 + (60 - scoreFinal);
      justificativa = 'Edital não apresenta viabilidade adequada para participação';
    }

    // Identificar fatores decisivos
    Object.entries(scores).forEach(([fator, score]) => {
      if (fator === 'final') return;

      if (score >= 80) {
        fatoresDecisivos.push({
          fator: fator,
          impacto: 'positivo',
          score: score,
          descricao: this.getFactorDescription(fator, score, 'positivo')
        });
      } else if (score <= 40) {
        fatoresDecisivos.push({
          fator: fator,
          impacto: 'negativo',
          score: score,
          descricao: this.getFactorDescription(fator, score, 'negativo')
        });
      }
    });

    // Ajustar confiança baseado em fatores críticos
    const fatoresNegativos = fatoresDecisivos.filter(f => f.impacto === 'negativo');
    if (fatoresNegativos.length > 2) {
      confianca = Math.max(30, confianca - 20);
    }

    return {
      recomendacao,
      confianca: Math.round(confianca),
      justificativa,
      fatores_decisivos: fatoresDecisivos
    };
  }

  /**
   * Gera estratégias de participação
   */
  generateParticipationStrategies(editalData, empresaProfile, scores, analiseIA) {
    const estrategias = {
      estrategia_principal: '',
      alternativas: [],
      vantagens: []
    };

    // Estratégia principal baseada nos scores dominantes
    const scoresDominantes = Object.entries(scores)
      .filter(([key]) => key !== 'final')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    const [melhorFator] = scoresDominantes[0];

    switch (melhorFator) {
      case 'financeiro':
        estrategias.estrategia_principal = 'Estratégia de Competitividade por Preço';
        estrategias.alternativas.push('Destacar experiência em projetos similares com boa relação custo-benefício');
        break;
      case 'tecnico':
        estrategias.estrategia_principal = 'Estratégia de Diferenciação Técnica';
        estrategias.alternativas.push('Propor soluções inovadoras que agreguem valor além do solicitado');
        break;
      case 'documental':
        estrategias.estrategia_principal = 'Estratégia de Conformidade Exemplar';
        estrategias.alternativas.push('Preparar documentação impecável para ganhar pontos na habilitação');
        break;
      case 'prazo':
        estrategias.estrategia_principal = 'Estratégia de Agilidade na Entrega';
        estrategias.alternativas.push('Propor cronograma otimizado com entregas antecipadas');
        break;
      case 'concorrencia':
        estrategias.estrategia_principal = 'Estratégia de Posicionamento Único';
        estrategias.alternativas.push('Explorar nichos específicos onde há menor concorrência');
        break;
      default:
        estrategias.estrategia_principal = 'Estratégia Balanceada';
    }

    // Identificar vantagens competitivas
    if (scores.tecnico > 70) {
      estrategias.vantagens.push('Forte capacidade técnica para execução');
    }
    if (scores.financeiro > 70) {
      estrategias.vantagens.push('Proposta financeiramente competitiva');
    }
    if (scores.documental > 80) {
      estrategias.vantagens.push('Facilidade na habilitação documental');
    }
    if (editalData.permite_me_epp && empresaProfile?.porte_empresa === 'pequena') {
      estrategias.vantagens.push('Benefícios de ME/EPP aplicáveis');
    }

    return estrategias;
  }

  /**
   * Gera plano de ação estruturado
   */
  generateActionPlan(editalData, empresaProfile, decisao, scores) {
    const dataAbertura = new Date(editalData.data_abertura);
    const hoje = new Date();
    const diasParaAbertura = Math.ceil((dataAbertura - hoje) / (1000 * 60 * 60 * 24));

    const plano = {
      imediatas: [],
      preparacao: [],
      pos_decisao: []
    };

    // Ações imediatas (primeiros 2-3 dias)
    if (decisao.recomendacao === 'participar' || decisao.recomendacao === 'analisar_mais') {
      plano.imediatas.push('Baixar e analisar detalhadamente o edital completo');
      plano.imediatas.push('Verificar disponibilidade da equipe técnica para o período');
      plano.imediatas.push('Consultar documentação necessária para habilitação');

      if (diasParaAbertura <= 10) {
        plano.imediatas.push('URGENTE: Iniciar preparação da documentação imediatamente');
      }
    }

    // Ações de preparação (até a abertura)
    if (decisao.recomendacao === 'participar') {
      plano.preparacao.push('Elaborar proposta técnica detalhada');
      plano.preparacao.push('Calcular proposta de preços competitiva');
      plano.preparacao.push('Reunir e organizar documentos de habilitação');
      plano.preparacao.push('Validar proposta com equipe técnica e jurídica');

      if (scores.tecnico < 70) {
        plano.preparacao.push('Buscar parcerias técnicas para fortalecer a proposta');
      }

      if (scores.financeiro < 60) {
        plano.preparacao.push('Revisar estrutura de custos para melhorar competitividade');
      }
    }

    // Ações pós-decisão
    if (decisao.recomendacao === 'participar') {
      plano.pos_decisao.push('Enviar proposta dentro do prazo estabelecido');
      plano.pos_decisao.push('Acompanhar processo licitatório e possíveis recursos');
      plano.pos_decisao.push('Preparar equipe para eventual início do projeto');
    } else if (decisao.recomendacao === 'analisar_mais') {
      plano.pos_decisao.push('Buscar informações adicionais sobre o edital');
      plano.pos_decisao.push('Consultar outros participantes do mercado');
      plano.pos_decisao.push('Reavaliar decisão com base em novas informações');
    }

    return plano;
  }

  /**
   * Gera estratégia de precificação
   */
  generatePricingStrategy(editalData, empresaProfile, scores) {
    const valorEstimado = editalData.valor_estimado || 0;

    let estrategia = '';
    let margem = 15; // Margem padrão de 15%
    let precoSugerido = 0;
    const fatores = [];

    // Determinar estratégia baseada nos scores
    if (scores.concorrencia > 70) {
      estrategia = 'Precificação Competitiva';
      margem = 10; // Margem menor para ser mais competitivo
      fatores.push('Baixa concorrência permite margem otimizada');
    } else if (scores.concorrencia < 50) {
      estrategia = 'Precificação Premium';
      margem = 8; // Margem muito baixa devido à alta concorrência
      fatores.push('Alta concorrência exige preço mais agressivo');
    } else {
      estrategia = 'Precificação Balanceada';
      margem = 12;
      fatores.push('Concorrência moderada permite margem equilibrada');
    }

    // Ajustar margem baseada no score técnico
    if (scores.tecnico > 80) {
      margem += 3;
      fatores.push('Alta capacidade técnica justifica margem adicional');
    }

    // Ajustar margem baseada no valor do contrato
    if (valorEstimado > 500000) {
      margem -= 2;
      fatores.push('Valor alto do contrato requer margem mais conservadora');
    }

    // Calcular preço sugerido
    if (valorEstimado > 0) {
      const custoEstimado = valorEstimado * 0.75; // Assumir que 75% do valor é custo
      precoSugerido = custoEstimado * (1 + margem / 100);
    }

    return {
      estrategia,
      margem,
      preco_sugerido: Math.round(precoSugerido),
      fatores
    };
  }

  /**
   * Gera recomendações de parcerias
   */
  generatePartnershipRecommendations(editalData, empresaProfile, scores) {
    const recomendacoes = {
      necessaria: false,
      tipos: [],
      criterios: []
    };

    // Avaliar necessidade de parceria
    if (scores.tecnico < 60) {
      recomendacoes.necessaria = true;
      recomendacoes.tipos.push('Parceria Técnica');
      recomendacoes.criterios.push('Buscar empresa com expertise específica no objeto do edital');
    }

    if (scores.financeiro < 50 && editalData.valor_estimado > 300000) {
      recomendacoes.necessaria = true;
      recomendacoes.tipos.push('Parceria Financeira');
      recomendacoes.criterios.push('Buscar parceiro com capacidade financeira para o projeto');
    }

    if (scores.documental < 60) {
      recomendacoes.tipos.push('Consultoria Jurídica');
      recomendacoes.criterios.push('Contratar consultoria especializada em licitações');
    }

    const objeto = (editalData.objeto || '').toLowerCase();
    if (objeto.includes('nacional') || objeto.includes('múltiplas localidades')) {
      recomendacoes.tipos.push('Parceria Regional');
      recomendacoes.criterios.push('Buscar parceiro com presença nacional ou regional');
    }

    if (editalData.participacao_consorcio) {
      recomendacoes.tipos.push('Consórcio');
      recomendacoes.criterios.push('Formar consórcio com empresa complementar');
    }

    return recomendacoes;
  }

  /**
   * Gera cronograma estratégico
   */
  generateStrategicTimeline(editalData, decisao) {
    const dataAbertura = new Date(editalData.data_abertura);
    const hoje = new Date();
    const diasParaAbertura = Math.ceil((dataAbertura - hoje) / (1000 * 60 * 60 * 24));

    const cronograma = [];

    if (decisao.recomendacao === 'participar') {
      const marcos = [
        { atividade: 'Análise completa do edital', prazo: Math.max(1, Math.ceil(diasParaAbertura * 0.1)) },
        { atividade: 'Preparação da documentação', prazo: Math.max(2, Math.ceil(diasParaAbertura * 0.3)) },
        { atividade: 'Elaboração da proposta técnica', prazo: Math.max(3, Math.ceil(diasParaAbertura * 0.4)) },
        { atividade: 'Cálculo da proposta financeira', prazo: Math.max(1, Math.ceil(diasParaAbertura * 0.1)) },
        { atividade: 'Revisão e validação final', prazo: Math.max(1, Math.ceil(diasParaAbertura * 0.1)) }
      ];

      let acumulado = 0;
      marcos.forEach(marco => {
        const dataInicio = new Date(hoje);
        dataInicio.setDate(dataInicio.getDate() + acumulado);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + marco.prazo);

        cronograma.push({
          atividade: marco.atividade,
          data_inicio: dataInicio.toISOString().split('T')[0],
          data_fim: dataFim.toISOString().split('T')[0],
          dias_duracao: marco.prazo
        });

        acumulado += marco.prazo;
      });
    }

    return cronograma;
  }

  /**
   * Calcula análise de ROI
   */
  calculateROIAnalysis(editalData, empresaProfile, scores) {
    const valorContrato = editalData.valor_estimado || 0;

    // Estimar custos baseado no score financeiro
    let custoEstimado = valorContrato * 0.75; // Base: 75% do valor é custo

    if (scores.tecnico < 60) {
      custoEstimado *= 1.1; // +10% por complexidade técnica
    }

    if (scores.prazo < 60) {
      custoEstimado *= 1.05; // +5% por pressão de prazo
    }

    const margemEstimada = valorContrato - custoEstimado;
    const roiPercentual = valorContrato > 0 ? (margemEstimada / custoEstimado) * 100 : 0;

    // Estimar período de retorno (baseado no prazo de execução)
    const prazoExecucao = this.scoringEngine.extractExecutionTimeInDays(editalData.prazo_execucao);
    const periodoRetorno = Math.max(1, Math.ceil(prazoExecucao / 30)); // Converter para meses

    return {
      roi_percentual: Math.round(roiPercentual * 100) / 100,
      retorno_valor: Math.round(margemEstimada),
      periodo_meses: periodoRetorno,
      detalhes: {
        valor_contrato: valorContrato,
        custo_estimado: Math.round(custoEstimado),
        margem_estimada: Math.round(margemEstimada),
        risco_financeiro: scores.risco < 60 ? 'Alto' : scores.risco > 80 ? 'Baixo' : 'Médio'
      }
    };
  }

  /**
   * Calcula prioridade geral do edital
   */
  calculatePriority(scores, decisao, roiAnalysis) {
    let prioridade = scores.final;

    // Ajustar baseado no ROI
    if (roiAnalysis.roi_percentual > 25) {
      prioridade += 10;
    } else if (roiAnalysis.roi_percentual < 10) {
      prioridade -= 10;
    }

    // Ajustar baseado na decisão
    if (decisao.recomendacao === 'participar' && decisao.confianca > 80) {
      prioridade += 5;
    }

    if (prioridade >= 80) return 'alta';
    if (prioridade >= 60) return 'média';
    return 'baixa';
  }

  /**
   * Gera descrição para fatores decisivos
   */
  getFactorDescription(fator, score, impacto) {
    const descriptions = {
      financeiro: {
        positivo: 'Excelente viabilidade financeira e adequação de valor',
        negativo: 'Questões financeiras podem comprometer a viabilidade'
      },
      tecnico: {
        positivo: 'Forte adequação técnica às capacidades da empresa',
        negativo: 'Complexidade técnica acima das capacidades atuais'
      },
      documental: {
        positivo: 'Documentação necessária facilmente atendível',
        negativo: 'Documentação exigida apresenta dificuldades significativas'
      },
      prazo: {
        positivo: 'Prazos adequados e bem distribuídos',
        negativo: 'Prazos apertados ou inadequados para execução'
      },
      risco: {
        positivo: 'Baixo nível de risco identificado',
        negativo: 'Alto nível de risco pode comprometer o projeto'
      },
      concorrencia: {
        positivo: 'Baixa concorrência esperada, boa chance de sucesso',
        negativo: 'Alta concorrência pode reduzir chances de sucesso'
      }
    };

    return descriptions[fator]?.[impacto] || 'Fator relevante para a decisão';
  }
}

module.exports = StrategicRecommendationEngine;