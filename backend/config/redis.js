const { createClient } = require('redis');
const logger = require('../utils/logger');

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 segundo
  }

  async connect() {
    try {
      this.client = createClient({
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        connectTimeout: 10000,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        enableReadyCheck: false,
        maxLoadingTimeout: 5000
      });

      // Event listeners
      this.client.on('connect', () => {
        logger.info('🔴 Conectando ao Redis...');
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis conectado e pronto');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('error', (error) => {
        logger.error('❌ Erro no Redis:', error.message);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('🔴 Conexão Redis encerrada');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        logger.info(`🔄 Reconectando ao Redis (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.error('❌ Máximo de tentativas de reconexão atingido');
          this.client.disconnect();
        }
      });

      await this.client.connect();
      return true;

    } catch (error) {
      logger.warn('⚠️  Redis não disponível:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('🔴 Redis desconectado');
      } catch (error) {
        logger.error('❌ Erro ao desconectar Redis:', error);
      }
    }
  }

  isHealthy() {
    return this.isConnected && this.client && this.client.isReady;
  }

  async ping() {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('❌ Erro no ping Redis:', error);
      return false;
    }
  }

  // =====================================================
  // MÉTODOS DE CACHE
  // =====================================================

  async get(key) {
    if (!this.isHealthy()) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`❌ Erro ao buscar chave ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao definir chave ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao deletar chave ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Erro ao verificar chave ${key}:`, error);
      return false;
    }
  }

  async expire(key, ttl) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao definir TTL para ${key}:`, error);
      return false;
    }
  }

  async ttl(key) {
    if (!this.isHealthy()) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`❌ Erro ao buscar TTL de ${key}:`, error);
      return -1;
    }
  }

  // =====================================================
  // MÉTODOS DE LISTA
  // =====================================================

  async lpush(key, ...values) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = values.map(v => JSON.stringify(v));
      await this.client.lPush(key, serialized);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao adicionar à lista ${key}:`, error);
      return false;
    }
  }

  async rpop(key) {
    if (!this.isHealthy()) {
      return null;
    }

    try {
      const value = await this.client.rPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`❌ Erro ao remover da lista ${key}:`, error);
      return null;
    }
  }

  async llen(key) {
    if (!this.isHealthy()) {
      return 0;
    }

    try {
      return await this.client.lLen(key);
    } catch (error) {
      logger.error(`❌ Erro ao obter tamanho da lista ${key}:`, error);
      return 0;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    if (!this.isHealthy()) {
      return [];
    }

    try {
      const values = await this.client.lRange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      logger.error(`❌ Erro ao buscar lista ${key}:`, error);
      return [];
    }
  }

  // =====================================================
  // MÉTODOS DE SET
  // =====================================================

  async sadd(key, ...members) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = members.map(m => JSON.stringify(m));
      await this.client.sAdd(key, serialized);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao adicionar ao set ${key}:`, error);
      return false;
    }
  }

  async srem(key, ...members) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = members.map(m => JSON.stringify(m));
      await this.client.sRem(key, serialized);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao remover do set ${key}:`, error);
      return false;
    }
  }

  async smembers(key) {
    if (!this.isHealthy()) {
      return [];
    }

    try {
      const members = await this.client.sMembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      logger.error(`❌ Erro ao buscar set ${key}:`, error);
      return [];
    }
  }

  async sismember(key, member) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(member);
      const result = await this.client.sIsMember(key, serialized);
      return result === 1;
    } catch (error) {
      logger.error(`❌ Erro ao verificar membro do set ${key}:`, error);
      return false;
    }
  }

  // =====================================================
  // MÉTODOS DE HASH
  // =====================================================

  async hset(key, field, value) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.hSet(key, field, serialized);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao definir hash ${key}.${field}:`, error);
      return false;
    }
  }

  async hget(key, field) {
    if (!this.isHealthy()) {
      return null;
    }

    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`❌ Erro ao buscar hash ${key}.${field}:`, error);
      return null;
    }
  }

  async hgetall(key) {
    if (!this.isHealthy()) {
      return {};
    }

    try {
      const hash = await this.client.hGetAll(key);
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      logger.error(`❌ Erro ao buscar hash completo ${key}:`, error);
      return {};
    }
  }

  async hdel(key, ...fields) {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      await this.client.hDel(key, fields);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao deletar campos do hash ${key}:`, error);
      return false;
    }
  }

  // =====================================================
  // MÉTODOS DE PADRÃO E BUSCA
  // =====================================================

  async keys(pattern) {
    if (!this.isHealthy()) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`❌ Erro ao buscar chaves com padrão ${pattern}:`, error);
      return [];
    }
  }

  async flushdb() {
    if (!this.isHealthy()) {
      return false;
    }

    try {
      await this.client.flushDb();
      logger.info('🗑️  Redis database limpo');
      return true;
    } catch (error) {
      logger.error('❌ Erro ao limpar Redis database:', error);
      return false;
    }
  }

  // =====================================================
  // MÉTODOS DE ESTATÍSTICAS
  // =====================================================

  async info(section = null) {
    if (!this.isHealthy()) {
      return null;
    }

    try {
      return await this.client.info(section);
    } catch (error) {
      logger.error('❌ Erro ao obter info do Redis:', error);
      return null;
    }
  }

  async dbsize() {
    if (!this.isHealthy()) {
      return 0;
    }

    try {
      return await this.client.dbSize();
    } catch (error) {
      logger.error('❌ Erro ao obter tamanho do banco Redis:', error);
      return 0;
    }
  }

  // =====================================================
  // MÉTODOS ESPECÍFICOS DA APLICAÇÃO
  // =====================================================

  // Cache de editais
  async cacheEdital(editalId, data, ttl = 3600) {
    return await this.set(`edital:${editalId}`, data, ttl);
  }

  async getCachedEdital(editalId) {
    return await this.get(`edital:${editalId}`);
  }

  // Cache de análises de IA
  async cacheAnaliseIA(editalId, analise, ttl = 7200) {
    return await this.set(`analise_ia:${editalId}`, analise, ttl);
  }

  async getCachedAnaliseIA(editalId) {
    return await this.get(`analise_ia:${editalId}`);
  }

  // Cache de sessões de usuário
  async setUserSession(userId, sessionData, ttl = 86400) {
    return await this.set(`session:${userId}`, sessionData, ttl);
  }

  async getUserSession(userId) {
    return await this.get(`session:${userId}`);
  }

  async deleteUserSession(userId) {
    return await this.del(`session:${userId}`);
  }

  // Rate limiting
  async incrementRateLimit(key, window = 60, limit = 100) {
    if (!this.isHealthy()) {
      return { count: 0, remaining: limit, resetTime: Date.now() + window * 1000 };
    }

    try {
      const current = await this.client.incr(`rate_limit:${key}`);

      if (current === 1) {
        await this.client.expire(`rate_limit:${key}`, window);
      }

      const remaining = Math.max(0, limit - current);
      const ttl = await this.client.ttl(`rate_limit:${key}`);
      const resetTime = Date.now() + (ttl * 1000);

      return {
        count: current,
        remaining,
        resetTime,
        exceeded: current > limit
      };
    } catch (error) {
      logger.error(`❌ Erro no rate limiting para ${key}:`, error);
      return { count: 0, remaining: limit, resetTime: Date.now() + window * 1000 };
    }
  }

  // Cache de relatórios
  async cacheRelatorio(tipo, filtros, data, ttl = 1800) {
    const key = `relatorio:${tipo}:${Buffer.from(JSON.stringify(filtros)).toString('base64')}`;
    return await this.set(key, data, ttl);
  }

  async getCachedRelatorio(tipo, filtros) {
    const key = `relatorio:${tipo}:${Buffer.from(JSON.stringify(filtros)).toString('base64')}`;
    return await this.get(key);
  }
}

// Criar instância singleton
const redisManager = new RedisManager();

// Inicializar conexão
async function initializeRedis() {
  try {
    await redisManager.connect();
    return redisManager;
  } catch (error) {
    logger.warn('⚠️  Redis não será utilizado nesta sessão');
    return null;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisManager.disconnect();
});

process.on('SIGTERM', async () => {
  await redisManager.disconnect();
});

module.exports = {
  redisManager,
  initializeRedis
};