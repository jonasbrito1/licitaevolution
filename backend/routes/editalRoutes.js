const express = require('express');
const router = express.Router();
const { Edital, AnaliseEdital, sequelize } = require('../models');
const auth = require('../middleware/auth');
const { validateEdital, validateEditalUpdate } = require('../middleware/validation');
const claudeSpecialist = require('../services/claudeSpecialist');
const logger = require('../utils/logger');

// Middleware para verificar se edital pertence à empresa do usuário
const verificarPropriedadeEdital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const edital = await Edital.findByPk(id);

    if (!edital) {
      return res.status(404).json({ success: false, message: 'Edital não encontrado' });
    }

    if (edital.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    req.edital = edital;
    next();
  } catch (error) {
    logger.error('Erro ao verificar propriedade do edital:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// GET /api/editais - Listar editais
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      modalidade,
      search,
      sort = 'created_at',
      order = 'DESC',
      data_abertura_inicio,
      data_abertura_fim,
      valor_min,
      valor_max,
      score_min
    } = req.query;

    const where = { empresa_id: req.user.empresa_id };
    const queryOptions = {
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sort, order.toUpperCase()]],
      include: [
        {
          model: require('../models').Usuario,
          as: 'responsavel',
          attributes: ['id', 'nome', 'email']
        }
      ]
    };

    // Filtros
    if (status) {
      where.status = status;
    }

    if (modalidade) {
      where.modalidade = modalidade;
    }

    if (data_abertura_inicio && data_abertura_fim) {
      where.data_abertura = {
        [sequelize.Op.between]: [data_abertura_inicio, data_abertura_fim]
      };
    }

    if (valor_min || valor_max) {
      where.valor_estimado = {};
      if (valor_min) where.valor_estimado[sequelize.Op.gte] = parseFloat(valor_min);
      if (valor_max) where.valor_estimado[sequelize.Op.lte] = parseFloat(valor_max);
    }

    if (score_min) {
      where.score_viabilidade = {
        [sequelize.Op.gte]: parseInt(score_min)
      };
    }

    // Busca por texto
    if (search) {
      const editais = await Edital.buscarPorTexto(req.user.empresa_id, search, queryOptions);
      const total = await Edital.count({
        where: {
          ...where,
          [sequelize.Op.or]: [
            sequelize.literal(`to_tsvector('portuguese', objeto || ' ' || COALESCE(orgao_nome, '')) @@ plainto_tsquery('portuguese', '${search}')`),
            { numero_edital: { [sequelize.Op.iLike]: `%${search}%` } },
            { orgao_nome: { [sequelize.Op.iLike]: `%${search}%` } }
          ]
        }
      });

      return res.json({
        success: true,
        data: editais,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    const editais = await Edital.findAll(queryOptions);
    const total = await Edital.count({ where });

    res.json({
      success: true,
      data: editais,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Erro ao listar editais:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
});

// GET /api/editais/estatisticas - Estatísticas dos editais
router.get('/estatisticas', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresa_id;

    const [
      totalEditais,
      estatisticasPorStatus,
      totalValorEstimado,
      editaisProximosVencimento
    ] = await Promise.all([
      Edital.count({ where: { empresa_id: empresaId } }),
      Edital.estatisticasPorStatus(empresaId),
      Edital.sum('valor_estimado', { where: { empresa_id: empresaId } }),
      Edital.count({
        where: {
          empresa_id: empresaId,
          data_abertura: {
            [sequelize.Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        total_editais: totalEditais,
        estatisticas_status: estatisticasPorStatus,
        valor_total_estimado: totalValorEstimado || 0,
        editais_proximos_vencimento: editaisProximosVencimento
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/editais/:id - Buscar edital específico
router.get('/:id', auth, verificarPropriedadeEdital, async (req, res) => {
  try {
    const edital = await Edital.findByPk(req.params.id, {
      include: [
        {
          model: require('../models').Usuario,
          as: 'responsavel',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: AnaliseEdital,
          as: 'analises',
          order: [['created_at', 'DESC']],
          limit: 5
        }
      ]
    });

    res.json({
      success: true,
      data: edital
    });

  } catch (error) {
    logger.error('Erro ao buscar edital:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/editais - Criar novo edital
router.post('/', auth, validateEdital, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const editalData = {
      ...req.body,
      empresa_id: req.user.empresa_id,
      usuario_responsavel_id: req.user.id
    };

    const edital = await Edital.create(editalData, { transaction });

    // Se o edital tem arquivo, processar com LicitAI
    if (edital.arquivo_edital_url) {
      try {
        const analise = await claudeSpecialist.analisarEdital({
          numero_edital: edital.numero_edital,
          objeto: edital.objeto,
          orgao_nome: edital.orgao_nome,
          valor_estimado: edital.valor_estimado,
          modalidade: edital.modalidade,
          data_abertura: edital.data_abertura,
          arquivo_url: edital.arquivo_edital_url
        });

        if (analise.success) {
          edital.analise_ia = analise.data;
          edital.score_viabilidade = analise.data.score_viabilidade?.score_final || 0;
          edital.riscos_identificados = analise.data.riscos_identificados || [];
          edital.oportunidades = analise.data.oportunidades || [];
          edital.status = 'analisando';

          await edital.save({ transaction });

          // Criar registro de análise
          await AnaliseEdital.create({
            edital_id: edital.id,
            usuario_id: req.user.id,
            tipo_analise: 'automatica',
            resultado: analise.data,
            score_calculado: analise.data.score_viabilidade?.score_final || 0
          }, { transaction });
        }
      } catch (analyzeError) {
        logger.error('Erro na análise automática:', analyzeError);
        // Continuar mesmo se a análise falhar
      }
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Edital criado com sucesso',
      data: edital
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao criar edital:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/editais/:id - Atualizar edital
router.put('/:id', auth, verificarPropriedadeEdital, validateEditalUpdate, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const edital = req.edital;
    const dadosAtualizacao = { ...req.body };

    // Não permitir alterar empresa_id
    delete dadosAtualizacao.empresa_id;

    await edital.update(dadosAtualizacao, { transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Edital atualizado com sucesso',
      data: edital
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao atualizar edital:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({ field: e.path, message: e.message }))
      });
    }

    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/editais/:id/status - Atualizar status do edital
router.put('/:id/status', auth, verificarPropriedadeEdital, async (req, res) => {
  try {
    const { status, decisao, motivo } = req.body;
    const edital = req.edital;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status é obrigatório' });
    }

    const statusValidos = ['novo', 'analisando', 'analisado', 'participando', 'finalizado', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status inválido' });
    }

    const dadosAtualizacao = { status };

    if (decisao) {
      const decisoesValidas = ['participar', 'nao_participar', 'analisar_melhor'];
      if (!decisoesValidas.includes(decisao)) {
        return res.status(400).json({ success: false, message: 'Decisão inválida' });
      }
      dadosAtualizacao.decisao = decisao;
    }

    if (motivo) {
      dadosAtualizacao.motivo_decisao = motivo;
    }

    if (status === 'analisado' || status === 'participando') {
      dadosAtualizacao.data_decisao = new Date();
    }

    await edital.update(dadosAtualizacao);

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: edital
    });

  } catch (error) {
    logger.error('Erro ao atualizar status:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/editais/:id/analisar - Solicitar análise com LicitAI
router.post('/:id/analisar', auth, verificarPropriedadeEdital, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const edital = req.edital;
    const { tipo_analise = 'completa', parametros_customizados } = req.body;

    // Atualizar status para analisando
    await edital.update({ status: 'analisando' }, { transaction });

    // Chamar LicitAI para análise
    const analise = await claudeSpecialist.analisarEdital({
      numero_edital: edital.numero_edital,
      objeto: edital.objeto,
      orgao_nome: edital.orgao_nome,
      valor_estimado: edital.valor_estimado,
      modalidade: edital.modalidade,
      data_abertura: edital.data_abertura,
      arquivo_url: edital.arquivo_edital_url,
      tipo_analise,
      parametros_customizados
    });

    if (!analise.success) {
      throw new Error(analise.message || 'Erro na análise');
    }

    // Atualizar edital com resultado da análise
    await edital.update({
      analise_ia: analise.data,
      score_viabilidade: analise.data.score_viabilidade?.score_final || 0,
      riscos_identificados: analise.data.riscos_identificados || [],
      oportunidades: analise.data.oportunidades || [],
      status: 'analisado'
    }, { transaction });

    // Criar registro de análise
    const registroAnalise = await AnaliseEdital.create({
      edital_id: edital.id,
      usuario_id: req.user.id,
      tipo_analise,
      resultado: analise.data,
      score_calculado: analise.data.score_viabilidade?.score_final || 0,
      parametros_utilizados: parametros_customizados || {}
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Análise concluída com sucesso',
      data: {
        edital,
        analise: registroAnalise
      }
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro na análise do edital:', error);

    // Reverter status se houver erro
    try {
      await req.edital.update({ status: 'novo' });
    } catch (revertError) {
      logger.error('Erro ao reverter status:', revertError);
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao analisar edital',
      error: error.message
    });
  }
});

// DELETE /api/editais/:id - Excluir edital
router.delete('/:id', auth, verificarPropriedadeEdital, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const edital = req.edital;

    // Verificar se pode ser excluído
    if (edital.status === 'participando') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir edital em que está participando'
      });
    }

    // Excluir análises relacionadas primeiro
    await AnaliseEdital.destroy({
      where: { edital_id: edital.id },
      transaction
    });

    // Excluir edital
    await edital.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Edital excluído com sucesso'
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao excluir edital:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/editais/:id/historico - Histórico de alterações
router.get('/:id/historico', auth, verificarPropriedadeEdital, async (req, res) => {
  try {
    const { LogAuditoria } = require('../models');

    const historico = await LogAuditoria.findAll({
      where: {
        entidade: 'edital',
        entidade_id: req.params.id
      },
      include: [
        {
          model: require('../models').Usuario,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: historico
    });

  } catch (error) {
    logger.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Edital routes OK' });
});

module.exports = router;