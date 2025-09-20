const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Definir níveis customizados
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
};

// Adicionar cores ao winston
winston.addColors(customLevels.colors);

// Formato customizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Adicionar stack trace para erros
    if (stack) {
      msg += `\n${stack}`;
    }

    // Adicionar metadados se existirem
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return msg;
  })
);

// Formato para arquivos (sem cores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transportes
const transports = [];

// Console transport para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: logFormat
    })
  );
}

// File transports para produção
if (process.env.NODE_ENV === 'production') {
  // Log geral com rotação diária
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: fileFormat
    })
  );

  // Log de erros separado
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat
    })
  );

  // Log de debug (se habilitado)
  if (process.env.LOG_LEVEL === 'debug') {
    transports.push(
      new DailyRotateFile({
        filename: path.join('logs', 'debug-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '50m',
        maxFiles: '7d',
        level: 'debug',
        format: fileFormat
      })
    );
  }
}

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: customLevels.levels,
  format: fileFormat,
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false,
  // Capturar exceções não tratadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      format: fileFormat
    })
  ],
  // Capturar promises rejeitadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      format: fileFormat
    })
  ]
});

// Middleware para Express
logger.expressMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log da requisição
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });

  // Interceptar resposta para log
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };

  next();
};

// Métodos auxiliares para diferentes contextos
logger.database = (message, meta = {}) => {
  logger.debug(`[DATABASE] ${message}`, meta);
};

logger.auth = (message, meta = {}) => {
  logger.info(`[AUTH] ${message}`, meta);
};

logger.security = (message, meta = {}) => {
  logger.warn(`[SECURITY] ${message}`, meta);
};

logger.claude = (message, meta = {}) => {
  logger.info(`[CLAUDE] ${message}`, meta);
};

logger.business = (message, meta = {}) => {
  logger.info(`[BUSINESS] ${message}`, meta);
};

// Método para log de performance
logger.performance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level](`[PERFORMANCE] ${operation} took ${duration}ms`, meta);
};

// Método para log de auditoria
logger.audit = (action, userId, data = {}) => {
  logger.info(`[AUDIT] ${action}`, {
    userId,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Stream para Morgan (logs HTTP)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Função para logs estruturados
logger.structured = (level, message, context = {}) => {
  logger[level](message, {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'licitaevolution-api',
    ...context
  });
};

// Interceptar erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Health check do logger
logger.healthCheck = () => {
  try {
    logger.info('Logger health check - OK');
    return true;
  } catch (error) {
    console.error('Logger health check failed:', error);
    return false;
  }
};

module.exports = logger;