module.exports = (sequelize, DataTypes) => {
  const Edital = sequelize.define('Edital', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    empresa_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    // Identificação
    numero_edital: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    numero_processo: {
      type: DataTypes.STRING(100)
    },
    portal_origem: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['comprasnet', 'bbm', 'licitacoes_e', 'portal_nacional', 'outros']]
      }
    },
    url_origem: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: true
      }
    },
    // Dados do órgão
    orgao_nome: {
      type: DataTypes.STRING(255)
    },
    orgao_cnpj: {
      type: DataTypes.STRING(18),
      validate: {
        is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
      }
    },
    orgao_estado: {
      type: DataTypes.STRING(2)
    },
    orgao_cidade: {
      type: DataTypes.STRING(100)
    },
    orgao_endereco: {
      type: DataTypes.TEXT
    },
    orgao_contato: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Informações principais
    modalidade: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['pregao', 'concorrencia', 'tomada_preco', 'convite', 'concurso', 'leilao']]
      }
    },
    tipo_licitacao: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['menor_preco', 'tecnica_preco', 'melhor_tecnica', 'maior_lance']]
      }
    },
    criterio_julgamento: {
      type: DataTypes.STRING(100)
    },
    objeto: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000]
      }
    },
    valor_estimado: {
      type: DataTypes.DECIMAL(15, 2),
      validate: {
        min: 0
      }
    },
    valor_minimo: {
      type: DataTypes.DECIMAL(15, 2),
      validate: {
        min: 0
      }
    },
    valor_maximo: {
      type: DataTypes.DECIMAL(15, 2),
      validate: {
        min: 0
      }
    },
    // Datas importantes
    data_publicacao: {
      type: DataTypes.DATEONLY
    },
    data_abertura: {
      type: DataTypes.DATE
    },
    data_questionamento: {
      type: DataTypes.DATEONLY
    },
    data_impugnacao: {
      type: DataTypes.DATEONLY
    },
    data_entrega_documentos: {
      type: DataTypes.DATEONLY
    },
    data_resultado: {
      type: DataTypes.DATEONLY
    },
    // Prazos
    prazo_execucao: {
      type: DataTypes.STRING(100)
    },
    prazo_vigencia: {
      type: DataTypes.STRING(100)
    },
    local_execucao: {
      type: DataTypes.TEXT
    },
    // Configurações
    permite_subcontratacao: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    participacao_consorcio: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_me_epp: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Análise IA
    score_viabilidade: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      }
    },
    analise_ia: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    riscos_identificados: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    oportunidades: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    documentos_exigidos: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    requisitos_habilitacao: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Arquivos
    arquivo_edital_url: {
      type: DataTypes.STRING(500)
    },
    arquivo_edital_hash: {
      type: DataTypes.STRING(64)
    },
    arquivos_anexos: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Status e decisão
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'novo',
      validate: {
        isIn: [['novo', 'analisando', 'analisado', 'participando', 'finalizado', 'cancelado']]
      }
    },
    decisao: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['participar', 'nao_participar', 'analisar_melhor']]
      }
    },
    motivo_decisao: {
      type: DataTypes.TEXT
    },
    // Acompanhamento
    usuario_responsavel_id: {
      type: DataTypes.UUID,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    data_decisao: {
      type: DataTypes.DATE
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'editais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['empresa_id', 'status']
      },
      {
        fields: ['data_abertura']
      },
      {
        fields: ['score_viabilidade']
      },
      {
        fields: ['orgao_nome']
      },
      {
        fields: ['valor_estimado']
      },
      {
        fields: ['modalidade']
      },
      {
        name: 'idx_editais_texto_busca',
        type: 'FULLTEXT',
        fields: ['objeto', 'orgao_nome']
      }
    ],
    hooks: {
      beforeValidate: (edital) => {
        // Limpar e formatar CNPJ do órgão
        if (edital.orgao_cnpj) {
          edital.orgao_cnpj = edital.orgao_cnpj.replace(/[^\d]/g, '');
          if (edital.orgao_cnpj.length === 14) {
            edital.orgao_cnpj = edital.orgao_cnpj.replace(
              /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
              '$1.$2.$3/$4-$5'
            );
          }
        }

        // Converter estado para maiúsculo
        if (edital.orgao_estado) {
          edital.orgao_estado = edital.orgao_estado.toUpperCase();
        }

        // Garantir que arrays sejam arrays
        if (typeof edital.riscos_identificados === 'string') {
          try {
            edital.riscos_identificados = JSON.parse(edital.riscos_identificados);
          } catch (e) {
            edital.riscos_identificados = [];
          }
        }

        if (typeof edital.oportunidades === 'string') {
          try {
            edital.oportunidades = JSON.parse(edital.oportunidades);
          } catch (e) {
            edital.oportunidades = [];
          }
        }

        if (typeof edital.documentos_exigidos === 'string') {
          try {
            edital.documentos_exigidos = JSON.parse(edital.documentos_exigidos);
          } catch (e) {
            edital.documentos_exigidos = [];
          }
        }

        if (typeof edital.arquivos_anexos === 'string') {
          try {
            edital.arquivos_anexos = JSON.parse(edital.arquivos_anexos);
          } catch (e) {
            edital.arquivos_anexos = [];
          }
        }
      },
      beforeCreate: (edital) => {
        // Calcular hash do arquivo se fornecido
        if (edital.arquivo_edital_url && !edital.arquivo_edital_hash) {
          const crypto = require('crypto');
          edital.arquivo_edital_hash = crypto
            .createHash('sha256')
            .update(edital.arquivo_edital_url + Date.now())
            .digest('hex');
        }
      },
      afterUpdate: async (edital) => {
        // Criar notificação quando status mudar
        if (edital.changed('status')) {
          const Notificacao = sequelize.models.Notificacao;
          if (Notificacao) {
            await Notificacao.create({
              empresa_id: edital.empresa_id,
              usuario_id: edital.usuario_responsavel_id,
              tipo: 'info',
              categoria: 'edital',
              titulo: 'Status do Edital Atualizado',
              mensagem: `O edital ${edital.numero_edital} teve seu status alterado para ${edital.status}`,
              acao_url: `/editais/${edital.id}`,
              acao_texto: 'Ver Edital'
            });
          }
        }
      }
    },
    validate: {
      datasCoerentes() {
        if (this.data_abertura && this.data_questionamento) {
          if (new Date(this.data_questionamento) >= new Date(this.data_abertura)) {
            throw new Error('Data de questionamento deve ser anterior à data de abertura');
          }
        }

        if (this.data_abertura && this.data_impugnacao) {
          if (new Date(this.data_impugnacao) >= new Date(this.data_abertura)) {
            throw new Error('Data de impugnação deve ser anterior à data de abertura');
          }
        }

        if (this.valor_minimo && this.valor_maximo) {
          if (this.valor_minimo > this.valor_maximo) {
            throw new Error('Valor mínimo não pode ser maior que valor máximo');
          }
        }
      },
      statusDecisaoCoerente() {
        if (this.status === 'analisado' && !this.decisao) {
          throw new Error('Edital analisado deve ter uma decisão');
        }

        if (this.decisao === 'participar' && this.status !== 'participando' && this.status !== 'finalizado') {
          if (this.status === 'analisado') {
            // Permitir status analisado com decisão participar
            return;
          }
          throw new Error('Decisão de participar requer status participando ou finalizado');
        }
      }
    }
  });

  // Métodos de instância
  Edital.prototype.calcularScore = function() {
    if (!this.analise_ia || typeof this.analise_ia !== 'object') {
      return 0;
    }

    const analise = this.analise_ia;
    return analise.score_viabilidade?.score_final || 0;
  };

  Edital.prototype.estaEmPrazo = function() {
    if (!this.data_abertura) {
      return false;
    }

    return new Date(this.data_abertura) > new Date();
  };

  Edital.prototype.podeFazerQuestionamento = function() {
    if (!this.data_questionamento) {
      return false;
    }

    return new Date() <= new Date(this.data_questionamento);
  };

  Edital.prototype.podeFazerImpugnacao = function() {
    if (!this.data_impugnacao) {
      return false;
    }

    return new Date() <= new Date(this.data_impugnacao);
  };

  Edital.prototype.getDiasParaAbertura = function() {
    if (!this.data_abertura) {
      return null;
    }

    const hoje = new Date();
    const abertura = new Date(this.data_abertura);
    const diffTime = abertura - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  Edital.prototype.getStatusDisplay = function() {
    const statusMap = {
      novo: 'Novo',
      analisando: 'Em Análise',
      analisado: 'Analisado',
      participando: 'Participando',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
    };

    return statusMap[this.status] || this.status;
  };

  Edital.prototype.getDecisaoDisplay = function() {
    const decisaoMap = {
      participar: 'Participar',
      nao_participar: 'Não Participar',
      analisar_melhor: 'Analisar Melhor'
    };

    return decisaoMap[this.decisao] || this.decisao;
  };

  Edital.prototype.isRentavel = function(margemMinima = 15) {
    if (!this.analise_ia || !this.analise_ia.estrategia_competitiva) {
      return false;
    }

    const margem = this.analise_ia.estrategia_competitiva.estrategia_preco?.margem_sugerida || 0;
    return margem >= margemMinima;
  };

  Edital.prototype.temRiscosAltos = function() {
    if (!this.riscos_identificados || !Array.isArray(this.riscos_identificados)) {
      return false;
    }

    return this.riscos_identificados.some(risco =>
      risco.probabilidade === 'alta' && risco.impacto === 'alto'
    );
  };

  Edital.prototype.atualizarStatus = async function(novoStatus, usuario, motivo = null) {
    const statusAntigo = this.status;

    this.status = novoStatus;
    if (motivo) {
      this.motivo_decisao = motivo;
    }

    if (novoStatus === 'analisado' || novoStatus === 'participando') {
      this.data_decisao = new Date();
    }

    await this.save();

    // Log de auditoria
    const LogAuditoria = sequelize.models.LogAuditoria;
    if (LogAuditoria) {
      await LogAuditoria.create({
        empresa_id: this.empresa_id,
        usuario_id: usuario.id,
        acao: 'update_status',
        entidade: 'edital',
        entidade_id: this.id,
        dados_anteriores: { status: statusAntigo },
        dados_novos: { status: novoStatus, motivo }
      });
    }

    return this;
  };

  // Métodos de classe
  Edital.buscarPorTexto = async function(empresaId, texto, opcoes = {}) {
    const where = {
      empresa_id: empresaId
    };

    if (texto) {
      where[sequelize.Sequelize.Op.or] = [
        sequelize.literal(`MATCH(objeto, orgao_nome) AGAINST('${texto}' IN NATURAL LANGUAGE MODE)`),
        { numero_edital: { [sequelize.Sequelize.Op.like]: `%${texto}%` } },
        { orgao_nome: { [sequelize.Sequelize.Op.like]: `%${texto}%` } },
        { objeto: { [sequelize.Sequelize.Op.like]: `%${texto}%` } }
      ];
    }

    return await this.findAll({
      where,
      order: [['created_at', 'DESC']],
      ...opcoes
    });
  };

  Edital.estatisticasPorStatus = async function(empresaId) {
    const result = await this.findAll({
      where: { empresa_id: empresaId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('score_viabilidade')), 'score_medio']
      ],
      group: ['status'],
      raw: true
    });

    return result.reduce((acc, item) => {
      acc[item.status] = {
        total: parseInt(item.total),
        score_medio: parseFloat(item.score_medio) || 0
      };
      return acc;
    }, {});
  };

  return Edital;
};