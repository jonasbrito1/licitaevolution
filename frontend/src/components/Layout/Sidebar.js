import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ user, empresa, onClose, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      permission: null,
    },
    {
      title: 'Editais',
      path: '/editais',
      icon: <DescriptionIcon />,
      permission: 'editais',
      badge: 'Novo',
    },
    {
      title: 'Fornecedores',
      path: '/fornecedores',
      icon: <BusinessIcon />,
      permission: 'fornecedores',
    },
    {
      title: 'Financeiro',
      path: '/financeiro',
      icon: <AttachMoneyIcon />,
      permission: 'financeiro',
    },
    {
      title: 'Compras',
      path: '/compras',
      icon: <ShoppingCartIcon />,
      permission: 'compras',
    },
    {
      title: 'Orçamentos',
      path: '/orcamentos',
      icon: <CalculateIcon />,
      permission: 'orcamentos',
    },
    {
      title: 'Relatórios',
      path: '/relatorios',
      icon: <AssessmentIcon />,
      permission: 'relatorios',
    },
    {
      title: 'LicitAI',
      path: '/licitai',
      icon: <PsychologyIcon />,
      permission: 'licitai',
      badge: 'IA',
      badgeColor: 'secondary',
    },
  ];

  const adminItems = [
    {
      title: 'Configurações',
      path: '/configuracoes',
      icon: <SettingsIcon />,
      roles: ['admin', 'gerente'],
    },
    {
      title: 'Empresa',
      path: '/configuracoes/empresa',
      icon: <BusinessIcon />,
      roles: ['admin'],
    },
    {
      title: 'Usuários',
      path: '/configuracoes/usuarios',
      icon: <GroupIcon />,
      roles: ['admin'],
    },
    {
      title: 'Segurança',
      path: '/configuracoes/seguranca',
      icon: <SecurityIcon />,
      roles: ['admin'],
    },
    {
      title: 'Notificações',
      path: '/configuracoes/notificacoes',
      icon: <NotificationsIcon />,
      roles: ['admin', 'gerente'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const filteredAdminItems = adminItems.filter(item => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  const renderMenuItem = (item) => {
    const active = isActive(item.path);

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          onClick={() => handleNavigate(item.path)}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            color: active ? theme.palette.primary.main : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.action.hover, 0.04),
            },
            '& .MuiListItemIcon-root': {
              color: active ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40,
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontWeight: active ? 600 : 500,
              fontSize: '0.875rem',
            }}
          />
          {item.badge && (
            <Chip
              label={item.badge}
              size="small"
              color={item.badgeColor || 'primary'}
              variant="outlined"
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo e empresa */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            component="svg"
            sx={{ width: 32, height: 32, color: 'primary.main' }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L8.26 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z"/>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.25rem',
            }}
          >
            LicitaEvolution
          </Typography>
        </Box>

        {/* Informações da empresa */}
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {empresa?.razao_social || 'Empresa'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CNPJ: {empresa?.cnpj ? empresa.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : 'N/A'}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={empresa?.porte_empresa || 'ME'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Menu principal */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ py: 2 }}>
          <Typography
            variant="overline"
            sx={{
              px: 3,
              pb: 1,
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            Menu Principal
          </Typography>
          <List dense sx={{ px: 1 }}>
            {filteredMenuItems.map(renderMenuItem)}
          </List>
        </Box>

        {/* Menu administrativo */}
        {filteredAdminItems.length > 0 && (
          <>
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ py: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  pb: 1,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                Administração
              </Typography>
              <List dense sx={{ px: 1 }}>
                {filteredAdminItems.map(renderMenuItem)}
              </List>
            </Box>
          </>
        )}
      </Box>

      {/* Informações do usuário */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {user?.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {user?.email}
          </Typography>
          <Chip
            label={user?.nivel_acesso === 'admin' ? 'Administrador' :
                  user?.nivel_acesso === 'gerente' ? 'Gerente' :
                  user?.nivel_acesso === 'usuario' ? 'Usuário' : 'Visualizador'}
            size="small"
            color={user?.nivel_acesso === 'admin' ? 'error' :
                   user?.nivel_acesso === 'gerente' ? 'primary' : 'default'}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;