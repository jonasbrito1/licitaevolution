# Database MySQL - LicitaEvolution

Este documento explica como configurar e usar o banco de dados MySQL para o sistema LicitaEvolution.

## 📋 Pré-requisitos

- MySQL 8.0+ instalado e executando
- Node.js 20+
- npm ou yarn

## 🚀 Configuração Inicial

### 1. Instalar MySQL

**Windows:**
```bash
# Download do MySQL Installer
# https://dev.mysql.com/downloads/installer/

# Ou via Chocolatey
choco install mysql

# Ou via winget
winget install Oracle.MySQL
```

**macOS:**
```bash
# Via Homebrew
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Configurar MySQL

```bash
# Configuração de segurança inicial
mysql_secure_installation

# Acessar MySQL
mysql -u root -p
```

### 3. Criar usuário para a aplicação (opcional)

```sql
-- No MySQL como root
CREATE USER 'licitaevolution'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON licitaevolution.* TO 'licitaevolution'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configurar variáveis de ambiente

Edite o arquivo `.env`:

```env
# Banco de dados MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=licitaevolution
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_mysql
```

## 🛠️ Scripts de Banco de Dados

### Inicialização Básica
```bash
# Criar banco e tabelas
npm run db:init

# Forçar recriação (apaga dados existentes)
npm run db:init:force

# Apenas inserir dados de exemplo
npm run db:seed

# Configuração completa (recria tudo + dados)
npm run db:setup
```

### Execução Manual do SQL
```bash
# Executar script SQL diretamente
mysql -u root -p licitaevolution < backend/database/init-mysql.sql
```

## 📊 Estrutura do Banco

### Tabelas Principais

#### `empresas`
- Dados das empresas usuárias do sistema
- Informações fiscais, endereço, configurações

#### `usuarios`
- Usuários do sistema
- Permissões, configurações pessoais
- Relacionamento com empresas

#### `editais`
- Editais de licitação
- Análise de IA, documentos, status
- Busca full-text

#### `analises_editais`
- Análises detalhadas dos editais
- Scores, cálculos financeiros
- Recomendações

### Tabelas Financeiras

#### `contas`
- Contas bancárias/caixa
- Saldos atualizados automaticamente

#### `categorias_financeiras`
- Categorização de receitas/despesas
- Hierárquica (pode ter pai)

#### `transacoes_financeiras`
- Movimentações financeiras
- Triggers automáticos para saldo

### Tabelas de Sistema

#### `logs_auditoria`
- Log de todas as ações no sistema
- Rastreabilidade completa

#### `notificacoes`
- Sistema de notificações
- Por usuário e empresa

## 🔧 Manutenção

### Backup
```bash
# Backup completo
mysqldump -u root -p --routines --triggers --single-transaction licitaevolution > backup.sql

# Backup apenas dados
mysqldump -u root -p --no-create-info licitaevolution > dados.sql
```

### Restore
```bash
# Restaurar backup
mysql -u root -p licitaevolution < backup.sql
```

### Otimização
```bash
# Analisar tabelas
mysql -u root -p -e "ANALYZE TABLE licitaevolution.editais, licitaevolution.transacoes_financeiras;"

# Otimizar tabelas
mysql -u root -p -e "OPTIMIZE TABLE licitaevolution.editais, licitaevolution.transacoes_financeiras;"
```

## 🔍 Monitoramento

### Queries Úteis

**Verificar tamanho das tabelas:**
```sql
SELECT
  table_name AS "Tabela",
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Tamanho (MB)"
FROM information_schema.TABLES
WHERE table_schema = "licitaevolution"
ORDER BY (data_length + index_length) DESC;
```

**Verificar índices:**
```sql
SELECT
  table_name,
  index_name,
  column_name,
  cardinality
FROM information_schema.STATISTICS
WHERE table_schema = 'licitaevolution'
ORDER BY table_name, index_name;
```

**Queries lentas:**
```sql
-- Habilitar log de queries lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Ver queries lentas
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### Performance

**Configurações recomendadas no my.cnf:**
```ini
[mysqld]
# Otimizações para LicitaEvolution
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 32M
tmp_table_size = 64M
max_heap_table_size = 64M

# Charset
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# Logs
slow_query_log = 1
long_query_time = 2
```

## 🚨 Troubleshooting

### Problemas Comuns

**Erro de conexão:**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar porta
netstat -tlnp | grep 3306

# Testar conexão
mysql -u root -p -h localhost
```

**Erro de charset:**
```sql
-- Verificar charset da database
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'licitaevolution';

-- Corrigir se necessário
ALTER DATABASE licitaevolution CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Tabelas não criadas:**
```bash
# Verificar logs do MySQL
sudo tail -f /var/log/mysql/error.log

# Recriar forçando
npm run db:init:force
```

**Performance lenta:**
```sql
-- Verificar queries em execução
SHOW PROCESSLIST;

-- Analisar query específica
EXPLAIN SELECT * FROM editais WHERE objeto LIKE '%termo%';
```

## 📈 Monitoramento de Produção

### Ferramentas Recomendadas

1. **MySQL Workbench** - Interface gráfica
2. **phpMyAdmin** - Interface web
3. **Percona Monitoring** - Monitoramento avançado
4. **Grafana + Prometheus** - Dashboards

### Alertas Importantes

- Uso de CPU > 80%
- Conexões ativas > 150
- Queries lentas > 10/min
- Espaço em disco < 20%
- Replicação atrasada > 60s

## 🔒 Segurança

### Boas Práticas

1. **Senhas fortes** para todos os usuários
2. **SSL/TLS** em produção
3. **Firewall** permitindo apenas IPs necessários
4. **Backup regular** e testado
5. **Logs de auditoria** habilitados
6. **Usuários específicos** para cada aplicação
7. **Privilégios mínimos** necessários

### Configuração SSL (Produção)

```sql
-- Verificar SSL
SHOW VARIABLES LIKE '%ssl%';

-- Forçar SSL para usuário
ALTER USER 'licitaevolution'@'%' REQUIRE SSL;
```

## 📚 Recursos Adicionais

- [Documentação MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)
- [Otimização MySQL](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Sequelize MySQL](https://sequelize.org/docs/v6/dialects/mysql/)
- [Backup Strategies](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)