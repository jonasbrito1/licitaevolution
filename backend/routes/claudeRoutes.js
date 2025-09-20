const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Claude routes OK' });
});

router.post('/analisar-texto', (req, res) => {
  res.json({
    success: true,
    analise: {
      score_final: 87,
      resumo: 'Edital com boa viabilidade para participação',
      recomendacao: 'Recomendamos a participação neste edital'
    }
  });
});

router.post('/analisar-edital', (req, res) => {
  res.json({
    success: true,
    analise: {
      score_final: 85,
      resumo: 'Análise de edital concluída',
      recomendacao: 'Edital aprovado para participação'
    }
  });
});

module.exports = router;