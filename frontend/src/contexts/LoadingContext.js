import React, { createContext, useContext, useReducer } from 'react';

const LoadingContext = createContext();

const initialState = {
  global: false,
  operations: new Map(),
};

const loadingReducer = (state, action) => {
  let newOperations;
  let updatedOperations;

  switch (action.type) {
    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        global: action.payload,
      };

    case 'START_OPERATION':
      newOperations = new Map(state.operations);
      newOperations.set(action.payload.key, {
        message: action.payload.message,
        timestamp: Date.now(),
      });
      return {
        ...state,
        operations: newOperations,
      };

    case 'FINISH_OPERATION':
      updatedOperations = new Map(state.operations);
      updatedOperations.delete(action.payload);
      return {
        ...state,
        operations: updatedOperations,
      };

    case 'CLEAR_ALL_OPERATIONS':
      return {
        ...state,
        operations: new Map(),
      };

    default:
      return state;
  }
};

export const LoadingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const setGlobalLoading = (loading) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading });
  };

  const startOperation = (key, message = 'Carregando...') => {
    dispatch({
      type: 'START_OPERATION',
      payload: { key, message },
    });
  };

  const finishOperation = (key) => {
    dispatch({ type: 'FINISH_OPERATION', payload: key });
  };

  const clearAllOperations = () => {
    dispatch({ type: 'CLEAR_ALL_OPERATIONS' });
  };

  const isOperationLoading = (key) => {
    return state.operations.has(key);
  };

  const hasActiveOperations = () => {
    return state.operations.size > 0;
  };

  const getOperationMessage = (key) => {
    const operation = state.operations.get(key);
    return operation ? operation.message : null;
  };

  const getAllOperations = () => {
    return Array.from(state.operations.entries()).map(([key, operation]) => ({
      key,
      ...operation,
    }));
  };

  // Hook para facilitar uso de operações
  const withLoading = async (key, operation, message = 'Carregando...') => {
    try {
      startOperation(key, message);
      const result = await operation();
      return result;
    } finally {
      finishOperation(key);
    }
  };

  const value = {
    isGlobalLoading: state.global,
    hasActiveOperations: hasActiveOperations(),
    activeOperationsCount: state.operations.size,
    setGlobalLoading,
    startOperation,
    finishOperation,
    clearAllOperations,
    isOperationLoading,
    getOperationMessage,
    getAllOperations,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }
  return context;
};