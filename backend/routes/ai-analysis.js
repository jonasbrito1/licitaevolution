const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Importar serviços de IA
const AIAnalysisService = require('../services/ai/AIAnalysisService');
const DocumentParserService = require('../services/ai/DocumentParserService');
const ScoringAlgorithms = require('../services/ai/ScoringAlgorithms');
const StrategicRecommendationEngine = require('../services/ai/StrategicRecommendationEngine');

// Importar models
// const { Edital, AnaliseEdital, Empresa } = require('../models');
// Temporariamente comentado até os models estarem prontos

// Inicializar serviços
const aiAnalysisService = new AIAnalysisService();
const documentParserService = new DocumentParserService();
const scoringAlgorithms = new ScoringAlgorithms();
const recommendationEngine = new StrategicRecommendationEngine();

/**
 * @route POST /api/ai-analysis/edital/:editalId/analyze
 * @desc Executa análise completa de IA para um edital
 * @access Private
 */
router.post('/edital/:editalId/analyze', [
  auth,
  param('editalId').isUUID().withMessage('ID do edital inválido')
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

    logger.info(`🤖 Iniciando análise IA completa do edital ${editalId} pelo usuário ${userId}`);

    // Verificar se edital existe e pertence à empresa do usuário
    const edital = await Edital.findOne({
      where: {
        id: editalId,
        empresa_id: req.user.empresa_id
      }
    });

    if (!edital) {
      return res.status(404).json({
        success: false,
        message: 'Edital não encontrado'
      });
    }

    // Verificar se já existe análise recente (últimas 24h)
    const analiseExistente = await AnaliseEdital.findOne({
      where: {
        edital_id: editalId,
        created_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (analiseExistente && !req.body.force_reanalysis) {
      return res.json({
        success: true,
        message: 'Análise recente encontrada',
        data: analiseExistente,
        from_cache: true
      });
    }

    // Executar análise IA completa
    const analiseCompleta = await aiAnalysisService.analyzeEdital(editalId, userId);

    logger.info(`✅ Análise IA concluída para edital ${editalId}`);

    res.json({
      success: true,
      message: 'Análise IA concluída com sucesso',
      data: analiseCompleta,
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
 * @route POST /api/ai-analysis/edital/:editalId/document-parse
 * @desc Analisa documento do edital usando IA
 * @access Private
 */
router.post('/edital/:editalId/document-parse', [
  auth,
  param('editalId').isUUID().withMessage('ID do edital inválido'),
  body('file_path').notEmpty().withMessage('Caminho do arquivo é obrigatório')
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
    const { file_path } = req.body;

    logger.info(`📄 Iniciando análise de documento: ${file_path}`);

    // Verificar se edital existe e pertence à empresa do usuário
    const edital = await Edital.findOne({
      where: {
        id: editalId,
        empresa_id: req.user.empresa_id
      }
    });

    if (!edital) {
      return res.status(404).json({
        success: false,
        message: 'Edital não encontrado'
      });
    }

    // Executar análise do documento
    const documentoAnalisado = await documentParserService.parseEditalDocument(file_path, editalId);

    // Atualizar edital com dados extraídos
    const dadosAtualizacao = {};
    if (documentoAnalisado.numero_edital) dadosAtualizacao.numero_edital = documentoAnalisado.numero_edital;
    if (documentoAnalisado.modalidade) dadosAtualizacao.modalidade = documentoAnalisado.modalidade;
    if (documentoAnalisado.objeto) dadosAtualizacao.objeto = documentoAnalisado.objeto;
    if (documentoAnalisado.valor_estimado) dadosAtualizacao.valor_estimado = documentoAnalisado.valor_estimado;
    if (documentoAnalisado.data_abertura) dadosAtualizacao.data_abertura = documentoAnalisado.data_abertura;
    if (documentoAnalisado.documentos_exigidos) dadosAtualizacao.documentos_exigidos = documentoAnalisado.documentos_exigidos;
    if (documentoAnalisado.requisitos_habilitacao) dadosAtualizacao.requisitos_habilitacao = documentoAnalisado.requisitos_habilitacao;

    if (Object.keys(dadosAtualizacao).length > 0) {
      await edital.update(dadosAtualizacao);
    }

    logger.info(`✅ Documento analisado e edital atualizado: ${editalId}`);

    res.json({
      success: true,
      message: 'Documento analisado com sucesso',
      data: documentoAnalisado
    });

  } catch (error) {
    logger.error('Erro na análise do documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na análise do documento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/ai-analysis/edital/:editalId/scoring
 * @desc Calcula scores detalhados para um edital
 * @access Private
 */
router.post('/edital/:editalId/scoring', [
  auth,
  param('editalId').isUUID().withMessage('ID do edital inválido')
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

    // Buscar edital
    const edital = await Edital.findOne({
      where: {
        id: editalId,
        empresa_id: req.user.empresa_id
      }
    });

    if (!edital) {
      return res.status(404).json({
        success: false,
        message: 'Edital não encontrado'
      });
    }

    // Buscar perfil da empresa
    const empresa = await Empresa.findByPk(req.user.empresa_id);

    // Calcular scores
    const scores = scoringAlgorithms.calculateAllScores(edital.toJSON(), empresa?.toJSON());

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
  param('editalId').isUUID().withMessage('ID do edital inválido')
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

    // Buscar edital
    const edital = await Edital.findOne({
      where: {
        id: editalId,
        empresa_id: req.user.empresa_id
      }
    });

    if (!edital) {
      return res.status(404).json({
        success: false,
        message: 'Edital não encontrado'
      });
    }

    // Buscar perfil da empresa
    const empresa = await Empresa.findByPk(req.user.empresa_id);

    // Buscar análise IA existente
    const analiseIA = await AnaliseEdital.findOne({
      where: { edital_id: editalId },
      order: [['created_at', 'DESC']]
    });

    // Gerar recomendação estratégica
    const recomendacao = await recommendationEngine.generateStrategicRecommendation(
      edital.toJSON(),
      empresa?.toJSON(),
      analiseIA?.toJSON()
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
 * @route GET /api/ai-analysis/edital/:editalId/history
 * @desc Busca histórico de análises de um edital
 * @access Private
 */
router.get('/edital/:editalId/history', [
  auth,
  param('editalId').isUUID().withMessage('ID do edital inválido')
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

    // Verificar se edital existe e pertence à empresa do usuário
    const edital = await Edital.findOne({
      where: {
        id: editalId,
        empresa_id: req.user.empresa_id
      }
    });

    if (!edital) {
      return res.status(404).json({
        success: false,
        message: 'Edital não encontrado'
      });
    }

    // Buscar histórico de análises
    const analises = await AnaliseEdital.findAll({
      where: { edital_id: editalId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

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
 * @route POST /api/ai-analysis/batch-analyze
 * @desc Executa análise em lote de múltiplos editais
 * @access Private
 */
router.post('/batch-analyze', [
  auth,
  body('edital_ids').isArray().withMessage('Lista de IDs de editais é obrigatória'),
  body('edital_ids.*').isUUID().withMessage('IDs de editais inválidos')
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

    const { edital_ids } = req.body;
    const userId = req.user.id;

    if (edital_ids.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 10 editais por análise em lote'
      });
    }

    logger.info(`🔄 Iniciando análise em lote de ${edital_ids.length} editais`);

    // Verificar se todos os editais existem e pertencem à empresa
    const editais = await Edital.findAll({
      where: {
        id: edital_ids,
        empresa_id: req.user.empresa_id
      }
    });

    if (editais.length !== edital_ids.length) {
      return res.status(404).json({
        success: false,
        message: 'Alguns editais não foram encontrados'
      });
    }

    // Executar análises em paralelo (máximo 3 simultâneas)
    const chunkSize = 3;
    const resultados = [];

    for (let i = 0; i < edital_ids.length; i += chunkSize) {
      const chunk = edital_ids.slice(i, i + chunkSize);

      const promisesChunk = chunk.map(async (editalId) => {
        try {
          const analise = await aiAnalysisService.analyzeEdital(editalId, userId);
          return {
            edital_id: editalId,
            success: true,
            analise: analise
          };
        } catch (error) {
          logger.error(`Erro na análise do edital ${editalId}:`, error);
          return {
            edital_id: editalId,
            success: false,
            error: error.message
          };
        }
      });

      const resultadosChunk = await Promise.all(promisesChunk);
      resultados.push(...resultadosChunk);
    }

    const sucessos = resultados.filter(r => r.success).length;
    const falhas = resultados.filter(r => !r.success).length;

    logger.info(`✅ Análise em lote concluída: ${sucessos} sucessos, ${falhas} falhas`);

    res.json({
      success: true,
      message: `Análise em lote concluída: ${sucessos} sucessos, ${falhas} falhas`,
      data: {
        total_processados: resultados.length,
        sucessos: sucessos,
        falhas: falhas,
        resultados: resultados
      }
    });

  } catch (error) {
    logger.error('Erro na análise em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno na análise em lote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/ai-analysis/stats
 * @desc Busca estatísticas das análises de IA da empresa
 * @access Private
 */
router.get('/stats', [auth], async (req, res) => {
  try {
    const empresaId = req.user.empresa_id;

    // Buscar estatísticas das análises
    const stats = await AnaliseEdital.findAll({
      include: [{
        model: Edital,
        where: { empresa_id: empresaId },
        attributes: []
      }],
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('AnaliseEdital.id')), 'total_analises'],
        [require('sequelize').fn('AVG', require('sequelize').col('score_final')), 'score_medio'],
        [require('sequelize').fn('MAX', require('sequelize').col('score_final')), 'score_maximo'],
        [require('sequelize').fn('MIN', require('sequelize').col('score_final')), 'score_minimo']
      ],
      raw: true
    });

    // Buscar distribuição de scores
    const distribuicaoScores = await AnaliseEdital.findAll({
      include: [{
        model: Edital,
        where: { empresa_id: empresaId },
        attributes: []
      }],
      attributes: [
        'score_final',
        [require('sequelize').fn('COUNT', require('sequelize').col('AnaliseEdital.id')), 'quantidade']
      ],
      group: ['score_final'],
      order: [['score_final', 'DESC']],
      limit: 20,
      raw: true
    });

    res.json({
      success: true,
      message: 'Estatísticas recuperadas com sucesso',
      data: {
        resumo: stats[0] || {
          total_analises: 0,
          score_medio: 0,
          score_maximo: 0,
          score_minimo: 0
        },
        distribuicao_scores: distribuicaoScores
      }
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