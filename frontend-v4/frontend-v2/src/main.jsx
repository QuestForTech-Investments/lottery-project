import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import { theme } from './theme/index.js'
import '@styles/index.css'
import '@styles/animations.css' // Animaciones globales - Modern Gradient
import './i18n/config' // Inicializar i18n
import { initializeLogger } from './utils/loggerSetup' // Sistema de logs
import { initWebVitals } from './utils/webVitals' // Web Vitals monitoring

// Initialize logging system
initializeLogger()

// Initialize Web Vitals monitoring (performance metrics)
initWebVitals()

// 🔥 CODE VERSION CHECK - 2025-10-25 16:00 🔥
console.log('%c🔥🔥🔥 FRONTEND V2 (OPTIMIZED) - CODE VERSION 4.5-ZONES-FIXED LOADED 🔥🔥🔥', 'background: #0066ff; color: #fff; padding: 10px; font-size: 20px; font-weight: bold;')
console.log('%c✅ FIXED: Zones now loading correctly (PascalCase support)', 'background: #00cc00; color: #fff; padding: 5px; font-size: 16px; font-weight: bold;')
console.log('%c✅ FIXED: Edit user CORS error resolved!', 'background: #00cc00; color: #fff; padding: 5px; font-size: 16px; font-weight: bold;')
console.log('%c✅ Optimized architecture with hooks and modular components', 'background: #9900ff; color: #fff; padding: 5px; font-size: 16px; font-weight: bold;')
console.log('%cIf you see this message, v2 code has been updated!', 'background: #00ff00; color: #000; padding: 5px; font-size: 16px;')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

