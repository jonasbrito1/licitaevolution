import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

const LoadingScreen = ({ message = 'Carregando...', size = 60 }) => {

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        zIndex: 9999,
        color: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          fontSize: '2rem',
          fontWeight: 700,
        }}
      >
        <Box
          component="svg"
          sx={{ width: 40, height: 40 }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L8.26 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z"/>
        </Box>
        LicitaEvolution
      </Box>

      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: 'white',
          mb: 2,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          opacity: 0.9,
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;