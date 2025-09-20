import api from './api';

const analyticsService = {
  // Dashboard Geral
  buscarDashboardGeral: async (periodo = '12m') => {
    try {
      const response = await api.get('/analytics/dashboard', { params: { periodo } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar dashboard geral' };
    }
  },

  // KPIs Principais
  buscarKPIsPrincipais: async (periodo = '12m') => {
    try {
      const response = await api.get('/analytics/kpis', { params: { periodo } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar KPIs' };
    }
  },

  // Relatórios Financeiros
  relatorioFinanceiro: {
    demonstrativoResultado: async (periodo) => {
      try {
        const response = await api.get('/analytics/financeiro/dre', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao gerar DRE' };
      }
    },

    fluxoCaixaDetalhado: async (periodo) => {
      try {
        const response = await api.get('/analytics/financeiro/fluxo-caixa', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao gerar fluxo de caixa' };
      }
    },

    analiseReceitas: async (periodo) => {
      try {
        const response = await api.get('/analytics/financeiro/receitas', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar receitas' };
      }
    },

    analiseDespesas: async (periodo) => {
      try {
        const response = await api.get('/analytics/financeiro/despesas', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar despesas' };
      }
    },

    analiseLucratividade: async (periodo) => {
      try {
        const response = await api.get('/analytics/financeiro/lucratividade', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar lucratividade' };
      }
    },

    projecaoFinanceira: async (meses = 6) => {
      try {
        const response = await api.get('/analytics/financeiro/projecao', { params: { meses } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao gerar projeção' };
      }
    }
  },

  // Relatórios de Licitações
  relatorioLicitacoes: {
    performanceGeral: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/performance', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao buscar performance de licitações' };
      }
    },

    analiseEditais: async (filtros = {}) => {
      try {
        const response = await api.get('/analytics/licitacoes/editais', { params: filtros });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar editais' };
      }
    },

    taxaSucesso: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/taxa-sucesso', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao calcular taxa de sucesso' };
      }
    },

    analiseOportunidades: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/oportunidades', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar oportunidades' };
      }
    },

    competitividade: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/competitividade', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar competitividade' };
      }
    },

    analiseModalidades: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/modalidades', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar modalidades' };
      }
    },

    analiseOrgaos: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitacoes/orgaos', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar órgãos' };
      }
    }
  },

  // Relatórios de LicitAI
  relatorioLicitAI: {
    efetividadeAnalises: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitai/efetividade', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar efetividade da LicitAI' };
      }
    },

    acuracidaScores: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitai/acuracia', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar acurácia dos scores' };
      }
    },

    riscosBeneficos: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitai/riscos-beneficios', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar riscos e benefícios' };
      }
    },

    tempoAnalise: async (periodo) => {
      try {
        const response = await api.get('/analytics/licitai/tempo-analise', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar tempo de análise' };
      }
    }
  },

  // Relatórios de Compras
  relatorioCompras: {
    performanceFornecedores: async (periodo) => {
      try {
        const response = await api.get('/analytics/compras/fornecedores', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar performance de fornecedores' };
      }
    },

    analiseEconomia: async (periodo) => {
      try {
        const response = await api.get('/analytics/compras/economia', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar economia em compras' };
      }
    },

    sazonalidade: async (periodo) => {
      try {
        const response = await api.get('/analytics/compras/sazonalidade', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar sazonalidade' };
      }
    },

    categorias: async (periodo) => {
      try {
        const response = await api.get('/analytics/compras/categorias', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar categorias de compras' };
      }
    }
  },

  // Análises Comparativas
  analiseComparativa: {
    periodos: async (periodo1, periodo2) => {
      try {
        const response = await api.get('/analytics/comparativo/periodos', {
          params: { periodo1, periodo2 }
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao comparar períodos' };
      }
    },

    benchmarking: async (tipo, periodo) => {
      try {
        const response = await api.get('/analytics/comparativo/benchmarking', {
          params: { tipo, periodo }
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao gerar benchmarking' };
      }
    },

    metas: async (periodo) => {
      try {
        const response = await api.get('/analytics/comparativo/metas', { params: { periodo } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao comparar com metas' };
      }
    }
  },

  // Relatórios Customizados
  relatorioCustomizado: {
    criar: async (configuracao) => {
      try {
        const response = await api.post('/analytics/custom/criar', configuracao);
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao criar relatório customizado' };
      }
    },

    executar: async (id, parametros = {}) => {
      try {
        const response = await api.post(`/analytics/custom/${id}/executar`, parametros);
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao executar relatório customizado' };
      }
    },

    listar: async () => {
      try {
        const response = await api.get('/analytics/custom/listar');
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao listar relatórios customizados' };
      }
    },

    salvar: async (id, nome) => {
      try {
        const response = await api.post(`/analytics/custom/${id}/salvar`, { nome });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao salvar relatório' };
      }
    }
  },

  // Exportação de Dados
  exportar: {
    pdf: async (relatorioId, parametros = {}) => {
      try {
        const response = await api.post(`/analytics/export/pdf/${relatorioId}`, parametros, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao exportar PDF' };
      }
    },

    excel: async (relatorioId, parametros = {}) => {
      try {
        const response = await api.post(`/analytics/export/excel/${relatorioId}`, parametros, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao exportar Excel' };
      }
    },

    csv: async (relatorioId, parametros = {}) => {
      try {
        const response = await api.post(`/analytics/export/csv/${relatorioId}`, parametros, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao exportar CSV' };
      }
    },

    dashboardPdf: async (dashboardConfig) => {
      try {
        const response = await api.post('/analytics/export/dashboard-pdf', dashboardConfig, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao exportar dashboard' };
      }
    }
  },

  // Dados em Tempo Real
  tempoReal: {
    conectar: (onUpdate) => {
      // WebSocket para dados em tempo real
      const ws = new WebSocket(`${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/analytics`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onUpdate(data);
      };

      return ws;
    },

    buscarUltimasAtualizacoes: async () => {
      try {
        const response = await api.get('/analytics/tempo-real/atualizacoes');
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao buscar atualizações' };
      }
    },

    configurarAlertas: async (alertas) => {
      try {
        const response = await api.post('/analytics/tempo-real/alertas', alertas);
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao configurar alertas' };
      }
    }
  },

  // Análise Preditiva
  analisePreditiva: {
    previsaoReceitas: async (meses = 6) => {
      try {
        const response = await api.get('/analytics/preditiva/receitas', { params: { meses } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao prever receitas' };
      }
    },

    previsaoOportunidades: async (meses = 3) => {
      try {
        const response = await api.get('/analytics/preditiva/oportunidades', { params: { meses } });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao prever oportunidades' };
      }
    },

    tendenciasMercado: async () => {
      try {
        const response = await api.get('/analytics/preditiva/tendencias');
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao analisar tendências' };
      }
    },

    riskAssessment: async (tipo, parametros) => {
      try {
        const response = await api.post('/analytics/preditiva/risco', { tipo, parametros });
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao avaliar riscos' };
      }
    }
  },

  // Configurações e Preferências
  configuracoes: {
    salvarPreferencias: async (preferencias) => {
      try {
        const response = await api.post('/analytics/config/preferencias', preferencias);
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao salvar preferências' };
      }
    },

    buscarPreferencias: async () => {
      try {
        const response = await api.get('/analytics/config/preferencias');
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao buscar preferências' };
      }
    },

    configurarDashboard: async (configuracao) => {
      try {
        const response = await api.post('/analytics/config/dashboard', configuracao);
        return response.data;
      } catch (error) {
        throw error.response?.data || { success: false, message: 'Erro ao configurar dashboard' };
      }
    }
  }
};

export default analyticsService;