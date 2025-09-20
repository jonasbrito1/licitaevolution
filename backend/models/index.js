const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Importar apenas os modelos que existem
const Empresa = require('./Empresa');
const Usuario = require('./Usuario');
const Edital = require('./Edital');
const AnaliseEdital = require('./AnaliseEdital');

// Inicializar modelos
const models = {
  Empresa: Empresa(sequelize, DataTypes),
  Usuario: Usuario(sequelize, DataTypes),
  Edital: Edital(sequelize, DataTypes),
  AnaliseEdital: AnaliseEdital(sequelize, DataTypes),
};

// Definir associações básicas
if (models.Empresa.associate) {
  models.Empresa.associate(models);
}
if (models.Usuario.associate) {
  models.Usuario.associate(models);
}
if (models.Edital.associate) {
  models.Edital.associate(models);
}
if (models.AnaliseEdital.associate) {
  models.AnaliseEdital.associate(models);
}

// Adicionar sequelize ao models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;