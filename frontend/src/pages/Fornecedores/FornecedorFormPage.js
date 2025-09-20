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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountBalanceIcon,
  VerifiedUser as VerifiedUserIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const FornecedorFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(id);

  // Estados do formulário
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fornecedor, setFornecedor] = useState({
    // Dados básicos
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    categoria: '',
    status: 'ativo',

    // Endereço
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },

    // Contato
    email: '',
    telefone: '',
    website: '',
    contato_principal: {
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
    },

    // Dados bancários
    dados_bancarios: {
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'corrente',
    },

    // Certificações
    certificacoes: [],
    nova_certificacao: '',

    // Observações
    observacoes: '',
  });

  const steps = [
    'Informações Básicas',
    'Endereço',
    'Contato',
    'Dados Bancários',
    'Certificações',
    'Revisão'
  ];

  const categorias = [
    'Tecnologia',
    'Material de Escritório',
    'Construção',
    'Serviços',
    'Alimentação',
    'Transporte',
    'Consultoria',
    'Equipamentos',
    'Outros'
  ];

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Carregar dados do fornecedor se for edição
  useEffect(() => {
    if (isEdit) {
      loadFornecedor();
    }
  }, [id, isEdit]);

  const loadFornecedor = async () => {
    setLoading(true);
    try {
      // Aqui seria feita a busca real do fornecedor
      // Por enquanto, dados mock
      const mockFornecedor = {
        razao_social: 'Tech Solutions Ltda',
        nome_fantasia: 'TechSol',
        cnpj: '12.345.678/0001-90',
        inscricao_estadual: '123.456.789.012',
        inscricao_municipal: '12345',
        categoria: 'Tecnologia',
        status: 'ativo',
        endereco: {
          cep: '01234-567',
          logradouro: 'Rua das Flores',
          numero: '123',
          complemento: 'Sala 45',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
        },
        email: 'contato@techsol.com.br',
        telefone: '(11) 99999-1111',
        website: 'www.techsol.com.br',
        contato_principal: {
          nome: 'João Silva',
          cargo: 'Gerente Comercial',
          email: 'joao@techsol.com.br',
          telefone: '(11) 98888-1111',
        },
        dados_bancarios: {
          banco: 'Banco do Brasil',
          agencia: '1234-5',
          conta: '67890-1',
          tipo_conta: 'corrente',
        },
        certificacoes: ['ISO 9001', 'ISO 27001'],
        observacoes: 'Fornecedor especializado em soluções de TI',
      };

      setFornecedor(mockFornecedor);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar dados do fornecedor', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, nested = null) => {
    setFornecedor(prev => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...prev[nested],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleAddCertificacao = () => {
    if (fornecedor.nova_certificacao.trim()) {
      setFornecedor(prev => ({
        ...prev,
        certificacoes: [...prev.certificacoes, prev.nova_certificacao.trim()],
        nova_certificacao: ''
      }));
    }
  };

  const handleRemoveCertificacao = (index) => {
    setFornecedor(prev => ({
      ...prev,
      certificacoes: prev.certificacoes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Aqui seria feita a submissão real
      await new Promise(resolve => setTimeout(resolve, 2000));

      enqueueSnackbar(
        isEdit ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!',
        { variant: 'success' }
      );

      navigate('/fornecedores');
    } catch (error) {
      enqueueSnackbar('Erro ao salvar fornecedor', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Informações Básicas
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Razão Social"
                value={fornecedor.razao_social}
                onChange={(e) => handleInputChange('razao_social', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Fantasia"
                value={fornecedor.nome_fantasia}
                onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="CNPJ"
                value={fornecedor.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={fornecedor.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  label="Categoria"
                >
                  {categorias.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Inscrição Estadual"
                value={fornecedor.inscricao_estadual}
                onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Inscrição Municipal"
                value={fornecedor.inscricao_municipal}
                onChange={(e) => handleInputChange('inscricao_municipal', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fornecedor.status === 'ativo'}
                    onChange={(e) => handleInputChange('status', e.target.checked ? 'ativo' : 'inativo')}
                  />
                }
                label="Fornecedor Ativo"
              />
            </Grid>
          </Grid>
        );

      case 1: // Endereço
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CEP"
                value={fornecedor.endereco.cep}
                onChange={(e) => handleInputChange('cep', e.target.value, 'endereco')}
                placeholder="00000-000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logradouro"
                value={fornecedor.endereco.logradouro}
                onChange={(e) => handleInputChange('logradouro', e.target.value, 'endereco')}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Número"
                value={fornecedor.endereco.numero}
                onChange={(e) => handleInputChange('numero', e.target.value, 'endereco')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={fornecedor.endereco.complemento}
                onChange={(e) => handleInputChange('complemento', e.target.value, 'endereco')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={fornecedor.endereco.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value, 'endereco')}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Cidade"
                value={fornecedor.endereco.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value, 'endereco')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={fornecedor.endereco.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value, 'endereco')}
                  label="Estado"
                >
                  {estados.map(estado => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2: // Contato
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email Principal"
                type="email"
                value={fornecedor.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Telefone Principal"
                value={fornecedor.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={fornecedor.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="www.empresa.com.br"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Contato Principal</Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Contato"
                value={fornecedor.contato_principal.nome}
                onChange={(e) => handleInputChange('nome', e.target.value, 'contato_principal')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={fornecedor.contato_principal.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value, 'contato_principal')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email do Contato"
                type="email"
                value={fornecedor.contato_principal.email}
                onChange={(e) => handleInputChange('email', e.target.value, 'contato_principal')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone do Contato"
                value={fornecedor.contato_principal.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value, 'contato_principal')}
                placeholder="(00) 00000-0000"
              />
            </Grid>
          </Grid>
        );

      case 3: // Dados Bancários
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Banco"
                value={fornecedor.dados_bancarios.banco}
                onChange={(e) => handleInputChange('banco', e.target.value, 'dados_bancarios')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Agência"
                value={fornecedor.dados_bancarios.agencia}
                onChange={(e) => handleInputChange('agencia', e.target.value, 'dados_bancarios')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Conta</InputLabel>
                <Select
                  value={fornecedor.dados_bancarios.tipo_conta}
                  onChange={(e) => handleInputChange('tipo_conta', e.target.value, 'dados_bancarios')}
                  label="Tipo de Conta"
                >
                  <MenuItem value="corrente">Corrente</MenuItem>
                  <MenuItem value="poupanca">Poupança</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Conta"
                value={fornecedor.dados_bancarios.conta}
                onChange={(e) => handleInputChange('conta', e.target.value, 'dados_bancarios')}
              />
            </Grid>
          </Grid>
        );

      case 4: // Certificações
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Nova Certificação"
                  value={fornecedor.nova_certificacao}
                  onChange={(e) => handleInputChange('nova_certificacao', e.target.value)}
                  placeholder="Ex: ISO 9001"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCertificacao}
                  disabled={!fornecedor.nova_certificacao.trim()}
                >
                  Adicionar
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {fornecedor.certificacoes.map((cert, index) => (
                  <Chip
                    key={index}
                    label={cert}
                    color="primary"
                    onDelete={() => handleRemoveCertificacao(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Stack>
              {fornecedor.certificacoes.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma certificação adicionada
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observações"
                value={fornecedor.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o fornecedor..."
              />
            </Grid>
          </Grid>
        );

      case 5: // Revisão
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Revise os dados antes de salvar o fornecedor
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    Dados Básicos
                  </Typography>
                  <Typography><strong>Razão Social:</strong> {fornecedor.razao_social}</Typography>
                  <Typography><strong>Nome Fantasia:</strong> {fornecedor.nome_fantasia}</Typography>
                  <Typography><strong>CNPJ:</strong> {fornecedor.cnpj}</Typography>
                  <Typography><strong>Categoria:</strong> {fornecedor.categoria}</Typography>
                  <Typography><strong>Status:</strong> {fornecedor.status}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    Endereço
                  </Typography>
                  <Typography>
                    {fornecedor.endereco.logradouro}, {fornecedor.endereco.numero}<br />
                    {fornecedor.endereco.bairro}<br />
                    {fornecedor.endereco.cidade} - {fornecedor.endereco.estado}<br />
                    CEP: {fornecedor.endereco.cep}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Contato
                  </Typography>
                  <Typography><strong>Email:</strong> {fornecedor.email}</Typography>
                  <Typography><strong>Telefone:</strong> {fornecedor.telefone}</Typography>
                  <Typography><strong>Contato Principal:</strong> {fornecedor.contato_principal.nome}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon color="primary" />
                    Certificações
                  </Typography>
                  {fornecedor.certificacoes.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {fornecedor.certificacoes.map((cert, index) => (
                        <Chip key={index} label={cert} size="small" color="success" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Nenhuma certificação
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/fornecedores')}
        >
          <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Fornecedores
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          {isEdit ? 'Editar' : 'Novo'} Fornecedor
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEdit ? '✏️ Editar Fornecedor' : '➕ Novo Fornecedor'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {isEdit ? 'Atualize os dados do fornecedor' : 'Cadastre um novo fornecedor no sistema'}
        </Typography>
      </Box>

      {/* Formulário com Stepper */}
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {renderStepContent(index)}
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={loading}
                      startIcon={index === steps.length - 1 ? <SaveIcon /> : null}
                    >
                      {loading ? 'Salvando...' : index === steps.length - 1 ? 'Salvar' : 'Continuar'}
                    </Button>
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={() => navigate('/fornecedores')}
                      sx={{ mt: 1 }}
                      startIcon={<CancelIcon />}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FornecedorFormPage;