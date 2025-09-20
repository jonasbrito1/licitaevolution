import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  useTheme,
  Fab,
  Divider,
  Avatar,
  Stack,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FornecedoresPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Estados
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null);

  // Dados mock dos fornecedores
  const mockFornecedores = [
    {
      id: 1,
      razao_social: 'Tech Solutions Ltda',
      nome_fantasia: 'TechSol',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsol.com.br',
      telefone: '(11) 99999-1111',
      categoria: 'Tecnologia',
      status: 'ativo',
      avaliacao: 4.5,
      endereco: {
        logradouro: 'Rua das Flores, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      contato_principal: {
        nome: 'João Silva',
        cargo: 'Gerente Comercial',
        email: 'joao@techsol.com.br',
        telefone: '(11) 98888-1111'
      },
      dados_bancarios: {
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '67890-1'
      },
      observacoes: 'Fornecedor especializado em soluções de TI',
      data_cadastro: '2024-01-15',
      ultima_compra: '2024-09-01',
      total_compras: 25000.50,
      certificacoes: ['ISO 9001', 'ISO 27001'],
      documentos: {
        cnpj_ativo: true,
        inscricao_estadual: '123.456.789.012',
        certidao_federal: true,
        certidao_estadual: true,
        certidao_municipal: true
      }
    },
    {
      id: 2,
      razao_social: 'Suprimentos Industriais S.A.',
      nome_fantasia: 'SupriInd',
      cnpj: '98.765.432/0001-10',
      email: 'vendas@supriind.com.br',
      telefone: '(11) 88888-2222',
      categoria: 'Material de Escritório',
      status: 'ativo',
      avaliacao: 3.8,
      endereco: {
        logradouro: 'Av. Industrial, 456',
        bairro: 'Vila Industrial',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04567-890'
      },
      contato_principal: {
        nome: 'Maria Santos',
        cargo: 'Diretora Comercial',
        email: 'maria@supriind.com.br',
        telefone: '(11) 97777-2222'
      },
      dados_bancarios: {
        banco: 'Itaú',
        agencia: '9876-5',
        conta: '54321-0'
      },
      observacoes: 'Fornecedor de materiais de escritório e limpeza',
      data_cadastro: '2024-02-20',
      ultima_compra: '2024-08-15',
      total_compras: 15750.25,
      certificacoes: ['ISO 9001'],
      documentos: {
        cnpj_ativo: true,
        inscricao_estadual: '987.654.321.098',
        certidao_federal: true,
        certidao_estadual: false,
        certidao_municipal: true
      }
    },
    {
      id: 3,
      razao_social: 'Construtora ABC Ltda',
      nome_fantasia: 'ABC Construções',
      cnpj: '11.222.333/0001-44',
      email: 'obras@abcconstrucoes.com.br',
      telefone: '(11) 77777-3333',
      categoria: 'Construção',
      status: 'inativo',
      avaliacao: 2.5,
      endereco: {
        logradouro: 'Rua dos Engenheiros, 789',
        bairro: 'Jardim das Obras',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05678-901'
      },
      contato_principal: {
        nome: 'Carlos Pereira',
        cargo: 'Engenheiro Responsável',
        email: 'carlos@abcconstrucoes.com.br',
        telefone: '(11) 96666-3333'
      },
      dados_bancarios: {
        banco: 'Caixa Econômica Federal',
        agencia: '1111-1',
        conta: '22222-2'
      },
      observacoes: 'Fornecedor com histórico de atrasos nas entregas',
      data_cadastro: '2023-10-10',
      ultima_compra: '2024-05-30',
      total_compras: 45320.80,
      certificacoes: [],
      documentos: {
        cnpj_ativo: true,
        inscricao_estadual: '111.222.333.444',
        certidao_federal: false,
        certidao_estadual: false,
        certidao_municipal: true
      }
    }
  ];

  // Carregar fornecedores
  useEffect(() => {
    const loadFornecedores = async () => {
      setLoading(true);
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFornecedores(mockFornecedores);
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFornecedores();
  }, []);

  // Filtrar fornecedores
  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = !searchTerm ||
      fornecedor.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.includes(searchTerm);

    const matchesStatus = !statusFilter || fornecedor.status === statusFilter;
    const matchesCategoria = !categoriaFilter || fornecedor.categoria === categoriaFilter;

    return matchesSearch && matchesStatus && matchesCategoria;
  });

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedFornecedor(null);
  };

  const handleDeleteClick = (fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fornecedorToDelete) {
      // Aqui seria feita a exclusão real
      setFornecedores(prev => prev.filter(f => f.id !== fornecedorToDelete.id));
      setDeleteConfirmOpen(false);
      setFornecedorToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    return status === 'ativo' ? 'success' : 'error';
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      'Tecnologia': 'primary',
      'Material de Escritório': 'secondary',
      'Construção': 'warning',
      'Serviços': 'info'
    };
    return colors[categoria] || 'default';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} fontSize="small" color="warning" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" fontSize="small" color="warning" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarBorderIcon key={`empty-${i}`} fontSize="small" color="disabled" />);
    }

    return stars;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏢 Fornecedores
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gestão completa de fornecedores e parceiros comerciais
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar fornecedor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                placeholder="Nome, CNPJ..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  label="Categoria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Tecnologia">Tecnologia</MenuItem>
                  <MenuItem value="Material de Escritório">Material de Escritório</MenuItem>
                  <MenuItem value="Construção">Construção</MenuItem>
                  <MenuItem value="Serviços">Serviços</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Atualizar">
                  <IconButton onClick={() => window.location.reload()}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filtros avançados">
                  <IconButton>
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de fornecedores */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Lista de Fornecedores ({filteredFornecedores.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/fornecedores/novo')}
            >
              Novo Fornecedor
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fornecedor</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Contato</TableCell>
                      <TableCell>Avaliação</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Última Compra</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFornecedores
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((fornecedor) => (
                        <TableRow key={fornecedor.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                <BusinessIcon />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    cursor: 'pointer',
                                    color: theme.palette.primary.main,
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                  onClick={() => handleOpenDetails(fornecedor)}
                                >
                                  {fornecedor.razao_social}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {fornecedor.nome_fantasia}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {fornecedor.cnpj}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fornecedor.categoria}
                              color={getCategoriaColor(fornecedor.categoria)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {fornecedor.telefone}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {fornecedor.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {renderStars(fornecedor.avaliacao)}
                              <Typography variant="caption">
                                ({fornecedor.avaliacao})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fornecedor.status.toUpperCase()}
                              color={getStatusColor(fornecedor.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {fornecedor.ultima_compra
                              ? formatDate(fornecedor.ultima_compra)
                              : 'Nunca'
                            }
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Visualizar detalhes">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDetails(fornecedor)}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/fornecedores/${fornecedor.id}/editar`)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(fornecedor)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredFornecedores.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* FAB para adicionar */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/fornecedores/novo')}
      >
        <AddIcon />
      </Fab>

      {/* Modal de detalhes do fornecedor */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            Detalhes do Fornecedor
          </Typography>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFornecedor && (
            <Grid container spacing={3}>
              {/* Informações básicas */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    Informações Básicas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Razão Social</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedFornecedor.razao_social}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Nome Fantasia</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedFornecedor.nome_fantasia}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">CNPJ</Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {selectedFornecedor.cnpj}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Categoria</Typography>
                      <Chip
                        label={selectedFornecedor.categoria}
                        color={getCategoriaColor(selectedFornecedor.categoria)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedFornecedor.status.toUpperCase()}
                        color={getStatusColor(selectedFornecedor.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">Avaliação</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {renderStars(selectedFornecedor.avaliacao)}
                        <Typography variant="body2">
                          ({selectedFornecedor.avaliacao})
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Contato */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Contato Principal
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedFornecedor.contato_principal.nome} - {selectedFornecedor.contato_principal.cargo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedFornecedor.contato_principal.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {selectedFornecedor.contato_principal.telefone}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Endereço */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    Endereço
                  </Typography>
                  <Typography variant="body2">
                    {selectedFornecedor.endereco.logradouro}<br />
                    {selectedFornecedor.endereco.bairro}<br />
                    {selectedFornecedor.endereco.cidade} - {selectedFornecedor.endereco.estado}<br />
                    CEP: {selectedFornecedor.endereco.cep}
                  </Typography>
                </Paper>
              </Grid>

              {/* Dados financeiros */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    Dados Financeiros
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Total de Compras</Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(selectedFornecedor.total_compras)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Última Compra</Typography>
                      <Typography variant="body2">
                        {formatDate(selectedFornecedor.ultima_compra)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Data de Cadastro</Typography>
                      <Typography variant="body2">
                        {formatDate(selectedFornecedor.data_cadastro)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Certificações */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon color="primary" />
                    Certificações
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedFornecedor.certificacoes.length > 0 ? (
                      selectedFornecedor.certificacoes.map((cert, index) => (
                        <Chip
                          key={index}
                          label={cert}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Nenhuma certificação registrada
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {/* Status dos documentos */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon color="primary" />
                    Status dos Documentos
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedFornecedor.documentos.cnpj_ativo ? (
                          <VerifiedUserIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2">CNPJ Ativo</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedFornecedor.documentos.certidao_federal ? (
                          <VerifiedUserIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2">Certidão Federal</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedFornecedor.documentos.certidao_estadual ? (
                          <VerifiedUserIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2">Certidão Estadual</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {selectedFornecedor.documentos.certidao_municipal ? (
                          <VerifiedUserIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="body2">Certidão Municipal</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Observações */}
              {selectedFornecedor.observacoes && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Observações
                    </Typography>
                    <Typography variant="body2">
                      {selectedFornecedor.observacoes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Fechar
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseDetails();
              navigate(`/fornecedores/${selectedFornecedor.id}/editar`);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o fornecedor{' '}
            <strong>{fornecedorToDelete?.razao_social}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FornecedoresPage;