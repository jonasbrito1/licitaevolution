-- ===========================================
-- LICITAEVOLUTION - INICIALIZAÇÃO MYSQL SIMPLES
-- ===========================================

USE licitaevolution;

-- ===========================================
-- TABELAS PRINCIPAIS
-- ===========================================

-- Tabela: empresas
CREATE TABLE IF NOT EXISTS empresas (
  id CHAR(36) PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),

  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),

  -- Contato
  telefone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Configurações
  regime_tributario VARCHAR(50) DEFAULT 'simples_nacional',
  porte_empresa VARCHAR(50) DEFAULT 'pequena',
  capital_social DECIMAL(15,2) DEFAULT 0,
  faturamento_anual DECIMAL(15,2) DEFAULT 0,
  numero_funcionarios INT DEFAULT 1,

  -- Controle
  logo_url VARCHAR(500),
  ativa BOOLEAN DEFAULT TRUE,
  data_fundacao DATE,
  observacoes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  telefone VARCHAR(20),
  avatar_url VARCHAR(500),

  -- Permissões
  nivel_acesso VARCHAR(50) DEFAULT 'usuario',
  modulos_permitidos JSON,
  permissoes_especiais JSON,

  -- Controle de acesso
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP NULL,
  tentativas_login INT DEFAULT 0,
  bloqueado_ate TIMESTAMP NULL,
  token_reset VARCHAR(255),
  token_reset_expira TIMESTAMP NULL,

  -- Configurações pessoais
  tema VARCHAR(20) DEFAULT 'light',
  idioma VARCHAR(5) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notificacoes_email BOOLEAN DEFAULT TRUE,
  notificacoes_push BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Tabela: editais
CREATE TABLE IF NOT EXISTS editais (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,

  -- Identificação
  numero_edital VARCHAR(100) NOT NULL,
  numero_processo VARCHAR(100),
  portal_origem VARCHAR(50),
  url_origem TEXT,

  -- Dados do órgão
  orgao_nome VARCHAR(255),
  orgao_cnpj VARCHAR(18),
  orgao_estado VARCHAR(2),
  orgao_cidade VARCHAR(100),
  orgao_endereco TEXT,
  orgao_contato JSON,

  -- Informações principais
  modalidade VARCHAR(50) NOT NULL,
  tipo_licitacao VARCHAR(50),
  criterio_julgamento VARCHAR(100),
  objeto TEXT NOT NULL,
  valor_estimado DECIMAL(15,2),
  valor_minimo DECIMAL(15,2),
  valor_maximo DECIMAL(15,2),

  -- Datas importantes
  data_publicacao DATE,
  data_abertura TIMESTAMP,
  data_questionamento DATE,
  data_impugnacao DATE,
  data_entrega_documentos DATE,
  data_resultado DATE,

  -- Prazos
  prazo_execucao VARCHAR(100),
  prazo_vigencia VARCHAR(100),
  local_execucao TEXT,

  -- Configurações
  permite_subcontratacao BOOLEAN DEFAULT FALSE,
  participacao_consorcio BOOLEAN DEFAULT FALSE,
  permite_me_epp BOOLEAN DEFAULT TRUE,

  -- Análise IA
  score_viabilidade INT,
  analise_ia JSON,
  riscos_identificados JSON,
  oportunidades JSON,
  documentos_exigidos JSON,
  requisitos_habilitacao JSON,

  -- Arquivos
  arquivo_edital_url VARCHAR(500),
  arquivo_edital_hash VARCHAR(64),
  arquivos_anexos JSON,

  -- Status e decisão
  status VARCHAR(50) DEFAULT 'novo',
  decisao VARCHAR(50),
  motivo_decisao TEXT,

  -- Acompanhamento
  usuario_responsavel_id CHAR(36),
  data_decisao TIMESTAMP NULL,
  observacoes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela: analises_editais
CREATE TABLE IF NOT EXISTS analises_editais (
  id CHAR(36) PRIMARY KEY,
  edital_id CHAR(36) NOT NULL,
  usuario_id CHAR(36) NOT NULL,
  versao INT DEFAULT 1,
  tipo_analise VARCHAR(50) DEFAULT 'completa',

  -- Cálculos financeiros
  valor_proposta DECIMAL(15,2),
  custo_direto DECIMAL(15,2),
  custo_indireto DECIMAL(15,2),
  impostos_calculados JSON,
  margem_bruta DECIMAL(5,2),
  margem_liquida DECIMAL(5,2),
  roi_estimado DECIMAL(5,2),

  -- Scores detalhados (0-100)
  score_financeiro INT,
  score_tecnico INT,
  score_documental INT,
  score_prazo INT,
  score_risco INT,
  score_concorrencia INT,
  score_final INT,

  -- Análise completa
  analise_completa JSON,
  pontos_fortes JSON,
  pontos_fracos JSON,
  recomendacoes JSON,
  observacoes TEXT,

  -- Comparação com editais similares
  editais_similares JSON,
  benchmark JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (edital_id) REFERENCES editais(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

SELECT 'Tabelas básicas criadas com sucesso!' as Status;