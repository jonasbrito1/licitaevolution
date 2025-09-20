import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const initialState = {
  user: null,
  empresa: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  permissions: [],
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        empresa: action.payload.empresa,
        token: action.payload.token,
        permissions: action.payload.permissions || [],
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case 'UPDATE_EMPRESA':
      return {
        ...state,
        empresa: { ...state.empresa, ...action.payload },
      };

    case 'TOKEN_REFRESH':
      return {
        ...state,
        token: action.payload,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configurar interceptadores do axios
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Verificar se há novo token no header
        const newToken = response.headers['x-new-token'];
        if (newToken) {
          dispatch({ type: 'TOKEN_REFRESH', payload: newToken });
          localStorage.setItem('token', newToken);
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token]);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Verificar se o token não expirou
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Buscar dados do usuário
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            empresa: response.data.empresa,
            token,
            permissions: response.data.permissions,
          },
        });

      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user, empresa, permissions } = response.data;

      // Salvar token no localStorage
      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, empresa, token, permissions },
      });

      return { success: true };

    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });

      const message = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await axios.post('/api/auth/register', userData);

      const { token, user, empresa, permissions } = response.data;

      // Salvar token no localStorage
      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, empresa, token, permissions },
      });

      return { success: true };

    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });

      const message = error.response?.data?.error || 'Erro ao criar conta';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/auth/profile', userData);

      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user,
      });

      return { success: true };

    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar perfil';
      return { success: false, error: message };
    }
  };

  const updateEmpresa = async (empresaData) => {
    try {
      const response = await axios.put('/api/auth/empresa', empresaData);

      dispatch({
        type: 'UPDATE_EMPRESA',
        payload: response.data.empresa,
      });

      return { success: true };

    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar empresa';
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return { success: true };

    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao alterar senha';
      return { success: false, error: message };
    }
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.nivel_acesso === 'admin') return true;
    return state.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!state.user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(state.user.nivel_acesso);
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      const { token } = response.data;

      localStorage.setItem('token', token);
      dispatch({ type: 'TOKEN_REFRESH', payload: token });

      return { success: true };
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateEmpresa,
    changePassword,
    hasPermission,
    hasRole,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};