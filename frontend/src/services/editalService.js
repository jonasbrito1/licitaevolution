import api from './api';

const editalService = {
  // Listar editais com filtros
  listarEditais: async (params = {}) => {
    try {
      const response = await api.get('/editais', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao listar editais' };
    }
  },

  // Buscar edital por ID
  buscarEdital: async (id) => {
    try {
      const response = await api.get(`/editais/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar edital' };
    }
  },

  // Criar novo edital
  criarEdital: async (editalData) => {
    try {
      const response = await api.post('/editais', editalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao criar edital' };
    }
  },

  // Atualizar edital
  atualizarEdital: async (id, editalData) => {
    try {
      const response = await api.put(`/editais/${id}`, editalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao atualizar edital' };
    }
  },

  // Atualizar status do edital
  atualizarStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/editais/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao atualizar status' };
    }
  },

  // Solicitar análise com LicitAI
  analisarEdital: async (id, parametros = {}) => {
    try {
      const response = await api.post(`/editais/${id}/analisar`, parametros);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao analisar edital' };
    }
  },

  // Excluir edital
  excluirEdital: async (id) => {
    try {
      const response = await api.delete(`/editais/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao excluir edital' };
    }
  },

  // Buscar estatísticas
  buscarEstatisticas: async () => {
    try {
      const response = await api.get('/editais/estatisticas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar estatísticas' };
    }
  },

  // Buscar histórico de alterações
  buscarHistorico: async (id) => {
    try {
      const response = await api.get(`/editais/${id}/historico`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Erro ao buscar histórico' };
    }
  }
};

export default editalService;