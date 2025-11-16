import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Función para alternar entre colapsado y expandido
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <Box sx={{ height: '100vh' }}>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar} 
      />
      
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={toggleSidebar}
      />
      
      <Box 
        component="main" 
        sx={{ 
          marginLeft: sidebarCollapsed ? '60px' : '280px',
          marginTop: '60px',
          padding: 2,
          backgroundColor: '#f4f3ef',
          minHeight: 'calc(100vh - 60px)',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
