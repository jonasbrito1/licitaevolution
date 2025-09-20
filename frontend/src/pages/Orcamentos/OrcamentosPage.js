import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import financeiroService from '../../services/financeiroService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orcamento-tabpanel-${index}`}
      aria-labelledby={`orcamento-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrcamentosPage = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [tabAtiva, setTabAtiva] = useState(0);
  const [orcamentos, setOrcamentos] = useState([]);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [showOrcamentoDialog, setShowOrcamentoDialog] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});

  // Dados mock para demonstracao
  const mockOrcamentos = [
    {
      id: 1,
      nome: 'Orçamento Anual 2024',
      periodo: '2024-01-01 - 2024-12-31',
      receita_prevista: 850000,
      despesa_prevista: 650000,
      lucro_previsto: 200000,
      status: 'aprovado',
      progresso: 75,
      categorias: [
        { nome: 'Receitas de Contratos', previsto: 600000, realizado: 450000 },
        { nome: 'Receitas de Serviços', previsto: 250000, realizado: 180000 },
        { nome: 'Despesas Operacionais', previsto: 400000, realizado: 320000 },
        { nome: 'Despesas Administrativas', previsto: 150000, realizado: 125000 },
        { nome: 'Despesas Comerciais', previsto: 100000, realizado: 85000 }
      ]
    },
    {
      id: 2,
      nome: 'Orçamento Q1 2024',
      periodo: '2024-01-01 - 2024-03-31',
      receita_prevista: 200000,
      despesa_prevista: 150000,
      lucro_previsto: 50000,
      status: 'revisao',
      progresso: 100,
      categorias: [
        { nome: 'Receitas de Contratos', previsto: 150000, realizado: 155000 },
        { nome: 'Receitas de Serviços', previsto: 50000, realizado: 45000 },
        { nome: 'Despesas Operacionais', previsto: 90000, realizado: 95000 },
        { nome: 'Despesas Administrativas', previsto: 40000, realizado: 38000 },
        { nome: 'Despesas Comerciais', previsto: 20000, realizado: 22000 }
      ]
    }
  ];

  useEffect(() => {
    carregarOrcamentos();
    carregarEstatisticas();
  }, []);

  const carregarOrcamentos = async () => {
    try {
      setLocalLoading(true);
      const response = await financeiroService.listarOrcamentos();
      if (response.success) {
        setOrcamentos(response.data);
      } else {
        setOrcamentos(mockOrcamentos);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      setOrcamentos(mockOrcamentos);
    } finally {
      setLocalLoading(false);
    }
  };

  const carregarEstatisticas = () => {
    const totalPrevisto = mockOrcamentos.reduce((acc, orc) => acc + orc.receita_prevista, 0);
    const totalRealizado = mockOrcamentos.reduce((acc, orc) => {
      const realizadoOrc = orc.categorias
        .filter(cat => cat.nome.includes('Receitas'))
        .reduce((sum, cat) => sum + cat.realizado, 0);
      return acc + realizadoOrc;
    }, 0);

    setEstatisticas({
      totalPrevisto,
      totalRealizado,
      percentualRealizacao: (totalRealizado / totalPrevisto * 100).toFixed(1),
      orcamentosAtivos: mockOrcamentos.filter(o => o.status === 'aprovado').length,
      variacaoOrcamentaria: totalRealizado - totalPrevisto
    });
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusColor = (status) => {
    const colors = {
      aprovado: 'success',
      revisao: 'warning',
      rejeitado: 'error',
      rascunho: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      aprovado: 'Aprovado',
      revisao: 'Em Revisão',
      rejeitado: 'Rejeitado',
      rascunho: 'Rascunho'
    };
    return labels[status] || status;
  };

  const calcularVariacao = (previsto, realizado) => {
    const variacao = ((realizado - previsto) / previsto * 100);
    return {
      valor: variacao,
      positiva: variacao >= 0,
      texto: `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%`
    };
  };

  const dadosGraficoComparacao = orcamentos.map(orc => ({
    nome: orc.nome.split(' ')[0] + ' ' + orc.nome.split(' ')[1],
    previsto: orc.receita_prevista,
    realizado: orc.categorias
      .filter(cat => cat.nome.includes('Receitas'))
      .reduce((sum, cat) => sum + cat.realizado, 0)
  }));

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Gestão de Orçamentos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Planejamento financeiro e controle orçamentário
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowOrcamentoDialog(true)}
          >
            Novo Orçamento
          </Button>
        </Box>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatarMoeda(estatisticas.totalPrevisto || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Previsto
                    </Typography>
                  </Box>
                  <CalculateIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatarMoeda(estatisticas.totalRealizado || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Realizado
                    </Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {estatisticas.percentualRealizacao || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      % Realização
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {estatisticas.orcamentosAtivos || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orçamentos Ativos
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs de Conteúdo */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabAtiva}
              onChange={(e, newValue) => setTabAtiva(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Orçamentos" />
              <Tab label="Comparação" />
              <Tab label="Análise" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Aba: Orçamentos */}
            <TabPanel value={tabAtiva} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Período</TableCell>
                      <TableCell>Receita Prevista</TableCell>
                      <TableCell>Despesa Prevista</TableCell>
                      <TableCell>Lucro Previsto</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progresso</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orcamentos.map((orcamento) => (
                      <TableRow key={orcamento.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {orcamento.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>{orcamento.periodo}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
                            {formatarMoeda(orcamento.receita_prevista)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'error.main', fontWeight: 600 }}>
                            {formatarMoeda(orcamento.despesa_prevista)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>
                            {formatarMoeda(orcamento.lucro_previsto)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(orcamento.status)}
                            color={getStatusColor(orcamento.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={orcamento.progresso}
                              sx={{ width: 60 }}
                            />
                            <Typography variant="body2">
                              {orcamento.progresso}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => setOrcamentoSelecionado(orcamento)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Aba: Comparação */}
            <TabPanel value={tabAtiva} index={1}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Comparação: Previsto vs Realizado
              </Typography>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosGraficoComparacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                  <Bar dataKey="previsto" fill={theme.palette.primary.main} name="Previsto" />
                  <Bar dataKey="realizado" fill={theme.palette.success.main} name="Realizado" />
                </BarChart>
              </ResponsiveContainer>
            </TabPanel>

            {/* Aba: Análise */}
            <TabPanel value={tabAtiva} index={2}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Análise Orçamentária Detalhada
              </Typography>

              {orcamentos.map((orcamento) => (
                <Accordion key={orcamento.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                      <Typography variant="h6">{orcamento.nome}</Typography>
                      <Chip
                        label={getStatusLabel(orcamento.status)}
                        color={getStatusColor(orcamento.status)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                          Categorias de Receitas e Despesas
                        </Typography>
                        <List>
                          {orcamento.categorias.map((categoria, index) => {
                            const variacao = calcularVariacao(categoria.previsto, categoria.realizado);
                            return (
                              <ListItem key={index} divider>
                                <ListItemText
                                  primary={categoria.nome}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2">
                                        Previsto: {formatarMoeda(categoria.previsto)}
                                      </Typography>
                                      <Typography variant="body2">
                                        Realizado: {formatarMoeda(categoria.realizado)}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Chip
                                    label={variacao.texto}
                                    color={variacao.positiva ? 'success' : 'error'}
                                    size="small"
                                    icon={variacao.positiva ? <TrendingUpIcon /> : <CancelIcon />}
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                          Distribuição por Categoria
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={orcamento.categorias}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="realizado"
                              label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                            >
                              {orcamento.categorias.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatarMoeda(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>
          </CardContent>
        </Card>

        {/* Dialog de Detalhes do Orçamento */}
        <Dialog
          open={Boolean(orcamentoSelecionado)}
          onClose={() => setOrcamentoSelecionado(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Detalhes do Orçamento: {orcamentoSelecionado?.nome}
          </DialogTitle>
          <DialogContent>
            {orcamentoSelecionado && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Período
                  </Typography>
                  <Typography variant="body1">
                    {orcamentoSelecionado.periodo}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={getStatusLabel(orcamentoSelecionado.status)}
                    color={getStatusColor(orcamentoSelecionado.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={orcamentoSelecionado.progresso}
                      sx={{ width: 100 }}
                    />
                    <Typography variant="body2">
                      {orcamentoSelecionado.progresso}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Resumo Financeiro
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: 'success.main' }}>
                            {formatarMoeda(orcamentoSelecionado.receita_prevista)}
                          </Typography>
                          <Typography variant="body2">
                            Receita Prevista
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: 'error.main' }}>
                            {formatarMoeda(orcamentoSelecionado.despesa_prevista)}
                          </Typography>
                          <Typography variant="body2">
                            Despesa Prevista
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ color: 'primary.main' }}>
                            {formatarMoeda(orcamentoSelecionado.lucro_previsto)}
                          </Typography>
                          <Typography variant="body2">
                            Lucro Previsto
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrcamentoSelecionado(null)}>
              Fechar
            </Button>
            <Button variant="contained">
              Editar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Novo Orçamento */}
        <Dialog
          open={showOrcamentoDialog}
          onClose={() => setShowOrcamentoDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Orçamento"
                  placeholder="Ex: Orçamento Anual 2024"
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Início"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Fim"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  placeholder="Descreva os objetivos e metas deste orçamento..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOrcamentoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained">
              Criar Orçamento
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default OrcamentosPage;