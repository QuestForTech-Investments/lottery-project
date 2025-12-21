import { useState, Suspense, type ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'

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
  // sidebarPinned = false: modo automático (se expande/contrae con hover, contenido fijo en 60px)
  // sidebarPinned = true: modo fijo (sidebar expandido, contenido desplazado a 280px)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  // Alternar entre modo automático y modo fijo
  const toggleSidebarPin = () => {
    setSidebarPinned((prev) => !prev)
  }

  // En modo fijo: contenido a 280px. En modo automático: contenido fijo a 60px
  const contentMarginLeft = sidebarPinned ? 280 : 60

  return (
    <Box sx={{ height: '100vh' }}>
      <Sidebar
        collapsed={!sidebarPinned}
        hovered={sidebarHovered}
        onToggleCollapse={toggleSidebarPin}
        onHoverChange={setSidebarHovered}
      />

      <Header
        sidebarCollapsed={!sidebarPinned}
        sidebarHovered={sidebarHovered}
        onToggleSidebar={toggleSidebarPin}
      />

      <Box
        component="main"
        sx={{
          marginLeft: `${contentMarginLeft}px`,
          marginTop: '64px',
          padding: 2,
          backgroundColor: '#f4f3ef',
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      >
        <Suspense fallback={<ContentLoadingFallback />}>{children}</Suspense>
      </Box>
    </Box>
  )
}
