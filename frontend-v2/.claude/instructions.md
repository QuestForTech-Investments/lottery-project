# LottoWebApp - Instrucciones para Claude Code

## 📋 Resumen del Proyecto

**LottoWebApp** es una aplicación web moderna de gestión de lotería desarrollada en React 18 con Material-UI (MUI). Permite administrar bancas, sorteos, ventas, resultados y transacciones.

**Estado actual:** Post-migración de Bootstrap a MUI, optimizado y funcionando en producción.

---

## 🏗️ Arquitectura del Sistema

### Entorno de Desarrollo

```
Windows Host (127.0.0.1)
├── LottoApi (Backend)
│   ├── Puerto: 5000
│   ├── Tecnología: Node.js/Express
│   └── Base URL: http://localhost:5000/api
│
└── LottoWebApp (Frontend React)
    ├── Puerto: 4000
    ├── Build: Vite 4.5.14
    └── ⚠️ DEBE CORRER EN WINDOWS (no en WSL)
```

**⚠️ CRÍTICO:** Ver `.claude/dev-environment.md` para detalles sobre problemas de conectividad WSL/Windows.

### Stack Tecnológico

**Frontend:**
- React 18.2.0 (Hooks, Context API)
- Material-UI (MUI) 7.3.4
- React Router DOM 7.1.1
- Vite 4.5.14 (Build tool)
- Framer Motion 11.11.17 (Animaciones)
- i18next (Internacionalización: ES, EN, FR, HT)

**Estado & Data:**
- React Context API (sin Redux)
- Custom Hooks para lógica de negocio
- Fetch API para comunicación con backend

**Estilos:**
- Material-UI con tema personalizado
- Tailwind CSS (configuración disponible)
- Paleta de colores custom (#4dd4d4 - turquesa principal)

---

## 📁 Estructura del Proyecto

```
LottoWebApp/
├── src/
│   ├── components/           # Componentes React
│   │   ├── common/          # Componentes reutilizables
│   │   ├── layout/          # Layout (Header, Sidebar)
│   │   ├── forms/           # Formularios
│   │   └── modals/          # Modales
│   │
│   ├── pages/               # Páginas de la aplicación
│   │   ├── bancas/          # Gestión de bancas
│   │   ├── sorteos/         # Gestión de sorteos
│   │   ├── ventas/          # Ventas diarias
│   │   ├── resultados/      # Resultados de sorteos
│   │   └── ...
│   │
│   ├── services/            # Servicios API
│   │   ├── branchService.js      # CRUD de bancas
│   │   ├── drawService.js        # CRUD de sorteos
│   │   └── ...
│   │
│   ├── hooks/               # Custom Hooks ⭐ EXCELENTE ARQUITECTURA
│   │   ├── useTime.js       # Hook de tiempo actualizado
│   │   ├── useNotification.js
│   │   └── ...
│   │
│   ├── context/             # Contextos de React
│   │   └── ThemeContext.js
│   │
│   ├── utils/               # Utilidades
│   ├── i18n/               # Configuración de idiomas
│   └── App.jsx             # Componente principal
│
├── public/                  # Assets estáticos
├── dist/                    # Build de producción
├── .claude/                 # Configuración de Claude
│   ├── agents/             # Agentes especializados
│   ├── dev-environment.md  # ⚠️ LEER PRIMERO
│   ├── instructions.md     # Este archivo
│   └── project-preferences.md
│
├── vite.config.js          # Configuración de Vite
├── package.json            # Dependencies
└── PERFORMANCE_ANALYSIS_REPORT.md  # Análisis de rendimiento
```

---

## 🎯 Convenciones de Código

### Nombres de Archivos
- **Componentes:** PascalCase - `BranchList.jsx`, `ChangePasswordModal.jsx`
- **Servicios:** camelCase - `branchService.js`, `drawService.js`
- **Hooks:** camelCase con prefijo `use` - `useTime.js`, `useNotification.js`
- **Páginas:** PascalCase - `BranchListPage.jsx`

### Estructura de Componentes

```javascript
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Descripción del componente
 * @param {Object} props - Props del componente
 */
function ComponentName({ prop1, prop2 }) {
  // 1. Hooks de estado
  const [state, setState] = useState(null);

  // 2. Hooks de efectos
  useEffect(() => {
    // Lógica
  }, [dependencies]);

  // 3. Handlers
  const handleAction = () => {
    // Lógica
  };

  // 4. Render
  return (
    <Box>
      <Typography>{/* Contenido */}</Typography>
    </Box>
  );
}

// 5. Memoización si es necesario
export default React.memo(ComponentName);
```

### Servicios API

Todos los servicios siguen este patrón robusto:

```javascript
export const getItems = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}?${queryParams}`);

    // ⚠️ IMPORTANTE: Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || `Error (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('Error en getItems:', error);
    throw error;
  }
};
```

**Razón:** Previene crashes cuando el servidor retorna errores HTML en lugar de JSON.

---

## 🚀 Flujo de Desarrollo

### 1. Iniciar el Proyecto

**⚠️ SIEMPRE en Windows (PowerShell o CMD):**

```powershell
# Terminal 1: Backend
cd H:\GIT\Lottery-Project\LottoApi
npm start

# Terminal 2: Frontend
cd H:\GIT\Lottery-Project\LottoWebApp
npm run dev
```

### 2. Verificar Conexión

**URL Frontend:** http://localhost:4000
**URL Backend:** http://localhost:5000/api

Verificar en los logs que aparezca:
```
Sending Request to the Target: GET /api/...
Received Response from the Target: 200 /api/...
```

### 3. Desarrollo de Features

1. Crear componente en `src/components/` o `src/pages/`
2. Crear servicio en `src/services/` si se necesita API
3. Agregar ruta en `src/App.jsx`
4. Probar en navegador
5. Optimizar con React.memo si es necesario

### 4. Testing

```bash
# Build de producción
npm run build

# Preview del build
npm run preview
```

### 5. Git Workflow

```bash
git add .
git commit -m "Descripción clara del cambio"
git push
```

**Formato de commits:**
- `feat: Agregar nueva funcionalidad`
- `fix: Corregir bug en componente`
- `refactor: Mejorar estructura de código`
- `perf: Optimizar rendimiento`
- `docs: Actualizar documentación`

---

## ⚡ Optimizaciones Aplicadas

### Performance Score: 82/100

**Fase 1 Completada (Octubre 2025):**

1. ✅ **Eliminado lucide-react (~200 KB)**
   - Reemplazado con iconos de Material-UI
   - Commits: 937ea37, 8528597

2. ✅ **Header optimizado con React.memo**
   - Reducción de 60 re-renders/min → 0/min (95%)
   - Ahorro: ~600ms/min CPU
   - Commit: cdfd815

3. ✅ **Corrección de JSON parsing**
   - 6 métodos corregidos en branchService.js
   - Previene crashes con errores HTML
   - Commit: 76070f0

**Bundle Size Actual:**
- Main bundle: 186.20 kB (44.83 kB gzipped)
- MUI vendor: 537.98 kB (166.35 kB gzipped)
- Build time: ~3 minutos

**Fase 2 (Pendiente - Opcional):**
- Lazy loading de rutas
- Code splitting más agresivo
- Virtualización de listas
- Memoización de componentes pesados

---

## 📚 API Endpoints

**Base URL:** `/api` (proxy a `http://localhost:5000/api`)

### Bancas (Betting Pools)
```
GET    /api/betting-pools              # Listar bancas
GET    /api/betting-pools/:id          # Obtener banca
GET    /api/betting-pools/next-code    # Próximo código
POST   /api/betting-pools              # Crear banca
PUT    /api/betting-pools/:id          # Actualizar banca
DELETE /api/betting-pools/:id          # Eliminar banca
GET    /api/betting-pools/:id/users    # Usuarios de banca
```

### Sorteos (Draws)
```
GET    /api/draws                      # Listar sorteos
GET    /api/draws/:id                  # Obtener sorteo
POST   /api/draws                      # Crear sorteo
PUT    /api/draws/:id                  # Actualizar sorteo
DELETE /api/draws/:id                  # Eliminar sorteo
```

**Documentación completa:** Ver backend API V4.0

---

## 🛠️ Comandos Importantes

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 4000)

# Build
npm run build            # Build de producción
npm run preview          # Preview del build

# Utilidades
npm run lint             # Linter (si está configurado)
npm audit                # Verificar vulnerabilidades

# Limpieza
rm -rf node_modules      # Limpiar dependencias
npm install              # Reinstalar dependencias
rm -rf dist              # Limpiar build
```

---

## 🐛 Solución de Problemas Comunes

### 1. Error: "ECONNREFUSED 127.0.0.1:5000"
**Solución:** Ver `.claude/dev-environment.md` - Probablemente React está corriendo en WSL en lugar de Windows.

### 2. Error: "Unexpected end of JSON input"
**Solución:** Verificado que branchService.js tiene el fix (commit 76070f0). Si persiste, verificar backend.

### 3. Puerto 4000 en uso
```powershell
# Windows
netstat -ano | findstr :4000
taskkill /F /PID [PID]
```

### 4. Componente no se actualiza
- Verificar que las dependencias de useEffect estén correctas
- Considerar usar React.memo si el componente se re-renderiza innecesariamente

### 5. Build falla
```bash
# Limpiar y rebuildar
rm -rf dist node_modules
npm install
npm run build
```

---

## 📖 Referencias Importantes

### Archivos de Configuración Claude
- **`.claude/dev-environment.md`** - ⚠️ LEER PRIMERO - Configuración Windows/WSL
- **`.claude/project-preferences.md`** - Preferencias del proyecto
- **`.claude/agents/react-performance-optimization.md`** - Agente de optimización

### Documentación del Proyecto
- **`PERFORMANCE_ANALYSIS_REPORT.md`** - Análisis completo de rendimiento (38 páginas)
- **`README.md`** - Documentación general del proyecto

### Documentación Externa
- [React 18 Docs](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [React Router v7](https://reactrouter.com/)

---

## 🎨 Tema y Estilos

### Colores Principales
```javascript
primary: '#4dd4d4'      // Turquesa principal
secondary: '#66615b'    // Gris oscuro
background: '#f3f4f6'   // Gris claro
```

### Breakpoints MUI
```javascript
xs: 0px      // Extra small
sm: 600px    // Small
md: 900px    // Medium
lg: 1200px   // Large
xl: 1536px   // Extra large
```

### Sidebar
- Expandido: 280px
- Colapsado: 60px
- Transición: cubic-bezier(0.4, 0.0, 0.2, 1)

---

## ✅ Checklist para Nuevas Features

1. [ ] Crear componente siguiendo convenciones
2. [ ] Crear servicio API si es necesario (con verificación de JSON)
3. [ ] Agregar ruta en App.jsx
4. [ ] Agregar traducción en i18n (ES, EN, FR, HT)
5. [ ] Optimizar con React.memo si tiene re-renders
6. [ ] Probar en localhost:4000
7. [ ] Verificar build con `npm run build`
8. [ ] Commit con mensaje descriptivo
9. [ ] Actualizar documentación si es necesario

---

## 🚨 Reglas Importantes

1. **NUNCA** correr `npm run dev` en WSL - Solo en Windows
2. **SIEMPRE** verificar content-type antes de parsear JSON en servicios
3. **USAR** React.memo para componentes que se re-renderizan innecesariamente
4. **MANTENER** la arquitectura de custom hooks - Es excelente
5. **NO ROMPER** la compatibilidad con i18n - Soportar 4 idiomas
6. **COMMITEAR** cambios frecuentemente con mensajes claros
7. **VERIFICAR** que el build funcione antes de commitear

---

## 📊 Métricas Actuales

- **Bundle Size:** 186.20 kB (gzipped: 44.83 kB)
- **Performance Score:** 82/100
- **Maintainability:** 85/100
- **Dependencies:** 0 vulnerabilidades
- **Build Time:** ~3 minutos
- **Componentes:** 32
- **Custom Hooks:** 14
- **Páginas:** 15+
- **Idiomas:** 4 (ES, EN, FR, HT)

---

## 💡 Consejos para Claude

- **Leer primero:** `.claude/dev-environment.md` en cada sesión
- **Usar agente:** `react-performance-optimization` para optimizaciones
- **Seguir patrón:** De servicios API con verificación de JSON
- **Priorizar:** Mantenibilidad sobre cleverness
- **Documentar:** Cambios significativos en commits
- **Preguntar:** Si hay ambigüedad en los requisitos

---

**Última actualización:** Octubre 2025
**Mantenedor:** Equipo LottoWebApp
**Contacto:** Ver project-preferences.md
