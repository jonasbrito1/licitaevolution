import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
} from '@mui/icons-material';

const PerfilPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Meu Perfil
      </Typography>

      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Perfil do Usuário
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerenciamento de perfil e preferências em desenvolvimento.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerfilPage;