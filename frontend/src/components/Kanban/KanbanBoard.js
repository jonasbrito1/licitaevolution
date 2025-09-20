import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  DragIndicator as DragIndicatorIcon,
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanCard = ({ edital, index, onCardAction }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

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
      novo: theme.palette.grey[500],
      analisando: theme.palette.info.main,
      analisado: theme.palette.success.main,
      participando: theme.palette.warning.main,
      finalizado: theme.palette.primary.main,
      cancelado: theme.palette.error.main,
    };
    return colors[status] || theme.palette.grey[500];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    if (score >= 40) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  return (
    <Draggable draggableId={edital.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            boxShadow: snapshot.isDragging ? theme.shadows[8] : theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
            border: `1px solid ${alpha(getStatusColor(edital.status), 0.3)}`,
            borderLeft: `4px solid ${getStatusColor(edital.status)}`,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Box {...provided.dragHandleProps} sx={{ cursor: 'grab', mr: 1 }}>
                <DragIndicatorIcon color="action" fontSize="small" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {edital.numero_edital}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {edital.orgao_nome}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.2,
                fontSize: '0.8rem',
              }}
              title={edital.objeto}
            >
              {edital.objeto}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip
                label={edital.modalidade}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
              {edital.score_viabilidade && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PsychologyIcon
                    sx={{
                      fontSize: 14,
                      color: getScoreColor(edital.score_viabilidade)
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: getScoreColor(edital.score_viabilidade)
                    }}
                  >
                    {edital.score_viabilidade}%
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {formatarData(edital.data_abertura)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.success.main,
                  fontSize: '0.7rem'
                }}
              >
                {formatarMoeda(edital.valor_estimado)}
              </Typography>
            </Box>
          </CardContent>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { onCardAction('view', edital); setAnchorEl(null); }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Visualizar
            </MenuItem>
            <MenuItem onClick={() => { onCardAction('edit', edital); setAnchorEl(null); }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={() => { onCardAction('analyze', edital); setAnchorEl(null); }}>
              <PsychologyIcon fontSize="small" sx={{ mr: 1 }} />
              Analisar IA
            </MenuItem>
            <MenuItem onClick={() => { onCardAction('delete', edital); setAnchorEl(null); }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
              Excluir
            </MenuItem>
          </Menu>
        </Card>
      )}
    </Draggable>
  );
};

const KanbanColumn = ({ column, editais, onCardAction }) => {
  const theme = useTheme();

  const getColumnColor = (status) => {
    const colors = {
      novo: theme.palette.grey[100],
      analisando: alpha(theme.palette.info.main, 0.1),
      analisado: alpha(theme.palette.success.main, 0.1),
      participando: alpha(theme.palette.warning.main, 0.1),
      finalizado: alpha(theme.palette.primary.main, 0.1),
      cancelado: alpha(theme.palette.error.main, 0.1),
    };
    return colors[status] || theme.palette.grey[100];
  };

  const getColumnHeaderColor = (status) => {
    const colors = {
      novo: theme.palette.grey[600],
      analisando: theme.palette.info.main,
      analisado: theme.palette.success.main,
      participando: theme.palette.warning.main,
      finalizado: theme.palette.primary.main,
      cancelado: theme.palette.error.main,
    };
    return colors[status] || theme.palette.grey[600];
  };

  return (
    <Paper
      sx={{
        minHeight: 600,
        backgroundColor: getColumnColor(column.id),
        p: 1,
        borderRadius: 2,
        border: `1px solid ${alpha(getColumnHeaderColor(column.id), 0.2)}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          p: 1,
          backgroundColor: alpha(getColumnHeaderColor(column.id), 0.1),
          borderRadius: 1,
          border: `1px solid ${alpha(getColumnHeaderColor(column.id), 0.3)}`,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: getColumnHeaderColor(column.id),
          }}
        >
          {column.title}
        </Typography>
        <Avatar
          sx={{
            width: 24,
            height: 24,
            fontSize: '0.75rem',
            backgroundColor: getColumnHeaderColor(column.id),
          }}
        >
          {editais.length}
        </Avatar>
      </Box>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              minHeight: 500,
              backgroundColor: snapshot.isDraggingOver
                ? alpha(getColumnHeaderColor(column.id), 0.15)
                : 'transparent',
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              p: 0.5,
            }}
          >
            {editais.map((edital, index) => (
              <KanbanCard
                key={edital.id}
                edital={edital}
                index={index}
                onCardAction={onCardAction}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

const KanbanBoard = ({ editais, onDragEnd, onCardAction }) => {
  const columns = [
    { id: 'novo', title: 'Novos' },
    { id: 'analisando', title: 'Em Análise' },
    { id: 'analisado', title: 'Analisado' },
    { id: 'participando', title: 'Participando' },
    { id: 'finalizado', title: 'Finalizado' },
    { id: 'cancelado', title: 'Cancelado' },
  ];

  const groupEditaisByStatus = () => {
    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = editais.filter(edital => edital.status === column.id);
    });
    return grouped;
  };

  const groupedEditais = groupEditaisByStatus();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
          p: 2,
          overflowX: 'auto',
        }}
      >
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            editais={groupedEditais[column.id]}
            onCardAction={onCardAction}
          />
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;