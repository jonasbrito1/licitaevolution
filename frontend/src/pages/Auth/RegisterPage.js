import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const steps = ['Dados Pessoais', 'Dados da Empresa', 'Finalizar'];

const RegisterPage = () => {
  const { register: registerUser, isLoading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      razao_social: '',
      cnpj: '',
      porte_empresa: 'ME',
      regime_tributario: 'simples',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
    },
  });

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const userData = {
        // Dados do usuário
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        password: data.password,
        nivel_acesso: 'admin', // Primeiro usuário da empresa é admin

        // Dados da empresa
        empresa: {
          razao_social: data.razao_social,
          cnpj: data.cnpj.replace(/\D/g, ''), // Remove formatação
          porte_empresa: data.porte_empresa,
          regime_tributario: data.regime_tributario,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep.replace(/\D/g, ''), // Remove formatação
        },
      };

      const result = await registerUser(userData);

      if (result.success) {
        showSuccess('Conta criada com sucesso!');
      } else {
        showError(result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      showError('Erro inesperado ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['nome', 'email', 'telefone', 'password', 'confirmPassword'];
      case 1:
        return ['razao_social', 'cnpj', 'porte_empresa', 'regime_tributario'];
      case 2:
        return ['endereco', 'cidade', 'estado', 'cep'];
      default:
        return [];
    }
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome completo"
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                })}
                error={!!errors.nome}
                helperText={errors.nome?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefone"
                {...register('telefone', {
                  required: 'Telefone é obrigatório',
                  onChange: (e) => {
                    e.target.value = formatTelefone(e.target.value);
                  },
                })}
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                placeholder="(11) 99999-9999"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar senha"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === watchPassword || 'Senhas não conferem',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razão social"
                {...register('razao_social', {
                  required: 'Razão social é obrigatória',
                })}
                error={!!errors.razao_social}
                helperText={errors.razao_social?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CNPJ"
                {...register('cnpj', {
                  required: 'CNPJ é obrigatório',
                  onChange: (e) => {
                    e.target.value = formatCNPJ(e.target.value);
                  },
                  validate: (value) => {
                    const numbers = value.replace(/\D/g, '');
                    return numbers.length === 14 || 'CNPJ deve ter 14 dígitos';
                  },
                })}
                error={!!errors.cnpj}
                helperText={errors.cnpj?.message}
                placeholder="00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Porte da empresa"
                {...register('porte_empresa')}
                SelectProps={{ native: true }}
              >
                <option value="MEI">Microempreendedor Individual</option>
                <option value="ME">Microempresa</option>
                <option value="EPP">Empresa de Pequeno Porte</option>
                <option value="MEDIO">Empresa de Médio Porte</option>
                <option value="GRANDE">Grande Empresa</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Regime tributário"
                {...register('regime_tributario')}
                SelectProps={{ native: true }}
              >
                <option value="simples">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
              </TextField>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço completo"
                {...register('endereco', {
                  required: 'Endereço é obrigatório',
                })}
                error={!!errors.endereco}
                helperText={errors.endereco?.message}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Cidade"
                {...register('cidade', {
                  required: 'Cidade é obrigatória',
                })}
                error={!!errors.cidade}
                helperText={errors.cidade?.message}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estado"
                {...register('estado', {
                  required: 'Estado é obrigatório',
                  maxLength: { value: 2, message: 'Use a sigla do estado (ex: SP)' },
                })}
                error={!!errors.estado}
                helperText={errors.estado?.message}
                placeholder="SP"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CEP"
                {...register('cep', {
                  required: 'CEP é obrigatório',
                  onChange: (e) => {
                    e.target.value = formatCEP(e.target.value);
                  },
                })}
                error={!!errors.cep}
                helperText={errors.cep?.message}
                placeholder="00000-000"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={12}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Logo e título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                component="svg"
                sx={{ width: 48, height: 48, color: 'primary.main' }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L8.26 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z"/>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                LicitaEvolution
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Criar nova conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure sua empresa e comece a usar o sistema
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Formulário */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            {/* Botões de navegação */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Voltar
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                Fazer login
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © 2024 LicitaEvolution. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;