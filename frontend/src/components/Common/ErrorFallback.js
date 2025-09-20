import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BugReportIcon
          sx={{
            fontSize: 80,
            color: 'error.main',
            mb: 2,
          }}
        />

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Ops! Algo deu errado
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600 }}
        >
          Encontramos um erro inesperado. Nossa equipe foi notificada e está
          trabalhando para resolver o problema.
        </Typography>

        <Alert
          severity="error"
          sx={{ width: '100%', mb: 4, textAlign: 'left' }}
        >
          <AlertTitle>Detalhes do erro</AlertTitle>
          <Typography variant="body2" component="div">
            {error.message}
          </Typography>
        </Alert>

        {isDevelopment && (
          <Paper
            sx={{
              p: 2,
              mb: 4,
              width: '100%',
              maxHeight: 300,
              overflow: 'auto',
              backgroundColor: 'grey.100',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Stack Trace (Desenvolvimento):
            </Typography>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {error.stack}
            </pre>
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetErrorBoundary}
            size="large"
          >
            Tentar Novamente
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
            size="large"
          >
            Recarregar Página
          </Button>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="large"
          >
            Ir para Dashboard
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, maxWidth: 500 }}
        >
          Se o problema persistir, entre em contato com o suporte técnico.
          Inclua os detalhes do erro mostrados acima para que possamos
          ajudá-lo mais rapidamente.
        </Typography>
      </Box>
    </Container>
  );
};

export default ErrorFallback;