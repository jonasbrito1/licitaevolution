#!/usr/bin/env node

/**
 * Script de inicialização do banco de dados MySQL para LicitaEvolution
 *
 * Este script:
 * 1. Conecta ao MySQL
 * 2. Cria o banco de dados se não existir
 * 3. Executa as migrations/sincronização das tabelas
 * 4. Popula dados iniciais se necessário
 *
 * Uso: node backend/utils/initDatabase.js [--force] [--seed]
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurar logger básico
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  debug: (msg) => process.env.NODE_ENV === 'development' && console.log(`🔍 ${msg}`)
};

// Configurações
const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123',
  database: process.env.MYSQL_DATABASE || 'licitaevolution'
};

// Argumentos da linha de comando
const args = process.argv.slice(2);
const forceInit = args.includes('--force');
const seedData = args.includes('--seed');

async function createDatabase() {
  logger.info('Conectando ao MySQL para criar database...');

  // Conectar sem especificar database para poder criar
  const adminConnection = new Sequelize({
    dialect: 'mysql',
    host: config.host,
    port: config.port,
    username: config.user,
    password: config.password,
    logging: false
  });

  try {
    await adminConnection.authenticate();
    logger.success('Conectado ao MySQL');

    // Criar database se não existir
    await adminConnection.query(`
      CREATE DATABASE IF NOT EXISTS \`${config.database}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
    `);

    logger.success(`Database '${config.database}' criado/verificado`);
    await adminConnection.close();

  } catch (error) {
    logger.error(`Erro ao criar database: ${error.message}`);
    await adminConnection.close();
    throw error;
  }
}

async function initializeSequelize() {
  logger.info('Inicializando Sequelize com MySQL...');

  const { sequelize, testConnection, syncDatabase } = require('../config/database');

  try {
    // Testar conexão
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Não foi possível conectar ao banco de dados');
    }

    // Sincronizar modelos
    logger.info('Sincronizando modelos com o banco...');
    const synced = await syncDatabase({
      force: forceInit,
      alter: !forceInit // Apenas alterar se não for force
    });

    if (!synced) {
      throw new Error('Erro ao sincronizar banco de dados');
    }

    logger.success('Modelos sincronizados com sucesso');
    return sequelize;

  } catch (error) {
    logger.error(`Erro na inicialização: ${error.message}`);
    throw error;
  }
}

async function seedInitialData(sequelize) {
  if (!seedData) {
    logger.info('Pular seed de dados (use --seed para incluir)');
    return;
  }

  logger.info('Inserindo dados iniciais...');

  try {
    const { Empresa, Usuario, CategoriaFinanceira, Conta } = require('../models');

    // Verificar se já existem dados
    const empresaCount = await Empresa.count();
    if (empresaCount > 0 && !forceInit) {
      logger.warn('Dados já existem, pulando seed');
      return;
    }

    // Criar empresa demo
    const empresaDemo = await Empresa.findOrCreate({
      where: { cnpj: '12.345.678/0001-90' },
      defaults: {
        razao_social: 'LicitaEvolution Demo LTDA',
        nome_fantasia: 'LicitaEvolution',
        cnpj: '12.345.678/0001-90',
        regime_tributario: 'simples_nacional',
        porte_empresa: 'pequena',
        email: 'demo@licitaevolution.com.br',
        telefone: '(11) 99999-9999',
        cidade: 'São Paulo',
        estado: 'SP',
        ativa: true
      }
    });

    const empresa = empresaDemo[0];
    logger.success(`Empresa demo criada: ${empresa.razao_social}`);

    // Criar usuário admin
    const usuarioAdmin = await Usuario.findOrCreate({
      where: { email: 'admin@licitaevolution.com.br' },
      defaults: {
        empresa_id: empresa.id,
        nome: 'Administrador Demo',
        email: 'admin@licitaevolution.com.br',
        senha: 'admin123', // Será hash automaticamente pelo hook
        nivel_acesso: 'admin',
        modulos_permitidos: [
          'editais', 'financeiro', 'compras', 'orcamentos',
          'relatorios', 'configuracoes', 'usuarios'
        ],
        ativo: true
      }
    });

    logger.success(`Usuário admin criado: ${usuarioAdmin[0].email}`);

    // Criar categorias financeiras padrão
    const categorias = [
      { nome: 'Receitas de Contratos', tipo: 'receita', cor: '#4CAF50' },
      { nome: 'Receitas Diversas', tipo: 'receita', cor: '#8BC34A' },
      { nome: 'Despesas Operacionais', tipo: 'despesa', cor: '#F44336' },
      { nome: 'Despesas com Pessoal', tipo: 'despesa', cor: '#FF5722' },
      { nome: 'Impostos e Taxas', tipo: 'despesa', cor: '#9C27B0' },
      { nome: 'Fornecedores', tipo: 'despesa', cor: '#FF9800' }
    ];

    for (const categoria of categorias) {
      await CategoriaFinanceira.findOrCreate({
        where: {
          empresa_id: empresa.id,
          nome: categoria.nome,
          tipo: categoria.tipo
        },
        defaults: {
          empresa_id: empresa.id,
          ...categoria,
          ativa: true
        }
      });
    }

    logger.success('Categorias financeiras criadas');

    // Criar conta padrão
    await Conta.findOrCreate({
      where: {
        empresa_id: empresa.id,
        nome: 'Conta Corrente Principal'
      },
      defaults: {
        empresa_id: empresa.id,
        nome: 'Conta Corrente Principal',
        tipo: 'banco',
        saldo_inicial: 0,
        saldo_atual: 0,
        ativa: true
      }
    });

    logger.success('Conta padrão criada');
    logger.success('Dados iniciais inseridos com sucesso!');

  } catch (error) {
    logger.error(`Erro ao inserir dados iniciais: ${error.message}`);
    throw error;
  }
}

async function createAdditionalTables(sequelize) {
  logger.info('Criando tabelas adicionais...');

  try {
    // Tabelas que podem não estar nos modelos ainda
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id CHAR(36) PRIMARY KEY,
        empresa_id CHAR(36),
        usuario_id CHAR(36),
        acao VARCHAR(100) NOT NULL,
        entidade VARCHAR(100) NOT NULL,
        entidade_id CHAR(36),
        dados_anteriores JSON,
        dados_novos JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_logs_empresa_data (empresa_id, created_at),
        INDEX idx_logs_usuario (usuario_id),
        INDEX idx_logs_entidade (entidade, entidade_id),
        INDEX idx_logs_acao (acao)
      )
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id CHAR(36) PRIMARY KEY,
        empresa_id CHAR(36),
        usuario_id CHAR(36),
        tipo VARCHAR(50) NOT NULL,
        categoria VARCHAR(50),
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        acao_url VARCHAR(500),
        acao_texto VARCHAR(100),
        data_expiracao TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_notificacoes_usuario_lida (usuario_id, lida),
        INDEX idx_notificacoes_empresa (empresa_id),
        INDEX idx_notificacoes_tipo (tipo),
        INDEX idx_notificacoes_data (created_at)
      )
    `);

    logger.success('Tabelas adicionais criadas');

  } catch (error) {
    logger.error(`Erro ao criar tabelas adicionais: ${error.message}`);
    // Não falha o processo, apenas avisa
  }
}

async function optimizeTables(sequelize) {
  logger.info('Otimizando tabelas...');

  try {
    const tables = [
      'empresas', 'usuarios', 'editais', 'analises_editais',
      'contas', 'categorias_financeiras', 'transacoes_financeiras'
    ];

    for (const table of tables) {
      try {
        await sequelize.query(`OPTIMIZE TABLE ${table}`);
        logger.debug(`Tabela ${table} otimizada`);
      } catch (error) {
        logger.warn(`Não foi possível otimizar ${table}: ${error.message}`);
      }
    }

    logger.success('Otimização de tabelas concluída');

  } catch (error) {
    logger.warn(`Erro na otimização: ${error.message}`);
  }
}

async function main() {
  logger.info('🚀 Iniciando configuração do banco de dados MySQL...');
  logger.info(`📊 Database: ${config.database}`);
  logger.info(`🖥️  Host: ${config.host}:${config.port}`);
  logger.info(`👤 User: ${config.user}`);

  if (forceInit) {
    logger.warn('⚠️  Modo FORCE ativado - todas as tabelas serão recriadas!');
  }

  if (seedData) {
    logger.info('🌱 Seed de dados ativado');
  }

  try {
    // 1. Criar database
    await createDatabase();

    // 2. Inicializar Sequelize e modelos
    const sequelize = await initializeSequelize();

    // 3. Criar tabelas adicionais
    await createAdditionalTables(sequelize);

    // 4. Inserir dados iniciais
    await seedInitialData(sequelize);

    // 5. Otimizar tabelas
    await optimizeTables(sequelize);

    // 6. Log de sucesso
    logger.success('🎉 Banco de dados configurado com sucesso!');
    logger.info('📝 Informações de acesso:');
    logger.info('   Email: admin@licitaevolution.com.br');
    logger.info('   Senha: admin123');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    logger.error(`💥 Falha na configuração: ${error.message}`);

    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createDatabase,
  initializeSequelize,
  seedInitialData
};