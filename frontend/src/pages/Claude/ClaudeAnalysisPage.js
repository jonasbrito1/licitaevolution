import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import licitAIService from '../../services/licitAIService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import InsightsDashboard from '../../components/LicitAI/InsightsDashboard';

const LicitaiAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('checking');

  const { user, empresa } = useAuth();
  const { showNotification } = useNotification();

  const analysisTypes = [
    {
      id: 'complete',
      title: 'Análise Completa',
      description: 'Análise detalhada do edital com estratégias e recomendações',
      icon: <AnalyticsIcon />,
      color: 'primary',
    },
    {
      id: 'document',
      title: 'Análise de Documentos',
      description: 'Processamento e análise de documentos PDF e contratos',
      icon: <DescriptionIcon />,
      color: 'info',
    },
    {
      id: 'strategy',
      title: 'Estratégia de Participação',
      description: 'Estratégias personalizadas para sua empresa',
      icon: <InsightsIcon />,
      color: 'success',
    },
    {
      id: 'compliance',
      title: 'Análise de Conformidade',
      description: 'Verificação de riscos e conformidade regulatória',
      icon: <SecurityIcon />,
      color: 'warning',
    },
    {
      id: 'market',
      title: 'Tendências de Mercado',
      description: 'Previsões e análises de tendências do mercado',
      icon: <TrendingUpIcon />,
      color: 'secondary',
    },
    {
      id: 'chat',
      title: 'Consulta Geral',
      description: 'Chat inteligente para dúvidas e consultas',
      icon: <ChatIcon />,
      color: 'primary',
    },
  ];

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await licitAIService.verificarStatus();
      setServiceStatus(status.status);
    } catch (error) {
      setServiceStatus('offline');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAnalysis = async (type) => {
    if (serviceStatus === 'offline') {
      showNotification('Serviço LicitAI indisponível no momento', 'error');
      return;
    }

    setLoading(true);
    setActiveTab(2); // Mudar para aba de resultados

    try {
      let result;
      const editalData = getEditalExample();
      const empresaData = licitAIService.formatarDadosEmpresa(empresa);

      switch (type) {
        case 'complete':
          result = await licitAIService.analisarEditalCompleto(editalData, empresaData);
          break;
        case 'strategy':
          result = await licitAIService.gerarEstrategiaParticipacao(editalData, empresaData);
          break;
        case 'compliance':
          result = await licitAIService.analisarRiscosConformidade(editalData, empresaData);
          break;
        case 'market':
          result = await licitAIService.preverTendenciasMercado(empresaData.ramo_atividade);
          break;
        case 'document':
          if (!selectedFile) {
            showNotification('Selecione um arquivo para análise', 'warning');
            setUploadDialog(true);
            setLoading(false);
            return;
          }
          result = await licitAIService.analisarDocumento(selectedFile);
          break;
        default:
          throw new Error('Tipo de análise não reconhecido');
      }

      setAnalysisResult({
        type,
        title: analysisTypes.find(t => t.id === type)?.title,
        status: 'success',
        data: result.data
      });

      showNotification(`${analysisTypes.find(t => t.id === type)?.title} concluída com sucesso!`, 'success');

    } catch (error) {
      console.error('Erro na análise:', error);
      setAnalysisResult({
        type,
        status: 'error',
        message: error.message || 'Erro ao processar análise',
      });
      showNotification(`Erro na análise: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEditalExample = () => {
    return {
      numero: '001/2024',
      objeto: 'Contratação de serviços de tecnologia',
      modalidade: 'pregao_eletronico',
      valor_estimado: 500000,
      prazo_entrega: '180 dias',
      data_abertura: '2024-02-15',
      criterio_julgamento: 'menor_preco',
      reserva_me_epp: true,
      exigencias_tecnicas: ['Certificação ISO', 'Equipe técnica especializada'],
      documentos_habilitacao: ['Certidão negativa', 'Balanço patrimonial'],
      local_execucao: 'Brasília/DF',
      orgao: 'Ministério da Educação',
      categoria: 'Tecnologia da Informação'
    };
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    if (serviceStatus === 'offline') {
      showNotification('Serviço LicitAI indisponível no momento', 'error');
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, newMessage]);
    const currentInput = chatInput;
    setChatInput('');

    try {
      const context = {
        empresa: empresa,
        usuario: user,
        conversa_anterior: chatMessages.slice(-5) // Últimas 5 mensagens como contexto
      };

      const result = await licitAIService.consultaGeral(currentInput, context);

      const aiResponse = {
        id: Date.now() + 1,
        text: result.data.resposta,
        sender: 'ai',
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Erro na consulta:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: `Desculpe, ocorreu um erro: ${error.message}. Tente novamente em alguns momentos.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorResponse]);
      showNotification('Erro na consulta ao LicitAI', 'error');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'medium': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'high': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  const renderAnalysisCards = () => (
    <Grid container spacing={3}>
      {analysisTypes.map((type) => (
        <Grid item xs={12} md={6} lg={4} key={type.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
                transition: 'all 0.3s ease-in-out'
              },
            }}
            onClick={() => type.id === 'chat' ? setActiveTab(1) : handleAnalysis(type.id)}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ color: `${type.color}.main`, mb: 2 }}>
                {React.cloneElement(type.icon, { sx: { fontSize: 48 } })}
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {type.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {type.description}
              </Typography>
              <Chip
                label="Clique para iniciar"
                color={type.color}
                variant="outlined"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderChatInterface = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" />
              Chat Inteligente LicitAI
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {chatMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 8 }}>
                <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Faça uma pergunta sobre licitações
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  O LicitAI está pronto para ajudar com suas dúvidas
                </Typography>
              </Box>
            ) : (
              chatMessages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Paper>
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Digite sua pergunta sobre licitações..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                size="small"
              />
              <Tooltip title="Upload de arquivo">
                <IconButton onClick={() => setUploadDialog(true)}>
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                onClick={handleChatSend}
                disabled={!chatInput.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sugestões de Perguntas
            </Typography>
            <List dense>
              {[
                'Como analisar um edital de licitação?',
                'Quais documentos são obrigatórios?',
                'Como calcular o preço de uma proposta?',
                'Critérios de habilitação mais comuns?',
                'Prazos importantes em licitações',
              ].map((suggestion, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setChatInput(suggestion)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={suggestion}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalysisResults = () => (
    <Box>
      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Processando Análise
          </Typography>
          <Typography variant="body2" color="text.secondary">
            O LicitAI está analisando os dados...
          </Typography>
        </Paper>
      ) : analysisResult ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert
              severity={analysisResult.status === 'success' ? 'success' : 'error'}
              sx={{ mb: 3 }}
            >
              {analysisResult.status === 'success'
                ? `Análise ${analysisResult.title} concluída com sucesso`
                : analysisResult.message
              }
            </Alert>
          </Grid>

          {analysisResult.status === 'success' && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                      {analysisResult.data.score}%
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Score de Viabilidade
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Recomendações Estratégicas
                    </Typography>
                    <List>
                      {analysisResult.data.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InsightsIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Análise de Riscos
                    </Typography>
                    <List>
                      {analysisResult.data.risks.map((risk, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {getRiskIcon(risk.level)}
                          </ListItemIcon>
                          <ListItemText primary={risk.description} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Insights Adicionais
                    </Typography>
                    <List>
                      {analysisResult.data.insights.map((insight, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AssessmentIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      ) : (
        renderAnalysisCards()
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <PsychologyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          LicitAI - Especialista em Licitações
        </Typography>
        <Chip label="IA" color="secondary" />
        <Chip label="Beta" color="warning" variant="outlined" />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Análises" />
          <Tab label="Chat Inteligente" />
          <Tab label="Resultados" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderAnalysisCards()}
      {activeTab === 1 && renderChatInterface()}
      {activeTab === 2 && renderAnalysisResults()}
      {activeTab === 3 && <InsightsDashboard />}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload de Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Selecionar Arquivo
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Arquivo selecionado: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!selectedFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LicitaiAnalysisPage;