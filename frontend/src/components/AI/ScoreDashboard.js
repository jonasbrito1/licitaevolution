import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Engineering as EngineeringIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  EmojiEvents as EmojiEventsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ScoreDashboard = ({ editalId, compact = false }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editalId) {
      loadScores();
    }
  }, [editalId]);

  const loadScores = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-analysis/edital/${editalId}/scoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setScores(data.data.scores);
      } else {
        setError(data.message || 'Erro ao calcular scores');
      }
    } catch (error) {
      setError('Erro na comunicação com o servidor');
      console.error('Erro ao carregar scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Baixo';
  };

  const scoreDetails = [
    {
      key: 'financeiro',
      label: 'Financeiro',
      icon: <AttachMoneyIcon />,
      description: 'Viabilidade econômica e adequação de valor'
    },
    {
      key: 'tecnico',
      label: 'Técnico',
      icon: <EngineeringIcon />,
      description: 'Complexidade técnica e adequação às capacidades'
    },
    {
      key: 'documental',
      label: 'Documental',
      icon: <AssignmentIcon />,
      description: 'Facilidade para atender documentação exigida'
    },
    {
      key: 'prazo',
      label: 'Prazo',
      icon: <ScheduleIcon />,
      description: 'Adequação dos prazos de execução'
    },
    {
      key: 'risco',
      label: 'Risco',
      icon: <WarningIcon />,
      description: 'Nível de risco do projeto (invertido: maior score = menor risco)'
    },
    {
      key: 'concorrencia',
      label: 'Concorrência',
      icon: <EmojiEventsIcon />,
      description: 'Estimativa de competitividade'
    }
  ];

  const prepareRadialData = () => {
    if (!scores) return [];

    return scoreDetails.map(detail => ({
      name: detail.label,
      value: scores[detail.key] || 0,
      fill: getScoreColor(scores[detail.key] || 0)
    }));
  };

  const preparePieData = () => {
    if (!scores) return [];

    const total = scoreDetails.reduce((sum, detail) => sum + (scores[detail.key] || 0), 0);

    return scoreDetails.map(detail => ({
      name: detail.label,
      value: scores[detail.key] || 0,
      percentage: total > 0 ? Math.round(((scores[detail.key] || 0) / total) * 100) : 0,
      fill: getScoreColor(scores[detail.key] || 0)
    }));
  };

  if (!editalId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Dashboard de Scores
          </Typography>
          <Typography color="textSecondary">
            Selecione um edital para visualizar os scores de viabilidade
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justify="center" minHeight={200}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Calculando scores...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <IconButton onClick={loadScores}>
              <RefreshIcon />
            </IconButton>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!scores) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Dashboard de Scores
          </Typography>
          <Typography color="textSecondary">
            Nenhum score disponível para este edital
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PsychologyIcon color="primary" />
            <Typography variant="h6">
              Dashboard de Scores
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`Score Final: ${scores.final}%`}
              color={scores.final >= 75 ? 'success' : scores.final >= 60 ? 'warning' : 'error'}
              size="small"
            />
            <IconButton size="small" onClick={loadScores}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {!compact && (
          <Grid container spacing={2} mb={3}>
            {/* Score Final em destaque */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color={getScoreColor(scores.final)} fontWeight="bold">
                  {scores.final}%
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  Score Final
                </Typography>
                <Chip
                  label={getScoreLevel(scores.final)}
                  color={scores.final >= 75 ? 'success' : scores.final >= 60 ? 'warning' : 'error'}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            {/* Gráfico radial */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={prepareRadialData()}>
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="#8884d8"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Scores detalhados */}
        <Grid container spacing={2}>
          {scoreDetails.map((detail) => {
            const score = scores[detail.key] || 0;
            return (
              <Grid item xs={12} sm={6} md={compact ? 6 : 4} key={detail.key}>
                <Tooltip title={detail.description} arrow>
                  <Card variant="outlined" sx={{
                    p: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box sx={{ color: getScoreColor(score) }}>
                        {detail.icon}
                      </Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {detail.label}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LinearProgress
                        variant="determinate"
                        value={score}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getScoreColor(score),
                            borderRadius: 4
                          }
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={getScoreColor(score)}
                        sx={{ minWidth: '40px', textAlign: 'right' }}
                      >
                        {score}%
                      </Typography>
                    </Box>

                    <Chip
                      label={getScoreLevel(score)}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: getScoreColor(score),
                        color: getScoreColor(score),
                        fontSize: '0.7rem'
                      }}
                    />
                  </Card>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>

        {/* Distribuição visual (apenas modo completo) */}
        {!compact && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              📈 Distribuição dos Scores
            </Typography>
            <Card variant="outlined" sx={{ height: '250px', p: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Box>
        )}

        {/* Interpretação do score final */}
        <Box mt={2}>
          <Alert
            severity={scores.final >= 75 ? 'success' : scores.final >= 60 ? 'warning' : 'error'}
            sx={{ mb: 1 }}
          >
            <Typography variant="body2">
              <strong>Interpretação:</strong> {
                scores.final >= 75 ?
                  'Edital com alta viabilidade - Recomenda-se a participação' :
                scores.final >= 60 ?
                  'Edital com viabilidade moderada - Analisar custos e riscos' :
                  'Edital com baixa viabilidade - Participação não recomendada'
              }
            </Typography>
          </Alert>

          <Typography variant="caption" color="textSecondary">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScoreDashboard;