import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Settings as SettingsIcon,
} from '@mui/icons-material';

const ConfiguracoesPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Configurações do Sistema
      </Typography>

      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Configurações
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Painel de configurações do sistema em desenvolvimento.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfiguracoesPage;