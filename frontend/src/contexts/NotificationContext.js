import React, { createContext, useContext, useCallback } from 'react';
import { useSnackbar } from 'notistack';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showSuccess = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showError = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 6000,
      persist: false,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showWarning = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: 5000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showInfo = useCallback((message, options = {}) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const showNotification = useCallback((message, variant = 'default', options = {}) => {
    return enqueueSnackbar(message, {
      variant,
      autoHideDuration: 4000,
      ...options,
    });
  }, [enqueueSnackbar]);

  const dismiss = useCallback((key) => {
    closeSnackbar(key);
  }, [closeSnackbar]);

  const dismissAll = useCallback(() => {
    closeSnackbar();
  }, [closeSnackbar]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    dismiss,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};