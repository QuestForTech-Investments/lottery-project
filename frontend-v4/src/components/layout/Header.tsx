import { memo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Home,
  CreditCard,
  MonetizationOn as Coins,
  ChevronRight,
  ChevronLeft,
  Settings,
  Lock,
  Logout,
  Receipt,
  Tag,
  List,
  Description,
  ShoppingCart,
  AccountBalance,
  CalendarMonth,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { useTime } from '@hooks/useTime'
import LanguageSelector from '@components/common/LanguageSelector'
import ChangePasswordModal from '@components/modals/ChangePasswordModal'
import * as authService from '@services/authService'
import * as logger from '@utils/logger'

interface HeaderProps {
  sidebarCollapsed: boolean
  sidebarHovered: boolean
  onToggleSidebar: () => void
}

interface QuickAccessButtonConfig {
  Icon: SvgIconComponent
  label: string
  path: string
}

const TimeDisplay = memo(() => {
  const currentTime = useTime()
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 700,
        color: 'text.primary',
      }}
    >
      {currentTime}
    </Typography>
  )
})

TimeDisplay.displayName = 'TimeDisplay'

interface QuickAccessButtonProps extends QuickAccessButtonConfig {
  index: number
}

const QuickAccessButton = memo(({ Icon, label, path, index }: QuickAccessButtonProps) => {
  const navigate = useNavigate()

  return (
    <Tooltip title={label}>
      <Box
        className="quick-access-button"
        sx={{
          animation: `fadeInDown 0.3s ease-out ${index * 0.05}s both`,
          '@keyframes fadeInDown': {
            '0%': { opacity: 0, transform: 'translateY(-20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <IconButton
          onClick={() => navigate(path)}
          sx={{
            color: 'text.primary',
            width: 56,
            height: 56,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'primary.main',
              transform: 'rotate(45deg) scale(1.05)',
            },
            '&:active': {
              transform: 'rotate(45deg) scale(0.95)',
              transition: 'transform 0.1s',
            },
          }}
        >
          <Icon sx={{ fontSize: 36 }} />
        </IconButton>
      </Box>
    </Tooltip>
  )
})

QuickAccessButton.displayName = 'QuickAccessButton'

const quickAccessButtons: QuickAccessButtonConfig[] = [
  { Icon: Receipt, label: 'Tickets', path: '/tickets/new' },
  { Icon: Coins, label: 'Ventas', path: '/sales/day' },
  { Icon: Tag, label: 'Resultados', path: '/results' },
  { Icon: Home, label: 'Inicio', path: '/' },
  { Icon: List, label: 'Bancas', path: '/betting-pools/list' },
  { Icon: Description, label: 'Balances', path: '/balances/betting-pools' },
  { Icon: ShoppingCart, label: 'Pagos', path: '/collections-payments/list' },
  { Icon: AccountBalance, label: 'Sorteos', path: '/draws/list' },
  { Icon: CreditCard, label: 'Transacciones', path: '/accountable-transactions' },
  { Icon: CalendarMonth, label: 'Horarios', path: '/draws/schedules' },
]

const Header = ({ sidebarCollapsed, sidebarHovered, onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate()
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [activeIcon, setActiveIcon] = useState<string | null>(null)
  const openSettings = Boolean(settingsAnchorEl)

  const handleSettingsClick = (event: MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget)
    setActiveIcon('settings')
  }

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null)
    setActiveIcon(null)
  }

  const handleChangePassword = () => {
    handleSettingsClose()
    setIsChangePasswordModalOpen(true)
    setActiveIcon('key')
  }

  const handleLogout = () => {
    handleSettingsClose()
    logger.info('LOGOUT', 'User logging out from header')
    authService.logout()
    navigate('/login')
  }

  const handleClosePasswordModal = () => {
    setIsChangePasswordModalOpen(false)
    setActiveIcon(null)
  }

  const effectiveSidebarWidth = sidebarCollapsed ? (sidebarHovered ? 280 : 60) : 280

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: '64px !important',
        minHeight: '64px !important',
        maxHeight: '64px !important',
        top: 0,
        left: `${effectiveSidebarWidth}px`,
        right: 0,
        width: `calc(100% - ${effectiveSidebarWidth}px)`,
        transition: 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
        zIndex: 1200,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '64px !important',
          height: '64px !important',
          maxHeight: '64px !important',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            marginRight: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {quickAccessButtons.map(({ Icon: IconComp, label, path }, idx) => (
            <QuickAccessButton key={label} Icon={IconComp} label={label} path={path} index={idx} />
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            animation: 'fadeInRight 0.5s ease-out 0.3s both',
            '@keyframes fadeInRight': {
              '0%': { opacity: 0, transform: 'translateX(20px)' },
              '100%': { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          <Box
            sx={{
              animation: 'fadeIn 0.3s ease-out 0.5s both',
              '@keyframes fadeIn': {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
              },
            }}
          >
            <TimeDisplay />
          </Box>

          <Box
            sx={{
              animation: 'fadeIn 0.3s ease-out 0.6s both',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {authService.getCurrentUser()?.username || 'Usuario'}
            </Typography>
          </Box>

          <Box onMouseEnter={() => setHoveredIcon('key')} onMouseLeave={() => setHoveredIcon(null)}>
            <IconButton
              onClick={handleChangePassword}
              sx={{
                color: hoveredIcon === 'key' || activeIcon === 'key' ? 'primary.main' : 'text.primary',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                  transform: 'scale(1.1) rotate(45deg)',
                },
                '&:active': {
                  backgroundColor: 'primary.main',
                  color: '#ffffff',
                  transform: 'scale(0.95) rotate(45deg)',
                  transition: 'transform 0.1s, background-color 0.1s, color 0.1s',
                },
              }}
            >
              <i className="fas fa-key" style={{ fontSize: '28px' }} />
            </IconButton>
          </Box>

          <Box
            onMouseEnter={() => setHoveredIcon('bell')}
            onMouseLeave={() => setHoveredIcon(null)}
            sx={{ position: 'relative' }}
          >
            <IconButton
              sx={{
                color: hoveredIcon === 'bell' || activeIcon === 'bell' ? 'primary.main' : 'text.primary',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                  transform: 'scale(1.1) rotate(10deg)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                  transition: 'transform 0.1s',
                },
              }}
            >
              <i className="fas fa-bell" style={{ fontSize: '14px' }} />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: '-1px',
                transform: 'translateY(-50%)',
                fontSize: '8px',
                color: hoveredIcon === 'bell' || activeIcon === 'bell' ? 'primary.main' : 'text.primary',
                fontWeight: 'bold',
              }}
            >
              ▼
            </Box>
          </Box>

          <LanguageSelector
            isHovered={hoveredIcon === 'language'}
            isActive={activeIcon === 'language'}
            onMouseEnter={() => setHoveredIcon('language')}
            onMouseLeave={() => setHoveredIcon(null)}
            onActiveChange={(active) => setActiveIcon(active ? 'language' : null)}
          />

          <Box
            onMouseEnter={() => setHoveredIcon('settings')}
            onMouseLeave={() => setHoveredIcon(null)}
            sx={{ position: 'relative' }}
          >
            <IconButton
              onClick={handleSettingsClick}
              sx={{
                color: hoveredIcon === 'settings' || activeIcon === 'settings' ? 'primary.main' : 'text.primary',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                  transform: 'scale(1.1) rotate(45deg)',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                  transition: 'transform 0.1s',
                },
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
                color:
                  hoveredIcon === 'settings' || activeIcon === 'settings' ? 'primary.main' : 'text.primary',
                fontWeight: 'bold',
              }}
            >
              ▼
            </Box>
          </Box>
        </Box>
      </Toolbar>

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
          },
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

      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={handleClosePasswordModal} />
    </AppBar>
  )
}

export default memo(
  Header,
  (prev, next) =>
    prev.sidebarCollapsed === next.sidebarCollapsed && prev.sidebarHovered === next.sidebarHovered,
)
