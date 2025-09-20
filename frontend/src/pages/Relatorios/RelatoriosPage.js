import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  ShoppingCart as ShoppingCartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  InsertDriveFile as CsvIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

import analyticsService from '../../services/analyticsService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import {
  KPICard,
  AdvancedLineChart,
  AdvancedAreaChart,
  AdvancedBarChart,
  AdvancedPieChart,
  ComposedAnalyticsChart,
  ScatterAnalyticsChart,
  RadialBarAnalyticsChart,
  TreemapChart,
  FunnelAnalyticsChart,
  HeatmapChart
} from '../../components/Analytics/ChartComponents';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`relatorios-tabpanel-${index}`}
      aria-labelledby={`relatorios-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const RelatoriosPage = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [tabAtiva, setTabAtiva] = useState(0);
  const [periodo, setPeriodo] = useState('12m');
  const [dashboardData, setDashboardData] = useState({});
  const [kpis, setKpis] = useState({});
  const [loading, setLocalLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [relatóriosCustomizados, setRelatóriosCustomizados] = useState([]);
  const [alertasAtivos, setAlertasAtivos] = useState([]);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(300000); // 5 minutos

  // Mock data para demonstração
  const mockKPIs = {
    receitaTotal: { value: 2850000, previous: 2650000, format: 'currency' },
    despesaTotal: { value: 2150000, previous: 2280000, format: 'currency' },
    lucroLiquido: { value: 700000, previous: 370000, format: 'currency' },
    margem: { value: 24.6, previous: 14.0, format: 'percentage' },
    editaisParticipados: { value: 156, previous: 142 },
    taxaSucesso: { value: 68.5, previous: 62.3, format: 'percentage' },
    ticketMedio: { value: 85000, previous: 78000, format: 'currency' },
    crescimentoMensal: { value: 12.5, previous: 8.2, format: 'percentage' }
  };

  const mockChartData = {
    receitas: [
      { name: 'Jan', receitas: 180000, despesas: 140000, lucro: 40000 },
      { name: 'Fev', receitas: 220000, despesas: 165000, lucro: 55000 },
      { name: 'Mar', receitas: 195000, despesas: 155000, lucro: 40000 },
      { name: 'Abr', receitas: 285000, despesas: 190000, lucro: 95000 },
      { name: 'Mai', receitas: 310000, despesas: 205000, lucro: 105000 },
      { name: 'Jun', receitas: 345000, despesas: 220000, lucro: 125000 },
      { name: 'Jul', receitas: 290000, despesas: 195000, lucro: 95000 },
      { name: 'Ago', receitas: 360000, despesas: 235000, lucro: 125000 },
      { name: 'Set', receitas: 385000, despesas: 245000, lucro: 140000 },
      { name: 'Out', receitas: 420000, despesas: 280000, lucro: 140000 },
      { name: 'Nov', receitas: 395000, despesas: 265000, lucro: 130000 },
      { name: 'Dez', receitas: 460000, despesas: 295000, lucro: 165000 }
    ],
    licitacoes: [
      { name: 'Pregão', value: 45, fill: theme.palette.primary.main },
      { name: 'Concorrência', value: 28, fill: theme.palette.secondary.main },
      { name: 'Tomada de Preço', value: 15, fill: theme.palette.success.main },
      { name: 'Convite', value: 8, fill: theme.palette.warning.main },
      { name: 'Outros', value: 4, fill: theme.palette.error.main }
    ],
    performance: [
      { mes: 'Jan', participacoes: 12, ganhas: 7, taxa: 58.3 },
      { mes: 'Fev', participacoes: 15, ganhas: 9, taxa: 60.0 },
      { mes: 'Mar', participacoes: 11, ganhas: 6, taxa: 54.5 },
      { mes: 'Abr', participacoes: 18, ganhas: 13, taxa: 72.2 },
      { mes: 'Mai', participacoes: 16, ganhas: 11, taxa: 68.8 },
      { mes: 'Jun', participacoes: 19, ganhas: 14, taxa: 73.7 }
    ],
    fornecedores: [
      { name: 'Alpha Tech', gastos: 285000, avaliaçao: 4.8 },
      { name: 'Beta Supply', gastos: 195000, avaliaçao: 4.2 },
      { name: 'Gamma Corp', gastos: 165000, avaliaçao: 4.5 },
      { name: 'Delta Services', gastos: 145000, avaliaçao: 4.1 },
      { name: 'Epsilon Ltd', gastos: 125000, avaliaçao: 4.6 }
    ]
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  useEffect(() => {
    let interval;
    if (autoUpdate) {
      interval = setInterval(() => {
        carregarDados();
      }, updateInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate, updateInterval, periodo]);

  const carregarDados = async () => {
    try {
      setLocalLoading(true);

      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));

      setKpis(mockKPIs);
      setDashboardData(mockChartData);

      // Simular relatórios customizados
      setRelatóriosCustomizados([
        {
          id: 1,
          nome: 'Análise Financeira Mensal',
          tipo: 'financeiro',
          ultimaExecucao: new Date(),
          agendado: true,
          frequencia: 'mensal'
        },
        {
          id: 2,
          nome: 'Performance de Licitações',
          tipo: 'licitacoes',
          ultimaExecucao: new Date(Date.now() - 86400000),
          agendado: false,
          frequencia: null
        }
      ]);

      // Simular alertas
      setAlertasAtivos([
        {
          id: 1,
          tipo: 'meta',
          mensagem: 'Meta de receitas do mês atingida (105%)',
          severity: 'success',
          timestamp: new Date()
        },
        {
          id: 2,
          tipo: 'performance',
          mensagem: 'Taxa de sucesso abaixo da média (55%)',
          severity: 'warning',
          timestamp: new Date(Date.now() - 3600000)
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleExport = async (formato, relatorioId = null) => {
    try {
      setLoading(true, `Exportando relatório em ${formato.toUpperCase()}...`);

      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess(`Relatório exportado em ${formato.toUpperCase()} com sucesso!`);
      setShowExportDialog(false);
    } catch (error) {
      showError('Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  const executarRelatorio = async (relatorioId) => {
    try {
      setLoading(true, 'Executando relatório...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Relatório executado com sucesso!');
    } catch (error) {
      showError('Erro ao executar relatório');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const getSeverityColor = (severity) => {
    const colors = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info'
    };
    return colors[severity] || 'default';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Analytics & Relatórios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Dashboard executivo e relatórios analíticos avançados
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                label="Período"
              >
                <MenuItem value="1m">1 Mês</MenuItem>
                <MenuItem value="3m">3 Meses</MenuItem>
                <MenuItem value="6m">6 Meses</MenuItem>
                <MenuItem value="12m">12 Meses</MenuItem>
                <MenuItem value="24m">24 Meses</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={carregarDados} title="Atualizar dados">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => setShowConfigDialog(true)} title="Configurações">
              <SettingsIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setShowExportDialog(true)}
            >
              Exportar
            </Button>
          </Box>
        </Box>

        {/* Alertas Ativos */}
        {alertasAtivos.length > 0 && (
          <Card sx={{ mb: 3, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                Alertas Ativos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {alertasAtivos.map((alerta) => (
                  <Chip
                    key={alerta.id}
                    label={`${alerta.mensagem} - ${formatarData(alerta.timestamp)}`}
                    color={getSeverityColor(alerta.severity)}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* KPIs Principais */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Receita Total"
              value={kpis.receitaTotal?.value}
              previousValue={kpis.receitaTotal?.previous}
              format={kpis.receitaTotal?.format}
              icon={AttachMoneyIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Lucro Líquido"
              value={kpis.lucroLiquido?.value}
              previousValue={kpis.lucroLiquido?.previous}
              format={kpis.lucroLiquido?.format}
              icon={TrendingUpIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Taxa de Sucesso"
              value={kpis.taxaSucesso?.value}
              previousValue={kpis.taxaSucesso?.previous}
              format={kpis.taxaSucesso?.format}
              icon={AssessmentIcon}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Margem de Lucro"
              value={kpis.margem?.value}
              previousValue={kpis.margem?.previous}
              format={kpis.margem?.format}
              icon={DashboardIcon}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Tabs de Relatórios */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabAtiva}
              onChange={(e, newValue) => setTabAtiva(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Dashboard Executivo" />
              <Tab label="Análise Financeira" />
              <Tab label="Performance de Licitações" />
              <Tab label="LicitAI Analytics" />
              <Tab label="Relatórios Customizados" />
              <Tab label="Tempo Real" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Dashboard Executivo */}
            <TabPanel value={tabAtiva} index={0}>
              <Grid container spacing={3}>
                {/* Gráfico de Receitas vs Despesas */}
                <Grid item xs={12} lg={8}>
                  <AdvancedLineChart
                    data={dashboardData.receitas}
                    lines={[
                      { dataKey: 'receitas', name: 'Receitas', color: theme.palette.success.main, type: 'currency' },
                      { dataKey: 'despesas', name: 'Despesas', color: theme.palette.error.main, type: 'currency' },
                      { dataKey: 'lucro', name: 'Lucro', color: theme.palette.primary.main, type: 'currency' }
                    ]}
                    title="Evolução Financeira"
                    subtitle="Receitas, despesas e lucro nos últimos 12 meses"
                    height={350}
                    loading={loading}
                  />
                </Grid>

                {/* Distribuição por Modalidade */}
                <Grid item xs={12} lg={4}>
                  <AdvancedPieChart
                    data={dashboardData.licitacoes}
                    title="Licitações por Modalidade"
                    subtitle="Distribuição dos editais participados"
                    height={350}
                    loading={loading}
                  />
                </Grid>

                {/* Performance de Licitações */}
                <Grid item xs={12} lg={6}>
                  <ComposedAnalyticsChart
                    data={dashboardData.performance}
                    bars={[
                      { dataKey: 'participacoes', name: 'Participações', color: theme.palette.info.main },
                      { dataKey: 'ganhas', name: 'Ganhas', color: theme.palette.success.main }
                    ]}
                    lines={[
                      { dataKey: 'taxa', name: 'Taxa de Sucesso (%)', color: theme.palette.primary.main }
                    ]}
                    title="Performance em Licitações"
                    subtitle="Participações e taxa de sucesso mensal"
                    height={300}
                    loading={loading}
                  />
                </Grid>

                {/* Top Fornecedores */}
                <Grid item xs={12} lg={6}>
                  <AdvancedBarChart
                    data={dashboardData.fornecedores}
                    bars={[
                      { dataKey: 'gastos', name: 'Gastos', color: theme.palette.secondary.main }
                    ]}
                    title="Top Fornecedores"
                    subtitle="Maior volume de compras"
                    height={300}
                    loading={loading}
                    horizontal
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Análise Financeira */}
            <TabPanel value={tabAtiva} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Análise Financeira Detalhada
                  </Typography>
                </Grid>

                {/* DRE Simplificado */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Demonstrativo de Resultado (DRE)
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ '& > *': { mb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Receita Bruta</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                            R$ 2.850.000
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>(-) Custos Diretos</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'error.main' }}>
                            R$ 1.420.000
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Lucro Bruto</Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            R$ 1.430.000
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>(-) Despesas Operacionais</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'error.main' }}>
                            R$ 730.000
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontWeight: 700 }}>Lucro Líquido</Typography>
                          <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.2rem' }}>
                            R$ 700.000
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Indicadores Financeiros */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Indicadores Financeiros
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1 }}>
                            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                              24.6%
                            </Typography>
                            <Typography variant="body2">Margem Líquida</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                              50.2%
                            </Typography>
                            <Typography variant="body2">Margem Bruta</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                            <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                              R$ 85k
                            </Typography>
                            <Typography variant="body2">Ticket Médio</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                              12.5%
                            </Typography>
                            <Typography variant="body2">Crescimento</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Fluxo de Caixa Projetado */}
                <Grid item xs={12}>
                  <AdvancedAreaChart
                    data={dashboardData.receitas}
                    areas={[
                      { dataKey: 'receitas', name: 'Receitas', color: theme.palette.success.main },
                      { dataKey: 'despesas', name: 'Despesas', color: theme.palette.error.main }
                    ]}
                    title="Fluxo de Caixa Projetado"
                    subtitle="Projeção baseada em tendências históricas"
                    height={350}
                    loading={loading}
                    stacked={false}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Performance de Licitações */}
            <TabPanel value={tabAtiva} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Análise de Performance em Licitações
                  </Typography>
                </Grid>

                {/* Funil de Conversão */}
                <Grid item xs={12} md={6}>
                  <FunnelAnalyticsChart
                    data={[
                      { name: 'Oportunidades Identificadas', value: 450 },
                      { name: 'Editais Analisados', value: 320 },
                      { name: 'Propostas Enviadas', value: 156 },
                      { name: 'Classificados', value: 89 },
                      { name: 'Contratos Ganhos', value: 62 }
                    ]}
                    title="Funil de Conversão"
                    subtitle="Do lead ao contrato fechado"
                    height={350}
                    loading={loading}
                  />
                </Grid>

                {/* Análise de Competitividade */}
                <Grid item xs={12} md={6}>
                  <RadialBarAnalyticsChart
                    data={[
                      { name: 'Pregão Eletrônico', value: 75, fill: theme.palette.primary.main },
                      { name: 'Concorrência', value: 62, fill: theme.palette.secondary.main },
                      { name: 'Tomada de Preço', value: 58, fill: theme.palette.success.main },
                      { name: 'Convite', value: 82, fill: theme.palette.warning.main }
                    ]}
                    title="Taxa de Sucesso por Modalidade"
                    subtitle="Percentual de contratos ganhos"
                    height={350}
                    loading={loading}
                  />
                </Grid>

                {/* Heatmap de Performance */}
                <Grid item xs={12}>
                  <HeatmapChart
                    data={[
                      { x: 'Jan', y: 'Pregão', value: 12 },
                      { x: 'Jan', y: 'Concorrência', value: 8 },
                      { x: 'Fev', y: 'Pregão', value: 15 },
                      { x: 'Fev', y: 'Concorrência', value: 6 },
                      { x: 'Mar', y: 'Pregão', value: 18 },
                      { x: 'Mar', y: 'Concorrência', value: 9 },
                      { x: 'Abr', y: 'Pregão', value: 22 },
                      { x: 'Abr', y: 'Concorrência', value: 11 }
                    ]}
                    title="Heatmap de Participações"
                    subtitle="Número de licitações por mês e modalidade"
                    height={250}
                    loading={loading}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* LicitAI Analytics */}
            <TabPanel value={tabAtiva} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Analytics da LicitAI
                  </Typography>
                </Grid>

                {/* KPIs da LicitAI */}
                <Grid item xs={12} md={3}>
                  <KPICard
                    title="Análises Realizadas"
                    value={1247}
                    previousValue={1156}
                    icon={PsychologyIcon}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <KPICard
                    title="Acurácia dos Scores"
                    value={87.3}
                    previousValue={84.1}
                    format="percentage"
                    icon={AssessmentIcon}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <KPICard
                    title="Tempo Médio de Análise"
                    value={3.2}
                    previousValue={4.1}
                    icon={ScheduleIcon}
                    color="info"
                    subtitle="minutos"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <KPICard
                    title="Economia Gerada"
                    value={245000}
                    previousValue={198000}
                    format="currency"
                    icon={TrendingUpIcon}
                    color="primary"
                  />
                </Grid>

                {/* Gráfico de Precisão dos Scores */}
                <Grid item xs={12} md={8}>
                  <ScatterAnalyticsChart
                    data={[
                      { x: 85, y: 92, name: 'Score vs Resultado' },
                      { x: 72, y: 78, name: 'Score vs Resultado' },
                      { x: 91, y: 95, name: 'Score vs Resultado' },
                      { x: 68, y: 71, name: 'Score vs Resultado' },
                      { x: 79, y: 83, name: 'Score vs Resultado' },
                      { x: 94, y: 97, name: 'Score vs Resultado' }
                    ]}
                    title="Precisão dos Scores LicitAI"
                    subtitle="Score previsto vs resultado real"
                    height={350}
                    loading={loading}
                    xKey="x"
                    yKey="y"
                  />
                </Grid>

                {/* Distribuição de Riscos */}
                <Grid item xs={12} md={4}>
                  <AdvancedPieChart
                    data={[
                      { name: 'Baixo Risco', value: 156 },
                      { name: 'Médio Risco', value: 89 },
                      { name: 'Alto Risco', value: 34 }
                    ]}
                    title="Distribuição de Riscos"
                    subtitle="Classificação dos editais analisados"
                    height={350}
                    loading={loading}
                    colors={[theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main]}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Relatórios Customizados */}
            <TabPanel value={tabAtiva} index={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Relatórios Personalizados
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {}}
                >
                  Criar Relatório
                </Button>
              </Box>

              <Grid container spacing={3}>
                {relatóriosCustomizados.map((relatorio) => (
                  <Grid item xs={12} md={6} key={relatorio.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {relatorio.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tipo: {relatorio.tipo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Última execução: {formatarData(relatorio.ultimaExecucao)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => executarRelatorio(relatorio.id)}>
                              <PlayIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={relatorio.agendado ? 'Agendado' : 'Manual'}
                              color={relatorio.agendado ? 'success' : 'default'}
                              size="small"
                            />
                            {relatorio.frequencia && (
                              <Chip
                                label={relatorio.frequencia}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                          >
                            Visualizar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Tempo Real */}
            <TabPanel value={tabAtiva} index={5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Dashboard em Tempo Real
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoUpdate}
                          onChange={(e) => setAutoUpdate(e.target.checked)}
                        />
                      }
                      label="Atualização Automática"
                    />
                  </Box>
                </Grid>

                {/* Métricas em Tempo Real */}
                <Grid item xs={12} md={3}>
                  <Card sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        24
                      </Typography>
                      <Typography variant="body1">Propostas Ativas</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Última atualização: agora
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700 }}>
                        R$ 2.1M
                      </Typography>
                      <Typography variant="body1">Valor em Disputa</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Última atualização: 2 min
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 700 }}>
                        8
                      </Typography>
                      <Typography variant="body1">Análises Pendentes</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Última atualização: 1 min
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: 'info.main', fontWeight: 700 }}>
                        95%
                      </Typography>
                      <Typography variant="body1">Sistema Online</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Última atualização: agora
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Atividades Recentes */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Atividades Recentes
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PsychologyIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Nova análise LicitAI concluída"
                            secondary="Edital PREGÃO-2024-001 - Score: 87%"
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="caption" color="text.secondary">
                              2 min atrás
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AttachMoneyIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Novo contrato assinado"
                            secondary="Valor: R$ 125.000 - Prefeitura Municipal XYZ"
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="caption" color="text.secondary">
                              15 min atrás
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BusinessIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Novo edital identificado"
                            secondary="CONCORRÊNCIA-2024-045 - Tecnologia"
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="caption" color="text.secondary">
                              32 min atrás
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Dialog de Exportação */}
        <Dialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Exportar Relatórios
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Selecione o formato desejado para exportação:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PdfIcon />}
                  onClick={() => handleExport('pdf')}
                  sx={{ height: 80, flexDirection: 'column' }}
                >
                  PDF
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ExcelIcon />}
                  onClick={() => handleExport('excel')}
                  sx={{ height: 80, flexDirection: 'column' }}
                >
                  Excel
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CsvIcon />}
                  onClick={() => handleExport('csv')}
                  sx={{ height: 80, flexDirection: 'column' }}
                >
                  CSV
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Configurações */}
        <Dialog
          open={showConfigDialog}
          onClose={() => setShowConfigDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Configurações do Dashboard
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Intervalo de Atualização</InputLabel>
                  <Select
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(e.target.value)}
                    label="Intervalo de Atualização"
                  >
                    <MenuItem value={60000}>1 minuto</MenuItem>
                    <MenuItem value={300000}>5 minutos</MenuItem>
                    <MenuItem value={600000}>10 minutos</MenuItem>
                    <MenuItem value={1800000}>30 minutos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                    />
                  }
                  label="Atualização Automática"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Configuração de Alertas
                </Typography>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Alertas Financeiros</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Meta de receitas atingida"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Margem abaixo do esperado"
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Alertas de Licitações</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Nova oportunidade identificada"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Taxa de sucesso baixa"
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfigDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default RelatoriosPage;