-- ===========================================
-- LICITAEVOLUTION - INICIALIZAÇÃO DO MYSQL
-- ===========================================

-- Criar database se não existir
CREATE DATABASE IF NOT EXISTS licitaevolution
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Usar o database
USE licitaevolution;

-- ===========================================
-- CONFIGURAÇÕES INICIAIS
-- ===========================================

-- Configurar timezone
SET time_zone = '-03:00';

-- Habilitar log de queries lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_empresas_ativa (ativa),
  INDEX idx_empresas_regime (regime_tributario),
  INDEX idx_empresas_porte (porte_empresa)
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

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  INDEX idx_usuarios_empresa (empresa_id),
  INDEX idx_usuarios_ativo (ativo),
  INDEX idx_usuarios_nivel (nivel_acesso)
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
  FOREIGN KEY (usuario_responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL,

  INDEX idx_editais_empresa_status (empresa_id, status),
  INDEX idx_editais_data_abertura (data_abertura),
  INDEX idx_editais_score (score_viabilidade),
  INDEX idx_editais_orgao (orgao_nome),
  INDEX idx_editais_valor (valor_estimado),
  INDEX idx_editais_modalidade (modalidade),
  FULLTEXT INDEX idx_editais_texto_busca (objeto, orgao_nome)
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
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

  INDEX idx_analises_edital (edital_id),
  INDEX idx_analises_usuario (usuario_id),
  INDEX idx_analises_score (score_final),
  INDEX idx_analises_tipo (tipo_analise)
);

-- ===========================================
-- TABELAS FINANCEIRAS
-- ===========================================

-- Tabela: contas
CREATE TABLE IF NOT EXISTS contas (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- banco, caixa, poupanca, etc
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  saldo_inicial DECIMAL(15,2) DEFAULT 0,
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  INDEX idx_contas_empresa (empresa_id),
  INDEX idx_contas_ativa (ativa)
);

-- Tabela: categorias_financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- receita, despesa
  categoria_pai_id CHAR(36),
  cor VARCHAR(7),
  icone VARCHAR(50),
  ativa BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_pai_id) REFERENCES categorias_financeiras(id) ON DELETE SET NULL,
  INDEX idx_categorias_empresa_tipo (empresa_id, tipo),
  INDEX idx_categorias_ativa (ativa)
);

-- Tabela: transacoes_financeiras
CREATE TABLE IF NOT EXISTS transacoes_financeiras (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36) NOT NULL,
  conta_id CHAR(36) NOT NULL,
  categoria_id CHAR(36),
  edital_id CHAR(36),

  tipo VARCHAR(50) NOT NULL, -- receita, despesa, transferencia
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_transacao DATE NOT NULL,
  data_competencia DATE,

  -- Para transferências
  conta_destino_id CHAR(36),

  -- Controle
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, confirmada, cancelada
  comprovante_url VARCHAR(500),
  observacoes TEXT,

  -- Recorrência
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia VARCHAR(50), -- mensal, trimestral, anual
  data_fim DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (conta_id) REFERENCES contas(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias_financeiras(id) ON DELETE SET NULL,
  FOREIGN KEY (edital_id) REFERENCES editais(id) ON DELETE SET NULL,
  FOREIGN KEY (conta_destino_id) REFERENCES contas(id) ON DELETE SET NULL,

  INDEX idx_transacoes_empresa_data (empresa_id, data_transacao),
  INDEX idx_transacoes_conta (conta_id),
  INDEX idx_transacoes_categoria (categoria_id),
  INDEX idx_transacoes_status (status),
  INDEX idx_transacoes_tipo (tipo)
);

-- ===========================================
-- TABELAS DE SISTEMA
-- ===========================================

-- Tabela: logs_auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36),
  usuario_id CHAR(36),
  acao VARCHAR(100) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  entidade_id CHAR(36),
  dados_anteriores JSON,
  dados_novos JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,

  INDEX idx_logs_empresa_data (empresa_id, created_at),
  INDEX idx_logs_usuario (usuario_id),
  INDEX idx_logs_entidade (entidade, entidade_id),
  INDEX idx_logs_acao (acao)
);

-- Tabela: notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
  id CHAR(36) PRIMARY KEY,
  empresa_id CHAR(36),
  usuario_id CHAR(36),
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(50),
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  acao_url VARCHAR(500),
  acao_texto VARCHAR(100),
  data_expiracao TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

  INDEX idx_notificacoes_usuario_lida (usuario_id, lida),
  INDEX idx_notificacoes_empresa (empresa_id),
  INDEX idx_notificacoes_tipo (tipo),
  INDEX idx_notificacoes_data (created_at)
);

-- ===========================================
-- DADOS INICIAIS
-- ===========================================

-- Inserir empresa demo (se não existir)
INSERT IGNORE INTO empresas (
  id, razao_social, nome_fantasia, cnpj, regime_tributario, porte_empresa,
  email, telefone, cidade, estado, created_at, updated_at
) VALUES (
  UUID(),
  'LicitaEvolution Demo LTDA',
  'LicitaEvolution',
  '12.345.678/0001-90',
  'simples_nacional',
  'pequena',
  'demo@licitaevolution.com.br',
  '(11) 99999-9999',
  'São Paulo',
  'SP',
  NOW(),
  NOW()
);

-- Inserir usuário administrador demo
SET @empresa_id = (SELECT id FROM empresas WHERE cnpj = '12.345.678/0001-90');

INSERT IGNORE INTO usuarios (
  id, empresa_id, nome, email, senha, nivel_acesso, modulos_permitidos,
  ativo, created_at, updated_at
) VALUES (
  UUID(),
  @empresa_id,
  'Administrador Demo',
  'admin@licitaevolution.com.br',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'admin',
  '["editais", "financeiro", "compras", "orcamentos", "relatorios", "configuracoes", "usuarios"]',
  TRUE,
  NOW(),
  NOW()
);

-- Inserir categorias financeiras padrão
INSERT IGNORE INTO categorias_financeiras (
  id, empresa_id, nome, tipo, cor, created_at, updated_at
) VALUES
  (UUID(), @empresa_id, 'Receitas de Contratos', 'receita', '#4CAF50', NOW(), NOW()),
  (UUID(), @empresa_id, 'Receitas Diversas', 'receita', '#8BC34A', NOW(), NOW()),
  (UUID(), @empresa_id, 'Despesas Operacionais', 'despesa', '#F44336', NOW(), NOW()),
  (UUID(), @empresa_id, 'Despesas com Pessoal', 'despesa', '#FF5722', NOW(), NOW()),
  (UUID(), @empresa_id, 'Impostos e Taxas', 'despesa', '#9C27B0', NOW(), NOW()),
  (UUID(), @empresa_id, 'Fornecedores', 'despesa', '#FF9800', NOW(), NOW());

-- Inserir conta padrão
INSERT IGNORE INTO contas (
  id, empresa_id, nome, tipo, saldo_inicial, saldo_atual, created_at, updated_at
) VALUES (
  UUID(),
  @empresa_id,
  'Conta Corrente Principal',
  'banco',
  0,
  0,
  NOW(),
  NOW()
);

-- ===========================================
-- PROCEDURES E FUNCTIONS
-- ===========================================

DELIMITER $$

-- Procedure para atualizar saldo das contas
CREATE PROCEDURE IF NOT EXISTS AtualizarSaldoConta(IN conta_uuid CHAR(36))
BEGIN
  DECLARE novo_saldo DECIMAL(15,2);

  SELECT
    COALESCE(c.saldo_inicial, 0) + COALESCE(SUM(
      CASE
        WHEN t.tipo = 'receita' THEN t.valor
        WHEN t.tipo = 'despesa' THEN -t.valor
        WHEN t.tipo = 'transferencia' AND t.conta_id = conta_uuid THEN -t.valor
        WHEN t.tipo = 'transferencia' AND t.conta_destino_id = conta_uuid THEN t.valor
        ELSE 0
      END
    ), 0)
  INTO novo_saldo
  FROM contas c
  LEFT JOIN transacoes_financeiras t ON (
    (t.conta_id = conta_uuid OR t.conta_destino_id = conta_uuid)
    AND t.status = 'confirmada'
  )
  WHERE c.id = conta_uuid
  GROUP BY c.id, c.saldo_inicial;

  UPDATE contas
  SET saldo_atual = novo_saldo, updated_at = NOW()
  WHERE id = conta_uuid;
END$$

-- Trigger para atualizar saldo após inserir transação
CREATE TRIGGER IF NOT EXISTS tr_transacao_insert
AFTER INSERT ON transacoes_financeiras
FOR EACH ROW
BEGIN
  CALL AtualizarSaldoConta(NEW.conta_id);
  IF NEW.conta_destino_id IS NOT NULL THEN
    CALL AtualizarSaldoConta(NEW.conta_destino_id);
  END IF;
END$$

-- Trigger para atualizar saldo após atualizar transação
CREATE TRIGGER IF NOT EXISTS tr_transacao_update
AFTER UPDATE ON transacoes_financeiras
FOR EACH ROW
BEGIN
  CALL AtualizarSaldoConta(NEW.conta_id);
  IF NEW.conta_destino_id IS NOT NULL THEN
    CALL AtualizarSaldoConta(NEW.conta_destino_id);
  END IF;
  IF OLD.conta_id != NEW.conta_id THEN
    CALL AtualizarSaldoConta(OLD.conta_id);
  END IF;
  IF OLD.conta_destino_id IS NOT NULL AND OLD.conta_destino_id != NEW.conta_destino_id THEN
    CALL AtualizarSaldoConta(OLD.conta_destino_id);
  END IF;
END$$

-- Trigger para atualizar saldo após deletar transação
CREATE TRIGGER IF NOT EXISTS tr_transacao_delete
AFTER DELETE ON transacoes_financeiras
FOR EACH ROW
BEGIN
  CALL AtualizarSaldoConta(OLD.conta_id);
  IF OLD.conta_destino_id IS NOT NULL THEN
    CALL AtualizarSaldoConta(OLD.conta_destino_id);
  END IF;
END$$

DELIMITER ;

-- ===========================================
-- CONFIGURAÇÕES FINAIS
-- ===========================================

-- Otimizar tabelas
OPTIMIZE TABLE empresas, usuarios, editais, analises_editais, contas, categorias_financeiras, transacoes_financeiras;

-- Criar usuário de aplicação (opcional)
-- CREATE USER IF NOT EXISTS 'licitaevolution'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON licitaevolution.* TO 'licitaevolution'@'localhost';
-- FLUSH PRIVILEGES;

-- Log de inicialização
INSERT INTO logs_auditoria (id, acao, entidade, entidade_id, dados_novos, created_at)
VALUES (UUID(), 'database_init', 'system', UUID(), JSON_OBJECT('status', 'completed', 'timestamp', NOW()), NOW());

SELECT 'Database LicitaEvolution inicializado com sucesso!' as Status;