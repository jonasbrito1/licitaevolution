const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Importar serviços de IA
const ScoringAlgorithms = require('../services/ai/ScoringAlgorithms');
const StrategicRecommendationEngine = require('../services/ai/StrategicRecommendationEngine');

// Inicializar serviços
const scoringAlgorithms = new ScoringAlgorithms();
const recommendationEngine = new StrategicRecommendationEngine();

/**
 * Dados mock para desenvolvimento
 */
const getMockEdital = (editalId) => ({
  id: editalId,
  numero_edital: 'PE-001/2024',
  orgao_nome: 'Prefeitura Municipal de São Paulo',
  modalidade: 'pregao',
  objeto: 'Aquisição de equipamentos de informática para modernização da rede municipal',
  valor_estimado: 250000.00,
  data_abertura: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias no futuro
  data_questionamento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  prazo_execucao: '90 dias',
  prazo_vigencia: '12 meses',
  permite_me_epp: true,
  permite_subcontratacao: true,
  participacao_consorcio: false,
  documentos_exigidos: ['CNPJ', 'Certidão de regularidade fiscal', 'Atestado de capacidade técnica'],
  requisitos_habilitacao: {
    qualificacao_tecnica: ['Atestado de capacidade técnica', 'Comprovação de experiência'],
    qualificacao_economica: ['Balanço patrimonial', 'Certidão negativa de falência'],
    habilitacao_juridica: ['Contrato social', 'Certidão de regularidade']
  },
  criterio_julgamento: 'menor_preco',
  tipo_licitacao: 'servicos_comuns'
});

const getMockEmpresa = () => ({
  id: '87654321-4321-4321-4321-cba987654321',
  razao_social: 'LicitaEvolution Demo LTDA',
  porte_empresa: 'pequena',
  regime_tributario: 'simples_nacional',
  faturamento_anual: 1000000,
  estado: 'SP',
  areas_atuacao: ['tecnologia', 'consultoria'],
  tecnologias_dominadas: ['javascript', 'node.js', 'react', 'mysql', 'aws'],
  capacidade_simultanea: 3
});

/**
 * @route POST /api/ai-analysis/edital/:editalId/scoring
 * @desc Calcula scores detalhados para um edital
 * @access Private
 */
router.post('/edital/:editalId/scoring', [
  auth,
  param('editalId').notEmpty().withMessage('ID do edital é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { editalId } = req.params;

    // Usar dados mock
    const edital = getMockEdital(editalId);
    const empresa = getMockEmpresa();

    // Calcular scores
    const scores = scoringAlgorithms.calculateAllScores(edital, empresa);

    logger.info(`📊 Scores calculados para edital ${editalId}: ${scores.final}`);

    res.json({
      success: true,
      message: 'Scores calculados com sucesso',
      data: {
        edital_id: editalId,
        scores: scores,
        calculated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro no cálculo de scores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no cálculo de scores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/ai-analysis/edital/:editalId/recommendation
 * @desc Gera recomendação estratégica para um edital
 * @access Private
 */
router.post('/edital/:editalId/recommendation', [
  auth,
  param('editalId').notEmpty().withMessage('ID do edital é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { editalId } = req.params;

    // Usar dados mock
    const edital = getMockEdital(editalId);
    const empresa = getMockEmpresa();

    // Gerar recomendação estratégica
    const recomendacao = await recommendationEngine.generateStrategicRecommendation(
      edital,
      empresa,
      null // analiseIA
    );

    logger.info(`🎯 Recomendação gerada para edital ${editalId}: ${recomendacao.decisao_recomendada}`);

    res.json({
      success: true,
      message: 'Recomendação estratégica gerada com sucesso',
      data: recomendacao
    });

  } catch (error) {
    logger.error('Erro na geração de recomendação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na geração de recomendação',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/ai-analysis/edital/:editalId/analyze
 * @desc Executa análise completa de IA para um edital (mock)
 * @access Private
 */
router.post('/edital/:editalId/analyze', [
  auth,
  param('editalId').notEmpty().withMessage('ID do edital é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { editalId } = req.params;
    const userId = req.user.id;

    logger.info(`🤖 Iniciando análise IA mock do edital ${editalId} pelo usuário ${userId}`);

    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Usar dados mock
    const edital = getMockEdital(editalId);
    const empresa = getMockEmpresa();

    // Calcular scores
    const scores = scoringAlgorithms.calculateAllScores(edital, empresa);

    // Gerar análise mock
    const analiseCompleta = {
      resumo_executivo: 'Edital com boa viabilidade para participação. O objeto está alinhado com as capacidades da empresa e o valor é adequado.',
      pontos_fortes: [
        'Valor do contrato adequado ao porte da empresa',
        'Objeto alinhado com expertise em tecnologia',
        'Prazo de execução adequado',
        'Permite participação de ME/EPP'
      ],
      pontos_fracos: [
        'Concorrência esperada pode ser alta',
        'Documentação técnica pode ser complexa'
      ],
      analise_detalhada: {
        objeto_adequacao: 'O objeto do edital está bem alinhado com as capacidades da empresa em tecnologia',
        valor_atratividade: 'Valor atrativo e dentro da faixa de operação da empresa',
        prazo_viabilidade: 'Prazos adequados para execução com qualidade',
        orgao_confiabilidade: 'Órgão com boa reputação de pagamento'
      },
      observacoes: 'Recomenda-se preparação cuidadosa da proposta técnica'
    };

    const mockAnalise = {
      id: `analise-${Date.now()}`,
      edital_id: editalId,
      usuario_id: userId,
      versao: 1,
      tipo_analise: 'completa',
      score_final: scores.final,
      score_financeiro: scores.financeiro,
      score_tecnico: scores.tecnico,
      score_documental: scores.documental,
      score_prazo: scores.prazo,
      score_risco: scores.risco,
      score_concorrencia: scores.concorrencia,
      analise_completa: analiseCompleta,
      pontos_fortes: analiseCompleta.pontos_fortes,
      pontos_fracos: analiseCompleta.pontos_fracos,
      recomendacoes: await recommendationEngine.generateStrategicRecommendation(edital, empresa, null),
      observacoes: analiseCompleta.observacoes,
      created_at: new Date().toISOString()
    };

    logger.info(`✅ Análise IA mock concluída para edital ${editalId}`);

    res.json({
      success: true,
      message: 'Análise IA concluída com sucesso',
      data: mockAnalise,
      from_cache: false
    });

  } catch (error) {
    logger.error('Erro na análise IA do edital:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na análise IA',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/ai-analysis/edital/:editalId/history
 * @desc Busca histórico de análises de um edital (mock)
 * @access Private
 */
router.get('/edital/:editalId/history', [
  auth,
  param('editalId').notEmpty().withMessage('ID do edital é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { editalId } = req.params;

    // Mock de histórico vazio
    const analises = [];

    res.json({
      success: true,
      message: 'Histórico de análises recuperado',
      data: {
        edital_id: editalId,
        total_analises: analises.length,
        analises: analises
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar histórico de análises:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar histórico',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/ai-analysis/stats
 * @desc Busca estatísticas das análises de IA da empresa (mock)
 * @access Private
 */
router.get('/stats', [auth], async (req, res) => {
  try {
    const mockStats = {
      resumo: {
        total_analises: 15,
        score_medio: 72.5,
        score_maximo: 89,
        score_minimo: 45
      },
      distribuicao_scores: [
        { score_final: 89, quantidade: 2 },
        { score_final: 78, quantidade: 5 },
        { score_final: 65, quantidade: 4 },
        { score_final: 52, quantidade: 3 },
        { score_final: 45, quantidade: 1 }
      ]
    };

    res.json({
      success: true,
      message: 'Estatísticas recuperadas com sucesso',
      data: mockStats
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar estatísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;