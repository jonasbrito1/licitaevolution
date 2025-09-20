import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button
} from '@mui/material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" sx={{ fontSize: '6rem', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Página não encontrada
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          Dashboard
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;