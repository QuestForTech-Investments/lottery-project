# Configuración del Entorno de Desarrollo

## Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│           Windows Host                   │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  LottoApi (Backend)             │    │
│  │  Puerto: 5000                   │    │
│  │  Bind: 127.0.0.1:5000          │    │
│  │  (Solo acepta conexiones local)│    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  LottoWebApp (Frontend React)   │    │
│  │  Puerto: 4000                   │    │
│  │  DEBE CORRER EN WINDOWS         │    │
│  │  Comando: npm run dev           │    │
│  └────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              WSL (Linux)                 │
│                                          │
│  ❌ NO CORRER React aquí                │
│  Razón: No puede conectar a             │
│         127.0.0.1:5000 de Windows       │
│                                          │
│  ✅ OK para: Git, edición de código     │
└─────────────────────────────────────────┘
```

## ⚠️ IMPORTANTE: Problema de Conectividad WSL ↔ Windows

### El Problema
- La API backend corre en **Windows** en `127.0.0.1:5000`
- WSL tiene su propia red aislada con su propio `127.0.0.1`
- Si React corre en WSL, NO puede conectarse a la API de Windows
- Error típico: `ECONNREFUSED 127.0.0.1:5000` o `Unexpected end of JSON input`

### La Solución
**SIEMPRE correr el servidor de desarrollo React en Windows:**

```powershell
# En PowerShell o CMD (Windows)
cd H:\GIT\Lottery-Project\LottoWebApp
npm run dev
```

**NO correr en WSL:**
```bash
# ❌ NO HACER ESTO
cd /mnt/h/GIT/Lottery-Project/LottoWebApp
npm run dev
```

## Estructura del Proyecto

```
H:\GIT\Lottery-Project\
├── LottoApi/              # Backend API (Node.js/Express)
│   └── Puerto: 5000
└── LottoWebApp/           # Frontend React (Vite)
    └── Puerto: 4000
```

## Configuración del Proxy

**Archivo:** `LottoWebApp/vite.config.js`

```javascript
server: {
  port: 4000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Este proxy funciona correctamente SOLO cuando React corre en Windows.

## Comandos de Desarrollo

### Iniciar Backend (Windows)
```powershell
cd H:\GIT\Lottery-Project\LottoApi
npm start
```

### Iniciar Frontend (Windows)
```powershell
cd H:\GIT\Lottery-Project\LottoWebApp
npm run dev
```

### Build de Producción
```powershell
cd H:\GIT\Lottery-Project\LottoWebApp
npm run build
```

## Verificar que la API esté corriendo

```powershell
# Desde PowerShell (Windows)
netstat -ano | findstr :5000

# Debería mostrar:
# TCP    127.0.0.1:5000         0.0.0.0:0              LISTENING       [PID]
```

## Endpoints de la API

**Base URL:** `http://localhost:5000/api`

Principales endpoints:
- `GET /api/betting-pools` - Listar bancas
- `GET /api/betting-pools/:id` - Obtener banca por ID
- `POST /api/betting-pools` - Crear banca
- `PUT /api/betting-pools/:id` - Actualizar banca
- `DELETE /api/betting-pools/:id` - Eliminar banca

## Solución de Problemas

### Error: "ECONNREFUSED 127.0.0.1:5000"
- ✅ Verificar que la API esté corriendo en Windows
- ✅ Verificar que React esté corriendo en Windows (NO en WSL)
- ✅ Verificar que no haya firewalls bloqueando el puerto 5000

### Error: "Unexpected end of JSON input"
- ✅ Verificado: `branchService.js` tiene manejo robusto de JSON (commit 76070f0)
- ✅ Este error ya está solucionado con la verificación de content-type

### El servidor no inicia en el puerto 4000
- Verificar que el puerto no esté en uso: `netstat -ano | findstr :4000`
- Matar el proceso si está bloqueado

## Historial de Optimizaciones

### Fase 1 Completada (Octubre 2025)
1. ✅ Eliminado lucide-react (~200 KB) - Commits: 937ea37, 8528597
2. ✅ Optimizado Header con React.memo (95% reducción re-renders) - Commit: cdfd815
3. ✅ Corregido JSON parsing en branchService.js (6 métodos) - Commit: 76070f0
4. ✅ Configurado entorno Windows para desarrollo

**Bundle Size:** 186.20 kB (44.83 kB gzipped)
**Performance Score:** 82/100
**Build Time:** ~3 minutos

## Referencias

- Análisis completo de rendimiento: `PERFORMANCE_ANALYSIS_REPORT.md`
- Documentación API: Backend V4.0 (endpoints `/api/betting-pools`)
- React DevTools: Profiler habilitado para análisis de renders
