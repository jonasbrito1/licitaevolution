-- =====================================================
-- LICITAEVOLUTION - BANCO DE DADOS MYSQL
-- Sistema ERP Completo de Gestão de Licitações
-- =====================================================

-- Configurações iniciais
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET TIME_ZONE = '-03:00';

-- Verificar se banco existe
CREATE DATABASE IF NOT EXISTS licitaevolution;
USE licitaevolution;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Empresas (Multi-tenant)
CREATE TABLE IF NOT EXISTS empresas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),

    -- Endereço
    cep VARCHAR(10),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),

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

    -- Logo e documentos
    logo_url VARCHAR(500),

    -- Controle
    ativa BOOLEAN DEFAULT TRUE,
    data_fundacao DATE,
    observacoes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_empresas_cnpj (cnpj),
    INDEX idx_empresas_ativa (ativa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
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
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: ANÁLISE DE EDITAIS
-- =====================================================

-- Tabela de Editais
CREATE TABLE IF NOT EXISTS editais (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
    FOREIGN KEY (usuario_responsavel_id) REFERENCES usuarios(id),
    INDEX idx_editais_empresa_status (empresa_id, status),
    INDEX idx_editais_data_abertura (data_abertura),
    INDEX idx_editais_score (score_viabilidade),
    INDEX idx_editais_orgao (orgao_nome),
    INDEX idx_editais_valor (valor_estimado),
    FULLTEXT idx_editais_texto (objeto, orgao_nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Análises de Editais
CREATE TABLE IF NOT EXISTS analises_editais (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    edital_id CHAR(36) NOT NULL,
    usuario_id CHAR(36),

    -- Versão da análise
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: GESTÃO DE SERVIÇOS
-- =====================================================

-- Tabela de Categorias de Serviços
CREATE TABLE IF NOT EXISTS categorias_servicos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(50),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Serviços/Produtos
CREATE TABLE IF NOT EXISTS servicos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,
    categoria_id CHAR(36),

    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    especificacoes_tecnicas TEXT,
    tipo VARCHAR(50) NOT NULL,

    -- Valores
    valor_unitario DECIMAL(15,2) DEFAULT 0,
    custo_unitario DECIMAL(15,2) DEFAULT 0,
    margem_padrao DECIMAL(5,2) DEFAULT 20.00,
    valor_minimo DECIMAL(15,2),
    valor_maximo DECIMAL(15,2),

    -- Configurações
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    tempo_execucao INT DEFAULT 1,
    equipe_minima INT DEFAULT 1,
    recursos_necessarios JSON,

    -- Tributação
    ncm VARCHAR(10),
    cst VARCHAR(5),
    cfop VARCHAR(5),
    aliquota_iss DECIMAL(5,2) DEFAULT 0,
    aliquota_icms DECIMAL(5,2) DEFAULT 0,
    aliquota_pis DECIMAL(5,2) DEFAULT 0,
    aliquota_cofins DECIMAL(5,2) DEFAULT 0,

    -- Controle
    ativo BOOLEAN DEFAULT TRUE,
    favorito BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_servicos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: GESTÃO FINANCEIRA
-- =====================================================

-- Plano de Contas
CREATE TABLE IF NOT EXISTS plano_contas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,

    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    natureza VARCHAR(20),
    nivel INT NOT NULL,
    conta_pai_id CHAR(36),

    aceita_lancamentos BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (conta_pai_id) REFERENCES plano_contas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Centro de Custos
CREATE TABLE IF NOT EXISTS centros_custos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,

    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50),
    responsavel_id CHAR(36),

    orcamento_mensal DECIMAL(15,2),
    orcamento_anual DECIMAL(15,2),

    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,

    tipo VARCHAR(20) NOT NULL,
    categoria VARCHAR(50),
    plano_conta_id CHAR(36),
    centro_custo_id CHAR(36),

    -- Relacionamentos opcionais
    edital_id CHAR(36),

    numero_documento VARCHAR(100),
    descricao VARCHAR(255) NOT NULL,
    observacoes TEXT,

    -- Valores e datas
    valor DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    multa DECIMAL(15,2) DEFAULT 0,
    juros DECIMAL(15,2) DEFAULT 0,
    desconto DECIMAL(15,2) DEFAULT 0,

    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    data_competencia DATE NOT NULL,

    -- Recorrência
    recorrente BOOLEAN DEFAULT FALSE,
    tipo_recorrencia VARCHAR(20),
    parcela_atual INT,
    total_parcelas INT,
    lancamento_pai_id CHAR(36),

    -- Pagamento
    forma_pagamento VARCHAR(50),
    banco VARCHAR(50),
    conta_bancaria VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'pendente',

    -- Arquivos
    anexo_url VARCHAR(500),

    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_conta_id) REFERENCES plano_contas(id),
    FOREIGN KEY (centro_custo_id) REFERENCES centros_custos(id),
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (lancamento_pai_id) REFERENCES lancamentos_financeiros(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    INDEX idx_lancamentos_empresa_status (empresa_id, status),
    INDEX idx_lancamentos_vencimento (data_vencimento),
    INDEX idx_lancamentos_competencia (data_competencia),
    INDEX idx_lancamentos_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: COMPRAS E FORNECEDORES
-- =====================================================

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,

    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18),
    cpf VARCHAR(14),
    inscricao_estadual VARCHAR(20),

    -- Contato
    telefone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    contato_nome VARCHAR(255),
    contato_cargo VARCHAR(100),
    contato_telefone VARCHAR(20),
    contato_email VARCHAR(255),

    -- Endereço
    cep VARCHAR(10),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),

    -- Financeiro
    banco VARCHAR(50),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    pix VARCHAR(255),

    -- Configurações
    prazo_pagamento INT DEFAULT 30,
    limite_credito DECIMAL(15,2),
    forma_pagamento_preferida VARCHAR(50),

    -- Avaliação
    categoria VARCHAR(100),
    avaliacao INT DEFAULT 0,
    observacoes TEXT,

    -- Documentos
    documentos JSON,

    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: ORÇAMENTOS E PROPOSTAS
-- =====================================================

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,
    edital_id CHAR(36),

    numero_orcamento VARCHAR(50) UNIQUE NOT NULL,
    versao INT DEFAULT 1,
    orcamento_pai_id CHAR(36),

    -- Cliente
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_cnpj VARCHAR(18),
    cliente_contato VARCHAR(255),
    cliente_email VARCHAR(255),
    cliente_telefone VARCHAR(20),
    cliente_endereco TEXT,

    -- Valores
    valor_servicos DECIMAL(15,2) DEFAULT 0,
    valor_produtos DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_acrescimo DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_subtotal DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,

    -- Impostos
    valor_impostos DECIMAL(15,2) DEFAULT 0,
    detalhamento_impostos JSON,
    regime_tributario VARCHAR(50),

    -- Margens
    margem_bruta DECIMAL(5,2),
    margem_liquida DECIMAL(5,2),
    custo_total DECIMAL(15,2),

    -- Validade
    data_criacao DATE DEFAULT (CURRENT_DATE),
    data_validade DATE,

    -- Condições
    prazo_entrega VARCHAR(100),
    local_entrega TEXT,
    forma_pagamento VARCHAR(255),
    condicao_pagamento VARCHAR(255),
    validade_proposta INT DEFAULT 30,
    garantia VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'elaboracao',
    data_envio TIMESTAMP NULL,
    data_resposta TIMESTAMP NULL,

    -- Configurações
    mostrar_valores_unitarios BOOLEAN DEFAULT TRUE,
    mostrar_margem BOOLEAN DEFAULT FALSE,
    incluir_impostos BOOLEAN DEFAULT TRUE,

    observacoes TEXT,
    termos_condicoes TEXT,

    criado_por CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (orcamento_pai_id) REFERENCES orcamentos(id),
    FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    INDEX idx_orcamentos_empresa_status (empresa_id, status),
    INDEX idx_orcamentos_data_criacao (data_criacao),
    INDEX idx_orcamentos_cliente (cliente_nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens do Orçamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    orcamento_id CHAR(36) NOT NULL,
    servico_id CHAR(36),

    item_numero INT NOT NULL,
    descricao TEXT NOT NULL,
    especificacao TEXT,

    quantidade DECIMAL(10,3) NOT NULL,
    unidade VARCHAR(20) DEFAULT 'UN',
    valor_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,

    -- Custos
    custo_unitario DECIMAL(15,2) DEFAULT 0,
    custo_total DECIMAL(15,2) DEFAULT 0,
    margem DECIMAL(5,2) DEFAULT 0,

    -- Configurações
    item_obrigatorio BOOLEAN DEFAULT TRUE,
    item_alternativo BOOLEAN DEFAULT FALSE,

    observacoes TEXT,

    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,
    usuario_id CHAR(36),

    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'normal',

    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    dados JSON,

    -- Link para ação
    acao_url VARCHAR(500),
    acao_texto VARCHAR(100),

    -- Status
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP NULL,

    -- Agendamento
    enviar_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviada BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP NULL,

    -- Canais de envio
    enviar_email BOOLEAN DEFAULT FALSE,
    enviar_push BOOLEAN DEFAULT TRUE,
    enviar_sms BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_notificacoes_usuario_lida (usuario_id, lida),
    INDEX idx_notificacoes_categoria (categoria),
    INDEX idx_notificacoes_prioridade (prioridade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- MÓDULO: CONFIGURAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36) NOT NULL,

    -- Configurações de Impostos
    regime_tributario VARCHAR(50) DEFAULT 'simples_nacional',
    aliquota_simples DECIMAL(5,2) DEFAULT 6.00,
    aliquota_iss DECIMAL(5,2) DEFAULT 5.00,
    aliquota_pis DECIMAL(5,2) DEFAULT 1.65,
    aliquota_cofins DECIMAL(5,2) DEFAULT 7.60,
    aliquota_irpj DECIMAL(5,2) DEFAULT 15.00,
    aliquota_csll DECIMAL(5,2) DEFAULT 9.00,
    aliquota_inss DECIMAL(5,2) DEFAULT 11.00,

    -- Configurações de Análise
    margem_minima_aceitavel DECIMAL(5,2) DEFAULT 15.00,
    score_minimo_participacao INT DEFAULT 70,
    dias_antecedencia_analise INT DEFAULT 10,

    -- Alertas e Notificações
    alertar_novos_editais BOOLEAN DEFAULT TRUE,
    alertar_vencimentos BOOLEAN DEFAULT TRUE,
    dias_antecedencia_alerta INT DEFAULT 5,
    alertar_score_baixo BOOLEAN DEFAULT TRUE,
    alertar_prazo_questionamento BOOLEAN DEFAULT TRUE,

    -- Integrações
    api_key_anthropic VARCHAR(255),
    anthropic_model VARCHAR(100) DEFAULT 'claude-3-opus-20240229',
    webhook_url VARCHAR(500),

    -- E-mail
    smtp_host VARCHAR(100),
    smtp_port INT DEFAULT 587,
    smtp_user VARCHAR(100),
    smtp_password VARCHAR(255),
    smtp_from VARCHAR(100),
    smtp_ssl BOOLEAN DEFAULT TRUE,

    -- Backup
    backup_automatico BOOLEAN DEFAULT TRUE,
    frequencia_backup VARCHAR(20) DEFAULT 'diario',
    manter_backups INT DEFAULT 30,

    -- Financeiro
    forma_pagamento_padrao VARCHAR(50) DEFAULT 'boleto',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE AUDITORIA E LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    empresa_id CHAR(36),
    usuario_id CHAR(36),

    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id CHAR(36),

    dados_anteriores JSON,
    dados_novos JSON,
    diferenca JSON,

    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),

    sucesso BOOLEAN DEFAULT TRUE,
    erro TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_logs_auditoria_empresa_data (empresa_id, created_at),
    INDEX idx_logs_auditoria_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logs_sistema (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nivel VARCHAR(20) NOT NULL,
    categoria VARCHAR(50),
    mensagem TEXT NOT NULL,
    dados JSON,
    erro TEXT,
    stack_trace TEXT,

    ip_address VARCHAR(45),
    user_agent TEXT,
    usuario_id CHAR(36),
    empresa_id CHAR(36),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_logs_sistema_nivel (nivel),
    INDEX idx_logs_sistema_data (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir empresa demo
INSERT IGNORE INTO empresas (
    id,
    razao_social,
    nome_fantasia,
    cnpj,
    email,
    telefone,
    regime_tributario,
    porte_empresa,
    capital_social,
    faturamento_anual,
    cep,
    logradouro,
    numero,
    bairro,
    cidade,
    estado
) VALUES (
    'demo-empresa-uuid-12345678901234567890',
    'Empresa Demo Licitações Ltda',
    'Demo Licitações',
    '00.000.000/0001-00',
    'contato@demolicitacoes.com.br',
    '(11) 99999-9999',
    'simples_nacional',
    'pequena',
    100000.00,
    2000000.00,
    '01310-100',
    'Avenida Paulista',
    '1000',
    'Bela Vista',
    'São Paulo',
    'SP'
);

-- Inserir usuário admin (senha: admin123)
INSERT IGNORE INTO usuarios (
    id,
    empresa_id,
    nome,
    email,
    senha,
    cpf,
    cargo,
    nivel_acesso,
    modulos_permitidos
) VALUES (
    'demo-admin-uuid-12345678901234567890',
    'demo-empresa-uuid-12345678901234567890',
    'Administrador do Sistema',
    'admin@demo.com',
    '$2a$10$rBV2JDeWW3.vKyeQcM8fFOoaMMUn0oRHSPnqOrPGIAm7ibf.HCEuy',
    '000.000.000-00',
    'Administrador',
    'admin',
    '["editais", "financeiro", "compras", "orcamentos", "relatorios", "configuracoes"]'
);

-- Inserir plano de contas básico
INSERT IGNORE INTO plano_contas (empresa_id, codigo, descricao, tipo, nivel)
VALUES
    ('demo-empresa-uuid-12345678901234567890', '1', 'ATIVO', 'ativo', 1),
    ('demo-empresa-uuid-12345678901234567890', '1.1', 'ATIVO CIRCULANTE', 'ativo', 2),
    ('demo-empresa-uuid-12345678901234567890', '1.1.1', 'Caixa e Equivalentes', 'ativo', 3),
    ('demo-empresa-uuid-12345678901234567890', '1.1.2', 'Contas a Receber', 'ativo', 3),
    ('demo-empresa-uuid-12345678901234567890', '2', 'PASSIVO', 'passivo', 1),
    ('demo-empresa-uuid-12345678901234567890', '2.1', 'PASSIVO CIRCULANTE', 'passivo', 2),
    ('demo-empresa-uuid-12345678901234567890', '2.1.1', 'Contas a Pagar', 'passivo', 3),
    ('demo-empresa-uuid-12345678901234567890', '3', 'RECEITAS', 'receita', 1),
    ('demo-empresa-uuid-12345678901234567890', '3.1', 'Receitas Operacionais', 'receita', 2),
    ('demo-empresa-uuid-12345678901234567890', '3.1.1', 'Receitas de Serviços', 'receita', 3),
    ('demo-empresa-uuid-12345678901234567890', '4', 'DESPESAS', 'despesa', 1),
    ('demo-empresa-uuid-12345678901234567890', '4.1', 'Despesas Operacionais', 'despesa', 2),
    ('demo-empresa-uuid-12345678901234567890', '4.1.1', 'Despesas Administrativas', 'despesa', 3);

-- Inserir centro de custos padrão
INSERT IGNORE INTO centros_custos (empresa_id, codigo, nome, tipo)
VALUES
    ('demo-empresa-uuid-12345678901234567890', '001', 'Administrativo', 'administrativo'),
    ('demo-empresa-uuid-12345678901234567890', '002', 'Comercial', 'comercial'),
    ('demo-empresa-uuid-12345678901234567890', '003', 'Operacional', 'operacional');

-- Inserir categorias de serviços
INSERT IGNORE INTO categorias_servicos (empresa_id, nome, codigo)
VALUES
    ('demo-empresa-uuid-12345678901234567890', 'Consultoria', 'CONS'),
    ('demo-empresa-uuid-12345678901234567890', 'Desenvolvimento', 'DEV'),
    ('demo-empresa-uuid-12345678901234567890', 'Manutenção', 'MANUT'),
    ('demo-empresa-uuid-12345678901234567890', 'Treinamento', 'TREIN');

-- Inserir configurações padrão
INSERT IGNORE INTO configuracoes (
    empresa_id,
    regime_tributario,
    margem_minima_aceitavel,
    score_minimo_participacao,
    aliquota_simples,
    aliquota_iss
) VALUES (
    'demo-empresa-uuid-12345678901234567890',
    'simples_nacional',
    15.00,
    70,
    6.00,
    5.00
);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para dashboard financeiro
CREATE OR REPLACE VIEW vw_resumo_financeiro AS
SELECT
    l.empresa_id,
    DATE_FORMAT(l.data_competencia, '%Y-%m-01') as mes,
    SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE 0 END) as receitas,
    SUM(CASE WHEN l.tipo = 'despesa' THEN l.valor ELSE 0 END) as despesas,
    SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE -l.valor END) as resultado,
    COUNT(*) as total_lancamentos
FROM lancamentos_financeiros l
WHERE l.status != 'cancelado'
GROUP BY l.empresa_id, DATE_FORMAT(l.data_competencia, '%Y-%m-01');

-- View para editais em andamento
CREATE OR REPLACE VIEW vw_editais_andamento AS
SELECT
    e.*,
    u.nome as responsavel_nome,
    CASE
        WHEN e.data_abertura > NOW() THEN 'aguardando'
        WHEN e.data_abertura <= NOW() AND e.status = 'analisado' THEN 'em_andamento'
        ELSE e.status
    END as status_atual,
    DATEDIFF(e.data_abertura, NOW()) as dias_para_abertura
FROM editais e
LEFT JOIN usuarios u ON e.usuario_responsavel_id = u.id
WHERE e.status IN ('novo', 'analisando', 'analisado', 'participando');

-- =====================================================
-- SUCESSO
-- =====================================================

SELECT 'Database LicitaEvolution MySQL inicializado com sucesso!' as status;