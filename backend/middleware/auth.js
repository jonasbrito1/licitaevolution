const jwt = require('jsonwebtoken');
const { Usuario, Empresa } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware de autenticação JWT (com fallback para desenvolvimento)
 */
const auth = async (req, res, next) => {
  try {
    // Em desenvolvimento, usar usuário simulado se não houver token
    if (process.env.NODE_ENV === 'development') {
      let token = req.header('Authorization');

      if (!token) {
        // Simular usuário autenticado em desenvolvimento
        req.user = {
          id: '12345678-1234-1234-1234-123456789abc',
          empresa_id: '87654321-4321-4321-4321-cba987654321',
          nome: 'Administrador Demo',
          email: 'admin@licitaevolution.com.br',
          nivel_acesso: 'admin',
          modulos_permitidos: ['editais', 'financeiro', 'compras', 'orcamentos', 'relatorios', 'configuracoes', 'usuarios'],
          ativo: true
        };
        req.empresa = {
          id: '87654321-4321-4321-4321-cba987654321',
          razao_social: 'LicitaEvolution Demo LTDA',
          cnpj: '12.345.678/0001-90',
          ativa: true,
          regime_tributario: 'simples_nacional',
          porte_empresa: 'pequena'
        };
        return next();
      }
    }

    // Extrair token do header Authorization
    let token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      });
    }

    // Remover 'Bearer ' do token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'razao_social', 'cnpj', 'ativa', 'regime_tributario', 'porte_empresa']
      }]
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido - usuário não encontrado'
      });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    // Verificar se usuário está bloqueado (apenas se método existir)
    if (typeof usuario.estaBloqueado === 'function' && usuario.estaBloqueado()) {
      return res.status(401).json({
        success: false,
        error: 'Usuário temporariamente bloqueado por excesso de tentativas'
      });
    }

    // Verificar se empresa está ativa
    if (!usuario.empresa || !usuario.empresa.ativa) {
      return res.status(401).json({
        success: false,
        error: 'Empresa inativa'
      });
    }

    // Adicionar usuário e empresa ao request
    req.user = usuario;
    req.empresa = usuario.empresa;

    // Log de acesso (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Usuário autenticado: ${usuario.email} (${usuario.empresa.razao_social})`);
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        expired: true
      });
    }

    logger.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno de autenticação'
    });
  }
};

/**
 * Middleware para verificar permissões de módulo
 */
const requireModule = (modulo) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Admin tem acesso a tudo
    if (req.user.nivel_acesso === 'admin') {
      return next();
    }

    // Verificar se tem permissão para o módulo
    if (!req.user.temPermissao(modulo)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado ao módulo: ${modulo}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar nível de acesso
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];

    if (!rolesArray.includes(req.user.nivel_acesso)) {
      return res.status(403).json({
        success: false,
        error: 'Nível de acesso insuficiente'
      });
    }

    next();
  };
};

/**
 * Middleware opcional - não falha se não autenticado
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) {
      return next(); // Continua sem autenticação
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{
        model: Empresa,
        as: 'empresa'
      }]
    });

    if (usuario && usuario.ativo && usuario.empresa && usuario.empresa.ativa) {
      req.user = usuario;
      req.empresa = usuario.empresa;
    }

    next();

  } catch (error) {
    // Ignora erros de token em auth opcional
    next();
  }
};

/**
 * Middleware para logging de auditoria
 */
const auditLog = (acao) => {
  return async (req, res, next) => {
    // Store audit info for later use
    req.auditAction = acao;
    req.auditIP = req.ip || req.connection.remoteAddress;
    req.auditUserAgent = req.get('User-Agent');

    next();
  };
};

/**
 * Middleware para rate limiting por usuário
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpar requests antigos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    next();
  };
};

/**
 * Middleware para verificar se empresa pode usar funcionalidades premium
 */
const requirePremium = async (req, res, next) => {
  try {
    if (!req.empresa) {
      return res.status(401).json({
        success: false,
        error: 'Empresa não identificada'
      });
    }

    // Aqui você implementaria a lógica de verificação de plano
    // Por enquanto, sempre permite
    next();

  } catch (error) {
    logger.error('Erro na verificação premium:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar permissões premium'
    });
  }
};

/**
 * Middleware para multi-tenancy - garantir isolamento por empresa
 */
const ensureCompanyIsolation = (req, res, next) => {
  if (!req.user || !req.empresa) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação requerida'
    });
  }

  // Adicionar filtro automático por empresa em queries
  req.companyFilter = { empresa_id: req.empresa.id };

  next();
};

/**
 * Middleware para refresh automático de token
 */
const autoRefreshToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const token = req.header('Authorization')?.slice(7);
    if (!token) {
      return next();
    }

    const decoded = jwt.decode(token);
    const timeUntilExpiry = decoded.exp * 1000 - Date.now();

    // Se o token expira em menos de 1 hora, gerar um novo
    if (timeUntilExpiry < 60 * 60 * 1000) {
      const newToken = jwt.sign(
        {
          id: req.user.id,
          empresa_id: req.empresa.id,
          nivel_acesso: req.user.nivel_acesso
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.set('X-New-Token', newToken);
    }

    next();

  } catch (error) {
    // Não falha se não conseguir renovar
    next();
  }
};

module.exports = {
  auth,
  requireModule,
  requireRole,
  optionalAuth,
  auditLog,
  userRateLimit,
  requirePremium,
  ensureCompanyIsolation,
  autoRefreshToken
};