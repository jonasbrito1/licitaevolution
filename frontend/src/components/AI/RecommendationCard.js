import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const RecommendationCard = ({ editalId, onRecommendationGenerated }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (editalId) {
      generateRecommendation();
    }
  }, [editalId]);

  const generateRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-analysis/edital/${editalId}/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setRecommendation(data.data);
        if (onRecommendationGenerated) {
          onRecommendationGenerated(data.data);
        }
      } else {
        setError(data.message || 'Erro ao gerar recomendação');
      }
    } catch (error) {
      setError('Erro na comunicação com o servidor');
      console.error('Erro ao gerar recomendação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionConfig = (decisao) => {
    switch (decisao) {
      case 'participar':
        return {
          icon: <CheckCircleIcon />,
          color: 'success',
          bgColor: theme.palette.success.light,
          textColor: theme.palette.success.dark,
          title: 'PARTICIPAR',
          description: 'Edital recomendado para participação'
        };
      case 'analisar_mais':
        return {
          icon: <WarningIcon />,
          color: 'warning',
          bgColor: theme.palette.warning.light,
          textColor: theme.palette.warning.dark,
          title: 'ANALISAR MAIS',
          description: 'Edital requer análise adicional'
        };
      default:
        return {
          icon: <CancelIcon />,
          color: 'error',
          bgColor: theme.palette.error.light,
          textColor: theme.palette.error.dark,
          title: 'NÃO PARTICIPAR',
          description: 'Participação não recomendada'
        };
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!editalId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Recomendação Estratégica
          </Typography>
          <Typography color="textSecondary">
            Selecione um edital para gerar recomendação estratégica
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
            <Typography sx={{ ml: 2 }}>Gerando recomendação estratégica...</Typography>
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
            <Button onClick={generateRecommendation}>
              Tentar Novamente
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Recomendação Estratégica
          </Typography>
          <Button onClick={generateRecommendation} variant="contained">
            Gerar Recomendação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const decisionConfig = getDecisionConfig(recommendation.decisao_recomendada);

  return (
    <Card>
      <CardContent>
        {/* Header da recomendação */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Psychology color="primary" />
          <Typography variant="h6">Recomendação Estratégica</Typography>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              icon={decisionConfig.icon}
              label={decisionConfig.title}
              sx={{
                backgroundColor: decisionConfig.bgColor,
                color: decisionConfig.textColor,
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>

        {/* Decisão principal */}
        <Alert
          severity={decisionConfig.color}
          icon={decisionConfig.icon}
          sx={{ mb: 2 }}
        >
          <Typography variant="body1" fontWeight="medium">
            {decisionConfig.description}
          </Typography>
          {recommendation.justificativa_principal && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Justificativa:</strong> {recommendation.justificativa_principal}
            </Typography>
          )}
          {recommendation.confianca_decisao && (
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography variant="body2">
                <strong>Confiança:</strong>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={recommendation.confianca_decisao}
                sx={{ flexGrow: 1, maxWidth: 100 }}
              />
              <Typography variant="body2">
                {recommendation.confianca_decisao}%
              </Typography>
            </Box>
          )}
        </Alert>

        {/* Resumo dos scores */}
        {recommendation.scores && (
          <Grid container spacing={1} mb={2}>
            {Object.entries(recommendation.scores)
              .filter(([key]) => key !== 'final')
              .slice(0, 3) // Mostrar apenas os 3 principais
              .map(([key, score]) => (
                <Grid item xs={4} key={key}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary" textTransform="capitalize">
                      {key}
                    </Typography>
                    <Typography variant="h6" color={score >= 70 ? 'success.main' : score >= 50 ? 'warning.main' : 'error.main'}>
                      {score}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
          </Grid>
        )}

        {/* Seções expandíveis */}
        <Box>
          {/* Estratégia de participação */}
          {recommendation.estrategia_participacao && (
            <Accordion
              expanded={expanded === 'strategy'}
              onChange={handleAccordionChange('strategy')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="subtitle1">Estratégia de Participação</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary">
                  {recommendation.estrategia_participacao}
                </Typography>

                {/* Vantagens competitivas */}
                {recommendation.vantagens_competitivas?.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      ✅ Vantagens Competitivas
                    </Typography>
                    <List dense>
                      {recommendation.vantagens_competitivas.map((vantagem, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={vantagem}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Plano de ação */}
          {(recommendation.acoes_imediatas?.length > 0 || recommendation.acoes_preparacao?.length > 0) && (
            <Accordion
              expanded={expanded === 'actions'}
              onChange={handleAccordionChange('actions')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="subtitle1">Plano de Ação</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Ações imediatas */}
                {recommendation.acoes_imediatas?.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      🚨 Ações Imediatas
                    </Typography>
                    <List dense>
                      {recommendation.acoes_imediatas.map((acao, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <WarningIcon fontSize="small" color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={acao}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Ações de preparação */}
                {recommendation.acoes_preparacao?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      📋 Ações de Preparação
                    </Typography>
                    <List dense>
                      {recommendation.acoes_preparacao.map((acao, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon fontSize="small" color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={acao}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Análise financeira */}
          {(recommendation.estrategia_precificacao || recommendation.roi_estimado) && (
            <Accordion
              expanded={expanded === 'financial'}
              onChange={handleAccordionChange('financial')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="subtitle1">Análise Financeira</Typography>
                  {recommendation.roi_estimado && (
                    <Chip
                      label={`ROI: ${recommendation.roi_estimado}%`}
                      size="small"
                      color={recommendation.roi_estimado > 20 ? 'success' : recommendation.roi_estimado > 10 ? 'warning' : 'error'}
                      sx={{ ml: 'auto', mr: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {recommendation.estrategia_precificacao && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        💰 Estratégia de Precificação
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {recommendation.estrategia_precificacao}
                      </Typography>
                    </Grid>
                  )}

                  {recommendation.margem_recomendada && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        📊 Margem Recomendada
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {recommendation.margem_recomendada}%
                      </Typography>
                    </Grid>
                  )}

                  {recommendation.periodo_retorno && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        ⏱️ Período de Retorno
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {recommendation.periodo_retorno} meses
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Cronograma estratégico */}
          {recommendation.cronograma_estrategico?.length > 0 && (
            <Accordion
              expanded={expanded === 'timeline'}
              onChange={handleAccordionChange('timeline')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimelineIcon color="primary" />
                  <Typography variant="subtitle1">Cronograma Estratégico</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {recommendation.cronograma_estrategico.map((item, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ScheduleIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.atividade}
                        secondary={`${item.data_inicio} - ${item.data_fim} (${item.dias_duracao} dias)`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        {/* Footer com informações da análise */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            Análise gerada em: {new Date(recommendation.data_analise).toLocaleString('pt-BR')}
          </Typography>
          {recommendation.prioridade && (
            <Chip
              label={`Prioridade: ${recommendation.prioridade.toUpperCase()}`}
              size="small"
              color={
                recommendation.prioridade === 'alta' ? 'error' :
                recommendation.prioridade === 'média' ? 'warning' : 'default'
              }
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;