import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const AnalysisPanel = ({ editalId, onAnalysisComplete }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState('scores');

  // Carregar análise existente ao montar componente
  useEffect(() => {
    if (editalId) {
      loadExistingAnalysis();
    }
  }, [editalId]);

  const loadExistingAnalysis = async () => {
    try {
      const response = await fetch(`/api/ai-analysis/edital/${editalId}/history`);
      const data = await response.json();

      if (data.success && data.data.analises.length > 0) {
        setAnalysisData(data.data.analises[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar análise existente:', error);
    }
  };

  const runCompleteAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-analysis/edital/${editalId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisData(data.data);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.data);
        }
      } else {
        setError(data.message || 'Erro na análise');
      }
    } catch (error) {
      setError('Erro na comunicação com o servidor');
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getDecisionColor = (decisao) => {
    switch (decisao) {
      case 'participar':
        return theme.palette.success.main;
      case 'analisar_mais':
        return theme.palette.warning.main;
      default:
        return theme.palette.error.main;
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const downloadAnalysisReport = () => {
    if (!analysisData) return;

    const report = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-edital-${editalId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!editalId) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🤖 Análise Especializada com IA
          </Typography>
          <Typography color="textSecondary">
            Selecione um edital para executar a análise especializada
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header com ações */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <PsychologyIcon color="primary" />
              <Typography variant="h6">
                Análise Especializada com IA
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {analysisData && (
                <Tooltip title="Baixar relatório">
                  <IconButton onClick={downloadAnalysisReport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Button
                variant="contained"
                onClick={runCompleteAnalysis}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                {loading ? 'Analisando...' : 'Executar Análise'}
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados da análise */}
      {analysisData && (
        <Box>
          {/* Scores principais */}
          <Accordion
            expanded={expanded === 'scores'}
            onChange={handleAccordionChange('scores')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Scores de Viabilidade</Typography>
                <Chip
                  label={`Score Final: ${analysisData.score_final}%`}
                  color={analysisData.score_final >= 75 ? 'success' : analysisData.score_final >= 60 ? 'warning' : 'error'}
                  sx={{ ml: 'auto', mr: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: 'Financeiro', score: analysisData.score_financeiro, icon: '💰' },
                  { label: 'Técnico', score: analysisData.score_tecnico, icon: '⚙️' },
                  { label: 'Documental', score: analysisData.score_documental, icon: '📋' },
                  { label: 'Prazo', score: analysisData.score_prazo, icon: '⏱️' },
                  { label: 'Risco', score: analysisData.score_risco, icon: '⚠️' },
                  { label: 'Concorrência', score: analysisData.score_concorrencia, icon: '🏆' }
                ].map(({ label, score, icon }) => (
                  <Grid item xs={12} sm={6} md={4} key={label}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <span>{icon}</span>
                        <Typography variant="subtitle2">{label}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
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
                        >
                          {score}%
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Análise completa */}
          {analysisData.analise_completa && (
            <Accordion
              expanded={expanded === 'analysis'}
              onChange={handleAccordionChange('analysis')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="h6">Análise Detalhada</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {analysisData.analise_completa.resumo_executivo && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Resumo Executivo:</strong> {analysisData.analise_completa.resumo_executivo}
                      </Typography>
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    {/* Pontos Fortes */}
                    {analysisData.analise_completa.pontos_fortes?.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" color="success.main" gutterBottom>
                            ✅ Pontos Fortes
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {analysisData.analise_completa.pontos_fortes.map((ponto, index) => (
                              <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                                {ponto}
                              </Typography>
                            ))}
                          </Box>
                        </Card>
                      </Grid>
                    )}

                    {/* Pontos Fracos */}
                    {analysisData.analise_completa.pontos_fracos?.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Typography variant="subtitle1" color="error.main" gutterBottom>
                            ❌ Pontos Fracos
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {analysisData.analise_completa.pontos_fracos.map((ponto, index) => (
                              <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                                {ponto}
                              </Typography>
                            ))}
                          </Box>
                        </Card>
                      </Grid>
                    )}
                  </Grid>

                  {/* Observações */}
                  {analysisData.observacoes && (
                    <Box mt={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        📝 Observações
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {analysisData.observacoes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Recomendações */}
          {analysisData.recomendacoes && (
            <Accordion
              expanded={expanded === 'recommendations'}
              onChange={handleAccordionChange('recommendations')}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">Recomendações Estratégicas</Typography>
                  {analysisData.recomendacoes.decisao_recomendada && (
                    <Chip
                      label={analysisData.recomendacoes.decisao_recomendada.replace('_', ' ').toUpperCase()}
                      sx={{
                        ml: 'auto',
                        mr: 2,
                        backgroundColor: getDecisionColor(analysisData.recomendacoes.decisao_recomendada),
                        color: 'white'
                      }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {/* Decisão principal */}
                  {analysisData.recomendacoes.justificativa_decisao && (
                    <Alert
                      severity={
                        analysisData.recomendacoes.decisao_recomendada === 'participar' ? 'success' :
                        analysisData.recomendacoes.decisao_recomendada === 'analisar_mais' ? 'warning' : 'error'
                      }
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        <strong>Justificativa:</strong> {analysisData.recomendacoes.justificativa_decisao}
                      </Typography>
                    </Alert>
                  )}

                  {/* Estratégia de participação */}
                  {analysisData.recomendacoes.estrategia_participacao && (
                    <Box mb={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        🎯 Estratégia Recomendada
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {analysisData.recomendacoes.estrategia_participacao}
                      </Typography>
                    </Box>
                  )}

                  {/* Ações de preparação */}
                  {analysisData.recomendacoes.acoes_preparacao?.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        📋 Ações de Preparação
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {analysisData.recomendacoes.acoes_preparacao.map((acao, index) => (
                          <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                            {acao}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Estratégia de precificação */}
                  {analysisData.recomendacoes.estrategia_precificacao && (
                    <Box mb={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        💰 Estratégia de Precificação
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {analysisData.recomendacoes.estrategia_precificacao}
                      </Typography>
                    </Box>
                  )}

                  {/* Prioridade */}
                  {analysisData.recomendacoes.prioridade && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        ⭐ Nível de Prioridade
                      </Typography>
                      <Chip
                        label={analysisData.recomendacoes.prioridade.toUpperCase()}
                        color={
                          analysisData.recomendacoes.prioridade === 'alta' ? 'error' :
                          analysisData.recomendacoes.prioridade === 'média' ? 'warning' : 'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Informações da análise */}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Análise executada em: {new Date(analysisData.created_at).toLocaleString('pt-BR')}
                {analysisData.versao && ` • Versão: ${analysisData.versao}`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AnalysisPanel;