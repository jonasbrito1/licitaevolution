const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
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
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    cpf: {
      type: DataTypes.STRING(14),
      unique: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      }
    },
    cargo: {
      type: DataTypes.STRING(100)
    },
    departamento: {
      type: DataTypes.STRING(100)
    },
    telefone: {
      type: DataTypes.STRING(20)
    },
    avatar_url: {
      type: DataTypes.STRING(500)
    },
    // Permissões
    nivel_acesso: {
      type: DataTypes.STRING(50),
      defaultValue: 'usuario',
      validate: {
        isIn: [['admin', 'gerente', 'usuario', 'visualizador']]
      }
    },
    modulos_permitidos: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    permissoes_especiais: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Controle de acesso
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimo_acesso: {
      type: DataTypes.DATE
    },
    tentativas_login: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bloqueado_ate: {
      type: DataTypes.DATE
    },
    token_reset: {
      type: DataTypes.STRING(255)
    },
    token_reset_expira: {
      type: DataTypes.DATE
    },
    // Configurações pessoais
    tema: {
      type: DataTypes.STRING(20),
      defaultValue: 'light',
      validate: {
        isIn: [['light', 'dark', 'auto']]
      }
    },
    idioma: {
      type: DataTypes.STRING(5),
      defaultValue: 'pt-BR'
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'America/Sao_Paulo'
    },
    notificacoes_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notificacoes_push: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['senha'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      },
      ativos: {
        where: { ativo: true }
      },
      admins: {
        where: { nivel_acesso: 'admin' }
      },
      porEmpresa: (empresaId) => ({
        where: { empresa_id: empresaId }
      })
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['cpf'],
        where: {
          cpf: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['empresa_id']
      },
      {
        fields: ['ativo']
      },
      {
        fields: ['nivel_acesso']
      }
    ],
    hooks: {
      beforeValidate: (usuario) => {
        // Limpar e formatar CPF
        if (usuario.cpf) {
          usuario.cpf = usuario.cpf.replace(/[^\d]/g, '');
          if (usuario.cpf.length === 11) {
            usuario.cpf = usuario.cpf.replace(
              /(\d{3})(\d{3})(\d{3})(\d{2})/,
              '$1.$2.$3-$4'
            );
          }
        }

        // Limpar telefone
        if (usuario.telefone) {
          usuario.telefone = usuario.telefone.replace(/[^\d]/g, '');
          if (usuario.telefone.length === 11) {
            usuario.telefone = usuario.telefone.replace(
              /(\d{2})(\d{5})(\d{4})/,
              '($1) $2-$3'
            );
          } else if (usuario.telefone.length === 10) {
            usuario.telefone = usuario.telefone.replace(
              /(\d{2})(\d{4})(\d{4})/,
              '($1) $2-$3'
            );
          }
        }

        // Normalizar email
        if (usuario.email) {
          usuario.email = usuario.email.toLowerCase().trim();
        }
      },
      beforeCreate: async (usuario) => {
        // Hash da senha
        if (usuario.senha) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }

        // Definir módulos padrão baseado no nível de acesso
        if (!usuario.modulos_permitidos || usuario.modulos_permitidos.length === 0) {
          switch (usuario.nivel_acesso) {
            case 'admin':
              usuario.modulos_permitidos = [
                'editais', 'financeiro', 'compras', 'orcamentos',
                'relatorios', 'configuracoes', 'usuarios'
              ];
              break;
            case 'gerente':
              usuario.modulos_permitidos = [
                'editais', 'financeiro', 'compras', 'orcamentos', 'relatorios'
              ];
              break;
            case 'usuario':
              usuario.modulos_permitidos = [
                'editais', 'orcamentos', 'relatorios'
              ];
              break;
            case 'visualizador':
              usuario.modulos_permitidos = ['relatorios'];
              break;
            default:
              usuario.modulos_permitidos = [];
          }
        }
      },
      beforeUpdate: async (usuario) => {
        // Hash da senha se foi alterada
        if (usuario.changed('senha') && usuario.senha) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }
      }
    },
    validate: {
      cpfValido() {
        if (this.cpf) {
          const cpf = this.cpf.replace(/[^\d]/g, '');
          if (cpf.length !== 11) {
            throw new Error('CPF deve ter 11 dígitos');
          }
          // Aqui você pode adicionar validação de dígito verificador do CPF
        }
      },
      senhaForte() {
        if (this.senha && this.senha.length < 60) { // 60 é o tamanho do hash bcrypt
          const senha = this.senha;
          const temMaiuscula = /[A-Z]/.test(senha);
          const temMinuscula = /[a-z]/.test(senha);
          const temNumero = /[0-9]/.test(senha);
          const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

          if (senha.length < 8) {
            throw new Error('Senha deve ter pelo menos 8 caracteres');
          }

          if (!(temMaiuscula && temMinuscula && temNumero && temEspecial)) {
            throw new Error('Senha deve conter ao menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial');
          }
        }
      }
    }
  });

  // Métodos de instância
  Usuario.prototype.verificarSenha = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  Usuario.prototype.temPermissao = function(modulo) {
    if (this.nivel_acesso === 'admin') {
      return true;
    }

    const modulosPermitidos = Array.isArray(this.modulos_permitidos)
      ? this.modulos_permitidos
      : JSON.parse(this.modulos_permitidos || '[]');

    return modulosPermitidos.includes(modulo);
  };

  Usuario.prototype.estaBloqueado = function() {
    return this.bloqueado_ate && new Date() < new Date(this.bloqueado_ate);
  };

  Usuario.prototype.podeAcessar = function() {
    return this.ativo && !this.estaBloqueado();
  };

  Usuario.prototype.incrementarTentativasLogin = async function() {
    this.tentativas_login += 1;

    if (this.tentativas_login >= 5) {
      // Bloquear por 30 minutos após 5 tentativas
      this.bloqueado_ate = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.save();
  };

  Usuario.prototype.resetarTentativasLogin = async function() {
    this.tentativas_login = 0;
    this.bloqueado_ate = null;
    this.ultimo_acesso = new Date();
    await this.save();
  };

  Usuario.prototype.gerarTokenReset = function() {
    const crypto = require('crypto');
    this.token_reset = crypto.randomBytes(32).toString('hex');
    this.token_reset_expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    return this.token_reset;
  };

  Usuario.prototype.toSafeJSON = function() {
    const { senha, token_reset, ...dadosSeguras } = this.dataValues;
    return dadosSeguras;
  };

  // Métodos de classe
  Usuario.encontrarPorEmail = async function(email) {
    return await this.scope('withPassword').findOne({
      where: { email: email.toLowerCase() }
    });
  };

  Usuario.encontrarPorToken = async function(token) {
    return await this.findOne({
      where: {
        token_reset: token,
        token_reset_expira: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  return Usuario;
};