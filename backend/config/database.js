const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuração da conexão com MySQL
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'licitaevolution',
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123',

  // Pool de conexões
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  },

  // Configurações de query específicas do MySQL
  dialectOptions: {
    connectTimeout: 60000,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    typeCast: true,
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    charset: 'utf8mb4'
  },

  // Logging personalizado
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[Sequelize] ${msg}`);
    }
  },

  // Configurações de benchmark
  benchmark: process.env.NODE_ENV === 'development',

  // Timezone
  timezone: '-03:00', // Brasília

  // Configurações de definição
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    dialectOptions: {
      collate: 'utf8mb4_unicode_ci'
    }
  },

  // Hooks globais
  hooks: {
    beforeConnect: async (_config) => {
      logger.info('🔌 Conectando ao MySQL...');
    },
    afterConnect: async (_connection, _config) => {
      logger.info('✅ Conectado ao MySQL com sucesso');
    },
    beforeDisconnect: async (_connection) => {
      logger.info('🔌 Desconectando do MySQL...');
    },
    afterDisconnect: async (_connection) => {
      logger.info('❌ Desconectado do MySQL');
    }
  }
});

// Função para testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexão com banco de dados estabelecida');
    return true;
  } catch (error) {
    logger.error('❌ Erro na conexão com banco de dados:', error);
    return false;
  }
}

// Função para sincronizar banco
async function syncDatabase(options = {}) {
  try {
    const defaultOptions = {
      force: false,
      alter: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development'
    };

    const syncOptions = { ...defaultOptions, ...options };

    await sequelize.sync(syncOptions);
    logger.info('✅ Banco de dados sincronizado');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao sincronizar banco de dados:', error);
    return false;
  }
}

// Função para executar migrations
async function runMigrations() {
  try {
    const { Umzug, SequelizeStorage } = require('umzug');

    const umzug = new Umzug({
      migrations: {
        glob: 'backend/migrations/*.js',
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize,
      }),
      logger: {
        info: (message) => logger.info(`[Migration] ${message}`),
        warn: (message) => logger.warn(`[Migration] ${message}`),
        error: (message) => logger.error(`[Migration] ${message}`)
      }
    });

    const pending = await umzug.pending();
    if (pending.length > 0) {
      logger.info(`🔄 Executando ${pending.length} migration(s)...`);
      await umzug.up();
      logger.info('✅ Migrations executadas com sucesso');
    } else {
      logger.info('ℹ️  Nenhuma migration pendente');
    }

    return true;
  } catch (error) {
    logger.error('❌ Erro ao executar migrations:', error);
    return false;
  }
}

// Função para backup do banco
async function backupDatabase() {
  try {
    const { spawn } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const backupDir = path.join(__dirname, '../../database/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

    const mysqldump = spawn('mysqldump', [
      '-h', process.env.MYSQL_HOST || 'localhost',
      '-P', process.env.MYSQL_PORT || '3306',
      '-u', process.env.MYSQL_USER || 'root',
      `-p${process.env.MYSQL_PASSWORD || 'root123'}`,
      '--routines',
      '--triggers',
      '--single-transaction',
      '--result-file=' + backupFile,
      process.env.MYSQL_DATABASE || 'licitaevolution'
    ]);

    return new Promise((resolve, reject) => {
      mysqldump.on('close', (code) => {
        if (code === 0) {
          logger.info(`✅ Backup criado: ${backupFile}`);
          resolve(backupFile);
        } else {
          logger.error(`❌ Erro no backup, código: ${code}`);
          reject(new Error(`Backup failed with code ${code}`));
        }
      });

      mysqldump.on('error', (error) => {
        logger.error('❌ Erro ao executar mysqldump:', error);
        reject(error);
      });
    });
  } catch (error) {
    logger.error('❌ Erro ao fazer backup:', error);
    throw error;
  }
}

// Função para restaurar backup
async function restoreDatabase(backupFile) {
  try {
    const { spawn } = require('child_process');

    if (!fs.existsSync(backupFile)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFile}`);
    }

    const mysql = spawn('mysql', [
      '-h', process.env.MYSQL_HOST || 'localhost',
      '-P', process.env.MYSQL_PORT || '3306',
      '-u', process.env.MYSQL_USER || 'root',
      `-p${process.env.MYSQL_PASSWORD || 'root123'}`,
      process.env.MYSQL_DATABASE || 'licitaevolution'
    ]);

    // Pipe o arquivo SQL para o mysql
    const readStream = fs.createReadStream(backupFile);
    readStream.pipe(mysql.stdin);

    return new Promise((resolve, reject) => {
      mysql.on('close', (code) => {
        if (code === 0) {
          logger.info(`✅ Backup restaurado: ${backupFile}`);
          resolve(true);
        } else {
          logger.error(`❌ Erro na restauração, código: ${code}`);
          reject(new Error(`Restore failed with code ${code}`));
        }
      });

      mysql.on('error', (error) => {
        logger.error('❌ Erro ao executar mysql:', error);
        reject(error);
      });
    });
  } catch (error) {
    logger.error('❌ Erro ao restaurar backup:', error);
    throw error;
  }
}

// Função para monitorar performance
function enableQueryMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    const originalQuery = sequelize.query;

    sequelize.query = function(...args) {
      const start = Date.now();
      const result = originalQuery.apply(this, args);

      if (result && typeof result.then === 'function') {
        return result.then((res) => {
          const duration = Date.now() - start;
          if (duration > 1000) { // Queries lentas (>1s)
            logger.warn(`🐌 Query lenta (${duration}ms): ${args[0]?.substring(0, 100)}...`);
          }
          return res;
        });
      }

      return result;
    };
  }
}

// Função para limpar cache
async function clearCache() {
  try {
    // Limpar cache de queries
    sequelize.connectionManager.pool.destroyAllNow();
    logger.info('✅ Cache do banco limpo');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao limpar cache:', error);
    return false;
  }
}

// Configurar monitoramento
enableQueryMonitoring();

// Event listeners para conexão
sequelize.addHook('afterConnect', () => {
  logger.debug('🔗 Nova conexão estabelecida');
});

sequelize.addHook('beforeDisconnect', () => {
  logger.debug('🔗 Conexão sendo encerrada');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔄 Encerrando conexões com banco...');
  await sequelize.close();
  logger.info('✅ Conexões encerradas');
});

process.on('SIGTERM', async () => {
  logger.info('🔄 Encerrando conexões com banco...');
  await sequelize.close();
  logger.info('✅ Conexões encerradas');
});

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase,
  runMigrations,
  backupDatabase,
  restoreDatabase,
  clearCache
};