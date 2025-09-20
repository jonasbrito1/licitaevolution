import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Button,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Importar componentes de IA
import AnalysisPanel from '../components/AI/AnalysisPanel';
import ScoreDashboard from '../components/AI/ScoreDashboard';
import RecommendationCard from '../components/AI/RecommendationCard';

const AIAnalysis = () => {
  const navigate = useNavigate();
  const [editais, setEditais] = useState([]);
  const [selectedEdital, setSelectedEdital] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    loadEditais();
  }, []);

  const loadEditais = async () => {
    try {
      // Simular carregamento de editais (substituir pela API real)
      const mockEditais = [
        {
          id: '1',
          numero_edital: 'PE-001/2024',
          orgao_nome: 'Prefeitura Municipal de São Paulo',
          objeto: 'Aquisição de equipamentos de informática para modernização da rede municipal',
          valor_estimado: 250000,
          status: 'novo'
        },
        {
          id: '2',
          numero_edital: 'CC-002/2024',
          orgao_nome: 'Governo do Estado de São Paulo',
          objeto: 'Contratação de serviços de consultoria em tecnologia da informação',
          valor_estimado: 500000,
          status: 'analisando'
        },
        {
          id: '3',
          numero_edital: 'TP-003/2024',
          orgao_nome: 'Ministério da Educação',
          objeto: 'Fornecimento de material escolar para escolas públicas',
          valor_estimado: 150000,
          status: 'novo'
        }
      ];

      setEditais(mockEditais);

      // Selecionar primeiro edital automaticamente
      if (mockEditais.length > 0) {
        setSelectedEdital(mockEditais[0].id);
      }
    } catch (error) {
      setError('Erro ao carregar editais');
      console.error('Erro ao carregar editais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditalChange = (event) => {
    setSelectedEdital(event.target.value);
    setAnalysisResults(null);
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
  };

  const selectedEditalData = editais.find(e => e.id === selectedEdital);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
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
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <PsychologyIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Análise IA
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🤖 Análise Especializada com IA
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Sistema avançado de análise de editais usando Inteligência Artificial Claude
        </Typography>
      </Box>

      {/* Seleção de edital */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Selecionar Edital para Análise</InputLabel>
                <Select
                  value={selectedEdital}
                  onChange={handleEditalChange}
                  label="Selecionar Edital para Análise"
                >
                  {editais.map((edital) => (
                    <MenuItem key={edital.id} value={edital.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {edital.numero_edital} - {edital.orgao_nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {edital.objeto.substring(0, 80)}...
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedEditalData && (
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      Valor Estimado:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(selectedEditalData.valor_estimado)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      Status:
                    </Typography>
                    <Chip
                      label={selectedEditalData.status.toUpperCase()}
                      size="small"
                      color={selectedEditalData.status === 'novo' ? 'primary' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Conteúdo principal */}
      {selectedEdital && (
        <Grid container spacing={3}>
          {/* Painel principal de análise */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Dashboard de Scores */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AssessmentIcon color="primary" />
                  <Typography variant="h6">Dashboard de Scores</Typography>
                </Box>
                <ScoreDashboard editalId={selectedEdital} />
              </Box>

              {/* Painel de análise completa */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="h6">Análise Detalhada</Typography>
                </Box>
                <AnalysisPanel
                  editalId={selectedEdital}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Sidebar com recomendações */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Informações do edital selecionado */}
              {selectedEditalData && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📋 Edital Selecionado
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      {selectedEditalData.numero_edital}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {selectedEditalData.orgao_nome}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" gutterBottom>
                      <strong>Objeto:</strong> {selectedEditalData.objeto}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Valor:</strong> {formatCurrency(selectedEditalData.valor_estimado)}
                    </Typography>
                    <Chip
                      label={selectedEditalData.status.toUpperCase()}
                      size="small"
                      color={selectedEditalData.status === 'novo' ? 'primary' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Recomendações estratégicas */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">Recomendações</Typography>
                </Box>
                <RecommendationCard editalId={selectedEdital} />
              </Box>

              {/* Ações rápidas */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚡ Ações Rápidas
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/editais/${selectedEdital}`)}
                    >
                      Ver Detalhes do Edital
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/propostas/nova?edital=${selectedEdital}`)}
                    >
                      Criar Proposta
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => window.print()}
                    >
                      Imprimir Análise
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Estatísticas da análise */}
              {analysisResults && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Resumo da Análise
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary">
                            {analysisResults.score_final}%
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Score Final
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="secondary">
                            {analysisResults.versao || '1.0'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Versão
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AIAnalysis;