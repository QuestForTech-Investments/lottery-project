import { useState, Suspense, type ReactNode } from 'react'
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'
import useSessionTimeout from '../../hooks/useSessionTimeout'

// Minimal loading indicator for content area only
const ContentLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%'
    }}
  >
    <CircularProgress size={40} sx={{ color: '#4dd4d4' }} />
  </Box>
)

interface MainLayoutProps {
  children?: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme()
  // `md` (≤900px) catches phones in any orientation and small tablets in
  // portrait — the sidebar collapses to a drawer below this width.
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Idle auto-logout. Reads the per-user value cached on login (set by
  // authService). Semantics:
  //   missing / not a number → 15 min default (preserves prior behavior)
  //   0                      → disabled (hook treats non-positive as off)
  //   > 0                    → log out after that many idle minutes
  const cachedAutoLogout = localStorage.getItem('autoLogoutMinutes')
  const autoLogoutMinutes = cachedAutoLogout !== null && !Number.isNaN(Number(cachedAutoLogout))
    ? Number(cachedAutoLogout)
    : 15
  useSessionTimeout({ timeoutMs: autoLogoutMinutes * 60 * 1000 })

  // sidebarPinned = false: modo automático (se expande/contrae con hover, contenido fijo en 60px)
  // sidebarPinned = true: modo fijo (sidebar expandido, contenido desplazado a 280px)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false)

  // Alternar entre modo automático y modo fijo
  const toggleSidebarPin = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setSidebarPinned((prev) => !prev)
    }
  }

  // En modo fijo: contenido a 280px. En modo automático: contenido fijo a 91px
  // En móvil: sin margen (sidebar oculto)
  const contentMarginLeft = isMobile ? 0 : (sidebarPinned ? 280 : 91)

  return (
    <Box sx={{ height: '100vh' }}>
      <Sidebar
        collapsed={!sidebarPinned}
        hovered={sidebarHovered}
        onToggleCollapse={toggleSidebarPin}
        onHoverChange={setSidebarHovered}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        sidebarCollapsed={!sidebarPinned}
        sidebarHovered={sidebarHovered}
        onToggleSidebar={toggleSidebarPin}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          marginLeft: `${contentMarginLeft}px`,
          marginTop: '64px',
          padding: { xs: 1.5, sm: 2 },
          backgroundColor: '#f4f3ef',
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      >
        <Suspense fallback={<ContentLoadingFallback />}>{children}</Suspense>
      </Box>
    </Box>
  )
}
