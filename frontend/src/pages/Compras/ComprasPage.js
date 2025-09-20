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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  RequestQuote as RequestQuoteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compras-tabpanel-${index}`}
      aria-labelledby={`compras-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ComprasPage = () => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [tabAtiva, setTabAtiva] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [showPedidoDialog, setShowPedidoDialog] = useState(false);
  const [showFornecedorDialog, setShowFornecedorDialog] = useState(false);
  const [filtros, setFiltros] = useState({
    status: '',
    fornecedor: '',
    dataInicio: null,
    dataFim: null
  });
  const [estatisticas, setEstatisticas] = useState({});

  // Mock data
  const mockPedidos = [
    {
      id: 1,
      numero: 'PC-2024-001',
      fornecedor: 'Fornecedor Alpha Ltda',
      data_pedido: '2024-01-15',
      data_entrega: '2024-01-25',
      valor_total: 15000,
      status: 'aprovado',
      itens: [
        { produto: 'Notebook Dell', quantidade: 2, valor_unitario: 3500, valor_total: 7000 },
        { produto: 'Material de Escritório', quantidade: 1, valor_unitario: 8000, valor_total: 8000 }
      ]
    },
    {
      id: 2,
      numero: 'PC-2024-002',
      fornecedor: 'Beta Suprimentos',
      data_pedido: '2024-01-10',
      data_entrega: '2024-01-20',
      valor_total: 8500,
      status: 'entregue',
      itens: [
        { produto: 'Impressora Multifuncional', quantidade: 1, valor_unitario: 8500, valor_total: 8500 }
      ]
    },
    {
      id: 3,
      numero: 'PC-2024-003',
      fornecedor: 'Gamma Tech',
      data_pedido: '2024-01-12',
      data_entrega: '2024-01-22',
      valor_total: 25000,
      status: 'pendente',
      itens: [
        { produto: 'Servidor', quantidade: 1, valor_unitario: 25000, valor_total: 25000 }
      ]
    }
  ];

  const mockFornecedores = [
    {
      id: 1,
      nome: 'Fornecedor Alpha Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@alpha.com.br',
      telefone: '(11) 1234-5678',
      endereco: 'Rua das Flores, 123, São Paulo - SP',
      categoria: 'Tecnologia',
      status: 'ativo',
      avaliacoes: {
        qualidade: 4.5,
        prazo: 4.2,
        preco: 3.8,
        atendimento: 4.7
      },
      total_compras: 45000,
      ultimo_pedido: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Beta Suprimentos',
      cnpj: '98.765.432/0001-10',
      email: 'vendas@betasuprimentos.com.br',
      telefone: '(11) 9876-5432',
      endereco: 'Av. Paulista, 456, São Paulo - SP',
      categoria: 'Material de Escritório',
      status: 'ativo',
      avaliacoes: {
        qualidade: 4.0,
        prazo: 4.5,
        preco: 4.2,
        atendimento: 4.1
      },
      total_compras: 28000,
      ultimo_pedido: '2024-01-10'
    }
  ];

  const mockCotacoes = [
    {
      id: 1,
      numero: 'COT-2024-001',
      produto: 'Notebook Dell Inspiron',
      quantidade: 5,
      data_solicitacao: '2024-01-08',
      data_limite: '2024-01-18',
      status: 'em_andamento',
      respostas: [
        { fornecedor: 'Alpha Tech', valor_unitario: 3500, prazo_entrega: 10, observacoes: 'Desconto para quantidade' },
        { fornecedor: 'Beta Store', valor_unitario: 3750, prazo_entrega: 7, observacoes: 'Entrega expressa' }
      ]
    }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setPedidos(mockPedidos);
    setFornecedores(mockFornecedores);
    setCotacoes(mockCotacoes);

    // Calcular estatísticas
    const totalPedidos = mockPedidos.length;
    const valorTotal = mockPedidos.reduce((sum, pedido) => sum + pedido.valor_total, 0);
    const pedidosPendentes = mockPedidos.filter(p => p.status === 'pendente').length;
    const fornecedoresAtivos = mockFornecedores.filter(f => f.status === 'ativo').length;

    setEstatisticas({
      totalPedidos,
      valorTotal,
      pedidosPendentes,
      fornecedoresAtivos,
      ticketMedio: valorTotal / totalPedidos
    });
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
      pendente: 'warning',
      aprovado: 'info',
      entregue: 'success',
      cancelado: 'error',
      em_andamento: 'primary',
      finalizada: 'success',
      ativo: 'success',
      inativo: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
      em_andamento: 'Em Andamento',
      finalizada: 'Finalizada',
      ativo: 'Ativo',
      inativo: 'Inativo'
    };
    return labels[status] || status;
  };

  const dadosGraficoMensal = [
    { mes: 'Jan', valor: 48500 },
    { mes: 'Fev', valor: 52000 },
    { mes: 'Mar', valor: 45000 },
    { mes: 'Abr', valor: 58000 },
    { mes: 'Mai', valor: 49000 },
    { mes: 'Jun', valor: 63000 }
  ];

  const dadosGraficoFornecedores = mockFornecedores.map(f => ({
    nome: f.nome.split(' ')[0],
    valor: f.total_compras
  }));

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Gestão de Compras
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Controle completo de compras, fornecedores e cotações
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RequestQuoteIcon />}
              onClick={() => {}}
            >
              Nova Cotação
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowPedidoDialog(true)}
            >
              Novo Pedido
            </Button>
          </Box>
        </Box>

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {estatisticas.totalPedidos || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Pedidos
                    </Typography>
                  </Box>
                  <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                      {formatarMoeda(estatisticas.valorTotal || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total
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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {estatisticas.pedidosPendentes || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Pendentes
                    </Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                      {estatisticas.fornecedoresAtivos || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fornecedores Ativos
                    </Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
              <Tab label="Pedidos de Compra" />
              <Tab label="Fornecedores" />
              <Tab label="Cotações" />
              <Tab label="Análises" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Aba: Pedidos de Compra */}
            <TabPanel value={tabAtiva} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pedidos de Compra
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar pedidos..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton>
                    <FilterIcon />
                  </IconButton>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell>Data Pedido</TableCell>
                      <TableCell>Data Entrega</TableCell>
                      <TableCell>Valor Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidos.map((pedido) => (
                      <TableRow key={pedido.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {pedido.numero}
                          </Typography>
                        </TableCell>
                        <TableCell>{pedido.fornecedor}</TableCell>
                        <TableCell>{formatarData(pedido.data_pedido)}</TableCell>
                        <TableCell>{formatarData(pedido.data_entrega)}</TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'success.main', fontWeight: 600 }}>
                            {formatarMoeda(pedido.valor_total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(pedido.status)}
                            color={getStatusColor(pedido.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {pedido.status === 'aprovado' && (
                              <IconButton size="small" color="success">
                                <LocalShippingIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Aba: Fornecedores */}
            <TabPanel value={tabAtiva} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Fornecedores
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowFornecedorDialog(true)}
                >
                  Novo Fornecedor
                </Button>
              </Box>

              <Grid container spacing={3}>
                {fornecedores.map((fornecedor) => (
                  <Grid item xs={12} md={6} key={fornecedor.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ backgroundColor: 'primary.main' }}>
                              <BusinessIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {fornecedor.nome}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {fornecedor.categoria}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={getStatusLabel(fornecedor.status)}
                            color={getStatusColor(fornecedor.status)}
                            size="small"
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ '& > *': { mb: 1 } }}>
                          <Typography variant="body2">
                            <strong>CNPJ:</strong> {fornecedor.cnpj}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {fornecedor.email}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Telefone:</strong> {fornecedor.telefone}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total de Compras:</strong> {formatarMoeda(fornecedor.total_compras)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Último Pedido:</strong> {formatarData(fornecedor.ultimo_pedido)}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Avaliações:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Qualidade: ${fornecedor.avaliacoes.qualidade}`} size="small" variant="outlined" />
                          <Chip label={`Prazo: ${fornecedor.avaliacoes.prazo}`} size="small" variant="outlined" />
                          <Chip label={`Preço: ${fornecedor.avaliacoes.preco}`} size="small" variant="outlined" />
                          <Chip label={`Atendimento: ${fornecedor.avaliacoes.atendimento}`} size="small" variant="outlined" />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Editar
                          </Button>
                          <Button size="small" startIcon={<VisibilityIcon />}>
                            Detalhes
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Aba: Cotações */}
            <TabPanel value={tabAtiva} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cotações
                </Typography>
                <Button variant="contained" startIcon={<RequestQuoteIcon />}>
                  Nova Cotação
                </Button>
              </Box>

              {cotacoes.map((cotacao) => (
                <Card key={cotacao.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {cotacao.numero}
                        </Typography>
                        <Typography variant="body1">
                          {cotacao.produto} (Qtd: {cotacao.quantidade})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Solicitado em {formatarData(cotacao.data_solicitacao)} • Prazo até {formatarData(cotacao.data_limite)}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusLabel(cotacao.status)}
                        color={getStatusColor(cotacao.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Respostas Recebidas:
                    </Typography>

                    <Grid container spacing={2}>
                      {cotacao.respostas.map((resposta, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {resposta.fornecedor}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Valor Unitário:</strong> {formatarMoeda(resposta.valor_unitario)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Total:</strong> {formatarMoeda(resposta.valor_unitario * cotacao.quantidade)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Prazo:</strong> {resposta.prazo_entrega} dias
                            </Typography>
                            {resposta.observacoes && (
                              <Typography variant="body2" color="text.secondary">
                                {resposta.observacoes}
                              </Typography>
                            )}
                            <Box sx={{ mt: 1 }}>
                              <Button size="small" variant="outlined">
                                Selecionar
                              </Button>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </TabPanel>

            {/* Aba: Análises */}
            <TabPanel value={tabAtiva} index={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Análises de Compras
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Evolução Mensal de Compras
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosGraficoMensal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatarMoeda(value)} />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Compras por Fornecedor
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosGraficoFornecedores}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                        label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dadosGraficoFornecedores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatarMoeda(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Indicadores de Performance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" sx={{ color: 'primary.main' }}>
                            {formatarMoeda(estatisticas.ticketMedio || 0)}
                          </Typography>
                          <Typography variant="body2">
                            Ticket Médio
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" sx={{ color: 'success.main' }}>
                            92%
                          </Typography>
                          <Typography variant="body2">
                            Taxa de Entrega
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" sx={{ color: 'warning.main' }}>
                            15
                          </Typography>
                          <Typography variant="body2">
                            Dias Médios
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" sx={{ color: 'info.main' }}>
                            4.2
                          </Typography>
                          <Typography variant="body2">
                            Avaliação Média
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Dialog Novo Pedido */}
        <Dialog
          open={showPedidoDialog}
          onClose={() => setShowPedidoDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Novo Pedido de Compra</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Fornecedor</InputLabel>
                  <Select label="Fornecedor">
                    {fornecedores.map((fornecedor) => (
                      <MenuItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data de Entrega"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  placeholder="Observações sobre o pedido..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPedidoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained">
              Criar Pedido
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Novo Fornecedor */}
        <Dialog
          open={showFornecedorDialog}
          onClose={() => setShowFornecedorDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome da Empresa" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="CNPJ" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Telefone" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select label="Categoria">
                    <MenuItem value="tecnologia">Tecnologia</MenuItem>
                    <MenuItem value="material_escritorio">Material de Escritório</MenuItem>
                    <MenuItem value="limpeza">Limpeza</MenuItem>
                    <MenuItem value="manutencao">Manutenção</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFornecedorDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained">
              Cadastrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ComprasPage;