import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Mock data - em produção virá da API
const mockData = {
  stats: {
    totalEditais: 24,
    editaisAtivos: 8,
    editaisVencidos: 3,
    taxaSucesso: 68,
    valorPotencial: 2850000,
    economiaGerada: 425000,
  },
  recentEditais: [
    {
      id: 1,
      numero: 'PE001/2024',
      orgao: 'Prefeitura Municipal',
      objeto: 'Aquisição de equipamentos de informática',
      valor: 150000,
      prazo: '2024-02-15',
      status: 'ativo',
      score: 85,
    },
    {
      id: 2,
      numero: 'CC002/2024',
      orgao: 'Governo do Estado',
      objeto: 'Prestação de serviços de limpeza',
      valor: 280000,
      prazo: '2024-02-20',
      status: 'analise',
      score: 72,
    },
    {
      id: 3,
      numero: 'TP003/2024',
      orgao: 'Ministério da Saúde',
      objeto: 'Fornecimento de medicamentos',
      valor: 450000,
      prazo: '2024-02-25',
      status: 'proposta',
      score: 91,
    },
  ],
  licitaiStats: {
    analisesRealizadas: 47,
    analisesHoje: 3,
    economiaIA: 125000,
    tempoEconomizado: '45h',
  },
  notifications: [
    {
      id: 1,
      tipo: 'prazo',
      titulo: 'Prazo de entrega próximo',
      descricao: 'Edital PE001/2024 vence em 2 dias',
      prioridade: 'alta',
    },
    {
      id: 2,
      tipo: 'analise',
      titulo: 'Nova análise disponível',
      descricao: 'Claude analisou o edital CC002/2024',
      prioridade: 'media',
    },
    {
      id: 3,
      tipo: 'sistema',
      titulo: 'Atualização de preços',
      descricao: 'Planilha de custos foi atualizada',
      prioridade: 'baixa',
    },
  ],
};

const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress, action }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.05)})`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}.main`,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>

        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Taxa de sucesso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette[color].main, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: `${color}.main`,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {action && (
          <Box sx={{ mt: 2 }}>
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useNotification();
  const [data] = useState(mockData);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      ativo: 'success',
      analise: 'warning',
      proposta: 'info',
      vencido: 'error',
      finalizado: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ativo: 'Ativo',
      analise: 'Em Análise',
      proposta: 'Proposta Enviada',
      vencido: 'Vencido',
      finalizado: 'Finalizado',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (prioridade) => {
    const colors = {
      alta: 'error',
      media: 'warning',
      baixa: 'info',
    };
    return colors[prioridade] || 'default';
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simular carregamento da API
    setTimeout(() => {
      setLoading(false);
      showSuccess('Dashboard atualizado com sucesso!');
    }, 1000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Bem-vindo, {user?.nome?.split(' ')[0]}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está um resumo das suas atividades em licitações
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar dados">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/editais')}
            sx={{ fontWeight: 600 }}
          >
            Novo Edital
          </Button>
        </Box>
      </Box>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Editais"
            value={data.stats.totalEditais}
            subtitle="Cadastrados no sistema"
            icon={<DescriptionIcon />}
            color="primary"
            action={
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/editais')}
              >
                Ver todos
              </Button>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Potencial"
            value={formatCurrency(data.stats.valorPotencial)}
            subtitle="Em editais ativos"
            icon={<AttachMoneyIcon />}
            color="success"
            progress={data.stats.taxaSucesso}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Economia Gerada"
            value={formatCurrency(data.stats.economiaGerada)}
            subtitle="Com análises LicitAI"
            icon={<TrendingUpIcon />}
            color="info"
            action={
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/licitai')}
              >
                LicitAI
              </Button>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taxa de Sucesso"
            value={`${data.stats.taxaSucesso}%`}
            subtitle="Em propostas enviadas"
            icon={<AssessmentIcon />}
            color="warning"
            action={
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/relatorios')}
              >
                Relatórios
              </Button>
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Editais recentes */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Editais Recentes
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/editais')}
                >
                  Ver todos
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.recentEditais.map((edital) => (
                  <Box
                    key={edital.id}
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                    onClick={() => navigate(`/editais/${edital.id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {edital.numero}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {edital.orgao}
                        </Typography>
                        <Typography variant="body2">
                          {edital.objeto}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={getStatusLabel(edital.status)}
                          color={getStatusColor(edital.status)}
                          size="small"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Score: {edital.score}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(edital.valor)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Prazo: {formatDate(edital.prazo)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar com LicitAI e notificações */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* LicitAI Stats */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: 'secondary.main',
                      color: 'white',
                    }}
                  >
                    <PsychologyIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    LicitAI
                  </Typography>
                  <Chip label="IA" color="secondary" size="small" />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Análises realizadas
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.licitaiStats.analisesRealizadas}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Análises hoje
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.licitaiStats.analisesHoje}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Economia gerada
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatCurrency(data.licitaiStats.economiaIA)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tempo economizado
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.licitaiStats.tempoEconomizado}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<PsychologyIcon />}
                  onClick={() => navigate('/licitai')}
                  sx={{ mt: 2, fontWeight: 600 }}
                >
                  Usar LicitAI
                </Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notificações
                  </Typography>
                  <NotificationsIcon color="action" />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {data.notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        p: 2,
                        border: `1px solid ${alpha(theme.palette[getPriorityColor(notification.prioridade)].main, 0.3)}`,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette[getPriorityColor(notification.prioridade)].main, 0.05),
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {notification.titulo}
                        </Typography>
                        <Chip
                          label={notification.prioridade}
                          color={getPriorityColor(notification.prioridade)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.descricao}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Ver todas as notificações
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        />
      )}
    </Box>
  );
};

export default DashboardPage;