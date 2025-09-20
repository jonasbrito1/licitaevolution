import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import {
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

import financeiroService from '../../services/financeiroService';
import { useNotification } from '../../contexts/NotificationContext';

const TransacaoDialog = ({ open, onClose, transacao, onSave }) => {
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria_id: '',
    centro_custo_id: '',
    data_transacao: new Date(),
    data_vencimento: new Date(),
    fornecedor_cliente: '',
    observacoes: '',
    tags: [],
    anexos: [],
    parcelado: false,
    num_parcelas: 1,
    recorrente: false,
    periodicidade: 'mensal',
    conta_bancaria_id: '',
    forma_pagamento: 'dinheiro',
    status: 'pendente'
  });

  const [categorias, setCategorias] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      carregarDados();
      if (transacao) {
        setFormData({ ...transacao });
      } else {
        setFormData({
          descricao: '',
          valor: '',
          tipo: 'despesa',
          categoria_id: '',
          centro_custo_id: '',
          data_transacao: new Date(),
          data_vencimento: new Date(),
          fornecedor_cliente: '',
          observacoes: '',
          tags: [],
          anexos: [],
          parcelado: false,
          num_parcelas: 1,
          recorrente: false,
          periodicidade: 'mensal',
          conta_bancaria_id: '',
          forma_pagamento: 'dinheiro',
          status: 'pendente'
        });
      }
    }
  }, [open, transacao]);

  const carregarDados = async () => {
    try {
      const [categoriasResponse, centrosResponse] = await Promise.all([
        financeiroService.listarCategorias(),
        financeiroService.listarCentrosCusto()
      ]);

      if (categoriasResponse.success) {
        setCategorias(categoriasResponse.data);
      } else {
        // Mock data
        setCategorias([
          { id: 1, nome: 'Fornecedores', tipo: 'despesa' },
          { id: 2, nome: 'Salários', tipo: 'despesa' },
          { id: 3, nome: 'Contratos', tipo: 'receita' },
          { id: 4, nome: 'Serviços', tipo: 'receita' },
          { id: 5, nome: 'Material', tipo: 'despesa' },
          { id: 6, nome: 'Aluguel', tipo: 'despesa' }
        ]);
      }

      if (centrosResponse.success) {
        setCentrosCusto(centrosResponse.data);
      } else {
        // Mock data
        setCentrosCusto([
          { id: 1, nome: 'Administrativo', codigo: 'ADM' },
          { id: 2, nome: 'Comercial', codigo: 'COM' },
          { id: 3, nome: 'Operacional', codigo: 'OPE' },
          { id: 4, nome: 'Licitações', codigo: 'LIC' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const dadosParaSalvar = {
        ...formData,
        valor: parseFloat(formData.valor.toString().replace(',', '.'))
      };

      let response;
      if (transacao) {
        response = await financeiroService.atualizarTransacao(transacao.id, dadosParaSalvar);
      } else {
        response = await financeiroService.criarTransacao(dadosParaSalvar);
      }

      if (response.success) {
        showSuccess(transacao ? 'Transação atualizada com sucesso!' : 'Transação criada com sucesso!');
        onSave(response.data);
        onClose();
      }
    } catch (error) {
      showError(error.message || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const categoriasFiltradasPorTipo = categorias.filter(cat => cat.tipo === formData.tipo);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon />
            {transacao ? 'Editar Transação' : 'Nova Transação'}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="receita">Receita</MenuItem>
                  <MenuItem value="despesa">Despesa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
                required
                type="number"
                inputProps={{ step: "0.01" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoria_id}
                  onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                  label="Categoria"
                >
                  {categoriasFiltradasPorTipo.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Centro de Custo</InputLabel>
                <Select
                  value={formData.centro_custo_id}
                  onChange={(e) => handleInputChange('centro_custo_id', e.target.value)}
                  label="Centro de Custo"
                >
                  {centrosCusto.map((centro) => (
                    <MenuItem key={centro.id} value={centro.id}>
                      {centro.codigo} - {centro.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={formData.tipo === 'receita' ? 'Cliente' : 'Fornecedor'}
                value={formData.fornecedor_cliente}
                onChange={(e) => handleInputChange('fornecedor_cliente', e.target.value)}
              />
            </Grid>

            {/* Datas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Datas
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data da Transação"
                value={formData.data_transacao}
                onChange={(date) => handleInputChange('data_transacao', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Data de Vencimento"
                value={formData.data_vencimento}
                onChange={(date) => handleInputChange('data_vencimento', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            {/* Configurações Avançadas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Configurações
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={formData.forma_pagamento}
                  onChange={(e) => handleInputChange('forma_pagamento', e.target.value)}
                  label="Forma de Pagamento"
                >
                  <MenuItem value="dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="transferencia">Transferência</MenuItem>
                  <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
                  <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
                  <MenuItem value="boleto">Boleto</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="recebido">Recebido</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.parcelado}
                      onChange={(e) => handleInputChange('parcelado', e.target.checked)}
                    />
                  }
                  label="Parcelado"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.recorrente}
                      onChange={(e) => handleInputChange('recorrente', e.target.checked)}
                    />
                  }
                  label="Recorrente"
                />
              </Box>
            </Grid>

            {formData.parcelado && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de Parcelas"
                  type="number"
                  value={formData.num_parcelas}
                  onChange={(e) => handleInputChange('num_parcelas', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 60 }}
                />
              </Grid>
            )}

            {formData.recorrente && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Periodicidade</InputLabel>
                  <Select
                    value={formData.periodicidade}
                    onChange={(e) => handleInputChange('periodicidade', e.target.value)}
                    label="Periodicidade"
                  >
                    <MenuItem value="semanal">Semanal</MenuItem>
                    <MenuItem value="mensal">Mensal</MenuItem>
                    <MenuItem value="bimestral">Bimestral</MenuItem>
                    <MenuItem value="trimestral">Trimestral</MenuItem>
                    <MenuItem value="semestral">Semestral</MenuItem>
                    <MenuItem value="anual">Anual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
              />
            </Grid>

            {/* Preview do Valor */}
            {formData.valor && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Resumo da Transação
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {formData.descricao || 'Nova transação'}
                    </Typography>
                    <Chip
                      label={formatarMoeda(parseFloat(formData.valor || 0))}
                      color={formData.tipo === 'receita' ? 'success' : 'error'}
                      variant="filled"
                      size="large"
                    />
                  </Box>
                  {formData.parcelado && formData.num_parcelas > 1 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {formData.num_parcelas}x de {formatarMoeda(parseFloat(formData.valor || 0) / formData.num_parcelas)}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.descricao || !formData.valor}
          >
            {loading ? 'Salvando...' : transacao ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TransacaoDialog;