import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

import licitAIService from '../../services/licitAIService';

const InsightsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const statsData = await licitAIService.buscarEstatisticas();
      setStats(statsData.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const getProgressColor = (value) => {
    if (value >= 80) return '#4caf50';
    if (value >= 60) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <IconButton size="small" onClick={loadDashboardData} sx={{ ml: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
          <InsightsIcon color="primary" />
          Dashboard de Insights
        </Typography>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={loadDashboardData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Métricas Principais */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <AssessmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {stats?.totalAnalyses || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Análises
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                {stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taxa de Sucesso
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <SpeedIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                {stats?.averageScore ? stats.averageScore.toFixed(0) : '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score Médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <PsychologyIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                IA+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by AI
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Análises por Mês */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Análises por Mês
              </Typography>

              {stats?.monthlyAnalyses?.map((month, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {month.month}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {month.count} análises
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(month.count / Math.max(...(stats?.monthlyAnalyses?.map(m => m.count) || [1]))) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `hsl(${210 + index * 30}, 70%, 50%)`,
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance por Categoria */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" />
                Top Categorias
              </Typography>

              <List dense>
                {stats?.topCategories?.map((category, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={category.category}
                      secondary={`${category.count} análises`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Chip
                      label={`${((category.count / (stats?.totalAnalyses || 1)) * 100).toFixed(0)}%`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights Recentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsightsIcon color="primary" />
                Insights Recentes
              </Typography>

              <List>
                {[
                  {
                    type: 'success',
                    title: 'Alta compatibilidade detectada',
                    description: 'Licitação de TI com 94% de match para sua empresa',
                    time: '2 horas atrás'
                  },
                  {
                    type: 'warning',
                    title: 'Atenção aos prazos',
                    description: 'Prazo de entrega reduzido em 20% nas últimas licitações',
                    time: '1 dia atrás'
                  },
                  {
                    type: 'info',
                    title: 'Tendência de mercado',
                    description: 'Aumento de 35% em licitações sustentáveis',
                    time: '2 dias atrás'
                  },
                  {
                    type: 'success',
                    title: 'Novo nicho identificado',
                    description: 'Oportunidades em consultorias especializadas',
                    time: '3 dias atrás'
                  }
                ].map((insight, index) => (
                  <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      {insight.type === 'success' && <CheckCircleIcon color="success" />}
                      {insight.type === 'warning' && <WarningIcon color="warning" />}
                      {insight.type === 'info' && <TrendingUpIcon color="info" />}
                      {insight.type === 'error' && <ErrorIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={insight.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {insight.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {insight.time}
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Status do Sistema */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                Status do Sistema
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Performance da IA
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    98%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={98}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressColor(98),
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Precisão das Análises
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    96%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={96}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressColor(96),
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Tempo de Resposta
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2.3s médio
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={85}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressColor(85),
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Sistema Online"
                  color="success"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
                <Chip
                  label="IA Ativa"
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<PsychologyIcon />}
                />
                <Chip
                  label="Atualizado"
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InsightsDashboard;