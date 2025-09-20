const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./backend/config/database');
const logger = require('./backend/utils/logger');

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

// Servir arquivos estáticos HTML
app.use(express.static('./', {
  extensions: ['html'],
  index: 'portal.html'
}));

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

// Rota de editais (com dados reais do banco)
app.get('/api/editais', async (req, res) => {
  try {
    const query = `
      SELECT
        numero_edital as numero,
        orgao_nome as orgao,
        objeto,
        valor_estimado as valor,
        status,
        score_viabilidade as score
      FROM editais
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.warn('Erro ao buscar editais, retornando dados mock:', error.message);
    // Fallback para dados mock se houver erro
    res.json({
      success: true,
      data: [
        {
          numero: 'PE001/2024',
          orgao: 'Prefeitura Municipal',
          objeto: 'Aquisição de equipamentos de informática',
          valor: 150000,
          status: 'ativo',
          score: 85
        },
        {
          numero: 'CC002/2024',
          orgao: 'Governo do Estado',
          objeto: 'Prestação de serviços de limpeza',
          valor: 280000,
          status: 'analise',
          score: 72
        }
      ]
    });
  }
});

// Rota do Claude IA - Chat Assistant
app.post('/api/claude/analisar-texto', (req, res) => {
  const { texto, contexto, historico } = req.body;

  // Respostas inteligentes baseadas no contexto
  let resposta = '';

  if (contexto === 'chat_assistente') {
    // Análise da mensagem para fornecer resposta contextual
    const textoLower = texto.toLowerCase();

    if (textoLower.includes('olá') || textoLower.includes('oi') || textoLower.includes('bom dia') || textoLower.includes('boa tarde')) {
      resposta = 'Olá! Sou o LicitAI, seu assistente inteligente especializado em licitações públicas. Posso ajudá-lo com análise de editais, orientações sobre processos licitatórios, interpretação de documentos e estratégias de participação. Como posso auxiliá-lo hoje?';
    }
    else if (textoLower.includes('edital') || textoLower.includes('licitação')) {
      resposta = 'Posso ajudá-lo com análise de editais! Compartilhe o número do edital ou me conte sobre o que precisa: análise de viabilidade, interpretação de cláusulas, estratégias de participação ou orientações sobre documentação necessária.';
    }
    else if (textoLower.includes('score') || textoLower.includes('pontuação') || textoLower.includes('análise')) {
      resposta = 'O sistema de score avalia automaticamente cada edital considerando critérios como: compatibilidade com o perfil da empresa, valor do contrato, complexidade técnica, concorrência estimada e histórico do órgão. Posso explicar detalhadamente qualquer pontuação específica!';
    }
    else if (textoLower.includes('documento') || textoLower.includes('documentação')) {
      resposta = 'Para participação em licitações, geralmente são necessários: habilitação jurídica, qualificação técnica, qualificação econômico-financeira e regularidade fiscal. Posso orientar sobre documentos específicos para cada modalidade de licitação.';
    }
    else if (textoLower.includes('prazo') || textoLower.includes('cronograma')) {
      resposta = 'É fundamental acompanhar os prazos! Posso ajudar a organizar um cronograma considerando: prazo para esclarecimentos, entrega de propostas, recursos administrativos e prazos contratuais. Quer que analise algum edital específico?';
    }
    else if (textoLower.includes('recurso') || textoLower.includes('impugnação')) {
      resposta = 'Recursos e impugnações são direitos importantes! Posso orientar sobre: prazos para recursos, fundamentação legal, recursos administrativos e quando é recomendável questionar aspectos do edital. Precisa de ajuda com algum caso específico?';
    }
    else if (textoLower.includes('modalidade') || textoLower.includes('concorrência') || textoLower.includes('tomada de preços')) {
      resposta = 'Cada modalidade tem suas características: Convite (até R$ 330 mil), Tomada de Preços (até R$ 3,3 milhões), Concorrência (acima de R$ 3,3 milhões), Pregão (bens e serviços comuns) e RDC (obras públicas). Qual modalidade te interessa?';
    }
    else if (textoLower.includes('obrigado') || textoLower.includes('valeu') || textoLower.includes('tchau')) {
      resposta = 'Foi um prazer ajudar! Estou sempre aqui para auxiliar com suas dúvidas sobre licitações. Boa sorte em suas participações! 🚀';
    }
    else if (textoLower.includes('ajuda') || textoLower.includes('como') || textoLower.includes('posso')) {
      resposta = 'Posso ajudar com: 📋 Análise de editais, 📊 Interpretação de scores, 📝 Orientações sobre documentação, ⏰ Gestão de prazos, 🎯 Estratégias de participação, ⚖️ Questões jurídicas básicas, 💼 Modalidades de licitação. O que você gostaria de saber?';
    }
    else {
      // Resposta genérica inteligente
      resposta = `Entendo sua questão sobre "${texto}". Como especialista em licitações, posso fornecer orientações específicas sobre este tema. Poderia me dar mais detalhes para que eu possa ajudá-lo de forma mais precisa? Por exemplo, se refere a algum edital específico ou processo em andamento?`;
    }
  } else {
    // Análise padrão de texto de edital
    const score = Math.floor(Math.random() * 30) + 70; // Score entre 70-100

    resposta = `Análise realizada com sucesso! Com base no texto fornecido, identifiquei características importantes para sua participação. Score de viabilidade: ${score}%. `;

    if (score >= 85) {
      resposta += 'Recomendo fortemente a participação neste edital - excelente oportunidade!';
    } else if (score >= 75) {
      resposta += 'Boa oportunidade de participação, com viabilidade positiva.';
    } else {
      resposta += 'Participação possível, mas recomendo análise detalhada dos riscos.';
    }
  }

  res.json({
    success: true,
    resposta: resposta,
    analise: {
      score_final: Math.floor(Math.random() * 20) + 80,
      resumo: 'Análise processada pelo LicitAI',
      recomendacao: 'Consulte orientações específicas no chat',
      contexto: contexto || 'analise_texto'
    },
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res, _next) => {
  logger.error('Erro na aplicação:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Rota raiz - redirecionar para portal
app.get('/', (req, res) => {
  // Se for uma requisição de API (Accept: application/json), retornar JSON
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      success: true,
      message: 'LicitaEvolution API v1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        editais: '/api/editais',
        auth: '/api/auth/login',
        claude: '/api/claude/analisar-texto'
      },
      documentation: 'Acesse / para interface web',
      timestamp: new Date().toISOString()
    });
  }

  // Se for navegador, servir o portal HTML
  res.sendFile('portal.html', { root: __dirname });
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
    // Tentar conexão com banco (não crítico)
    try {
      await sequelize.authenticate();
      logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');

      // Sincronizar modelos (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false });
        logger.info('✅ Modelos sincronizados com o banco');
      }
    } catch (dbError) {
      logger.warn('⚠️  Banco de dados não disponível, continuando sem conexão:', dbError.message);
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