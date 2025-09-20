-- =====================================================
-- LICITAEVOLUTION - BANCO DE DADOS INICIAL
-- Sistema ERP Completo de Gestão de Licitações
-- =====================================================

-- Criar banco se não existir
SELECT 'CREATE DATABASE erp_licitacao'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'erp_licitacao')\gexec

-- Usar o banco
\c erp_licitacao;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- FUNÇÃO PARA UPDATE TIMESTAMP AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Empresas (Multi-tenant)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    numero_funcionarios INTEGER DEFAULT 1,

    -- Logo e documentos
    logo_url VARCHAR(500),

    -- Controle
    ativa BOOLEAN DEFAULT true,
    data_fundacao DATE,
    observacoes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    telefone VARCHAR(20),
    avatar_url VARCHAR(500),

    -- Permissões
    nivel_acesso VARCHAR(50) DEFAULT 'usuario', -- admin, gerente, usuario, visualizador
    modulos_permitidos JSONB DEFAULT '[]',
    permissoes_especiais JSONB DEFAULT '{}',

    -- Controle de acesso
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    token_reset VARCHAR(255),
    token_reset_expira TIMESTAMP,

    -- Configurações pessoais
    tema VARCHAR(20) DEFAULT 'light',
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    notificacoes_email BOOLEAN DEFAULT true,
    notificacoes_push BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: ANÁLISE DE EDITAIS
-- =====================================================

-- Tabela de Editais
CREATE TABLE IF NOT EXISTS editais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

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
    orgao_contato JSONB,

    -- Informações principais
    modalidade VARCHAR(50) NOT NULL, -- pregao, concorrencia, tomada_preco, convite
    tipo_licitacao VARCHAR(50), -- menor_preco, tecnica_preco, maior_lance
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
    permite_subcontratacao BOOLEAN DEFAULT false,
    participacao_consorcio BOOLEAN DEFAULT false,
    permite_me_epp BOOLEAN DEFAULT true,

    -- Análise IA
    score_viabilidade INTEGER,
    analise_ia JSONB,
    riscos_identificados JSONB,
    oportunidades JSONB,
    documentos_exigidos JSONB,
    requisitos_habilitacao JSONB,

    -- Arquivos
    arquivo_edital_url VARCHAR(500),
    arquivo_edital_hash VARCHAR(64),
    arquivos_anexos JSONB,

    -- Status e decisão
    status VARCHAR(50) DEFAULT 'novo', -- novo, analisando, analisado, participando, finalizado, cancelado
    decisao VARCHAR(50), -- participar, nao_participar, analisar_melhor
    motivo_decisao TEXT,

    -- Acompanhamento
    usuario_responsavel_id UUID REFERENCES usuarios(id),
    data_decisao TIMESTAMP,
    observacoes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Análises de Editais (Histórico detalhado)
CREATE TABLE IF NOT EXISTS analises_editais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id UUID REFERENCES editais(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),

    -- Versão da análise
    versao INTEGER DEFAULT 1,
    tipo_analise VARCHAR(50) DEFAULT 'completa', -- rapida, completa, revisao

    -- Cálculos financeiros
    valor_proposta DECIMAL(15,2),
    custo_direto DECIMAL(15,2),
    custo_indireto DECIMAL(15,2),
    impostos_calculados JSONB,
    margem_bruta DECIMAL(5,2),
    margem_liquida DECIMAL(5,2),
    roi_estimado DECIMAL(5,2),

    -- Scores detalhados (0-100)
    score_financeiro INTEGER,
    score_tecnico INTEGER,
    score_documental INTEGER,
    score_prazo INTEGER,
    score_risco INTEGER,
    score_concorrencia INTEGER,
    score_final INTEGER,

    -- Análise completa
    analise_completa JSONB,
    pontos_fortes TEXT[],
    pontos_fracos TEXT[],
    recomendacoes TEXT[],
    observacoes TEXT,

    -- Comparação com editais similares
    editais_similares JSONB,
    benchmark JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: GESTÃO DE SERVIÇOS
-- =====================================================

-- Tabela de Categorias de Serviços
CREATE TABLE IF NOT EXISTS categorias_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(50),
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços/Produtos
CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_servicos(id),

    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    especificacoes_tecnicas TEXT,
    tipo VARCHAR(50) NOT NULL, -- servico, produto, locacao, manutencao

    -- Valores
    valor_unitario DECIMAL(15,2) DEFAULT 0,
    custo_unitario DECIMAL(15,2) DEFAULT 0,
    margem_padrao DECIMAL(5,2) DEFAULT 20.00,
    valor_minimo DECIMAL(15,2),
    valor_maximo DECIMAL(15,2),

    -- Configurações
    unidade_medida VARCHAR(20) DEFAULT 'UN',
    tempo_execucao INTEGER DEFAULT 1, -- em dias
    equipe_minima INTEGER DEFAULT 1,
    recursos_necessarios JSONB,

    -- Tributação
    ncm VARCHAR(10),
    cst VARCHAR(5),
    cfop VARCHAR(5),
    aliquota_iss DECIMAL(5,2) DEFAULT 0,
    aliquota_icms DECIMAL(5,2) DEFAULT 0,
    aliquota_pis DECIMAL(5,2) DEFAULT 0,
    aliquota_cofins DECIMAL(5,2) DEFAULT 0,

    -- Controle
    ativo BOOLEAN DEFAULT true,
    favorito BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contratos
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    edital_id UUID REFERENCES editais(id),

    numero_contrato VARCHAR(100) UNIQUE NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_cnpj VARCHAR(18),
    cliente_contato JSONB,

    -- Valores
    valor_total DECIMAL(15,2) NOT NULL,
    valor_mensal DECIMAL(15,2),
    valor_executado DECIMAL(15,2) DEFAULT 0,
    valor_pendente DECIMAL(15,2),

    -- Datas
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_assinatura DATE,
    data_ultimo_aditivo DATE,

    -- Controle
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, suspenso, encerrado, cancelado
    tipo_garantia VARCHAR(50),
    valor_garantia DECIMAL(15,2),
    percentual_garantia DECIMAL(5,2),

    -- Gestão
    gestor_id UUID REFERENCES usuarios(id),
    fiscal_id UUID REFERENCES usuarios(id),
    equipe_ids UUID[],

    -- Documentos
    observacoes TEXT,
    clausulas_especiais TEXT,
    arquivo_contrato_url VARCHAR(500),
    arquivos_aditivos JSONB,

    -- Faturamento
    forma_faturamento VARCHAR(50) DEFAULT 'mensal', -- mensal, quinzenal, por_medicao
    dia_vencimento INTEGER DEFAULT 30,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Aditivos de Contratos
CREATE TABLE IF NOT EXISTS aditivos_contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,

    numero_aditivo VARCHAR(50) NOT NULL,
    tipo_aditivo VARCHAR(50) NOT NULL, -- prazo, valor, escopo, suspensao
    descricao TEXT NOT NULL,

    -- Valores (se aplicável)
    valor_anterior DECIMAL(15,2),
    valor_novo DECIMAL(15,2),
    valor_aditivo DECIMAL(15,2),

    -- Prazos (se aplicável)
    prazo_anterior DATE,
    prazo_novo DATE,
    dias_aditivos INTEGER,

    -- Controle
    data_aditivo DATE NOT NULL,
    arquivo_aditivo_url VARCHAR(500),
    justificativa TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: GESTÃO FINANCEIRA
-- =====================================================

-- Plano de Contas
CREATE TABLE IF NOT EXISTS plano_contas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- receita, despesa, ativo, passivo
    natureza VARCHAR(20), -- debito, credito
    nivel INTEGER NOT NULL,
    conta_pai_id UUID REFERENCES plano_contas(id),

    aceita_lancamentos BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Centro de Custos
CREATE TABLE IF NOT EXISTS centros_custos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50), -- administrativo, operacional, comercial, financeiro
    responsavel_id UUID REFERENCES usuarios(id),

    orcamento_mensal DECIMAL(15,2),
    orcamento_anual DECIMAL(15,2),

    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

    tipo VARCHAR(20) NOT NULL, -- receita, despesa
    categoria VARCHAR(50),
    plano_conta_id UUID REFERENCES plano_contas(id),
    centro_custo_id UUID REFERENCES centros_custos(id),

    -- Relacionamentos opcionais
    contrato_id UUID REFERENCES contratos(id),
    compra_id UUID,
    edital_id UUID REFERENCES editais(id),

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
    recorrente BOOLEAN DEFAULT false,
    tipo_recorrencia VARCHAR(20), -- mensal, trimestral, semestral, anual
    parcela_atual INTEGER,
    total_parcelas INTEGER,
    lancamento_pai_id UUID REFERENCES lancamentos_financeiros(id),

    -- Pagamento
    forma_pagamento VARCHAR(50),
    banco VARCHAR(50),
    conta_bancaria VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, pago, cancelado, vencido

    -- Arquivos
    anexo_url VARCHAR(500),

    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

    banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(10) NOT NULL,
    conta VARCHAR(20) NOT NULL,
    digito VARCHAR(2),
    tipo_conta VARCHAR(20) DEFAULT 'corrente', -- corrente, poupanca, investimento

    saldo_atual DECIMAL(15,2) DEFAULT 0,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    data_saldo_inicial DATE,

    ativa BOOLEAN DEFAULT true,
    principal BOOLEAN DEFAULT false,

    -- Configurações
    limite_cheque_especial DECIMAL(15,2) DEFAULT 0,
    taxa_manutencao DECIMAL(8,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: COMPRAS E FORNECEDORES
-- =====================================================

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

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
    prazo_pagamento INTEGER DEFAULT 30,
    limite_credito DECIMAL(15,2),
    forma_pagamento_preferida VARCHAR(50),

    -- Avaliação
    categoria VARCHAR(100),
    avaliacao INTEGER DEFAULT 0, -- 0-5 estrelas
    observacoes TEXT,

    -- Documentos
    documentos JSONB,

    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Compras
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    fornecedor_id UUID REFERENCES fornecedores(id),

    numero_pedido VARCHAR(50) UNIQUE,
    numero_cotacao VARCHAR(50),

    -- Valores
    valor_produtos DECIMAL(15,2) DEFAULT 0,
    valor_servicos DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_impostos DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,

    -- Datas
    data_pedido DATE DEFAULT CURRENT_DATE,
    data_entrega_prevista DATE,
    data_entrega_real DATE,
    data_pagamento DATE,

    -- Status
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, aprovado, recebido, cancelado, devolvido
    prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente

    -- Pagamento
    forma_pagamento VARCHAR(50),
    condicao_pagamento VARCHAR(100),
    prazo_pagamento INTEGER DEFAULT 30,

    -- Entrega
    endereco_entrega TEXT,
    transportadora VARCHAR(255),
    codigo_rastreamento VARCHAR(100),

    observacoes TEXT,

    solicitado_por UUID REFERENCES usuarios(id),
    aprovado_por UUID REFERENCES usuarios(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens da Compra
CREATE TABLE IF NOT EXISTS itens_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID REFERENCES compras(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id),

    produto_nome VARCHAR(255) NOT NULL,
    produto_codigo VARCHAR(50),
    produto_descricao TEXT,

    quantidade DECIMAL(10,3) NOT NULL,
    unidade VARCHAR(20) DEFAULT 'UN',
    valor_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,

    -- Estoque
    quantidade_recebida DECIMAL(10,3) DEFAULT 0,
    quantidade_pendente DECIMAL(10,3),

    observacoes TEXT
);

-- =====================================================
-- MÓDULO: ORÇAMENTOS E PROPOSTAS
-- =====================================================

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    edital_id UUID REFERENCES editais(id),

    numero_orcamento VARCHAR(50) UNIQUE NOT NULL,
    versao INTEGER DEFAULT 1,
    orcamento_pai_id UUID REFERENCES orcamentos(id),

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
    detalhamento_impostos JSONB,
    regime_tributario VARCHAR(50),

    -- Margens
    margem_bruta DECIMAL(5,2),
    margem_liquida DECIMAL(5,2),
    custo_total DECIMAL(15,2),

    -- Validade
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_validade DATE,

    -- Condições
    prazo_entrega VARCHAR(100),
    local_entrega TEXT,
    forma_pagamento VARCHAR(255),
    condicao_pagamento VARCHAR(255),
    validade_proposta INTEGER DEFAULT 30, -- dias
    garantia VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'elaboracao', -- elaboracao, enviado, aprovado, rejeitado, expirado
    data_envio TIMESTAMP,
    data_resposta TIMESTAMP,

    -- Configurações
    mostrar_valores_unitarios BOOLEAN DEFAULT true,
    mostrar_margem BOOLEAN DEFAULT false,
    incluir_impostos BOOLEAN DEFAULT true,

    observacoes TEXT,
    termos_condicoes TEXT,

    criado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens do Orçamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id),

    item_numero INTEGER NOT NULL,
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
    item_obrigatorio BOOLEAN DEFAULT true,
    item_alternativo BOOLEAN DEFAULT false,

    observacoes TEXT
);

-- =====================================================
-- MÓDULO: DOCUMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS tipos_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    obrigatorio BOOLEAN DEFAULT false,
    dias_validade INTEGER,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_documento_id UUID REFERENCES tipos_documentos(id),

    -- Relacionamento polimórfico
    entidade_tipo VARCHAR(50) NOT NULL, -- edital, contrato, orcamento, compra, fornecedor
    entidade_id UUID NOT NULL,

    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    numero_documento VARCHAR(100),

    -- Arquivo
    arquivo_url VARCHAR(500) NOT NULL,
    arquivo_nome VARCHAR(255),
    arquivo_tamanho INTEGER,
    arquivo_tipo VARCHAR(50),
    arquivo_hash VARCHAR(64),

    -- Versionamento
    versao INTEGER DEFAULT 1,
    documento_pai_id UUID REFERENCES documentos(id),

    -- Validade
    data_emissao DATE,
    data_validade DATE,
    alertar_vencimento BOOLEAN DEFAULT false,
    dias_alerta INTEGER DEFAULT 30,

    -- Controle
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, vencido, cancelado, substituido
    confidencial BOOLEAN DEFAULT false,

    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),

    tipo VARCHAR(50) NOT NULL, -- info, alerta, erro, sucesso, lembrete
    categoria VARCHAR(50) NOT NULL, -- edital, financeiro, documento, sistema, usuario
    prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente

    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    dados JSONB,

    -- Link para ação
    acao_url VARCHAR(500),
    acao_texto VARCHAR(100),

    -- Status
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,

    -- Agendamento
    enviar_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enviada BOOLEAN DEFAULT false,
    data_envio TIMESTAMP,

    -- Canais de envio
    enviar_email BOOLEAN DEFAULT false,
    enviar_push BOOLEAN DEFAULT true,
    enviar_sms BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MÓDULO: CONFIGURAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

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
    score_minimo_participacao INTEGER DEFAULT 70,
    dias_antecedencia_analise INTEGER DEFAULT 10,

    -- Alertas e Notificações
    alertar_novos_editais BOOLEAN DEFAULT true,
    alertar_vencimentos BOOLEAN DEFAULT true,
    dias_antecedencia_alerta INTEGER DEFAULT 5,
    alertar_score_baixo BOOLEAN DEFAULT true,
    alertar_prazo_questionamento BOOLEAN DEFAULT true,

    -- Integrações
    api_key_anthropic VARCHAR(255),
    anthropic_model VARCHAR(100) DEFAULT 'claude-3-opus-20240229',
    webhook_url VARCHAR(500),

    -- E-mail
    smtp_host VARCHAR(100),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(100),
    smtp_password VARCHAR(255),
    smtp_from VARCHAR(100),
    smtp_ssl BOOLEAN DEFAULT true,

    -- Backup
    backup_automatico BOOLEAN DEFAULT true,
    frequencia_backup VARCHAR(20) DEFAULT 'diario',
    manter_backups INTEGER DEFAULT 30,

    -- Financeiro
    conta_bancaria_padrao_id UUID REFERENCES contas_bancarias(id),
    centro_custo_padrao_id UUID REFERENCES centros_custos(id),
    forma_pagamento_padrao VARCHAR(50) DEFAULT 'boleto',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELAS DE AUDITORIA E LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    usuario_id UUID REFERENCES usuarios(id),

    acao VARCHAR(50) NOT NULL, -- create, update, delete, login, logout, export, import
    entidade VARCHAR(50) NOT NULL,
    entidade_id UUID,

    dados_anteriores JSONB,
    dados_novos JSONB,
    diferenca JSONB,

    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),

    sucesso BOOLEAN DEFAULT true,
    erro TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nivel VARCHAR(20) NOT NULL, -- debug, info, warn, error, fatal
    categoria VARCHAR(50),
    mensagem TEXT NOT NULL,
    dados JSONB,
    erro TEXT,
    stack_trace TEXT,

    ip_address INET,
    user_agent TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    empresa_id UUID REFERENCES empresas(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_ativa ON empresas(ativa);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Índices para editais
CREATE INDEX IF NOT EXISTS idx_editais_empresa_status ON editais(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_editais_data_abertura ON editais(data_abertura);
CREATE INDEX IF NOT EXISTS idx_editais_score ON editais(score_viabilidade);
CREATE INDEX IF NOT EXISTS idx_editais_orgao ON editais(orgao_nome);
CREATE INDEX IF NOT EXISTS idx_editais_valor ON editais(valor_estimado);
CREATE INDEX IF NOT EXISTS idx_editais_texto ON editais USING GIN (to_tsvector('portuguese', objeto || ' ' || COALESCE(orgao_nome, '')));

-- Índices para contratos
CREATE INDEX IF NOT EXISTS idx_contratos_empresa_status ON contratos(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_contratos_data_inicio ON contratos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_contratos_data_fim ON contratos(data_fim);
CREATE INDEX IF NOT EXISTS idx_contratos_valor ON contratos(valor_total);

-- Índices para lançamentos financeiros
CREATE INDEX IF NOT EXISTS idx_lancamentos_empresa_status ON lancamentos_financeiros(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_vencimento ON lancamentos_financeiros(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_competencia ON lancamentos_financeiros(data_competencia);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos_financeiros(tipo);

-- Índices para orçamentos
CREATE INDEX IF NOT EXISTS idx_orcamentos_empresa_status ON orcamentos(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data_criacao ON orcamentos(data_criacao);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_nome);

-- Índices para compras
CREATE INDEX IF NOT EXISTS idx_compras_empresa_status ON compras(empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_compras_fornecedor ON compras(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_data_pedido ON compras(data_pedido);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida ON notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_categoria ON notificacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_empresa_data ON logs_auditoria(empresa_id, created_at);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_nivel ON logs_sistema(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_data ON logs_sistema(created_at);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_entidade ON documentos(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_documentos_validade ON documentos(data_validade) WHERE data_validade IS NOT NULL;

-- =====================================================
-- TRIGGERS PARA UPDATE AUTOMÁTICO
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON editais
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON lancamentos_financeiros
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON compras
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para dashboard financeiro
CREATE OR REPLACE VIEW vw_resumo_financeiro AS
SELECT
    l.empresa_id,
    DATE_TRUNC('month', l.data_competencia) as mes,
    SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE 0 END) as receitas,
    SUM(CASE WHEN l.tipo = 'despesa' THEN l.valor ELSE 0 END) as despesas,
    SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE -l.valor END) as resultado,
    COUNT(*) as total_lancamentos
FROM lancamentos_financeiros l
WHERE l.status != 'cancelado'
GROUP BY l.empresa_id, DATE_TRUNC('month', l.data_competencia);

-- View para editais em andamento
CREATE OR REPLACE VIEW vw_editais_andamento AS
SELECT
    e.*,
    u.nome as responsavel_nome,
    CASE
        WHEN e.data_abertura > CURRENT_TIMESTAMP THEN 'aguardando'
        WHEN e.data_abertura <= CURRENT_TIMESTAMP AND e.status = 'analisado' THEN 'em_andamento'
        ELSE e.status
    END as status_atual,
    EXTRACT(days FROM e.data_abertura - CURRENT_TIMESTAMP) as dias_para_abertura
FROM editais e
LEFT JOIN usuarios u ON e.usuario_responsavel_id = u.id
WHERE e.status IN ('novo', 'analisando', 'analisado', 'participando');

-- View para contratos ativos
CREATE OR REPLACE VIEW vw_contratos_ativos AS
SELECT
    c.*,
    g.nome as gestor_nome,
    f.nome as fiscal_nome,
    EXTRACT(days FROM c.data_fim - CURRENT_DATE) as dias_para_vencimento,
    (c.valor_total - COALESCE(c.valor_executado, 0)) as saldo_a_executar,
    CASE
        WHEN c.data_fim < CURRENT_DATE THEN 'vencido'
        WHEN c.data_fim <= CURRENT_DATE + INTERVAL '30 days' THEN 'vencendo'
        ELSE 'vigente'
    END as situacao_prazo
FROM contratos c
LEFT JOIN usuarios g ON c.gestor_id = g.id
LEFT JOIN usuarios f ON c.fiscal_id = f.id
WHERE c.status = 'ativo';

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para calcular score de edital
CREATE OR REPLACE FUNCTION calcular_score_edital(
    p_valor_estimado DECIMAL,
    p_margem_estimada DECIMAL,
    p_complexidade INTEGER,
    p_prazo_dias INTEGER
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Score baseado no valor (0-25 pontos)
    CASE
        WHEN p_valor_estimado >= 1000000 THEN score := score + 25;
        WHEN p_valor_estimado >= 500000 THEN score := score + 20;
        WHEN p_valor_estimado >= 100000 THEN score := score + 15;
        WHEN p_valor_estimado >= 50000 THEN score := score + 10;
        ELSE score := score + 5;
    END CASE;

    -- Score baseado na margem (0-30 pontos)
    CASE
        WHEN p_margem_estimada >= 25 THEN score := score + 30;
        WHEN p_margem_estimada >= 20 THEN score := score + 25;
        WHEN p_margem_estimada >= 15 THEN score := score + 20;
        WHEN p_margem_estimada >= 10 THEN score := score + 15;
        ELSE score := score + 5;
    END CASE;

    -- Score baseado na complexidade (0-25 pontos)
    CASE
        WHEN p_complexidade = 1 THEN score := score + 25; -- baixa
        WHEN p_complexidade = 2 THEN score := score + 20; -- média
        WHEN p_complexidade = 3 THEN score := score + 10; -- alta
        ELSE score := score + 5;
    END CASE;

    -- Score baseado no prazo (0-20 pontos)
    CASE
        WHEN p_prazo_dias >= 180 THEN score := score + 20;
        WHEN p_prazo_dias >= 90 THEN score := score + 15;
        WHEN p_prazo_dias >= 30 THEN score := score + 10;
        ELSE score := score + 5;
    END CASE;

    RETURN LEAST(score, 100); -- Máximo 100 pontos
END;
$$ LANGUAGE plpgsql;

-- Função para gerar número sequencial
CREATE OR REPLACE FUNCTION gerar_numero_sequencial(
    p_empresa_id UUID,
    p_tipo VARCHAR,
    p_ano INTEGER DEFAULT NULL
) RETURNS VARCHAR AS $$
DECLARE
    v_ano INTEGER;
    v_proximo_numero INTEGER;
    v_numero_formatado VARCHAR;
BEGIN
    v_ano := COALESCE(p_ano, EXTRACT(year FROM CURRENT_DATE));

    -- Buscar próximo número da sequência
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero_orcamento FROM '\d+') AS INTEGER)
    ), 0) + 1 INTO v_proximo_numero
    FROM orcamentos
    WHERE empresa_id = p_empresa_id
    AND numero_orcamento LIKE p_tipo || '/' || v_ano || '%';

    -- Formatar número
    v_numero_formatado := p_tipo || '/' || v_ano || '/' || LPAD(v_proximo_numero::TEXT, 4, '0');

    RETURN v_numero_formatado;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir empresa demo
INSERT INTO empresas (
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
) ON CONFLICT (cnpj) DO NOTHING;

-- Inserir usuário admin (senha: admin123)
INSERT INTO usuarios (
    empresa_id,
    nome,
    email,
    senha,
    cpf,
    cargo,
    nivel_acesso,
    modulos_permitidos
) VALUES (
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    'Administrador do Sistema',
    'admin@demo.com',
    '$2a$10$rBV2JDeWW3.vKyeQcM8fFOoaMMUn0oRHSPnqOrPGIAm7ibf.HCEuy', -- bcrypt de 'admin123'
    '000.000.000-00',
    'Administrador',
    'admin',
    '["editais", "financeiro", "compras", "orcamentos", "relatorios", "configuracoes"]'
) ON CONFLICT (email) DO NOTHING;

-- Inserir plano de contas básico
INSERT INTO plano_contas (empresa_id, codigo, descricao, tipo, nivel)
SELECT
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    codigo,
    descricao,
    tipo,
    nivel
FROM (VALUES
    ('1', 'ATIVO', 'ativo', 1),
    ('1.1', 'ATIVO CIRCULANTE', 'ativo', 2),
    ('1.1.1', 'Caixa e Equivalentes', 'ativo', 3),
    ('1.1.2', 'Contas a Receber', 'ativo', 3),
    ('2', 'PASSIVO', 'passivo', 1),
    ('2.1', 'PASSIVO CIRCULANTE', 'passivo', 2),
    ('2.1.1', 'Contas a Pagar', 'passivo', 3),
    ('3', 'RECEITAS', 'receita', 1),
    ('3.1', 'Receitas Operacionais', 'receita', 2),
    ('3.1.1', 'Receitas de Serviços', 'receita', 3),
    ('4', 'DESPESAS', 'despesa', 1),
    ('4.1', 'Despesas Operacionais', 'despesa', 2),
    ('4.1.1', 'Despesas Administrativas', 'despesa', 3)
) AS v(codigo, descricao, tipo, nivel)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir centro de custos padrão
INSERT INTO centros_custos (empresa_id, codigo, nome, tipo)
SELECT
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    codigo,
    nome,
    tipo
FROM (VALUES
    ('001', 'Administrativo', 'administrativo'),
    ('002', 'Comercial', 'comercial'),
    ('003', 'Operacional', 'operacional')
) AS v(codigo, nome, tipo)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir categorias de serviços
INSERT INTO categorias_servicos (empresa_id, nome, codigo)
SELECT
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    nome,
    codigo
FROM (VALUES
    ('Consultoria', 'CONS'),
    ('Desenvolvimento', 'DEV'),
    ('Manutenção', 'MANUT'),
    ('Treinamento', 'TREIN')
) AS v(nome, codigo)
ON CONFLICT DO NOTHING;

-- Inserir tipos de documentos
INSERT INTO tipos_documentos (empresa_id, nome, categoria, obrigatorio, dias_validade)
SELECT
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    nome,
    categoria,
    obrigatorio,
    dias_validade
FROM (VALUES
    ('Certidão Negativa Federal', 'tributaria', true, 180),
    ('Certidão Negativa Estadual', 'tributaria', true, 180),
    ('Certidão Negativa Municipal', 'tributaria', true, 180),
    ('Certidão FGTS', 'trabalhista', true, 90),
    ('Certidão Trabalhista', 'trabalhista', true, 180),
    ('Balanço Patrimonial', 'economica', true, 365),
    ('Atestado de Capacidade Técnica', 'tecnica', true, null)
) AS v(nome, categoria, obrigatorio, dias_validade);

-- Inserir configurações padrão
INSERT INTO configuracoes (
    empresa_id,
    regime_tributario,
    margem_minima_aceitavel,
    score_minimo_participacao,
    aliquota_simples,
    aliquota_iss
) SELECT
    (SELECT id FROM empresas WHERE cnpj = '00.000.000/0001-00'),
    'simples_nacional',
    15.00,
    70,
    6.00,
    5.00
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON DATABASE erp_licitacao IS 'Sistema ERP LicitaEvolution para gestão de licitações públicas';

COMMENT ON TABLE empresas IS 'Empresas cadastradas no sistema (multi-tenant)';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com controle de acesso por empresa';
COMMENT ON TABLE editais IS 'Editais de licitação com análise de IA';
COMMENT ON TABLE contratos IS 'Contratos assinados e gestão de execução';
COMMENT ON TABLE lancamentos_financeiros IS 'Movimentações financeiras da empresa';
COMMENT ON TABLE orcamentos IS 'Orçamentos e propostas comerciais';
COMMENT ON TABLE servicos IS 'Catálogo de serviços e produtos da empresa';
COMMENT ON TABLE fornecedores IS 'Cadastro de fornecedores e parceiros';
COMMENT ON TABLE documentos IS 'Gestão de documentos e arquivos';
COMMENT ON TABLE notificacoes IS 'Sistema de notificações e alertas';

-- Sucesso!
SELECT 'Database LicitaEvolution inicializado com sucesso!' as status;