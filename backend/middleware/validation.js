const { body, validationResult } = require('express-validator');

const validateRequest = (validations) => {
  return (req, res, next) => {
    const errors = [];

    for (const validation of validations) {
      const { field, required = false, minLength, maxLength, type } = validation;
      const value = req.body[field];

      if (required && (!value || value === '')) {
        errors.push({
          field,
          message: `${field} é obrigatório`,
          type: 'required'
        });
        continue;
      }

      if (value && minLength && value.length < minLength) {
        errors.push({
          field,
          message: `${field} deve ter pelo menos ${minLength} caracteres`,
          type: 'minLength'
        });
      }

      if (value && maxLength && value.length > maxLength) {
        errors.push({
          field,
          message: `${field} deve ter no máximo ${maxLength} caracteres`,
          type: 'maxLength'
        });
      }

      if (value && type) {
        if (type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          errors.push({
            field,
            message: `${field} deve ser um email válido`,
            type: 'email'
          });
        }

        if (type === 'number' && isNaN(value)) {
          errors.push({
            field,
            message: `${field} deve ser um número`,
            type: 'number'
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        validationErrors: errors
      });
    }

    next();
  };
};

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      validationErrors: errors.array()
    });
  };
};

const authValidation = [
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

const empresaValidation = [
  body('razao_social').notEmpty().withMessage('Razão social é obrigatória'),
  body('cnpj').matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),
  body('email').isEmail().withMessage('Email deve ser válido')
];

const usuarioValidation = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

const editalValidation = [
  body('numero_edital').notEmpty().withMessage('Número do edital é obrigatório'),
  body('modalidade').isIn(['pregao', 'concorrencia', 'tomada_preco', 'convite', 'concurso', 'leilao'])
    .withMessage('Modalidade deve ser: pregao, concorrencia, tomada_preco, convite, concurso ou leilao'),
  body('objeto').isLength({ min: 10, max: 5000 }).withMessage('Objeto deve ter entre 10 e 5000 caracteres'),
  body('valor_estimado').optional().isFloat({ min: 0 }).withMessage('Valor estimado deve ser um número positivo'),
  body('data_abertura').optional().isISO8601().withMessage('Data de abertura deve ser uma data válida'),
  body('orgao_cnpj').optional().matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ do órgão deve estar no formato XX.XXX.XXX/XXXX-XX'),
  body('url_origem').optional().isURL().withMessage('URL de origem deve ser uma URL válida')
];

const editalUpdateValidation = [
  body('numero_edital').optional().notEmpty().withMessage('Número do edital não pode estar vazio'),
  body('modalidade').optional().isIn(['pregao', 'concorrencia', 'tomada_preco', 'convite', 'concurso', 'leilao'])
    .withMessage('Modalidade deve ser: pregao, concorrencia, tomada_preco, convite, concurso ou leilao'),
  body('objeto').optional().isLength({ min: 10, max: 5000 }).withMessage('Objeto deve ter entre 10 e 5000 caracteres'),
  body('valor_estimado').optional().isFloat({ min: 0 }).withMessage('Valor estimado deve ser um número positivo'),
  body('data_abertura').optional().isISO8601().withMessage('Data de abertura deve ser uma data válida'),
  body('orgao_cnpj').optional().matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ do órgão deve estar no formato XX.XXX.XXX/XXXX-XX'),
  body('url_origem').optional().isURL().withMessage('URL de origem deve ser uma URL válida')
];

const validateEdital = validate(editalValidation);
const validateEditalUpdate = validate(editalUpdateValidation);

module.exports = {
  validateRequest,
  validate,
  authValidation,
  empresaValidation,
  usuarioValidation,
  editalValidation,
  editalUpdateValidation,
  validateEdital,
  validateEditalUpdate
};