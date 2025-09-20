import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  CircularProgress,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

import editalService from '../../services/editalService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edital-tabpanel-${index}`}
      aria-labelledby={`edital-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const EditalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [edital, setEdital] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [showAnaliseDialog, setShowAnaliseDialog] = useState(false);
  const [analisandoIA, setAnalisandoIA] = useState(false);

  // Carregar dados
  useEffect(() => {
    if (id) {
      carregarEdital();
      carregarHistorico();
    }
  }, [id]);

  const carregarEdital = async () => {
    try {
      setLoading(true, 'Carregando edital...');
      const response = await editalService.buscarEdital(id);

      if (response.success) {
        setEdital(response.data);
      }
    } catch (error) {
      showError(error.message || 'Erro ao carregar edital');
      navigate('/editais');
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await editalService.buscarHistorico(id);
      if (response.success) {
        setHistorico(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleAnalisarIA = async () => {
    try {
      setAnalisandoIA(true);
      setShowAnaliseDialog(false);

      const response = await editalService.analisarEdital(id, {
        tipo_analise: 'completa'
      });

      if (response.success) {
        showSuccess('Análise concluída com sucesso!');
        carregarEdital();
        setTabAtiva(1); // Mudar para aba de análise
      }
    } catch (error) {
      showError(error.message || 'Erro ao analisar edital');
    } finally {
      setAnalisandoIA(false);
    }
  };

  const handleAtualizarStatus = async (novoStatus, decisao = null, motivo = null) => {
    try {
      setLoading(true, 'Atualizando status...');

      const data = { status: novoStatus };
      if (decisao) data.decisao = decisao;
      if (motivo) data.motivo = motivo;

      const response = await editalService.atualizarStatus(id, data);

      if (response.success) {
        showSuccess('Status atualizado com sucesso!');
        carregarEdital();
      }
    } catch (error) {
      showError(error.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      novo: 'default',
      analisando: 'info',
      analisado: 'success',
      participando: 'warning',
      finalizado: 'primary',
      cancelado: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      novo: 'Novo',
      analisando: 'Em Análise',
      analisado: 'Analisado',
      participando: 'Participando',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  const getRiscoIcon = (nivel) => {
    switch (nivel) {
      case 'alto': return <ErrorIcon color="error" />;
      case 'medio': return <WarningIcon color="warning" />;
      case 'baixo': return <InfoIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  if (!edital) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/editais')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {edital.numero_edital}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {edital.orgao_nome}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {edital.status !== 'analisando' && (
            <Button
              variant="outlined"
              startIcon={<PsychologyIcon />}
              onClick={() => setShowAnaliseDialog(true)}
              disabled={analisandoIA}
              sx={{ color: 'secondary.main', borderColor: 'secondary.main' }}
            >
              {analisandoIA ? 'Analisando...' : 'Analisar com LicitAI'}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/editais/${id}/editar`)}
          >
            Editar
          </Button>
        </Box>
      </Box>

      {/* Status e Informações Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Objeto da Licitação
                  </Typography>
                  <Typography variant="body1">
                    {edital.objeto}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(edital.status)}
                  color={getStatusColor(edital.status)}
                  size="large"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Modalidade
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {edital.modalidade?.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoneyIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Valor Estimado
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatarMoeda(edital.valor_estimado)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Data de Abertura
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatarDataHora(edital.data_abertura)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DescriptionIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Portal de Origem
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {edital.portal_origem || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Score de Viabilidade
              </Typography>

              {edital.score_viabilidade ? (
                <>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={edital.score_viabilidade}
                      size={120}
                      thickness={6}
                      color={getScoreColor(edital.score_viabilidade)}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {edital.score_viabilidade}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Análise realizada pela LicitAI
                  </Typography>
                </>
              ) : (
                <Box>
                  <PsychologyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Edital ainda não foi analisado pela LicitAI
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => setShowAnaliseDialog(true)}
                  >
                    Analisar Agora
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de Detalhes */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabAtiva}
            onChange={(e, newValue) => setTabAtiva(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Informações Gerais" />
            <Tab label="Análise LicitAI" />
            <Tab label="Cronograma" />
            <Tab label="Documentos" />
            <Tab label="Histórico" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Aba: Informações Gerais */}
          <TabPanel value={tabAtiva} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Dados do Órgão
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Nome</Typography>
                    <Typography variant="body1">{edital.orgao_nome || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">CNPJ</Typography>
                    <Typography variant="body1">{edital.orgao_cnpj || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Estado</Typography>
                    <Typography variant="body1">{edital.orgao_estado || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cidade</Typography>
                    <Typography variant="body1">{edital.orgao_cidade || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Valores e Prazos
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Valor Estimado</Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>
                      {formatarMoeda(edital.valor_estimado)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Prazo de Execução</Typography>
                    <Typography variant="body1">{edital.prazo_execucao || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Prazo de Vigência</Typography>
                    <Typography variant="body1">{edital.prazo_vigencia || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Local de Execução</Typography>
                    <Typography variant="body1">{edital.local_execucao || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aba: Análise LicitAI */}
          <TabPanel value={tabAtiva} index={1}>
            {edital.analise_ia && Object.keys(edital.analise_ia).length > 0 ? (
              <Box>
                {/* Resumo da Análise */}
                <Alert
                  severity={edital.score_viabilidade >= 70 ? 'success' : edital.score_viabilidade >= 50 ? 'warning' : 'error'}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Score de Viabilidade: {edital.score_viabilidade}%
                  </Typography>
                  <Typography variant="body2">
                    {edital.analise_ia.resumo_executivo || 'Análise detalhada disponível abaixo.'}
                  </Typography>
                </Alert>

                {/* Riscos Identificados */}
                {edital.riscos_identificados && edital.riscos_identificados.length > 0 && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        <Typography variant="h6">
                          Riscos Identificados ({edital.riscos_identificados.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {edital.riscos_identificados.map((risco, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {getRiscoIcon(risco.nivel)}
                            </ListItemIcon>
                            <ListItemText
                              primary={risco.descricao}
                              secondary={`Probabilidade: ${risco.probabilidade} | Impacto: ${risco.impacto}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Oportunidades */}
                {edital.oportunidades && edital.oportunidades.length > 0 && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="success" />
                        <Typography variant="h6">
                          Oportunidades ({edital.oportunidades.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {edital.oportunidades.map((oportunidade, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={oportunidade.descricao}
                              secondary={oportunidade.potencial_ganho}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Recomendações */}
                {edital.analise_ia.recomendacoes && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon color="primary" />
                        <Typography variant="h6">Recomendações da LicitAI</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1">
                        {edital.analise_ia.recomendacoes}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PsychologyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Nenhuma análise disponível
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Execute uma análise com a LicitAI para ver insights detalhados sobre este edital.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PsychologyIcon />}
                  onClick={() => setShowAnaliseDialog(true)}
                >
                  Analisar com LicitAI
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Aba: Cronograma */}
          <TabPanel value={tabAtiva} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Datas Importantes
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary="Data de Publicação"
                      secondary={formatarData(edital.data_publicacao)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary="Data de Abertura"
                      secondary={formatarDataHora(edital.data_abertura)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary="Prazo para Questionamentos"
                      secondary={formatarData(edital.data_questionamento)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary="Prazo para Impugnação"
                      secondary={formatarData(edital.data_impugnacao)}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Status do Cronograma
                </Typography>
                <Box>
                  {/* Timeline visual aqui */}
                  <Typography variant="body2" color="text.secondary">
                    Timeline visual em desenvolvimento
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aba: Documentos */}
          <TabPanel value={tabAtiva} index={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Documentos e Anexos
            </Typography>
            {edital.arquivo_edital_url ? (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  href={edital.arquivo_edital_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visualizar Edital
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum documento anexado
              </Typography>
            )}
          </TabPanel>

          {/* Aba: Histórico */}
          <TabPanel value={tabAtiva} index={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Histórico de Alterações
            </Typography>
            {historico.length > 0 ? (
              <List>
                {historico.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TimelineIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.acao}
                      secondary={`${formatarDataHora(item.created_at)} - ${item.usuario?.nome || 'Sistema'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum histórico disponível
              </Typography>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Análise */}
      <Dialog
        open={showAnaliseDialog}
        onClose={() => setShowAnaliseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="secondary" />
            Análise com LicitAI
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            A LicitAI irá analisar este edital e fornecer:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Score de viabilidade" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Identificação de riscos" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Oportunidades de mercado" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Recomendações estratégicas" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            A análise pode levar alguns minutos para ser concluída.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnaliseDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAnalisarIA}
            variant="contained"
            color="secondary"
            startIcon={<PsychologyIcon />}
          >
            Iniciar Análise
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading da Análise IA */}
      {analisandoIA && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Card sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
            <CircularProgress color="secondary" size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              LicitAI Analisando...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processando informações do edital
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default EditalDetailPage;