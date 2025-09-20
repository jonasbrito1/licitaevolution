const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
});
app.use(limiter);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LicitaEvolution API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected',
  });
});

// Importar rotas
const aiAnalysisRoutes = require('./routes/ai-analysis-simple');

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    services: {
      database: 'connected',
      redis: 'connected',
      claude: 'ready',
    }
  });
});

// Configurar rotas de análise IA
app.use('/api/ai-analysis', aiAnalysisRoutes);

// Rota básica de auth (placeholder)
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login simulado - sistema em desenvolvimento',
    user: {
      id: 1,
      nome: 'Usuário Demo',
      email: 'demo@licitaevolution.com',
      nivel_acesso: 'admin'
    },
    empresa: {
      id: 1,
      razao_social: 'Empresa Demo LTDA',
      cnpj: '12.345.678/0001-90'
    },
    token: 'demo_token_123'
  });
});

// Rota de editais (placeholder)
app.get('/api/editais', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        numero: 'PE001/2024',
        orgao: 'Prefeitura Municipal',
        objeto: 'Aquisição de equipamentos de informática',
        valor: 150000,
        status: 'ativo',
        score: 85
      },
      {
        id: 2,
        numero: 'CC002/2024',
        orgao: 'Governo do Estado',
        objeto: 'Prestação de serviços de limpeza',
        valor: 280000,
        status: 'analise',
        score: 72
      }
    ]
  });
});

// Rota do Claude (placeholder)
app.post('/api/claude/analisar-texto', (req, res) => {
  res.json({
    success: true,
    analise: {
      score_final: 87,
      resumo: 'Edital com boa viabilidade para participação',
      recomendacao: 'Recomendamos a participação neste edital'
    }
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  logger.error('Erro na aplicação:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Função para iniciar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Modelos sincronizados com o banco');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📊 API Health: http://localhost:${PORT}/health`);
      logger.info(`🔗 API Base: http://localhost:${PORT}/api`);
      logger.info(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('🔄 Recebido SIGTERM, encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        logger.info('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🔄 Recebido SIGINT, encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        logger.info('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

module.exports = app;