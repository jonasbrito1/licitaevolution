import React, { useState } from 'react';
import {
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick, user, empresa, showMenuButton = false }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    return user.nome
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleLabel = (nivel) => {
    const roles = {
      admin: 'Administrador',
      gerente: 'Gerente',
      usuario: 'Usuário',
      visualizador: 'Visualizador',
    };
    return roles[nivel] || nivel;
  };

  const getRoleColor = (nivel) => {
    const colors = {
      admin: 'error',
      gerente: 'primary',
      usuario: 'success',
      visualizador: 'default',
    };
    return colors[nivel] || 'default';
  };

  return (
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      {/* Menu toggle e título */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {showMenuButton && (
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box>
          <Typography variant="h6" noWrap component="div">
            {empresa?.razao_social || 'LicitaEvolution'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Sistema ERP para Licitações Públicas
          </Typography>
        </Box>
      </Box>

      {/* Ações do usuário */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Informações do usuário - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, mr: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.nome}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                label={getRoleLabel(user?.nivel_acesso)}
                size="small"
                color={getRoleColor(user?.nivel_acesso)}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        {/* Notificações */}
        <Tooltip title="Notificações">
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Menu do usuário */}
        <Tooltip title="Conta do usuário">
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.dark',
                width: 40,
                height: 40,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menu de perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 220,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Informações do usuário */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {user?.email}
          </Typography>
          <Chip
            label={getRoleLabel(user?.nivel_acesso)}
            size="small"
            color={getRoleColor(user?.nivel_acesso)}
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>

        <Divider />

        <MenuItem onClick={() => handleNavigate('/perfil')}>
          <PersonIcon sx={{ mr: 1 }} />
          Meu Perfil
        </MenuItem>

        <MenuItem onClick={() => handleNavigate('/configuracoes')}>
          <SettingsIcon sx={{ mr: 1 }} />
          Configurações
        </MenuItem>

        {user?.nivel_acesso === 'admin' && (
          <MenuItem onClick={() => handleNavigate('/configuracoes/empresa')}>
            <BusinessIcon sx={{ mr: 1 }} />
            Empresa
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>

      {/* Menu de notificações */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notificações
          </Typography>
        </Box>
        <Divider />

        {/* Lista de notificações - exemplo */}
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Novo edital analisado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edital PE001/2024 foi processado com sucesso
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Atualização de preços
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Planilha de custos atualizada
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Lembrete de prazo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Proposta vence em 2 dias
            </Typography>
          </Box>
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            Ver todas as notificações
          </Typography>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;