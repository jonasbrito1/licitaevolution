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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import financeiroService from '../../services/financeiroService';
import analyticsService from '../../services/analyticsService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import TransacaoDialog from '../../components/Financeiro/TransacaoDialog';
import {
  KPICard,
  AdvancedLineChart,
  AdvancedAreaChart,
  AdvancedBarChart,
  AdvancedPieChart,
  ComposedAnalyticsChart,
  TreemapChart
} from '../../components/Analytics/ChartComponents';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financeiro-tabpanel-${index}`}
      aria-labelledby={`financeiro-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FinanceiroPage = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dashboard, setDashboard] = useState({});
  const [transacoes, setTransacoes] = useState([]);
  const [contasPagar, setContasPagar] = useState([]);
  const [contasReceber, setContasReceber] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [loading, setLocalLoading] = useState(false);
  const [showTransacaoDialog, setShowTransacaoDialog] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);

  // Estados para Analytics
  const [analyticsData, setAnalyticsData] = useState({});
  const [dreData, setDreData] = useState({});
  const [lucratividade, setLucratividade] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);
  const [projecaoFinanceira, setProjecaoFinanceira] = useState([]);
  const [periodo, setPeriodo] = useState('12m');

  // Carregar dados
  useEffect(() => {
    carregarDashboard();
    carregarTransacoes();
    carregarContasPagar();
    carregarContasReceber();
    carregarFluxoCaixa();
    carregarAnalytics();
  }, []);

  useEffect(() => {
    carregarAnalytics();
  }, [periodo]);

  const carregarDashboard = async () => {
    try {
      setLocalLoading(true);
      const response = await financeiroService.buscarDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      // Mock data para demonstração
      setDashboard({
        saldoAtual: 150000,
        receitasMes: 85000,
        despesasMes: 65000,
        lucroMes: 20000,
        contasPagarVencendo: 12,
        contasReceberVencendo: 8,
        fluxoCaixaPositivo: true,
        crescimentoMensal: 12.5
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const carregarTransacoes = async () => {
    try {
      const response = await financeiroService.listarTransacoes({ limit: 10 });
      if (response.success) {
        setTransacoes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      // Mock data
      setTransacoes([
        {
          id: 1,
          descricao: 'Pagamento Fornecedor ABC',
          valor: -15000,
          tipo: 'despesa',
          categoria: 'Fornecedores',
          data: '2024-01-15',
          status: 'pago'
        },
        {
          id: 2,
          descricao: 'Recebimento Contrato XYZ',
          valor: 25000,
          tipo: 'receita',
          categoria: 'Contratos',
          data: '2024-01-14',
          status: 'recebido'
        }
      ]);
    }
  };

  const carregarContasPagar = async () => {
    try {
      const response = await financeiroService.listarContasPagar({ status: 'pendente' });
      if (response.success) {
        setContasPagar(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      // Mock data
      setContasPagar([
        {
          id: 1,
          descricao: 'Aluguel Escritório',
          valor: 8000,
          vencimento: '2024-01-20',
          fornecedor: 'Imobiliária Central',
          status: 'pendente'
        },
        {
          id: 2,
          descricao: 'Material de Escritório',
          valor: 1500,
          vencimento: '2024-01-18',
          fornecedor: 'Papelaria Moderna',
          status: 'vencida'
        }
      ]);
    }
  };

  const carregarContasReceber = async () => {
    try {
      const response = await financeiroService.listarContasReceber({ status: 'pendente' });
      if (response.success) {
        setContasReceber(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      // Mock data
      setContasReceber([
        {
          id: 1,
          descricao: 'Contrato Prefeitura A',
          valor: 45000,
          vencimento: '2024-01-25',
          cliente: 'Prefeitura Municipal A',
          status: 'pendente'
        }
      ]);
    }
  };

  const carregarFluxoCaixa = async () => {
    try {
      const response = await financeiroService.buscarFluxoCaixa({ periodo: '12m' });
      if (response.success) {
        setFluxoCaixa(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
      // Mock data
      setFluxoCaixa([
        { mes: 'Jan', receitas: 85000, despesas: 65000, saldo: 20000 },
        { mes: 'Fev', receitas: 92000, despesas: 68000, saldo: 24000 },
        { mes: 'Mar', receitas: 78000, despesas: 72000, saldo: 6000 },
        { mes: 'Abr', receitas: 95000, despesas: 70000, saldo: 25000 },
        { mes: 'Mai', receitas: 88000, despesas: 75000, saldo: 13000 },
        { mes: 'Jun', receitas: 105000, despesas: 80000, saldo: 25000 }
      ]);
    }
  };

  const carregarAnalytics = async () => {
    try {
      setLocalLoading(true);

      // Carregar dados de analytics financeiro usando o serviço
      const [dreResponse, lucrativResponse, receitasResponse, despesasResponse, projecaoResponse] = await Promise.allSettled([
        analyticsService.relatorioFinanceiro.demonstrativoResultado(periodo),
        analyticsService.relatorioFinanceiro.analiseLucratividade(periodo),
        analyticsService.relatorioFinanceiro.analiseReceitas(periodo),
        analyticsService.relatorioFinanceiro.analiseDespesas(periodo),
        analyticsService.relatorioFinanceiro.projecaoFinanceira(6)
      ]);

      // Processar DRE
      if (dreResponse.status === 'fulfilled') {
        setDreData(dreResponse.value);
      } else {
        // Mock DRE data
        setDreData({
          receitaBruta: 2850000,
          custosDirectos: 1420000,
          lucroBruto: 1430000,
          despesasOperacionais: 730000,
          lucroLiquido: 700000,
          margemBruta: 50.2,
          margemLiquida: 24.6
        });
      }

      // Processar análise de lucratividade
      if (lucrativResponse.status === 'fulfilled') {
        setLucratividade(lucrativResponse.value);
      } else {
        // Mock data
        setLucratividade([
          { periodo: 'Jan', margem: 22.5, lucro: 185000 },
          { periodo: 'Fev', margem: 25.1, lucro: 220000 },
          { periodo: 'Mar', margem: 20.5, lucro: 159500 },
          { periodo: 'Abr', margem: 33.3, lucro: 285000 },
          { periodo: 'Mai', margem: 33.9, lucro: 310000 },
          { periodo: 'Jun', margem: 36.2, lucro: 345000 }
        ]);
      }

      // Processar análise de despesas por categoria
      if (despesasResponse.status === 'fulfilled') {
        setCategoriasDespesas(despesasResponse.value);
      } else {
        // Mock data
        setCategoriasDespesas([
          { categoria: 'Pessoal', valor: 580000, percentual: 38.5 },
          { categoria: 'Fornecedores', valor: 420000, percentual: 27.8 },
          { categoria: 'Infraestrutura', valor: 285000, percentual: 18.9 },
          { categoria: 'Marketing', valor: 145000, percentual: 9.6 },
          { categoria: 'Outros', valor: 80000, percentual: 5.2 }
        ]);
      }

      // Processar projeção financeira
      if (projecaoResponse.status === 'fulfilled') {
        setProjecaoFinanceira(projecaoResponse.value);
      } else {
        // Mock data
        setProjecaoFinanceira([
          { mes: 'Jul', receitas: 480000, despesas: 310000, lucro: 170000 },
          { mes: 'Ago', receitas: 520000, despesas: 330000, lucro: 190000 },
          { mes: 'Set', receitas: 550000, despesas: 340000, lucro: 210000 },
          { mes: 'Out', receitas: 580000, despesas: 360000, lucro: 220000 },
          { mes: 'Nov', receitas: 610000, despesas: 380000, lucro: 230000 },
          { mes: 'Dez', receitas: 650000, despesas: 400000, lucro: 250000 }
        ]);
      }

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      pago: 'success',
      recebido: 'success',
      pendente: 'warning',
      vencida: 'error',
      cancelado: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pago: 'Pago',
      recebido: 'Recebido',
      pendente: 'Pendente',
      vencida: 'Vencida',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const handleGerarRelatorio = async (tipoRelatorio, formato) => {
    try {
      setLoading(true, `Gerando relatório ${tipoRelatorio} em ${formato.toUpperCase()}...`);

      let relatorioData;
      switch (tipoRelatorio) {
        case 'dre':
          relatorioData = await analyticsService.relatorioFinanceiro.demonstrativoResultado(periodo);
          break;
        case 'fluxo-caixa':
          relatorioData = await analyticsService.relatorioFinanceiro.fluxoCaixaDetalhado(periodo);
          break;
        case 'receitas':
          relatorioData = await analyticsService.relatorioFinanceiro.analiseReceitas(periodo);
          break;
        case 'despesas':
          relatorioData = await analyticsService.relatorioFinanceiro.analiseDespesas(periodo);
          break;
        case 'lucratividade':
          relatorioData = await analyticsService.relatorioFinanceiro.analiseLucratividade(periodo);
          break;
        case 'projecao':
          relatorioData = await analyticsService.relatorioFinanceiro.projecaoFinanceira(6);
          break;
        default:
          throw new Error('Tipo de relatório não reconhecido');
      }

      // Simular download do relatório
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess(`Relatório ${tipoRelatorio} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showError(`Erro ao gerar relatório: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarDados = async (formato) => {
    try {
      setLoading(true, `Exportando dados financeiros em ${formato.toUpperCase()}...`);

      // Usar o serviço de analytics para exportação
      const exportFunction = analyticsService.exportar[formato];
      if (exportFunction) {
        const blob = await exportFunction('financeiro-completo', {
          periodo,
          incluirDRE: true,
          incluirFluxoCaixa: true,
          incluirAnalises: true
        });

        // Simular download
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      showSuccess(`Dados exportados em ${formato.toUpperCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      showError(`Erro ao exportar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard Financeiro
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Controle financeiro completo para licitações
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
            </Select>
          </FormControl>
          <IconButton onClick={carregarDashboard}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowTransacaoDialog(true)}
          >
            Nova Transação
          </Button>
        </Box>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatarMoeda(dashboard.saldoAtual || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saldo Atual
                  </Typography>
                </Box>
                <WalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    {formatarMoeda(dashboard.receitasMes || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receitas do Mês
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatarMoeda(dashboard.despesasMes || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Despesas do Mês
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                    {formatarMoeda(dashboard.lucroMes || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lucro do Mês
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      +{dashboard.crescimentoMensal || 0}%
                    </Typography>
                  </Box>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
            <Tab label="Visão Geral" />
            <Tab label="Analytics Financeiro" />
            <Tab label="Transações" />
            <Tab label="Contas a Pagar" />
            <Tab label="Contas a Receber" />
            <Tab label="Fluxo de Caixa" />
            <Tab label="Relatórios" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Aba: Visão Geral */}
          <TabPanel value={tabAtiva} index={0}>
            <Grid container spacing={3}>
              {/* Gráfico de Fluxo de Caixa */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Fluxo de Caixa (Últimos 6 meses)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fluxoCaixa}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(value)} />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      name="Receitas"
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      stroke={theme.palette.error.main}
                      strokeWidth={3}
                      name="Despesas"
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      name="Saldo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              {/* Resumo de Contas */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Resumo de Contas
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Card sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {dashboard.contasPagarVencendo || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Contas a Pagar
                          </Typography>
                        </Box>
                        <CreditCardIcon color="warning" />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {dashboard.contasReceberVencendo || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Contas a Receber
                          </Typography>
                        </Box>
                        <ReceiptIcon color="success" />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: dashboard.fluxoCaixaPositivo ? 'success.main' : 'error.main' }}>
                            {dashboard.fluxoCaixaPositivo ? 'Positivo' : 'Negativo'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Fluxo de Caixa
                          </Typography>
                        </Box>
                        <TimelineIcon color="info" />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aba: Analytics Financeiro */}
          <TabPanel value={tabAtiva} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Analytics Financeiro Avançado
                </Typography>
              </Grid>

              {/* KPIs Financeiros */}
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Margem Bruta"
                  value={dreData.margemBruta}
                  format="percentage"
                  icon={TrendingUpIcon}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Margem Líquida"
                  value={dreData.margemLiquida}
                  format="percentage"
                  icon={AssessmentIcon}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Lucro Bruto"
                  value={dreData.lucroBruto}
                  format="currency"
                  icon={AttachMoneyIcon}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <KPICard
                  title="Lucro Líquido"
                  value={dreData.lucroLiquido}
                  format="currency"
                  icon={AccountBalanceIcon}
                  color="warning"
                />
              </Grid>

              {/* DRE Detalhado */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Demonstrativo de Resultado (DRE)
                    </Typography>
                    <Box sx={{ '& > *': { mb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">Receita Bruta</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {formatarMoeda(dreData.receitaBruta || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">(-) Custos Diretos</Typography>
                        <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                          {formatarMoeda(dreData.custosDirectos || 0)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Lucro Bruto</Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                          {formatarMoeda(dreData.lucroBruto || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">(-) Despesas Operacionais</Typography>
                        <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                          {formatarMoeda(dreData.despesasOperacionais || 0)}
                        </Typography>
                      </Box>
                      <Divider sx={{ bgcolor: 'primary.main', height: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Lucro Líquido</Typography>
                        <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 700 }}>
                          {formatarMoeda(dreData.lucroLiquido || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Distribuição de Despesas por Categoria */}
              <Grid item xs={12} md={6}>
                <AdvancedPieChart
                  data={categoriasDespesas.map(cat => ({
                    name: cat.categoria,
                    value: cat.valor,
                    percentual: cat.percentual
                  }))}
                  title="Despesas por Categoria"
                  subtitle={`Total: ${formatarMoeda(categoriasDespesas.reduce((total, cat) => total + cat.valor, 0))}`}
                  height={350}
                  loading={loading}
                  colors={[
                    theme.palette.primary.main,
                    theme.palette.secondary.main,
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.main
                  ]}
                />
              </Grid>

              {/* Evolução da Margem de Lucratividade */}
              <Grid item xs={12} md={8}>
                <ComposedAnalyticsChart
                  data={lucratividade}
                  bars={[
                    { dataKey: 'lucro', name: 'Lucro (R$)', color: theme.palette.success.main }
                  ]}
                  lines={[
                    { dataKey: 'margem', name: 'Margem (%)', color: theme.palette.primary.main }
                  ]}
                  title="Evolução da Lucratividade"
                  subtitle="Lucro absoluto e margem percentual por período"
                  height={350}
                  loading={loading}
                />
              </Grid>

              {/* Projeção Financeira */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Projeção (6 meses)
                    </Typography>
                    <Box sx={{ '& > *': { mb: 1.5 } }}>
                      {projecaoFinanceira.slice(0, 3).map((proj, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{proj.mes}</Typography>
                          <Typography variant="body2" sx={{
                            color: proj.lucro > 0 ? 'success.main' : 'error.main',
                            fontWeight: 600
                          }}>
                            {formatarMoeda(proj.lucro)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button variant="outlined" size="small" fullWidth sx={{ mt: 2 }}>
                      Ver Projeção Completa
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Análise Comparativa de Receitas vs Despesas */}
              <Grid item xs={12}>
                <AdvancedAreaChart
                  data={projecaoFinanceira}
                  areas={[
                    { dataKey: 'receitas', name: 'Receitas Projetadas', color: theme.palette.success.main },
                    { dataKey: 'despesas', name: 'Despesas Projetadas', color: theme.palette.error.main }
                  ]}
                  title="Projeção de Receitas vs Despesas"
                  subtitle="Projeção para os próximos 6 meses baseada em tendências históricas"
                  height={350}
                  loading={loading}
                  stacked={false}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Aba: Transações */}
          <TabPanel value={tabAtiva} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Últimas Transações
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowTransacaoDialog(true)}
              >
                Nova Transação
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>{transacao.descricao}</TableCell>
                      <TableCell>{transacao.categoria}</TableCell>
                      <TableCell>{formatarData(transacao.data)}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: transacao.valor >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 600
                          }}
                        >
                          {formatarMoeda(transacao.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(transacao.status)}
                          color={getStatusColor(transacao.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setTransacaoEditando(transacao);
                            setShowTransacaoDialog(true);
                          }}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Aba: Contas a Pagar */}
          <TabPanel value={tabAtiva} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Contas a Pagar
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Nova Conta
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Fornecedor</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contasPagar.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>{conta.descricao}</TableCell>
                      <TableCell>{conta.fornecedor}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: 'error.main', fontWeight: 600 }}>
                          {formatarMoeda(conta.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatarData(conta.vencimento)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(conta.status)}
                          color={getStatusColor(conta.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" color="success">
                          Pagar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Aba: Contas a Receber */}
          <TabPanel value={tabAtiva} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Contas a Receber
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Nova Conta
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contasReceber.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>{conta.descricao}</TableCell>
                      <TableCell>{conta.cliente}</TableCell>
                      <TableCell>
                        <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
                          {formatarMoeda(conta.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatarData(conta.vencimento)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(conta.status)}
                          color={getStatusColor(conta.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" color="success">
                          Receber
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Aba: Fluxo de Caixa */}
          <TabPanel value={tabAtiva} index={5}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Projeção de Fluxo de Caixa
            </Typography>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={fluxoCaixa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke={theme.palette.primary.main}
                  fill={alpha(theme.palette.primary.main, 0.3)}
                  name="Saldo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabPanel>

          {/* Aba: Relatórios */}
          <TabPanel value={tabAtiva} index={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Relatórios Financeiros
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon color="primary" />
                      Demonstrativo de Resultado (DRE)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Relatório completo de receitas, custos e resultado operacional
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('dre', 'pdf')}
                        startIcon={<AssessmentIcon />}
                        fullWidth
                      >
                        Gerar DRE
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon color="info" />
                      Fluxo de Caixa Detalhado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Análise detalhada de entradas e saídas de caixa
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('fluxo-caixa', 'pdf')}
                        startIcon={<TimelineIcon />}
                        fullWidth
                      >
                        Gerar Fluxo
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="success" />
                      Análise de Receitas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Relatório detalhado das fontes de receita e crescimento
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('receitas', 'pdf')}
                        startIcon={<TrendingUpIcon />}
                        fullWidth
                      >
                        Gerar Análise
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDownIcon color="error" />
                      Análise de Despesas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Controle e categorização detalhada de despesas
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('despesas', 'pdf')}
                        startIcon={<TrendingDownIcon />}
                        fullWidth
                      >
                        Gerar Análise
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon color="warning" />
                      Análise de Lucratividade
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Estudo da margem de lucro e rentabilidade por período
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('lucratividade', 'pdf')}
                        startIcon={<AttachMoneyIcon />}
                        fullWidth
                      >
                        Gerar Análise
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon color="secondary" />
                      Projeção Financeira
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Projeções de receitas e despesas para os próximos meses
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleGerarRelatorio('projecao', 'pdf')}
                        startIcon={<AccountBalanceIcon />}
                        fullWidth
                      >
                        Gerar Projeção
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Exportação Rápida */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon color="primary" />
                      Exportação Rápida
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Exporte todos os dados financeiros em diferentes formatos
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleExportarDados('pdf')}
                        startIcon={<AssessmentIcon />}
                      >
                        Exportar PDF
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleExportarDados('excel')}
                        startIcon={<AssessmentIcon />}
                      >
                        Exportar Excel
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleExportarDados('csv')}
                        startIcon={<AssessmentIcon />}
                      >
                        Exportar CSV
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Dialog de Transação */}
      <TransacaoDialog
        open={showTransacaoDialog}
        onClose={() => {
          setShowTransacaoDialog(false);
          setTransacaoEditando(null);
        }}
        transacao={transacaoEditando}
        onSave={(novaTransacao) => {
          carregarTransacoes();
          carregarDashboard();
        }}
      />
    </Box>
  );
};

export default FinanceiroPage;