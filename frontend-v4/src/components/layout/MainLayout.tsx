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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  // Función para alternar entre colapsado y expandido
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  // El contenido siempre mantiene el margen mínimo (60px)
  // El sidebar se superpone encima del contenido cuando se expande
  const contentMarginLeft = 60

  return (
    <Box sx={{ height: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        hovered={sidebarHovered}
        onToggleCollapse={toggleSidebar}
        onHoverChange={setSidebarHovered}
      />

      <Header
        sidebarCollapsed={sidebarCollapsed}
        sidebarHovered={sidebarHovered}
        onToggleSidebar={toggleSidebar}
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
