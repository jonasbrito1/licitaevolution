-- ===========================================
-- LICITAEVOLUTION - DADOS INICIAIS
-- ===========================================

USE licitaevolution;

-- Gerar ID único para empresa
SET @empresa_id = REPLACE(UUID(), '-', '');

-- Inserir empresa demo
INSERT IGNORE INTO empresas (
  id, razao_social, nome_fantasia, cnpj, regime_tributario, porte_empresa,
  email, telefone, cidade, estado, ativa, created_at, updated_at
) VALUES (
  @empresa_id,
  'LicitaEvolution Demo LTDA',
  'LicitaEvolution Demo',
  '12.345.678/0001-90',
  'simples_nacional',
  'pequena',
  'demo@licitaevolution.com.br',
  '(11) 99999-9999',
  'São Paulo',
  'SP',
  TRUE,
  NOW(),
  NOW()
);

-- Inserir usuário administrador demo
INSERT IGNORE INTO usuarios (
  id, empresa_id, nome, email, senha, nivel_acesso, modulos_permitidos,
  ativo, created_at, updated_at
) VALUES (
  REPLACE(UUID(), '-', ''),
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

-- Inserir editais de exemplo
INSERT IGNORE INTO editais (
  id, empresa_id, numero_edital, orgao_nome, modalidade, objeto,
  valor_estimado, status, score_viabilidade, data_abertura, created_at, updated_at
) VALUES
(
  REPLACE(UUID(), '-', ''),
  @empresa_id,
  'PE-001/2024',
  'Prefeitura Municipal de São Paulo',
  'pregao',
  'Aquisição de equipamentos de informática para modernização da rede municipal',
  250000.00,
  'novo',
  85,
  DATE_ADD(NOW(), INTERVAL 15 DAY),
  NOW(),
  NOW()
),
(
  REPLACE(UUID(), '-', ''),
  @empresa_id,
  'CC-002/2024',
  'Governo do Estado de São Paulo',
  'concorrencia',
  'Contratação de serviços de consultoria em tecnologia da informação',
  500000.00,
  'analisando',
  92,
  DATE_ADD(NOW(), INTERVAL 30 DAY),
  NOW(),
  NOW()
),
(
  REPLACE(UUID(), '-', ''),
  @empresa_id,
  'TP-003/2024',
  'Ministério da Educação',
  'tomada_preco',
  'Fornecimento de material escolar para escolas públicas',
  150000.00,
  'novo',
  78,
  DATE_ADD(NOW(), INTERVAL 20 DAY),
  NOW(),
  NOW()
);

SELECT 'Dados de exemplo inseridos com sucesso!' as Status;