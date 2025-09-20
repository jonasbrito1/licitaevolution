const logger = require('../../utils/logger');

class ScoringAlgorithms {
  constructor() {
    this.weights = {
      financeiro: 0.25,    // 25% - Viabilidade financeira
      tecnico: 0.20,       // 20% - Complexidade técnica
      documental: 0.15,    // 15% - Facilidade documental
      prazo: 0.15,         // 15% - Adequação de prazos
      risco: 0.15,         // 15% - Nível de risco
      concorrencia: 0.10   // 10% - Competitividade
    };
  }

  /**
   * Calcula score financeiro baseado em valor e complexidade
   */
  calculateFinancialScore(editalData, empresaProfile = null) {
    try {
      let score = 50; // Score base

      const valor = editalData.valor_estimado || 0;

      // Análise do valor do contrato
      if (valor > 0) {
        // Faixas de valor ideais (baseado no perfil da empresa)
        const faixaIdealMin = empresaProfile?.faturamento_anual * 0.05 || 50000;
        const faixaIdealMax = empresaProfile?.faturamento_anual * 0.30 || 500000;

        if (valor >= faixaIdealMin && valor <= faixaIdealMax) {
          score += 30; // Valor na faixa ideal
        } else if (valor < faixaIdealMin) {
          score += 15; // Valor baixo mas aceitável
        } else if (valor > faixaIdealMax && valor <= faixaIdealMax * 2) {
          score += 20; // Valor alto mas gerenciável
        } else {
          score += 5; // Valor muito alto, risco elevado
        }
      }

      // Modalidade influencia score financeiro
      const modalidade = editalData.modalidade?.toLowerCase() || '';
      if (modalidade.includes('pregao')) {
        score += 10; // Pregões geralmente mais ágeis
      } else if (modalidade.includes('concorrencia')) {
        score -= 5; // Concorrências mais burocráticas
      }

      // Prazo de pagamento (se disponível)
      const prazoPagamento = this.extractPaymentTerms(editalData);
      if (prazoPagamento <= 30) {
        score += 15;
      } else if (prazoPagamento <= 60) {
        score += 5;
      } else {
        score -= 10;
      }

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score financeiro:', error);
      return 50;
    }
  }

  /**
   * Calcula score técnico baseado em complexidade e adequação
   */
  calculateTechnicalScore(editalData, empresaProfile = null) {
    try {
      let score = 50; // Score base

      const objeto = (editalData.objeto || '').toLowerCase();
      const especificacoes = editalData.especificacoes_tecnicas || [];

      // Análise da adequação técnica
      const expertiseAreas = empresaProfile?.areas_atuacao || ['tecnologia', 'consultoria'];

      // Verificar se o objeto está na área de expertise
      const isInExpertise = expertiseAreas.some(area =>
        objeto.includes(area.toLowerCase()) ||
        objeto.includes('sistema') ||
        objeto.includes('software') ||
        objeto.includes('tecnologia') ||
        objeto.includes('informatica')
      );

      if (isInExpertise) {
        score += 25;
      } else {
        score -= 15;
      }

      // Complexidade técnica baseada em palavras-chave
      const complexityKeywords = [
        'integracao', 'api', 'microservicos', 'blockchain', 'ia', 'machine learning',
        'big data', 'cloud', 'aws', 'azure', 'devops', 'kubernetes'
      ];

      const foundComplexKeywords = complexityKeywords.filter(keyword =>
        objeto.includes(keyword) ||
        especificacoes.some(spec => spec.toLowerCase().includes(keyword))
      );

      if (foundComplexKeywords.length === 0) {
        score += 15; // Baixa complexidade
      } else if (foundComplexKeywords.length <= 2) {
        score += 10; // Média complexidade
      } else if (foundComplexKeywords.length <= 4) {
        score += 5; // Alta complexidade
      } else {
        score -= 10; // Muito alta complexidade
      }

      // Tecnologias específicas
      const techs = empresaProfile?.tecnologias_dominadas || ['javascript', 'node.js', 'react', 'mysql'];
      const requiredTechs = this.extractRequiredTechnologies(editalData);

      const techMatch = requiredTechs.filter(tech =>
        techs.some(domTech => domTech.toLowerCase().includes(tech.toLowerCase()))
      ).length;

      if (requiredTechs.length === 0) {
        score += 5; // Nenhuma tecnologia específica
      } else {
        const matchPercentage = techMatch / requiredTechs.length;
        score += Math.round(matchPercentage * 20);
      }

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score técnico:', error);
      return 50;
    }
  }

  /**
   * Calcula score documental baseado em requisitos de habilitação
   */
  calculateDocumentalScore(editalData, empresaProfile = null) {
    try {
      let score = 70; // Score base (maioria das empresas tem docs básicos)

      const docsExigidos = editalData.documentos_exigidos || [];
      const requisitos = editalData.requisitos_habilitacao || {};

      // Documentos básicos (maioria das empresas tem)
      const basicDocs = [
        'certidao regularidade fiscal', 'cnpj', 'contrato social',
        'certidao municipal', 'certidao estadual', 'fgts', 'inss'
      ];

      // Documentos técnicos (podem ser mais complexos)
      const technicalDocs = [
        'atestado capacidade tecnica', 'certidao acervo tecnico',
        'comprovacao experiencia', 'qualificacao tecnica'
      ];

      // Documentos financeiros (podem exigir comprovações específicas)
      const financialDocs = [
        'balanco patrimonial', 'demonstracao resultado',
        'capital social', 'patrimonio liquido', 'faturamento'
      ];

      // Contar documentos por categoria
      let basicCount = 0;
      let technicalCount = 0;
      let financialCount = 0;

      docsExigidos.forEach(doc => {
        const docLower = doc.toLowerCase();
        if (basicDocs.some(basic => docLower.includes(basic))) {
          basicCount++;
        } else if (technicalDocs.some(tech => docLower.includes(tech))) {
          technicalCount++;
        } else if (financialDocs.some(fin => docLower.includes(fin))) {
          financialCount++;
        }
      });

      // Penalizar por documentos técnicos complexos
      if (technicalCount > 3) {
        score -= 20;
      } else if (technicalCount > 1) {
        score -= 10;
      }

      // Penalizar por documentos financeiros rigorosos
      if (financialCount > 2) {
        score -= 15;
      } else if (financialCount > 0) {
        score -= 5;
      }

      // Verificar se empresa atende requisitos mínimos
      const empresaPorte = empresaProfile?.porte_empresa || 'pequena';
      if (empresaPorte === 'micro' || empresaPorte === 'pequena') {
        if (editalData.permite_me_epp) {
          score += 15; // Benefício ME/EPP
        }
      }

      // Qualificação técnica específica
      const qualifTecnica = requisitos.qualificacao_tecnica || [];
      if (qualifTecnica.length > 5) {
        score -= 15;
      } else if (qualifTecnica.length > 2) {
        score -= 8;
      }

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score documental:', error);
      return 70;
    }
  }

  /**
   * Calcula score de prazo baseado em adequação temporal
   */
  calculateTimelineScore(editalData, empresaProfile = null) {
    try {
      let score = 50; // Score base

      const dataAbertura = new Date(editalData.data_abertura);
      const hoje = new Date();
      const diasParaAbertura = Math.ceil((dataAbertura - hoje) / (1000 * 60 * 60 * 24));

      // Tempo para preparação da proposta
      if (diasParaAbertura >= 15) {
        score += 20; // Tempo suficiente
      } else if (diasParaAbertura >= 10) {
        score += 10; // Tempo razoável
      } else if (diasParaAbertura >= 5) {
        score += 0; // Tempo apertado
      } else {
        score -= 20; // Muito pouco tempo
      }

      // Prazo de execução
      const prazoExecucao = this.extractExecutionTimeInDays(editalData.prazo_execucao);
      if (prazoExecucao > 0) {
        const capacidadeExecucao = empresaProfile?.capacidade_simultanea || 3;

        if (prazoExecucao >= 180) { // 6 meses ou mais
          score += 15;
        } else if (prazoExecucao >= 90) { // 3-6 meses
          score += 10;
        } else if (prazoExecucao >= 30) { // 1-3 meses
          score += 5;
        } else {
          score -= 15; // Menos de 1 mês
        }
      }

      // Vigência do contrato
      const prazoVigencia = this.extractContractDurationInMonths(editalData.prazo_vigencia);
      if (prazoVigencia >= 12) {
        score += 10; // Contrato longo, mais estabilidade
      } else if (prazoVigencia >= 6) {
        score += 5;
      }

      // Verificar conflitos com outros projetos (seria necessário integração com agenda)
      // Por enquanto, assumir score neutro

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score de prazo:', error);
      return 50;
    }
  }

  /**
   * Calcula score de risco baseado em fatores diversos
   */
  calculateRiskScore(editalData, empresaProfile = null) {
    try {
      let score = 80; // Score base (80 = baixo risco)

      // Risco do órgão (baseado em histórico - por enquanto genérico)
      const orgao = (editalData.orgao_nome || '').toLowerCase();
      if (orgao.includes('federal') || orgao.includes('ministerio')) {
        score += 10; // Órgãos federais geralmente mais confiáveis
      } else if (orgao.includes('municipal')) {
        score -= 5; // Órgãos municipais podem ter mais burocracria
      }

      // Risco por modalidade
      const modalidade = editalData.modalidade?.toLowerCase() || '';
      if (modalidade.includes('emergencia')) {
        score -= 20; // Licitações emergenciais são mais arriscadas
      } else if (modalidade.includes('registro_preco')) {
        score -= 10; // Registro de preços tem riscos específicos
      }

      // Risco de valor
      const valor = editalData.valor_estimado || 0;
      if (valor > 1000000) {
        score -= 15; // Valores altos aumentam risco
      } else if (valor > 500000) {
        score -= 10;
      } else if (valor < 50000) {
        score -= 5; // Valores muito baixos podem não compensar
      }

      // Risco de subcontratação
      if (editalData.permite_subcontratacao) {
        score += 5; // Flexibilidade reduz risco
      }

      // Risco de consórcio
      if (editalData.participacao_consorcio) {
        score -= 10; // Consórcios aumentam complexidade
      }

      // Risco de prazo
      const prazoExecucao = this.extractExecutionTimeInDays(editalData.prazo_execucao);
      if (prazoExecucao > 0 && prazoExecucao < 30) {
        score -= 20; // Prazos muito curtos são arriscados
      }

      // Risco técnico
      const objeto = (editalData.objeto || '').toLowerCase();
      const highRiskKeywords = [
        'missao critica', 'seguranca nacional', 'dados sensíveis',
        'alta disponibilidade', '24x7', 'sla rigoroso'
      ];

      const foundRiskKeywords = highRiskKeywords.filter(keyword =>
        objeto.includes(keyword)
      );

      score -= foundRiskKeywords.length * 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score de risco:', error);
      return 80;
    }
  }

  /**
   * Calcula score de concorrência baseado em competitividade
   */
  calculateCompetitionScore(editalData, empresaProfile = null) {
    try {
      let score = 50; // Score base

      const valor = editalData.valor_estimado || 0;
      const objeto = (editalData.objeto || '').toLowerCase();

      // Análise por valor (valores menores = menos concorrência)
      if (valor < 100000) {
        score += 25; // Baixa concorrência
      } else if (valor < 300000) {
        score += 15;
      } else if (valor < 1000000) {
        score += 5;
      } else {
        score -= 15; // Alta concorrência
      }

      // Análise por complexidade técnica
      const technicalKeywords = [
        'especializado', 'customizado', 'específico', 'proprietário',
        'integração complexa', 'arquitetura avançada'
      ];

      const foundTechKeywords = technicalKeywords.filter(keyword =>
        objeto.includes(keyword)
      );

      score += foundTechKeywords.length * 8; // Maior especialização = menor concorrência

      // Análise por localização
      const estado = editalData.orgao_estado?.toLowerCase() || '';
      const empresaEstado = empresaProfile?.estado?.toLowerCase() || 'sp';

      if (estado === empresaEstado) {
        score += 10; // Vantagem local
      } else if (estado !== 'sp' && estado !== 'rj' && estado !== 'mg') {
        score += 15; // Estados menores têm menos concorrência
      }

      // Análise por modalidade
      const modalidade = editalData.modalidade?.toLowerCase() || '';
      if (modalidade.includes('convite')) {
        score += 30; // Convites têm participação restrita
      } else if (modalidade.includes('tomada_preco')) {
        score += 10;
      } else if (modalidade.includes('pregao')) {
        score -= 10; // Pregões são muito concorridos
      }

      // ME/EPP advantage
      if (editalData.permite_me_epp && (empresaProfile?.porte_empresa === 'micro' || empresaProfile?.porte_empresa === 'pequena')) {
        score += 15; // Vantagem competitiva para ME/EPP
      }

      // Análise de deadline
      const dataAbertura = new Date(editalData.data_abertura);
      const hoje = new Date();
      const diasParaAbertura = Math.ceil((dataAbertura - hoje) / (1000 * 60 * 60 * 24));

      if (diasParaAbertura < 7) {
        score += 10; // Prazos curtos reduzem participação
      }

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Erro no cálculo do score de concorrência:', error);
      return 50;
    }
  }

  /**
   * Calcula score final ponderado
   */
  calculateFinalScore(scores, customWeights = null) {
    try {
      const weights = customWeights || this.weights;

      const finalScore =
        (scores.financeiro || 0) * weights.financeiro +
        (scores.tecnico || 0) * weights.tecnico +
        (scores.documental || 0) * weights.documental +
        (scores.prazo || 0) * weights.prazo +
        (scores.risco || 0) * weights.risco +
        (scores.concorrencia || 0) * weights.concorrencia;

      return Math.round(finalScore);
    } catch (error) {
      logger.error('Erro no cálculo do score final:', error);
      return 50;
    }
  }

  /**
   * Calcula todos os scores de uma vez
   */
  calculateAllScores(editalData, empresaProfile = null, customWeights = null) {
    try {
      const scores = {
        financeiro: this.calculateFinancialScore(editalData, empresaProfile),
        tecnico: this.calculateTechnicalScore(editalData, empresaProfile),
        documental: this.calculateDocumentalScore(editalData, empresaProfile),
        prazo: this.calculateTimelineScore(editalData, empresaProfile),
        risco: this.calculateRiskScore(editalData, empresaProfile),
        concorrencia: this.calculateCompetitionScore(editalData, empresaProfile)
      };

      scores.final = this.calculateFinalScore(scores, customWeights);

      return scores;
    } catch (error) {
      logger.error('Erro no cálculo geral de scores:', error);
      return {
        financeiro: 50,
        tecnico: 50,
        documental: 50,
        prazo: 50,
        risco: 50,
        concorrencia: 50,
        final: 50
      };
    }
  }

  // Métodos auxiliares para extração de dados

  extractPaymentTerms(editalData) {
    // Simular extração de prazo de pagamento
    // Em implementação real, analisaria o contrato/edital
    return 30; // Default 30 dias
  }

  extractRequiredTechnologies(editalData) {
    const objeto = (editalData.objeto || '').toLowerCase();
    const specs = editalData.especificacoes_tecnicas || [];

    const allText = (objeto + ' ' + specs.join(' ')).toLowerCase();

    const techs = [];
    const techKeywords = [
      'java', 'javascript', 'python', 'php', 'nodejs', 'react', 'angular',
      'vue', 'mysql', 'postgresql', 'mongodb', 'oracle', 'aws', 'azure',
      'docker', 'kubernetes', 'linux', 'windows'
    ];

    techKeywords.forEach(tech => {
      if (allText.includes(tech)) {
        techs.push(tech);
      }
    });

    return techs;
  }

  extractExecutionTimeInDays(prazoString) {
    if (!prazoString) return 0;

    const prazo = prazoString.toLowerCase();

    if (prazo.includes('dia')) {
      const match = prazo.match(/(\d+)\s*dias?/);
      return match ? parseInt(match[1]) : 0;
    }

    if (prazo.includes('mes')) {
      const match = prazo.match(/(\d+)\s*mes/);
      return match ? parseInt(match[1]) * 30 : 0;
    }

    if (prazo.includes('ano')) {
      const match = prazo.match(/(\d+)\s*anos?/);
      return match ? parseInt(match[1]) * 365 : 0;
    }

    return 90; // Default 3 meses
  }

  extractContractDurationInMonths(vigenciaString) {
    if (!vigenciaString) return 12;

    const vigencia = vigenciaString.toLowerCase();

    if (vigencia.includes('mes')) {
      const match = vigencia.match(/(\d+)\s*mes/);
      return match ? parseInt(match[1]) : 12;
    }

    if (vigencia.includes('ano')) {
      const match = vigencia.match(/(\d+)\s*anos?/);
      return match ? parseInt(match[1]) * 12 : 12;
    }

    return 12; // Default 1 ano
  }
}

module.exports = ScoringAlgorithms;