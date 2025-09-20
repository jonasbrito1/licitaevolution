module.exports = (sequelize, DataTypes) => {
  const AnaliseEdital = sequelize.define('AnaliseEdital', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    edital_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'editais',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    versao: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    tipo_analise: {
      type: DataTypes.STRING(50),
      defaultValue: 'completa',
      validate: {
        isIn: [['rapida', 'completa', 'revisao']]
      }
    },
    // Cálculos financeiros
    valor_proposta: {
      type: DataTypes.DECIMAL(15, 2)
    },
    custo_direto: {
      type: DataTypes.DECIMAL(15, 2)
    },
    custo_indireto: {
      type: DataTypes.DECIMAL(15, 2)
    },
    impostos_calculados: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    margem_bruta: {
      type: DataTypes.DECIMAL(5, 2)
    },
    margem_liquida: {
      type: DataTypes.DECIMAL(5, 2)
    },
    roi_estimado: {
      type: DataTypes.DECIMAL(5, 2)
    },
    // Scores detalhados (0-100)
    score_financeiro: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_tecnico: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_documental: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_prazo: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_risco: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_concorrencia: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    score_final: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    // Análise completa
    analise_completa: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    pontos_fortes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    pontos_fracos: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    recomendacoes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    // Comparação com editais similares
    editais_similares: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    benchmark: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'analises_editais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['edital_id']
      },
      {
        fields: ['usuario_id']
      },
      {
        fields: ['score_final']
      },
      {
        fields: ['tipo_analise']
      }
    ],
    hooks: {
      beforeCreate: (analise) => {
        // Calcular score final baseado nos scores individuais
        if (!analise.score_final) {
          const scores = [
            analise.score_financeiro || 0,
            analise.score_tecnico || 0,
            analise.score_documental || 0,
            analise.score_prazo || 0,
            analise.score_risco || 0,
            analise.score_concorrencia || 0
          ];

          const validScores = scores.filter(score => score > 0);
          if (validScores.length > 0) {
            analise.score_final = Math.round(
              validScores.reduce((sum, score) => sum + score, 0) / validScores.length
            );
          }
        }

        // Calcular margem líquida se não fornecida
        if (!analise.margem_liquida && analise.margem_bruta && analise.impostos_calculados) {
          const impostos = Object.values(analise.impostos_calculados)
            .reduce((sum, valor) => sum + (parseFloat(valor) || 0), 0);

          analise.margem_liquida = analise.margem_bruta - impostos;
        }
      }
    }
  });

  // Métodos de instância
  AnaliseEdital.prototype.getRecomendacao = function() {
    if (this.score_final >= 80) {
      return 'participar';
    } else if (this.score_final >= 60) {
      return 'analisar_melhor';
    } else {
      return 'nao_participar';
    }
  };

  AnaliseEdital.prototype.isRentavel = function(margemMinima = 15) {
    return (this.margem_liquida || 0) >= margemMinima;
  };

  AnaliseEdital.prototype.temRiscosAltos = function() {
    return (this.score_risco || 0) < 50;
  };

  AnaliseEdital.prototype.getClassificacaoScore = function() {
    const score = this.score_final || 0;

    if (score >= 90) return 'excelente';
    if (score >= 80) return 'muito_bom';
    if (score >= 70) return 'bom';
    if (score >= 60) return 'regular';
    if (score >= 40) return 'ruim';
    return 'muito_ruim';
  };

  AnaliseEdital.prototype.getResumoFinanceiro = function() {
    return {
      valor_proposta: this.valor_proposta || 0,
      custo_total: (this.custo_direto || 0) + (this.custo_indireto || 0),
      margem_bruta: this.margem_bruta || 0,
      margem_liquida: this.margem_liquida || 0,
      roi_estimado: this.roi_estimado || 0,
      impostos_total: Object.values(this.impostos_calculados || {})
        .reduce((sum, valor) => sum + (parseFloat(valor) || 0), 0)
    };
  };

  // Métodos de classe
  AnaliseEdital.obterUltimaAnalise = async function(editalId) {
    return await this.findOne({
      where: { edital_id: editalId },
      order: [['versao', 'DESC'], ['created_at', 'DESC']]
    });
  };

  AnaliseEdital.compararAnalises = async function(editalIds) {
    const analises = await this.findAll({
      where: {
        edital_id: {
          [sequelize.Sequelize.Op.in]: editalIds
        }
      },
      include: [{
        model: sequelize.models.Edital,
        as: 'edital',
        attributes: ['numero_edital', 'objeto', 'valor_estimado']
      }],
      order: [['score_final', 'DESC']]
    });

    return analises.map(analise => ({
      edital: analise.edital,
      score_final: analise.score_final,
      margem_liquida: analise.margem_liquida,
      recomendacao: analise.getRecomendacao(),
      resumo_financeiro: analise.getResumoFinanceiro()
    }));
  };

  AnaliseEdital.estatisticasGerais = async function(empresaId, periodo = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodo);

    const analises = await this.findAll({
      include: [{
        model: sequelize.models.Edital,
        as: 'edital',
        where: { empresa_id: empresaId },
        attributes: []
      }],
      where: {
        created_at: {
          [sequelize.Sequelize.Op.gte]: dataInicio
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('AnaliseEdital.id')), 'total_analises'],
        [sequelize.fn('AVG', sequelize.col('score_final')), 'score_medio'],
        [sequelize.fn('AVG', sequelize.col('margem_liquida')), 'margem_media'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN score_final >= 70 THEN 1 END')), 'analises_positivas']
      ],
      raw: true
    });

    return {
      total_analises: parseInt(analises[0]?.total_analises || 0),
      score_medio: parseFloat(analises[0]?.score_medio || 0),
      margem_media: parseFloat(analises[0]?.margem_media || 0),
      analises_positivas: parseInt(analises[0]?.analises_positivas || 0),
      taxa_sucesso: analises[0]?.total_analises ?
        (parseInt(analises[0].analises_positivas) / parseInt(analises[0].total_analises) * 100) : 0
    };
  };

  return AnaliseEdital;
};