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
  LinearProgress,
  CircularProgress,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Psychology as PsychologyIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

import editalService from '../../services/editalService';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import KanbanBoard from '../../components/Kanban/KanbanBoard';

const EditaisPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();

  // Estados
  const [editais, setEditais] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [filtros, setFiltros] = useState({
    search: '',
    status: '',
    modalidade: '',
    data_abertura_inicio: null,
    data_abertura_fim: null,
    valor_min: '',
    valor_max: '',
    score_min: ''
  });
  const [paginacao, setPaginacao] = useState({
    page: 0,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showFiltros, setShowFiltros] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [editalParaExcluir, setEditalParaExcluir] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'kanban'

  // Carregar dados iniciais
  useEffect(() => {
    carregarEditais();
    carregarEstatisticas();
  }, [paginacao.page, paginacao.limit, filtros]);

  const carregarEditais = async () => {
    try {
      setLocalLoading(true);
      const params = {
        page: paginacao.page + 1,
        limit: paginacao.limit,
        ...filtros
      };

      // Remover campos vazios
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await editalService.listarEditais(params);

      if (response.success) {
        setEditais(response.data);
        setPaginacao(prev => ({
          ...prev,
          total: response.pagination.total,
          pages: response.pagination.pages
        }));
      }
    } catch (error) {
      showError(error.message || 'Erro ao carregar editais');
    } finally {
      setLocalLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await editalService.buscarEstatisticas();
      if (response.success) {
        setEstatisticas(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginacao(prev => ({ ...prev, page: 0 }));
  };

  const limparFiltros = () => {
    setFiltros({
      search: '',
      status: '',
      modalidade: '',
      data_abertura_inicio: null,
      data_abertura_fim: null,
      valor_min: '',
      valor_max: '',
      score_min: ''
    });
  };

  const handleChangePage = (event, newPage) => {
    setPaginacao(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPaginacao(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleAnalisarEdital = async (edital) => {
    try {
      setLoading(true, 'Analisando edital com LicitAI...');

      const response = await editalService.analisarEdital(edital.id, {
        tipo_analise: 'completa'
      });

      if (response.success) {
        showSuccess('Análise concluída com sucesso!');
        carregarEditais();
      }
    } catch (error) {
      showError(error.message || 'Erro ao analisar edital');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirEdital = async () => {
    if (!editalParaExcluir) return;

    try {
      setLoading(true, 'Excluindo edital...');

      const response = await editalService.excluirEdital(editalParaExcluir.id);

      if (response.success) {
        showSuccess('Edital excluído com sucesso!');
        setEditalParaExcluir(null);
        carregarEditais();
      }
    } catch (error) {
      showError(error.message || 'Erro ao excluir edital');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const editalId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Encontrar o edital que foi movido
    const edital = editais.find(e => e.id === editalId);
    if (!edital || edital.status === newStatus) return;

    try {
      setLoading(true, 'Atualizando status...');

      const response = await editalService.atualizarStatus(editalId, {
        status: newStatus
      });

      if (response.success) {
        showSuccess('Status atualizado com sucesso!');
        carregarEditais();
      }
    } catch (error) {
      showError(error.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = (action, edital) => {
    switch (action) {
      case 'view':
        navigate(`/editais/${edital.id}`);
        break;
      case 'edit':
        navigate(`/editais/${edital.id}/editar`);
        break;
      case 'analyze':
        handleAnalisarEdital(edital);
        break;
      case 'delete':
        setEditalParaExcluir(edital);
        break;
      default:
        break;
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Gestão de Editais
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie editais e utilize a LicitAI para análises inteligentes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Atualizar">
              <IconButton onClick={carregarEditais}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filtros">
              <IconButton onClick={() => setShowFiltros(!showFiltros)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualização em Tabela">
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualização Kanban">
              <IconButton
                onClick={() => setViewMode('kanban')}
                color={viewMode === 'kanban' ? 'primary' : 'default'}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/editais/novo')}
              sx={{ fontWeight: 600 }}
            >
              Novo Edital
            </Button>
          </Box>
        </Box>

        {/* Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {estatisticas.total_editais || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Editais
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatarMoeda(estatisticas.valor_total_estimado)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor Total Estimado
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {estatisticas.editais_proximos_vencimento || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Próximos do Vencimento
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Análises com LicitAI
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        {showFiltros && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Buscar"
                    placeholder="Número, objeto ou órgão..."
                    value={filtros.search}
                    onChange={(e) => handleFiltroChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filtros.status}
                      onChange={(e) => handleFiltroChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="novo">Novo</MenuItem>
                      <MenuItem value="analisando">Em Análise</MenuItem>
                      <MenuItem value="analisado">Analisado</MenuItem>
                      <MenuItem value="participando">Participando</MenuItem>
                      <MenuItem value="finalizado">Finalizado</MenuItem>
                      <MenuItem value="cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Modalidade</InputLabel>
                    <Select
                      value={filtros.modalidade}
                      onChange={(e) => handleFiltroChange('modalidade', e.target.value)}
                      label="Modalidade"
                    >
                      <MenuItem value="">Todas</MenuItem>
                      <MenuItem value="pregao">Pregão</MenuItem>
                      <MenuItem value="concorrencia">Concorrência</MenuItem>
                      <MenuItem value="tomada_preco">Tomada de Preço</MenuItem>
                      <MenuItem value="convite">Convite</MenuItem>
                      <MenuItem value="concurso">Concurso</MenuItem>
                      <MenuItem value="leilao">Leilão</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="Data Início"
                    value={filtros.data_abertura_inicio}
                    onChange={(date) => handleFiltroChange('data_abertura_inicio', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="Data Fim"
                    value={filtros.data_abertura_fim}
                    onChange={(date) => handleFiltroChange('data_abertura_fim', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={limparFiltros}>
                      Limpar Filtros
                    </Button>
                    <Button variant="contained" onClick={carregarEditais}>
                      Aplicar Filtros
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Visualizações dos Editais */}
        {viewMode === 'table' ? (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {loading && <LinearProgress />}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Órgão</TableCell>
                      <TableCell>Objeto</TableCell>
                      <TableCell>Modalidade</TableCell>
                      <TableCell>Valor Estimado</TableCell>
                      <TableCell>Data Abertura</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Score IA</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editais.map((edital) => (
                      <TableRow key={edital.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {edital.numero_edital}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {edital.orgao_nome || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={edital.objeto}
                          >
                            {edital.objeto}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={edital.modalidade}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatarMoeda(edital.valor_estimado)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatarData(edital.data_abertura)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(edital.status)}
                            color={getStatusColor(edital.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {edital.score_viabilidade ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress
                                variant="determinate"
                                value={edital.score_viabilidade}
                                size={24}
                                color={getScoreColor(edital.score_viabilidade)}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {edital.score_viabilidade}%
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/editais/${edital.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/editais/${edital.id}/editar`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Analisar com LicitAI">
                              <IconButton
                                size="small"
                                onClick={() => handleAnalisarEdital(edital)}
                                disabled={edital.status === 'analisando'}
                                sx={{ color: 'secondary.main' }}
                              >
                                <PsychologyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => setEditalParaExcluir(edital)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={paginacao.total}
                page={paginacao.page}
                onPageChange={handleChangePage}
                rowsPerPage={paginacao.limit}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                labelRowsPerPage="Itens por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Box>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <KanbanBoard
              editais={editais}
              onDragEnd={handleDragEnd}
              onCardAction={handleCardAction}
            />
          </Box>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog
          open={Boolean(editalParaExcluir)}
          onClose={() => setEditalParaExcluir(null)}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o edital{' '}
              <strong>{editalParaExcluir?.numero_edital}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditalParaExcluir(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleExcluirEdital}
              color="error"
              variant="contained"
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* FAB para Análise Rápida */}
        <Fab
          color="secondary"
          aria-label="Análise Rápida com LicitAI"
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
          }}
          onClick={() => navigate('/licitai')}
        >
          <PsychologyIcon />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
};

export default EditaisPage;