import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { theme } from './theme'
import '@styles/index.css'
import '@styles/animations.css' // Animaciones globales - Modern Gradient
import './i18n/config' // Initialize i18n
import { initializeLogger } from './utils/loggerSetup' // Sistema de logs
import { initWebVitals } from './utils/webVitals' // Web Vitals monitoring

// Initialize logging system
initializeLogger()

// Initialize Web Vitals monitoring (performance metrics)
initWebVitals()

// Development-only logging
if (import.meta.env.DEV) {
  console.log(
    '%c[DEV] Frontend V4 loaded',
    'background: #6366f1; color: #fff; padding: 5px; font-size: 12px; border-radius: 4px;',
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
