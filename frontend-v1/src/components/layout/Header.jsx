import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ConfirmationNumber as Ticket,
  AttachMoney as DollarSign,
  EmojiEvents as Award,
  Home,
  Store,
  PieChart,
  CreditCard,
  MonetizationOn as Coins,
  Notifications,
  Person,
  ChevronRight,
  ChevronLeft,
  VpnKey,
  Settings,
  Lock,
  Logout
} from '@mui/icons-material';
import { useTime } from '@hooks/useTime';
import LanguageSelector from '@components/common/LanguageSelector';
import ChangePasswordModal from '@components/modals/ChangePasswordModal';
import * as authService from '../../services/authService';
import * as logger from '../../utils/logger';

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
  const navigate = useNavigate();
  const currentTime = useTime();
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = React.useState(false);
  const [hoveredIcon, setHoveredIcon] = React.useState(null);
  const [activeIcon, setActiveIcon] = React.useState(null);
  const openSettings = Boolean(settingsAnchorEl);

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
    setActiveIcon('settings');
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
    setActiveIcon(null);
  };

  const handleChangePassword = () => {
    handleSettingsClose();
    setIsChangePasswordModalOpen(true);
    setActiveIcon('key');
  };

  const handleLogout = () => {
    handleSettingsClose();
    logger.info('LOGOUT', 'User logging out from header');

    // Clear auth token
    authService.logout();

    // Navigate to login page
    navigate('/login');
  };

  const handleClosePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setActiveIcon(null);
  };

  const quickAccessButtons = [
    { Icon: 'nc-box', label: 'Tickets', path: '/tickets/crear' },
    { Icon: 'nc-money-coins', label: 'Ventas', path: '/ventas/dia' },
    { Icon: 'nc-tag-content', label: 'Resultados', path: '/resultados' },
    { Icon: 'nc-ruler-pencil', label: 'Inicio', path: '/' },
    { Icon: 'nc-bullet-list-67', label: 'Bancas', path: '/bancas/lista' },
    { Icon: 'nc-paper', label: 'Balances', path: '/balances/bancas' },
    { Icon: 'nc-shop', label: 'Pagos', path: '/cobros-pagos/lista' },
    { Icon: 'nc-bank', label: 'Sorteos', path: '/sorteos/lista' },
    { Icon: 'nc-credit-card', label: 'Transacciones', path: '/transacciones/lista' },
      { Icon: 'fa-calendar-check', label: 'Horarios', path: '/sorteos/horarios' }
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{ 
        backgroundColor: '#f3f4f6',
                  color: '#66615b',
        height: '60px !important',
        minHeight: '60px !important',
        maxHeight: '60px !important',
        top: 0,
        left: sidebarCollapsed ? '60px' : '280px',
        right: 0,
        width: sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 280px)',
        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ 
        minHeight: '60px !important', 
        height: '60px !important',
        maxHeight: '60px !important',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Botón de toggle del sidebar */}
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            backgroundColor: '#66615b',
            color: 'white',
            marginRight: 2,
            '&:hover': {
              backgroundColor: '#5a5650'
            }
          }}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>

        {/* Iconos de acceso rápido */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {quickAccessButtons.map(({ Icon: IconComp, label, path }, idx) => {
            const isNucleoIcon = typeof IconComp === 'string' && IconComp.startsWith('nc-');
            const isFontAwesomeIcon = typeof IconComp === 'string' && IconComp.startsWith('fa-');
            return (
              <Tooltip key={idx} title={label}>
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    rotate: 45,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                  whileTap={{
                    scale: 0.95,
                    rotate: 0,
                    transition: { duration: 0.1 }
                  }}
                >
                  <IconButton
                    onClick={() => navigate(path)}
                    sx={{
                      color: '#66615b',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        backgroundColor: 'rgba(102, 97, 91, 0.1)'
                      }
                    }}
                  >
                    {isNucleoIcon ? (
                      <i className={`nc-icon ${IconComp}`} style={{ fontSize: '36px' }}></i>
                    ) : isFontAwesomeIcon ? (
                      <i className={`fas ${IconComp}`} style={{ fontSize: '36px' }}></i>
                    ) : (
                      <IconComp sx={{ fontSize: 36 }} />
                    )}
                  </IconButton>
                </motion.div>
              </Tooltip>
            );
          })}
        </Box>

        {/* Espaciador */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Elementos del lado derecho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700,
                color: '#66615b'
              }}
            >
              {currentTime}
            </Typography>
          </div>

          <div>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#66615b',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              oliver
            </Typography>
          </div>

          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: 45,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 15
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            onMouseEnter={() => setHoveredIcon('key')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <IconButton
              onClick={handleChangePassword}
              sx={{
                color: (hoveredIcon === 'key' || activeIcon === 'key') ? '#4dd4d4' : '#66615b',
                '&:hover': {
                  backgroundColor: 'rgba(102, 97, 91, 0.1)',
                  color: '#4dd4d4'
                },
                '&:active': {
                  backgroundColor: '#4dd4d4',
                  color: '#ffffff'
                }
              }}
            >
              <i className="fas fa-key" style={{ fontSize: '28px' }}></i>
            </IconButton>
          </motion.div>

          <motion.div
            whileHover={{
              scale: 1.1,
              rotate: 10,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredIcon('bell')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Box sx={{ position: 'relative' }}>
              <IconButton
                sx={{
                  color: (hoveredIcon === 'bell' || activeIcon === 'bell') ? '#4dd4d4' : '#66615b',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 97, 91, 0.1)',
                    color: '#4dd4d4'
                  }
                }}
              >
                <i className="fas fa-bell" style={{ fontSize: '14px' }}></i>
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '-1px',
                  transform: 'translateY(-50%)',
                  fontSize: '8px',
                  color: (hoveredIcon === 'bell' || activeIcon === 'bell') ? '#4dd4d4' : '#66615b',
                  fontWeight: 'bold'
                }}
              >
                ▼
              </Box>
            </Box>
          </motion.div>
          
          
          <LanguageSelector 
            isHovered={hoveredIcon === 'language'}
            isActive={activeIcon === 'language'}
            onMouseEnter={() => setHoveredIcon('language')}
            onMouseLeave={() => setHoveredIcon(null)}
            onActiveChange={(active) => setActiveIcon(active ? 'language' : null)}
          />
          
          <motion.div
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredIcon('settings')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleSettingsClick}
                sx={{
                  color: (hoveredIcon === 'settings' || activeIcon === 'settings') ? '#4dd4d4' : '#66615b',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 97, 91, 0.1)',
                    color: '#4dd4d4'
                  }
                }}
              >
                <Settings sx={{ fontSize: 16 }} />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '-1px',
                  transform: 'translateY(-50%)',
                  fontSize: '8px',
                  color: (hoveredIcon === 'settings' || activeIcon === 'settings') ? '#4dd4d4' : '#66615b',
                  fontWeight: 'bold'
                }}
              >
                ▼
              </Box>
            </Box>
          </motion.div>
        </div>
      </Toolbar>
      
      {/* Menú desplegable de Settings */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={openSettings}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem onClick={handleChangePassword}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cambiar contraseña</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar sesión</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={handleClosePasswordModal}
      />
    </AppBar>
  );
}
