const express = require('express');
const router = express.Router();
const LicitAIService = require('../services/licitai/LicitAIService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas PDFs, DOCs e DOCXs
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use PDF, DOC ou DOCX.'));
    }
  }
});

const licitAIService = new LicitAIService();

// Middleware para verificar autenticação
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  // Aqui você implementaria a validação do token
  next();
};

// Rota para análise completa de edital
router.post('/analyze/complete', requireAuth, async (req, res) => {
  try {
    const { editalData, empresaData, historicoData } = req.body;

    if (!editalData || !empresaData) {
      return res.status(400).json({
        error: 'Dados do edital e da empresa são obrigatórios'
      });
    }

    const analise = await licitAIService.analisarEditalCompleto(
      editalData,
      empresaData,
      historicoData
    );

    res.json({
      success: true,
      type: 'complete',
      data: analise
    });

  } catch (error) {
    console.error('Erro na análise completa:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para consulta geral via chat
router.post('/chat/consult', requireAuth, async (req, res) => {
  try {
    const { pergunta, contexto } = req.body;

    if (!pergunta) {
      return res.status(400).json({
        error: 'Pergunta é obrigatória'
      });
    }

    const resposta = await licitAIService.consultaGeral(pergunta, contexto);

    res.json({
      success: true,
      type: 'chat',
      data: {
        pergunta,
        resposta,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro na consulta geral:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para análise de documento
router.post('/analyze/document', requireAuth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Arquivo de documento é obrigatório'
      });
    }

    const { tipoAnalise = 'geral' } = req.body;
    const filePath = req.file.path;

    // Simular leitura do conteúdo do documento
    const documentoConteudo = `Conteúdo simulado do documento: ${req.file.originalname}`;

    const analise = await licitAIService.analisarDocumento(
      documentoConteudo,
      tipoAnalise
    );

    // Remover arquivo após processamento
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.warn('Erro ao remover arquivo temporário:', unlinkError);
    }

    res.json({
      success: true,
      type: 'document',
      filename: req.file.originalname,
      data: analise
    });

  } catch (error) {
    console.error('Erro na análise de documento:', error);

    // Tentar remover arquivo em caso de erro
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Erro ao remover arquivo após erro:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para estratégia de participação
router.post('/analyze/strategy', requireAuth, async (req, res) => {
  try {
    const { editalData, empresaData, concorrentes } = req.body;

    if (!editalData || !empresaData) {
      return res.status(400).json({
        error: 'Dados do edital e da empresa são obrigatórios'
      });
    }

    const estrategia = await licitAIService.gerarEstrategiaParticipacao(
      editalData,
      empresaData,
      concorrentes
    );

    res.json({
      success: true,
      type: 'strategy',
      data: estrategia
    });

  } catch (error) {
    console.error('Erro na análise de estratégia:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para análise de conformidade e riscos
router.post('/analyze/compliance', requireAuth, async (req, res) => {
  try {
    const { editalData, empresaData } = req.body;

    if (!editalData || !empresaData) {
      return res.status(400).json({
        error: 'Dados do edital e da empresa são obrigatórios'
      });
    }

    const analiseRiscos = await licitAIService.analisarRiscosConformidade(
      editalData,
      empresaData
    );

    res.json({
      success: true,
      type: 'compliance',
      data: analiseRiscos
    });

  } catch (error) {
    console.error('Erro na análise de conformidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para previsão de tendências de mercado
router.post('/analyze/market', requireAuth, async (req, res) => {
  try {
    const { setorEconomico, regiao, historicoLicitacoes } = req.body;

    if (!setorEconomico) {
      return res.status(400).json({
        error: 'Setor econômico é obrigatório'
      });
    }

    const previsoes = await licitAIService.preverTendenciasMercado(
      setorEconomico,
      regiao,
      historicoLicitacoes
    );

    res.json({
      success: true,
      type: 'market',
      data: previsoes
    });

  } catch (error) {
    console.error('Erro na análise de mercado:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para histórico de análises
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    // Simular histórico de análises
    const historico = {
      analyses: [
        {
          id: 1,
          type: 'complete',
          title: 'Análise Completa - Edital 001/2024',
          date: '2024-01-15',
          status: 'completed',
          score: 85
        },
        {
          id: 2,
          type: 'strategy',
          title: 'Estratégia - Licitação de TI',
          date: '2024-01-14',
          status: 'completed',
          score: 92
        },
        {
          id: 3,
          type: 'document',
          title: 'Análise de Documento - Contrato.pdf',
          date: '2024-01-13',
          status: 'completed',
          score: 78
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 3,
        pages: 1
      }
    };

    res.json({
      success: true,
      data: historico
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para estatísticas do LicitAI
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = {
      totalAnalyses: 156,
      successRate: 94.2,
      averageScore: 82.5,
      monthlyAnalyses: [
        { month: 'Jan', count: 45 },
        { month: 'Fev', count: 52 },
        { month: 'Mar', count: 59 }
      ],
      topCategories: [
        { category: 'Obras e Serviços', count: 65 },
        { category: 'TI e Tecnologia', count: 43 },
        { category: 'Consultoria', count: 32 },
        { category: 'Materiais', count: 16 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware de tratamento de erros do multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo: 10MB'
      });
    }
  }

  if (error.message.includes('Tipo de arquivo não suportado')) {
    return res.status(400).json({
      error: error.message
    });
  }

  res.status(500).json({
    error: 'Erro no processamento do arquivo',
    message: error.message
  });
});

module.exports = router;