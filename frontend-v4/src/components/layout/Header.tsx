import { memo, useState, useEffect, type MouseEvent } from 'react'
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
  Badge,
} from '@mui/material'
import {
  Home,
  CreditCard,
  MonetizationOn as Coins,
  ChevronRight,
  ChevronLeft,
  Menu as MenuIcon,
  Lock,
  Logout,
  Receipt,
  Tag,
  List,
  Description,
  ShoppingCart,
  AccountBalance,
  CalendarMonth,
  Schedule,
  Notifications,
  NotificationsActive,
  ArrowDropDown,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { useTimezone } from '@hooks/useTimezone'
import LanguageSelector from '@components/common/LanguageSelector'
import ChangePasswordModal from '@components/modals/ChangePasswordModal'
import TimezoneModal from '@components/modals/TimezoneModal'
import * as authService from '@services/authService'
import { getWarningCount } from '@services/warningService'
import * as logger from '@utils/logger'

interface HeaderProps {
  sidebarCollapsed: boolean
  sidebarHovered: boolean
  onToggleSidebar: () => void
  isMobile?: boolean
}

interface QuickAccessButtonConfig {
  Icon: SvgIconComponent
  label: string
  path: string
}

const TimeDisplay = memo(() => {
  const { getCurrentTime, timezoneLabel } = useTimezone()
  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [getCurrentTime])

  return (
    <Tooltip title={`Zona horaria: ${timezoneLabel}`}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '13px',
          color: 'text.primary',
          cursor: 'default',
        }}
      >
        {currentTime}
      </Typography>
    </Tooltip>
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
            width: 40,
            height: 40,
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
          <Icon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
    </Tooltip>
  )
})

QuickAccessButton.displayName = 'QuickAccessButton'

const quickAccessButtons: QuickAccessButtonConfig[] = []

const Header = ({ sidebarCollapsed, sidebarHovered, onToggleSidebar, isMobile = false }: HeaderProps) => {
  const navigate = useNavigate()
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [activeIcon, setActiveIcon] = useState<string | null>(null)
  const [warningCount, setWarningCount] = useState<number>(0)
  const openSettings = Boolean(settingsAnchorEl)

  useEffect(() => {
    let cancelled = false
    const fetchCount = async () => {
      try {
        const count = await getWarningCount()
        if (!cancelled) setWarningCount(count)
      } catch (err) {
        // Silent fail — badge just stays at last value
      }
    }
    fetchCount()
    const timer = setInterval(fetchCount, 60_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const handleSettingsClick = (event: MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget)
    setActiveIcon('user')
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

  const handleTimezone = () => {
    handleSettingsClose()
    setIsTimezoneModalOpen(true)
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

  // En móvil: header a ancho completo (left: 0)
  // En modo fijo (sidebarCollapsed=false): header a 280px
  // En modo automático (sidebarCollapsed=true): header fijo a 91px
  const headerMarginLeft = isMobile ? 0 : (sidebarCollapsed ? 91 : 280)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: '64px !important',
        minHeight: '64px !important',
        maxHeight: '64px !important',
        top: 0,
        left: `${headerMarginLeft}px`,
        right: 0,
        width: `calc(100% - ${headerMarginLeft}px)`,
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
        {/* Mobile-only menu toggle button */}
        {isMobile && (
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              background: 'linear-gradient(135deg, #319795 0%, #2c7a7b 100%)',
              color: 'white',
              marginLeft: '1px',
              marginRight: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Quick access buttons - hidden on mobile */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {quickAccessButtons.map(({ Icon: IconComp, label, path }, idx) => (
              <QuickAccessButton key={label} Icon={IconComp} label={label} path={path} index={idx} />
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Centered warnings bell */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Tooltip title={warningCount > 0 ? `${warningCount} advertencia(s) hoy` : 'Sin advertencias'}>
              <IconButton
                onClick={() => navigate('/warnings')}
                onMouseEnter={() => setHoveredIcon('bell')}
                onMouseLeave={() => setHoveredIcon(null)}
                sx={{
                  p: 0.75,
                  color:
                    warningCount > 0
                      ? '#d32f2f'
                      : hoveredIcon === 'bell'
                        ? 'primary.main'
                        : 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor:
                      warningCount > 0 ? 'rgba(211, 47, 47, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                <Badge
                  badgeContent={warningCount}
                  max={99}
                  color="error"
                  overlap="circular"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '9px',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  {warningCount > 0 ? (
                    <NotificationsActive sx={{ fontSize: 20 }} />
                  ) : (
                    <Notifications sx={{ fontSize: 20 }} />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            animation: 'fadeInRight 0.5s ease-out 0.3s both',
            '@keyframes fadeInRight': {
              '0%': { opacity: 0, transform: 'translateX(20px)' },
              '100%': { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          {/* Time */}
          <Box sx={{ animation: 'fadeIn 0.3s ease-out 0.5s both', '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }}>
            <TimeDisplay />
          </Box>

          {/* Language selector */}
          {!isMobile && (
            <LanguageSelector
              isHovered={hoveredIcon === 'language'}
              isActive={activeIcon === 'language'}
              onMouseEnter={() => setHoveredIcon('language')}
              onMouseLeave={() => setHoveredIcon(null)}
              onActiveChange={(active) => setActiveIcon(active ? 'language' : null)}
            />
          )}

          {/* User menu */}
          <Tooltip title="Cuenta">
            <Box
              onClick={handleSettingsClick}
              onMouseEnter={() => setHoveredIcon('user')}
              onMouseLeave={() => setHoveredIcon(null)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #51cbce 0%, #45b8bb 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                {(authService.getCurrentUser()?.username || 'U').charAt(0)}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: hoveredIcon === 'user' || openSettings ? 'primary.main' : 'text.primary',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                {authService.getCurrentUser()?.username || 'Usuario'}
              </Typography>
              <ArrowDropDown
                sx={{
                  fontSize: 18,
                  color: hoveredIcon === 'user' || openSettings ? 'primary.main' : 'text.primary',
                  transition: 'transform 0.2s',
                  transform: openSettings ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </Box>
          </Tooltip>
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
        <MenuItem onClick={handleTimezone}>
          <ListItemIcon>
            <Schedule fontSize="small" />
          </ListItemIcon>
          <ListItemText>Zona horaria</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar sesión</ListItemText>
        </MenuItem>
      </Menu>

      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={handleClosePasswordModal} />
      <TimezoneModal isOpen={isTimezoneModalOpen} onClose={() => setIsTimezoneModalOpen(false)} />
    </AppBar>
  )
}

export default memo(
  Header,
  (prev, next) =>
    prev.sidebarCollapsed === next.sidebarCollapsed && prev.sidebarHovered === next.sidebarHovered,
)
