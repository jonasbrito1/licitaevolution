const express = require('express');
const router = express.Router();

// Placeholder para rotas de autenticação
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Auth routes OK' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ success: false, message: 'Login em desenvolvimento' });
});

router.post('/register', (req, res) => {
  res.status(501).json({ success: false, message: 'Registro em desenvolvimento' });
});

router.get('/me', (req, res) => {
  res.status(501).json({ success: false, message: 'Profile em desenvolvimento' });
});

module.exports = router;