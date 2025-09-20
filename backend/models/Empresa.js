module.exports = (sequelize, DataTypes) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    razao_social: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    nome_fantasia: {
      type: DataTypes.STRING(255),
      validate: {
        len: [0, 255]
      }
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
      }
    },
    inscricao_estadual: {
      type: DataTypes.STRING(20)
    },
    inscricao_municipal: {
      type: DataTypes.STRING(20)
    },
    // Endereço
    cep: {
      type: DataTypes.STRING(10),
      validate: {
        is: /^\d{5}-?\d{3}$/
      }
    },
    logradouro: {
      type: DataTypes.STRING(255)
    },
    numero: {
      type: DataTypes.STRING(20)
    },
    complemento: {
      type: DataTypes.STRING(100)
    },
    bairro: {
      type: DataTypes.STRING(100)
    },
    cidade: {
      type: DataTypes.STRING(100)
    },
    estado: {
      type: DataTypes.STRING(2),
      validate: {
        len: [2, 2],
        isUppercase: true
      }
    },
    // Contato
    telefone: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(255),
      validate: {
        isEmail: true
      }
    },
    website: {
      type: DataTypes.STRING(255),
      validate: {
        isUrl: true
      }
    },
    // Configurações
    regime_tributario: {
      type: DataTypes.STRING(50),
      defaultValue: 'simples_nacional',
      validate: {
        isIn: [['simples_nacional', 'lucro_presumido', 'lucro_real', 'mei']]
      }
    },
    porte_empresa: {
      type: DataTypes.STRING(50),
      defaultValue: 'pequena',
      validate: {
        isIn: [['mei', 'micro', 'pequena', 'media', 'grande']]
      }
    },
    capital_social: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    faturamento_anual: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    numero_funcionarios: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    // Logo e documentos
    logo_url: {
      type: DataTypes.STRING(500)
    },
    // Controle
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    data_fundacao: {
      type: DataTypes.DATEONLY
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'empresas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['cnpj']
      },
      {
        fields: ['ativa']
      },
      {
        fields: ['regime_tributario']
      },
      {
        fields: ['porte_empresa']
      }
    ],
    hooks: {
      beforeValidate: (empresa) => {
        // Limpar e formatar CNPJ
        if (empresa.cnpj) {
          empresa.cnpj = empresa.cnpj.replace(/[^\d]/g, '');
          if (empresa.cnpj.length === 14) {
            empresa.cnpj = empresa.cnpj.replace(
              /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
              '$1.$2.$3/$4-$5'
            );
          }
        }

        // Limpar e formatar CEP
        if (empresa.cep) {
          empresa.cep = empresa.cep.replace(/[^\d]/g, '');
          if (empresa.cep.length === 8) {
            empresa.cep = empresa.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
          }
        }

        // Limpar telefone
        if (empresa.telefone) {
          empresa.telefone = empresa.telefone.replace(/[^\d]/g, '');
          if (empresa.telefone.length === 11) {
            empresa.telefone = empresa.telefone.replace(
              /(\d{2})(\d{5})(\d{4})/,
              '($1) $2-$3'
            );
          } else if (empresa.telefone.length === 10) {
            empresa.telefone = empresa.telefone.replace(
              /(\d{2})(\d{4})(\d{4})/,
              '($1) $2-$3'
            );
          }
        }

        // Converter estado para maiúsculo
        if (empresa.estado) {
          empresa.estado = empresa.estado.toUpperCase();
        }
      },
      beforeCreate: (empresa) => {
        // Gerar nome fantasia se não fornecido
        if (!empresa.nome_fantasia) {
          empresa.nome_fantasia = empresa.razao_social;
        }
      }
    },
    validate: {
      cnpjValido() {
        if (this.cnpj) {
          const cnpj = this.cnpj.replace(/[^\d]/g, '');
          if (cnpj.length !== 14) {
            throw new Error('CNPJ deve ter 14 dígitos');
          }
          // Aqui você pode adicionar validação de dígito verificador do CNPJ
        }
      },
      capitalSocialCoerente() {
        const portes = {
          mei: 81000,
          micro: 360000,
          pequena: 4800000,
          media: 300000000,
          grande: Infinity
        };

        if (this.porte_empresa && this.faturamento_anual) {
          const limite = portes[this.porte_empresa];
          if (this.faturamento_anual > limite) {
            throw new Error(`Faturamento incompatível com o porte ${this.porte_empresa}`);
          }
        }
      }
    }
  });

  return Empresa;
};