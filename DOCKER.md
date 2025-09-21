# 🐳 Docker - LicitaEvolution

Guia para executar o sistema localmente usando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado
- Pelo menos 4GB de RAM disponível

## 🚀 Início Rápido

### 1. Primeiro uso (build e start)

```bash
# Windows
docker-dev build
docker-dev up

# Linux/Mac
chmod +x docker-dev.sh
./docker-dev.sh build
./docker-dev.sh up
```

### 2. Uso diário (apenas start)

```bash
# Windows
docker-dev up

# Linux/Mac
./docker-dev.sh up
```

## 🌐 Acessos

Após iniciar os serviços:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface principal do sistema |
| **Backend API** | http://localhost:3001 | API REST do backend |
| **PgAdmin** | http://localhost:5050 | Interface de administração do PostgreSQL |
| **PostgreSQL** | localhost:5432 | Banco de dados |
| **Redis** | localhost:6379 | Cache e filas |

### Credenciais Padrão

**PgAdmin:**
- Email: `admin@admin.com`
- Senha: `admin123`

**PostgreSQL:**
- Host: `localhost` (ou `postgres` dentro do Docker)
- Porta: `5432`
- Database: `erp_licitacao`
- Usuário: `admin`
- Senha: `admin123`

## 📜 Comandos Disponíveis

```bash
# Construir imagens
docker-dev build

# Iniciar serviços
docker-dev up

# Parar serviços
docker-dev down

# Reiniciar serviços
docker-dev restart

# Ver logs em tempo real
docker-dev logs

# Ver status dos containers
docker-dev status

# Limpeza completa (volumes e containers)
docker-dev clean
```

## 🔧 Configuração

### Variáveis de Ambiente

As configurações estão no arquivo `.env.docker` e incluem:

- Configurações do banco de dados
- URLs dos serviços
- Chaves de API (opcional para desenvolvimento)
- Configurações de email (opcional)

### Volumes Persistentes

O Docker manterá os dados nos seguintes volumes:

- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `pgadmin_data` - Configurações do PgAdmin
- `./uploads` - Arquivos enviados
- `./logs` - Logs da aplicação

## 🐛 Troubleshooting

### Problema: Containers não iniciam

```bash
# Verificar status
docker-dev status

# Ver logs detalhados
docker-dev logs

# Limpeza e reinício
docker-dev clean
docker-dev build
docker-dev up
```

### Problema: Porta já em uso

Se alguma porta estiver em uso, você pode:

1. Parar o serviço que está usando a porta
2. Ou alterar as portas no `docker-compose.yml`

### Problema: Banco de dados não conecta

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs do banco
docker logs erp_licitacao_db

# Reiniciar apenas o banco
docker restart erp_licitacao_db
```

### Problema: Frontend não carrega

```bash
# Verificar logs do frontend
docker logs erp_frontend

# Verificar se o backend está rodando
curl http://localhost:3001/api/health
```

## 🔄 Desenvolvimento

### Hot Reload

O sistema está configurado para **hot reload**:

- **Backend**: Mudanças em arquivos `.js` reiniciam automaticamente o servidor
- **Frontend**: Mudanças são refletidas automaticamente no browser

### Acessar containers

```bash
# Backend
docker exec -it erp_backend sh

# Frontend
docker exec -it erp_frontend sh

# Banco de dados
docker exec -it erp_licitacao_db psql -U admin -d erp_licitacao
```

### Logs específicos

```bash
# Backend apenas
docker logs -f erp_backend

# Frontend apenas
docker logs -f erp_frontend

# Banco de dados apenas
docker logs -f erp_licitacao_db
```

## 📁 Estrutura dos Serviços

```
LicitaEvolution/
├── docker/
│   ├── Dockerfile.backend      # Imagem do backend
│   ├── Dockerfile.frontend     # Imagem do frontend
│   └── nginx.conf             # Configuração do Nginx
├── docker-compose.yml         # Orquestração dos serviços
├── .env.docker               # Variáveis de ambiente
└── docker-dev.bat           # Script helper (Windows)
```

## 🛡️ Segurança

⚠️ **Atenção**: Esta configuração é apenas para desenvolvimento local.

Para produção, você deve:
- Alterar todas as senhas padrão
- Configurar SSL/TLS
- Configurar firewalls apropriados
- Usar secrets do Docker para informações sensíveis

## 💡 Dicas

1. **Performance**: Aumente a memória do Docker para 4GB+ nas configurações
2. **Storage**: Use volumes nomeados para melhor performance
3. **Logs**: Use `docker-dev logs` para debuggar problemas
4. **Limpeza**: Execute `docker-dev clean` periodicamente para liberar espaço