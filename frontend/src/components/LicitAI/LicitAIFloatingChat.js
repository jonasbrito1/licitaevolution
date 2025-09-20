import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Minimize as MinimizeIcon,
  OpenInFull as ExpandIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LicitAIFloatingChat = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Olá ${user?.nome?.split(' ')[0] || 'usuário'}! 👋 Sou a LicitAI, sua assistente especializada em licitações. Como posso ajudá-lo hoje?`,
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Simular chamada para API da LicitAI
      const response = await fetch('/api/licitai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: message,
          context: 'chat_floating',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Erro ao processar mensagem');
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickActions = [
    { label: 'Analisar Edital', action: 'analisar_edital' },
    { label: 'Calcular Score', action: 'calcular_score' },
    { label: 'Revisar Proposta', action: 'revisar_proposta' },
    { label: 'Ajuda Geral', action: 'ajuda_geral' },
  ];

  const handleQuickAction = (action) => {
    const actionMessages = {
      analisar_edital: 'Quero analisar um edital com a LicitAI',
      calcular_score: 'Preciso calcular o score de viabilidade de um edital',
      revisar_proposta: 'Gostaria de revisar uma proposta com a LicitAI',
      ajuda_geral: 'Preciso de ajuda geral sobre licitações',
    };

    setMessage(actionMessages[action] || 'Como posso ajudar?');
  };

  return (
    <>
      {/* Botão Flutuante */}
      <Zoom in={true}>
        <Fab
          color="secondary"
          aria-label="LicitAI Chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease-in-out',
            boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
          }}
        >
          <Tooltip title="Conversar com LicitAI" placement="left">
            <PsychologyIcon sx={{ fontSize: 28 }} />
          </Tooltip>
        </Fab>
      </Zoom>

      {/* Dialog do Chat */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: isMinimized ? 'auto' : '70vh',
            maxHeight: '70vh',
            background: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            color: 'white',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 40,
                height: 40,
              }}
            >
              <PsychologyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                LicitAI
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Assistente Inteligente em Licitações
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: 'white', mr: 1 }}
            >
              {isMinimized ? <ExpandIcon /> : <MinimizeIcon />}
            </IconButton>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {!isMinimized && (
          <>
            {/* Área de Mensagens */}
            <DialogContent
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 0,
                background: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Ações Rápidas */}
                {messages.length === 1 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Ações rápidas:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {quickActions.map((action) => (
                        <Chip
                          key={action.action}
                          label={action.label}
                          onClick={() => handleQuickAction(action.action)}
                          variant="outlined"
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                              borderColor: theme.palette.secondary.main,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Lista de Mensagens */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          maxWidth: '80%',
                          backgroundColor: msg.type === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                          color: msg.type === 'user' ? 'white' : 'text.primary',
                          borderRadius: msg.type === 'user'
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                            textAlign: msg.type === 'user' ? 'right' : 'left',
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}

                  {/* Indicador de digitação */}
                  {isTyping && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '18px 18px 18px 4px',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {[...Array(3)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.text.secondary,
                                animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                                '@keyframes bounce': {
                                  '0%, 80%, 100%': {
                                    transform: 'scale(0)',
                                  },
                                  '40%': {
                                    transform: 'scale(1)',
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
              </Box>
            </DialogContent>

            {/* Área de Input */}
            <DialogActions
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  variant="outlined"
                  size="small"
                  disabled={isTyping}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    borderRadius: 2,
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default LicitAIFloatingChat;