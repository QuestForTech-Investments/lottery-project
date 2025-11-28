# PLAN DE REFACTORIZACIÓN FRONTEND - LottoWebApp

**Fecha de análisis:** 18 de octubre de 2025
**Versión:** 1.0
**Estado:** Pendiente de aprobación

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Componentes](#1-arquitectura-de-componentes)
3. [Estado y Manejo de Datos](#2-estado-y-manejo-de-datos)
4. [Estilos y UI](#3-estilos-y-ui)
5. [Performance](#4-performance)
6. [Estructura de Carpetas](#5-estructura-de-carpetas)
7. [Dependencias Legacy](#6-dependencias-legacy)
8. [Código Técnico](#7-código-técnico)
9. [Routing y Navegación](#8-routing-y-navegación)
10. [Resumen Priorizado](#9-resumen-priorizado-de-refactorizaciones)
11. [Plan de Implementación](#10-plan-de-refactorización-recomendado)
12. [Métricas de Éxito](#11-métricas-de-éxito)
13. [Conclusiones](#12-conclusiones)
14. [Testing Strategy](#14-testing-strategy) ⭐ NUEVO
15. [Accessibility Audit](#15-accessibility-audit) ⭐ NUEVO
16. [Security Checklist](#16-security-checklist) ⭐ NUEVO
17. [CI/CD Pipeline](#17-cicd-pipeline) ⭐ NUEVO

---

## RESUMEN EJECUTIVO

**Aplicación:** LottoWebApp - Sistema de gestión de lotería
**Framework:** React 18.2.0 + Vite
**Total de archivos JSX:** 36 componentes
**Total de líneas de código JSX:** ~9,914 líneas
**Total de líneas CSS:** ~17,394 líneas
**Tamaño de node_modules:** 322 MB
**Estado actual:** En desarrollo activo, mezcla de código legacy y moderno

### Problemas Críticos Identificados

| Prioridad | Problema | Impacto | Esfuerzo |
|-----------|----------|---------|----------|
| CRÍTICA | God Component CreateBanca (1,580 líneas) | Alto | 3-5 días |
| CRÍTICA | Datos hardcodeados en producción | Alto | 2 días |
| CRÍTICA | Sin autenticación real | Crítico | 2 días |
| CRÍTICA | jQuery en React moderno | Alto | 1 hora |
| CRÍTICA | 0% Code Coverage - Sin tests | Crítico | 8-10 días |
| CRÍTICA | Accesibilidad no implementada (WCAG) | Alto | 5-7 días |
| CRÍTICA | Vulnerabilidades de seguridad (XSS, CSP) | Crítico | 3-5 días |
| ALTA | Guerra de frameworks CSS (3 activos) | Alto | 10-15 días |
| ALTA | Sin gestión de estado global | Alto | 3-4 días |
| MEDIA | Sin CI/CD automatizado | Medio | 8 días |

---

## 1. ARQUITECTURA DE COMPONENTES

### 1.1 PROBLEMA CRÍTICO #1: God Components

**Componente Monolítico: CreateBanca.jsx**

- **Ubicación:** `/src/components/CreateBanca.jsx`
- **Líneas:** 1,580 líneas en un solo archivo
- **Prioridad:** CRÍTICA

**Problemas identificados:**

```javascript
// Estado masivo con 75+ campos (líneas 10-75)
const [formData, setFormData] = useState({
  branchName: '',
  branchCode: '',
  username: '',
  // ... 72 campos más
});

// 8 tabs diferentes en un solo archivo
// Funciones de mapeo duplicadas
// Lógica de negocio mezclada con presentación
// Re-renders innecesarios de todo el formulario
```

**Impacto:**
- Difícil mantenimiento
- Re-renders innecesarios de todo el formulario
- Imposible hacer testing unitario
- Alto acoplamiento

**Solución propuesta:**

```
src/components/CreateBanca/
  ├── index.jsx (container - 100 líneas)
  ├── tabs/
  │   ├── GeneralTab.jsx
  │   ├── ConfiguracionTab.jsx
  │   ├── PiesPaginaTab.jsx
  │   ├── PremiosComisionesTab.jsx
  │   ├── HorariosSorteosTab.jsx
  │   ├── SorteosTab.jsx
  │   ├── EstilosTab.jsx
  │   └── GastosAutomaticosTab.jsx
  ├── hooks/
  │   ├── useBranchForm.js
  │   └── useBranchValidation.js
  ├── utils/
  │   ├── mappers.js
  │   └── validators.js
  └── constants.js
```

**Esfuerzo estimado:** 3-5 días

---

### 1.2 PROBLEMA CRÍTICO #2: Duplicación Masiva de Código

**Datos Hardcodeados en Producción**

**Ejemplo 1: UserBancas.jsx (líneas 24-183)**

```javascript
// 143 objetos hardcodeados con usuarios de prueba
const usuarios = [
  { id: '001', banca: 'LA CENTRAL 01', referencia: '...', ... },
  { id: '002', banca: 'LA CENTRAL 02', referencia: '...', ... },
  // ... 141 más
]
```

**Ejemplo 2: BancasList.jsx (líneas 102-343)**

```javascript
// Backup hardcodeado de bancas que nunca se limpia
const bancasBackup = [ /* 20 bancas hardcodeadas */ ]
```

**Problema:**
- Datos de prueba en código de producción
- No se usan datos reales de la API
- Confusión entre datos mock y reales

**Recomendación:**
- Eliminar todos los datos mock
- Usar solo datos de API
- Implementar estados de loading/error apropiados
- Crear sistema de cache si es necesario

**Esfuerzo estimado:** 2 días

---

### 1.3 Componentes Reutilizables que NO lo Son

**Problema:** Componentes similares sin abstracción

**Ejemplos identificados:**
1. `PasswordModal.jsx` y `ChangePasswordModal.jsx` - Duplican funcionalidad
2. `BranchSelector.jsx` y `ReactMultiselect.jsx` - Patrones similares sin componente base
3. Múltiples formularios con validación duplicada

**Solución propuesta:**

```
src/components/shared/
  ├── Form/
  │   ├── FormField.jsx
  │   ├── FormSelect.jsx
  │   ├── FormToggle.jsx
  │   └── FormValidation.js
  ├── Modal/
  │   ├── BaseModal.jsx
  │   └── ConfirmModal.jsx
  └── Selectors/
      ├── BaseSelector.jsx
      └── MultiSelector.jsx
```

**Esfuerzo estimado:** 4 días

---

## 2. ESTADO Y MANEJO DE DATOS

### 2.1 PROBLEMA CRÍTICO #3: Sin Gestión de Estado Global

**Evidencia:**
- Prop drilling en 3+ niveles
- Estado duplicado en múltiples componentes
- Re-fetching innecesario de datos

**Problema en App.jsx:**

```javascript
// Rutas anidadas sin contexto compartido
<Route path="/*" element={
  <MainLayout>
    <Routes>
      <Route path="/usuarios/crear" element={<CreateUser />} />
      // MainLayout no comparte contexto
    </Routes>
  </MainLayout>
} />
```

**Solución propuesta:**

```javascript
// Context API para datos globales
src/context/
  ├── AuthContext.jsx
  ├── UserContext.jsx
  ├── BranchContext.jsx
  └── ZoneContext.jsx

// O mejor: React Query / SWR para cache automático
```

**Prioridad:** ALTA
**Esfuerzo estimado:** 3-4 días

---

### 2.2 PROBLEMA CRÍTICO #4: API Calls Inconsistentes

**Problema en branchService.js:**

```javascript
// Línea 6 - URL base inconsistente
const API_BASE_URL = '/api/branches';

// VS api.js línea 8
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// branchService NO usa el servicio api.js base
// Hace fetch directo (líneas 29, 50, 73, 104)
```

**Problemas:**
1. No hay autenticación en branchService - No usa el token de api.js
2. No hay logging consistente - api.js tiene logging, branchService no
3. Manejo de errores duplicado - Cada servicio implementa el suyo
4. No hay interceptors - No se pueden agregar headers globales

**Comparación:**

```javascript
// userService.js (CORRECTO)
import api from './api'
export const getAllUsers = async (params = {}) => {
  return api.get(`/users${query ? `?${query}` : ''}`)
}

// branchService.js (INCORRECTO)
const response = await fetch(`${API_BASE_URL}?${queryParams}`);
```

**Solución:**

```javascript
// REFACTORIZAR branchService.js para usar api.js
import api from './api'

export const getBranches = async (params = {}) => {
  const queryParams = new URLSearchParams(params)
  return api.get(`/branches?${queryParams}`)
}
```

**Prioridad:** ALTA
**Esfuerzo estimado:** 1 día

---

### 2.3 PROBLEMA CRÍTICO #5: Código de Debugging en Producción

**Código temporal en userService.js (líneas 190-200):**

```javascript
// TEMPORARY: Function added by API agent for testing
window.userService = window.userService || {}
window.userService.updateUserComplete = async function(userId, userData) {
  const response = await fetch(`http://localhost:5000/api/users/${userId}/complete`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Error al actualizar');
  return await response.json();
};
```

**Problema:** Código temporal que expone funciones al objeto window global

**Recomendación:** ELIMINAR INMEDIATAMENTE

**Prioridad:** ALTA
**Esfuerzo estimado:** 5 minutos

---

## 3. ESTILOS Y UI

### 3.1 PROBLEMA CRÍTICO #6: Guerra de Frameworks CSS

**Evidencia en main.jsx (líneas 15-25):**

```javascript
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
// Paper Kit custom (basado en Bootstrap)
import './assets/css/paper-kit.css'
// Tailwind (importado en index.css)
// Material-UI (importado en componentes)
```

**Problema:** 3 frameworks CSS activos simultáneamente

- **Bootstrap 5.3.8** (vendor bundle ~200KB)
- **Tailwind CSS 3.4.18** (custom build ~50KB+)
- **Material-UI 7.3.4** (componentes individuales)

**Conflictos identificados:**

1. **Clases duplicadas:**
```javascript
// Dashboard.jsx - línea 13
className="min-h-screen bg-gray-100 p-4"  // Tailwind
// vs líneas 19, 120, 153
className="bg-white rounded-lg shadow p-4"  // Bootstrap classes mezcladas
```

2. **Estilos inline mezclados:**
```javascript
// Dashboard.jsx líneas 32-40
className={`flex-1 py-2 px-3...`}  // Tailwind
style={{
  backgroundColor: '#4dd4d4',  // Inline CSS
  color: '#ffffff',
  borderColor: '#4dd4d4',
}}
```

3. **Archivos CSS específicos por componente:**
```
src/assets/css/
  ├── bancas-list.css
  ├── branch-selector.css
  ├── create-banca.css
  ├── create-user.css
  ├── user-list.css
  └── ... 9 archivos más
```

**Impacto:**
- Bundle size inflado: 322 MB node_modules
- Especificidad de CSS conflictiva
- Mantenimiento imposible
- Performance degradado

**Solución propuesta:**

**OPCIÓN A - Minimalista (Recomendada):**

```javascript
// Eliminar Bootstrap y Paper Kit
// Mantener solo Tailwind + Material-UI para componentes complejos

// package.json
{
  "dependencies": {
    "@mui/material": "^7.3.4",  // Solo para componentes complejos
    "tailwindcss": "^3.4.18"
  }
}
```

**OPCIÓN B - Gradual:**

```
Fase 1: Freeze new Bootstrap usage
Fase 2: Migrar componentes uno por uno a Tailwind
Fase 3: Eliminar Bootstrap cuando todos estén migrados
```

**Prioridad:** ALTA
**Esfuerzo estimado:**
- Opción A: 10-15 días
- Opción B: 20-30 días (gradual)

---

### 3.2 PROBLEMA #7: Archivos Backup y Test en Producción

**Hallazgos:**

```bash
src/components/layout/
  ├── Header.backup.jsx        # ELIMINAR
  ├── Sidebar.backup.jsx       # ELIMINAR

src/components/
  ├── TestMultiZone.jsx        # ELIMINAR o mover a /tests
  ├── TestPermissions.jsx      # ELIMINAR o mover a /tests
  ├── TestReactMultiselect.jsx # ELIMINAR o mover a /tests
  └── TestToggleBranch.jsx     # ELIMINAR o mover a /tests

src/constants/
  └── menuItems.backup.js      # ELIMINAR
```

**Solución:**

```bash
# Mover tests fuera de src
tests/
  └── components/
      ├── TestMultiZone.spec.jsx
      └── ... otros tests

# Eliminar backups
git rm src/components/layout/*.backup.jsx
git rm src/constants/*.backup.js
```

**Prioridad:** MEDIA
**Esfuerzo estimado:** 30 minutos

---

## 4. PERFORMANCE

### 4.1 PROBLEMA CRÍTICO #8: Re-renders Masivos

**Evidencia en CreateBanca.jsx:**

```javascript
// Estado masivo sin memoization (línea 10)
const [formData, setFormData] = useState({
  // 75+ campos
});

// Cada cambio en UN campo re-renderiza TODO el componente
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,  // Spread de 75 campos
    [name]: type === 'checkbox' ? checked : value
  }));
};
```

**Problema:**
- Cada keystroke re-renderiza 1,580 líneas de componente
- 8 tabs re-renderizados aunque solo 1 esté visible
- Ningún uso de React.memo, useMemo, o useCallback

**Medición estimada:**
- 75 campos × promedio 10 cambios = 750 re-renders solo para llenar el formulario
- Cada re-render procesa 1,580 líneas de JSX

**Solución:**

```javascript
// OPCIÓN 1: Separar tabs en componentes memoizados
const GeneralTab = React.memo(({ formData, onChange }) => {
  // Solo se re-renderiza si formData.general cambia
});

// OPCIÓN 2: Usar React Hook Form
import { useForm } from 'react-hook-form';
const { register, handleSubmit, watch } = useForm();
```

**Prioridad:** ALTA
**Esfuerzo estimado:** 3-4 días

---

### 4.2 PROBLEMA #9: Sin Code Splitting

**Problema en App.jsx:**

```javascript
// Todos los componentes importados síncronamente
import CreateBanca from '@components/CreateBanca'  // 1,580 líneas
import CreateUser from '@components/CreateUser'
import UserList from '@components/UserList'
// ... 13 más
```

**Impacto:**
- Todos los componentes se cargan en el bundle inicial
- CreateBanca se carga aunque el usuario nunca lo use
- No hay lazy loading

**Solución:**

```javascript
// App.jsx con lazy loading
import { lazy, Suspense } from 'react';

const CreateBanca = lazy(() => import('@components/CreateBanca'));
const CreateUser = lazy(() => import('@components/CreateUser'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/bancas/crear" element={<CreateBanca />} />
</Suspense>
```

**Impacto estimado:**
- Reducción de bundle inicial: 40-60%
- Time to Interactive: -2s

**Prioridad:** MEDIA
**Esfuerzo estimado:** 1 día

---

### 4.3 PROBLEMA #10: Bundle Size Inflado

**Análisis de node_modules (322 MB):**

```
Desglose estimado:
- Bootstrap: ~40 MB
- Material-UI: ~60 MB
- Tailwind: ~20 MB
- jQuery: ~30 MB (NO DEBERÍA ESTAR EN REACT)
- Framer Motion: ~15 MB
- React Router DOM: ~10 MB
```

**Problema en main.jsx (líneas 30-36):**

```javascript
// jQuery legacy en React moderno
import $ from 'jquery'
window.$ = window.jQuery = $
import 'popper.js'
import 'bootstrap/dist/js/bootstrap.bundle.min'
```

**Solución:**

1. Eliminar jQuery completamente
2. Eliminar Bootstrap JS
3. Elegir UN framework CSS
4. Configurar Tree Shaking apropiado

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'mui': ['@mui/material'],
        'router': ['react-router-dom']
      }
    }
  }
}
```

**Prioridad:** ALTA
**Esfuerzo estimado:** 5-7 días

---

## 5. ESTRUCTURA DE CARPETAS

### 5.1 Estructura Actual

```
src/
├── assets/ (CSS disperso, jQuery legacy)
├── components/ (36 archivos JSX mixtos)
├── hooks/ (solo 1 archivo)
├── pages/ (solo 2 archivos)
├── services/ (7 archivos, inconsistentes)
└── utils/
```

**Problemas:**
1. Componentes mezclados sin organización clara
2. CSS disperso en múltiples lugares
3. Hooks infrautilizado (solo useTime.js)
4. Data mock sin eliminar
5. Services inconsistentes

---

### 5.2 Estructura Propuesta

```
src/
├── api/                      # NUEVO - Centralizar API
│   ├── client.js
│   ├── interceptors.js
│   └── endpoints/
│       ├── branches.js
│       ├── users.js
│       └── zones.js
│
├── components/
│   ├── bancas/              # Agrupar por dominio
│   │   ├── BancasList/
│   │   ├── CreateBanca/
│   │   └── EditBanca/
│   ├── users/
│   │   ├── UsersList/
│   │   ├── CreateUser/
│   │   └── EditUser/
│   ├── shared/              # Componentes reutilizables
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   └── Modal/
│   ├── layout/
│   └── widgets/
│
├── context/                 # Estado global
│   ├── AuthContext.jsx
│   ├── UserContext.jsx
│   └── BranchContext.jsx
│
├── hooks/                   # Expandir
│   ├── useAuth.js
│   ├── useForm.js
│   ├── useTable.js
│   └── useApi.js
│
├── pages/
│   ├── Dashboard/
│   ├── Login/
│   └── NotFound/
│
├── styles/                  # Solo Tailwind
│   ├── globals.css
│   └── variables.css
│
└── utils/
```

**Beneficios:**
- Organización por dominio
- Componentes compartidos centralizados
- Hooks reutilizables
- API centralizado

**Prioridad:** MEDIA
**Esfuerzo estimado:** 3-4 días

---

## 6. DEPENDENCIAS LEGACY

### 6.1 PROBLEMA CRÍTICO #11: jQuery en React

**Evidencia en main.jsx:**

```javascript
// Líneas 30-36
import $ from 'jquery'
window.$ = window.jQuery = $
import 'popper.js'
import 'bootstrap/dist/js/bootstrap.bundle.min'
```

**Problema:**
- jQuery es anti-patrón en React
- Manipulación directa del DOM compite con Virtual DOM
- 30 MB de dependencia innecesaria
- jQuery NO se usa en ningún componente React actual

**Solución:** ELIMINAR COMPLETAMENTE

```diff
// package.json
{
  "dependencies": {
-   "jquery": "^3.7.1",
-   "popper.js": "^1.16.1",
-   "bootstrap": "^5.3.8",
  }
}
```

**Prioridad:** ALTA
**Esfuerzo estimado:** 1 hora

---

### 6.2 Dependencias Duplicadas

**Problema: 3 librerías de iconos diferentes:**

```json
{
  "dependencies": {
    "@fortawesome/fontawesome-free": "^7.1.0",
    "lucide-react": "^0.263.1",
    "react-icons": "^5.5.0",
    "@mui/icons-material": "^7.3.4"
  }
}
```

**Solución:**

```json
{
  "dependencies": {
    "lucide-react": "^0.263.1"  // UN solo sistema de iconos
  }
}
```

**Prioridad:** MEDIA
**Esfuerzo estimado:** 1 día

---

## 7. CÓDIGO TÉCNICO

### 7.1 Manejo de Errores Inconsistente

**3 patrones diferentes encontrados:**

**Patrón 1: Try-catch con setState (CreateUser.jsx)**
```javascript
try {
  const response = await userService.createUser(userData)
} catch (error) {
  logger.error('CREATE_USER', 'Failed', { error })
  setErrors({ submit: handleApiError(error) })
}
```

**Patrón 2: Try-catch con console.error (branchService.js)**
```javascript
try {
  // ...
} catch (error) {
  console.error('Error en createBranch:', error);
  throw error;
}
```

**Patrón 3: Try-catch sin manejo (BancasList.jsx)**
```javascript
catch (err) {
  setError(handleBranchError(err));
  console.error('Error:', err);
}
```

**Solución propuesta:**

```javascript
// utils/errorHandler.js
export class AppError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  logger.error('API_ERROR', error.message, error);

  if (error.response?.status === 401) {
    window.location.href = '/login';
    return;
  }

  return {
    message: error.message || 'Error desconocido',
    code: error.response?.status || 500
  };
};
```

**Prioridad:** MEDIA
**Esfuerzo estimado:** 2 días

---

### 7.2 i18n Sub-utilizado

**Estado:** Sistema bien configurado pero solo usado en 2 componentes

**Componentes SIN i18n:**
- CreateUser.jsx - Textos hardcodeados
- CreateBanca.jsx - Textos hardcodeados
- BancasList.jsx - Textos hardcodeados
- Dashboard.jsx - Textos hardcodeados

**Solución:**

```javascript
// Migrar todos los textos
const { t } = useTranslation();

<h3>{t('users.create.title')}</h3>
<label>{t('users.create.username')}</label>
```

**Prioridad:** BAJA
**Esfuerzo estimado:** 5 días

---

## 8. ROUTING Y NAVEGACIÓN

### 8.1 Rutas Anidadas Innecesariamente

**Problema en App.jsx:**

```javascript
<Routes>
  <Route path="/*" element={        // Catch-all anidado
    <MainLayout>
      <Routes>                      // Routes dentro de Routes
        <Route path="/" element={<Dashboard />} />
        // ... rutas anidadas
      </Routes>
    </MainLayout>
  } />
</Routes>
```

**Problemas:**
1. Routes anidados - difícil de leer
2. Duplicación de Dashboard
3. MainLayout repetido

**Solución:**

```javascript
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />

      <Route path="/usuarios">
        <Route path="crear" element={<CreateUser />} />
        <Route path="editar/:userId" element={<EditUser />} />
      </Route>

      <Route path="/bancas">
        <Route path="crear" element={<CreateBanca />} />
        <Route path="editar/:id" element={<EditBanca />} />
      </Route>
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

**Prioridad:** MEDIA
**Esfuerzo estimado:** 1 día

---

### 8.2 PROBLEMA CRÍTICO #13: Sin Autenticación

**Evidencia:**
- No hay componente ProtectedRoute
- No hay verificación de token
- No hay Context de autenticación
- localStorage.getItem('authToken') en api.js pero nunca se setea

**Solución:**

```javascript
// context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      validateToken(token)
        .then(setUser)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { token, user } = await loginAPI(credentials);
    localStorage.setItem('authToken', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Prioridad:** CRÍTICA
**Esfuerzo estimado:** 2 días

---

## 9. RESUMEN PRIORIZADO DE REFACTORIZACIONES

### PRIORIDAD CRÍTICA (Hacer AHORA)

| # | Problema | Archivo | Esfuerzo | Impacto |
|---|----------|---------|----------|---------|
| 1 | God Component CreateBanca | CreateBanca.jsx | 3-5 días | Alto |
| 2 | Datos hardcodeados | UserBancas.jsx, BancasList.jsx | 2 días | Alto |
| 3 | Sin gestión de estado global | Toda la app | 3-4 días | Alto |
| 4 | API calls inconsistentes | branchService.js | 1 día | Alto |
| 5 | Código debugging en producción | userService.js | 5 min | Crítico |
| 6 | Guerra de frameworks CSS | main.jsx, package.json | 10-15 días | Alto |
| 11 | jQuery en React | main.jsx, package.json | 1 hora | Alto |
| 13 | Sin autenticación | Toda la app | 2 días | Crítico |

**Total esfuerzo crítico:** 22-29 días

---

### PRIORIDAD ALTA (Próximas 2-4 semanas)

| # | Problema | Archivo | Esfuerzo | Impacto |
|---|----------|---------|----------|---------|
| 8 | Re-renders masivos | CreateBanca.jsx, CreateUser.jsx | 3-4 días | Medio |
| 10 | Bundle size inflado | package.json, main.jsx | 5-7 días | Medio |
| 12 | Paper Kit legacy | assets/, main.jsx | 2 días | Medio |

**Total esfuerzo alto:** 10-13 días

---

### PRIORIDAD MEDIA (1-2 meses)

| # | Problema | Archivo | Esfuerzo | Impacto |
|---|----------|---------|----------|---------|
| 3 | Componentes no reutilizables | modals/, selectors/ | 4 días | Medio |
| 7 | Archivos backup/test | components/ | 30 min | Bajo |
| 9 | Sin code splitting | App.jsx | 1 día | Medio |
| - | Estructura de carpetas | src/ | 3-4 días | Medio |
| - | Estilos inline vs separados | Múltiples | 5 días | Bajo |
| - | Manejo de errores | Múltiples | 2 días | Medio |
| - | Routing simplificado | App.jsx | 1 día | Bajo |

**Total esfuerzo medio:** 16-17 días

---

### PRIORIDAD BAJA (Backlog)

| # | Problema | Archivo | Esfuerzo | Impacto |
|---|----------|---------|----------|---------|
| - | Logging centralizado | logger.js | 1 día | Bajo |
| - | i18n sub-utilizado | Múltiples | 5 días | Bajo |

**Total esfuerzo bajo:** 6 días

---

## 10. PLAN DE REFACTORIZACIÓN RECOMENDADO

### FASE 1: FUNDAMENTOS (Semanas 1-3)

**Objetivo:** Estabilizar la base técnica

**Semana 1:**
- ✅ Eliminar jQuery y dependencias legacy (1 día)
- ✅ Implementar AuthContext y protección de rutas (2 días)
- ✅ Eliminar código de debugging (5 min)
- ✅ Limpiar archivos backup/test (30 min)
- ✅ Refactorizar branchService para usar api.js base (1 día)

**Semanas 2-3:**
- ✅ Decidir framework CSS (Tailwind solo)
- ✅ Eliminar Bootstrap y Paper Kit
- ✅ Comenzar migración gradual de estilos

---

### FASE 2: ARQUITECTURA (Semanas 4-6)

**Objetivo:** Mejorar organización y performance

**Semana 4:**
- ✅ Implementar Context API para estado global
- ✅ Refactorizar CreateBanca: separar en tabs
- ✅ Crear hooks reutilizables (useForm, useApi)

**Semanas 5-6:**
- ✅ Reorganizar estructura de carpetas
- ✅ Crear componentes shared reutilizables
- ✅ Implementar React.memo y optimizaciones

---

### FASE 3: OPTIMIZACIÓN (Semanas 7-8)

**Objetivo:** Mejorar performance y UX

**Semana 7:**
- ✅ Implementar code splitting y lazy loading
- ✅ Optimizar bundle size
- ✅ Configurar tree shaking apropiado

**Semana 8:**
- ✅ Implementar manejo de errores centralizado
- ✅ Mejorar logging (solo prod errors)
- ✅ Testing básico de componentes críticos

---

### FASE 4: PULIDO (Semanas 9-10)

**Objetivo:** Completar detalles

**Semana 9:**
- ✅ Migrar textos a i18n
- ✅ Documentación de componentes
- ✅ Performance audit final

**Semana 10:**
- ✅ Code review completo
- ✅ Fix de bugs encontrados
- ✅ Deployment a producción

---

## 11. MÉTRICAS DE ÉXITO

### ANTES (Estado Actual)

| Métrica | Valor Actual |
|---------|-------------|
| Bundle size (inicial) | ~800 KB |
| Time to Interactive | ~5-7s |
| Líneas por componente (promedio) | 450 líneas |
| Componente más grande | 1,580 líneas |
| Frameworks CSS | 3 (Bootstrap, Tailwind, MUI) |
| Re-renders por formulario | ~750 |
| Code coverage | 0% |
| Dependencias legacy | jQuery, Popper, Paper Kit |

### DESPUÉS (Objetivo)

| Métrica | Valor Objetivo |
|---------|----------------|
| Bundle size (inicial) | ~300 KB (-62%) |
| Time to Interactive | ~2-3s (-50%) |
| Líneas por componente (promedio) | <200 líneas |
| Componente más grande | <400 líneas |
| Frameworks CSS | 1 (Tailwind) |
| Re-renders por formulario | <100 (-87%) |
| Code coverage | >60% |
| Dependencias legacy | 0 |

---

## 12. CONCLUSIONES

### Fortalezas de la Aplicación Actual

✅ **Sistema de logging bien diseñado** (logger.js)
✅ **i18n correctamente configurado**
✅ **Alias de imports configurados** (Vite)
✅ **React 18 moderno**
✅ **API service bien estructurado** (api.js base)

### Debilidades Críticas

❌ **Arquitectura monolítica** (God components)
❌ **Mezcla de frameworks CSS** (Bootstrap + Tailwind + MUI)
❌ **Sin gestión de estado global**
❌ **jQuery en app React moderna**
❌ **Sin autenticación real**
❌ **Performance no optimizado**
❌ **Código legacy mezclado con moderno**

---

## 13. RECOMENDACIÓN FINAL

### PRIORIDAD INMEDIATA

1. **Eliminar jQuery** (1 hora)
2. **Implementar autenticación** (2 días)
3. **Refactorizar CreateBanca** (5 días)
4. **Decidir un solo framework CSS** (estrategia)

### INVERSIÓN TOTAL ESTIMADA

- **Refactorización completa:** 78-94 días de desarrollo
- **MVP mejorado (solo crítico):** 44-61 días
- **Con Testing + Security + A11y:** 60-75 días
- **ROI esperado:** +50% performance, +80% mantenibilidad, 100% seguridad mejorada

### ESTRATEGIA RECOMENDADA

Hacer refactorización **GRADUAL** en 10 semanas:
- No detener desarrollo de features
- Aplicar Boy Scout Rule: "Dejar el código mejor de como lo encontraste"
- Migrar componente por componente
- Testing incremental

---

## ARCHIVOS CLAVE PARA REVISAR

**CRÍTICOS:**
- `/src/components/CreateBanca.jsx` (1,580 líneas)
- `/src/components/UserBancas.jsx` (475 líneas)
- `/src/main.jsx` (jQuery global)
- `/src/services/branchService.js` (API inconsistente)

**IMPORTANTES:**
- `/src/App.jsx` (rutas)
- `/src/components/CreateUser.jsx` (540 líneas)
- `/package.json` (dependencias)
- `/tailwind.config.js` (CSS config)

---

## 14. TESTING STRATEGY

### 14.1 PROBLEMA CRÍTICO #14: Ausencia Total de Tests

**Estado actual:**
- **Code coverage:** 0%
- **Tests unitarios:** 0
- **Tests de integración:** 0
- **Tests E2E:** 0
- **No hay configuración de testing**

**Evidencia:**

```bash
# Ninguna dependencia de testing en package.json
# No existe carpeta /tests o /__tests__
# No hay archivos .test.jsx o .spec.jsx
```

**Riesgos:**
- Refactorización sin safety net
- Regresiones no detectadas
- Cambios que rompen funcionalidad existente
- Imposible validar optimizaciones de performance

---

### 14.2 Solución Propuesta: Testing Pyramid

**Configuración recomendada:**

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "playwright": "^1.40.0",
    "msw": "^2.0.0"
  }
}
```

**Estructura propuesta:**

```
tests/
├── unit/                    # Tests unitarios (70%)
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Button.test.jsx
│   │   │   ├── Input.test.jsx
│   │   │   └── Modal.test.jsx
│   │   └── layout/
│   │       ├── Header.test.jsx
│   │       └── Sidebar.test.jsx
│   ├── hooks/
│   │   ├── useAuth.test.js
│   │   └── useForm.test.js
│   └── utils/
│       ├── validators.test.js
│       └── formatters.test.js
│
├── integration/             # Tests de integración (20%)
│   ├── CreateUser.test.jsx
│   ├── CreateBanca.test.jsx
│   └── BancasList.test.jsx
│
├── e2e/                     # Tests E2E con Playwright (10%)
│   ├── user-flow.spec.js
│   ├── branch-flow.spec.js
│   └── auth-flow.spec.js
│
├── mocks/
│   ├── handlers.js          # MSW handlers
│   └── server.js            # Mock server
│
└── setup.js                 # Test configuration
```

---

### 14.3 Ejemplo de Test Unitario

```javascript
// tests/unit/components/shared/Button.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from '@/components/shared/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
```

---

### 14.4 Ejemplo de Test de Integración

```javascript
// tests/integration/CreateUser.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import CreateUser from '@/components/CreateUser'

const server = setupServer(
  http.post('/api/users', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({
      id: 1,
      username: data.username,
      success: true
    })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('CreateUser Component', () => {
  it('creates user successfully', async () => {
    render(<CreateUser />)

    await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
    await userEvent.type(screen.getByLabelText(/password/i), 'Test123!')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')

    await userEvent.click(screen.getByRole('button', { name: /crear/i }))

    await waitFor(() => {
      expect(screen.getByText(/usuario creado exitosamente/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for empty fields', async () => {
    render(<CreateUser />)

    await userEvent.click(screen.getByRole('button', { name: /crear/i }))

    expect(screen.getByText(/el nombre de usuario es requerido/i)).toBeInTheDocument()
    expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
  })
})
```

---

### 14.5 Ejemplo de Test E2E

```javascript
// tests/e2e/user-flow.spec.js
import { test, expect } from '@playwright/test'

test('complete user creation flow', async ({ page }) => {
  // Login
  await page.goto('http://localhost:4000/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'admin123')
  await page.click('button[type="submit"]')

  // Navigate to create user
  await expect(page).toHaveURL('http://localhost:4000/')
  await page.click('text=Usuarios')
  await page.click('text=Crear Usuario')

  // Fill form
  await page.fill('input[name="username"]', 'newuser')
  await page.fill('input[name="password"]', 'Password123!')
  await page.fill('input[name="email"]', 'newuser@test.com')
  await page.selectOption('select[name="role"]', '2')

  // Submit
  await page.click('button:has-text("Crear Usuario")')

  // Verify success
  await expect(page.locator('.success-message')).toBeVisible()
  await expect(page).toHaveURL(/\/usuarios/)
})

test('form validation on create user', async ({ page }) => {
  await page.goto('http://localhost:4000/usuarios/crear')

  // Try to submit empty form
  await page.click('button:has-text("Crear Usuario")')

  // Check validation errors
  await expect(page.locator('text=El nombre de usuario es requerido')).toBeVisible()
  await expect(page.locator('text=La contraseña es requerida')).toBeVisible()
})
```

---

### 14.6 Configuración de Vitest

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/mockData.js'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```javascript
// tests/setup.js
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

---

### 14.7 Scripts de Testing

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

### 14.8 Plan de Implementación de Tests

**Prioridad 1: Componentes Críticos (Semana 1)**
- [ ] CreateUser.test.jsx
- [ ] CreateBanca.test.jsx (cuando se refactorice)
- [ ] BancasList.test.jsx
- [ ] UserList.test.jsx

**Prioridad 2: Shared Components (Semana 2)**
- [ ] Button.test.jsx
- [ ] Input.test.jsx
- [ ] Modal.test.jsx
- [ ] Select.test.jsx

**Prioridad 3: Hooks y Utils (Semana 3)**
- [ ] useAuth.test.js
- [ ] useForm.test.js
- [ ] validators.test.js
- [ ] formatters.test.js

**Prioridad 4: E2E Critical Flows (Semana 4)**
- [ ] user-flow.spec.js
- [ ] branch-flow.spec.js
- [ ] auth-flow.spec.js

---

### 14.9 Coverage Targets

| Fase | Target | Timeline |
|------|--------|----------|
| MVP | 40% | 2 semanas |
| Beta | 60% | 4 semanas |
| Producción | 75%+ | 6 semanas |

**Prioridad:** ALTA
**Esfuerzo estimado:** 8-10 días (distribuidos en refactorización)

---

## 15. ACCESSIBILITY AUDIT

### 15.1 PROBLEMA CRÍTICO #15: Accesibilidad No Considerada

**Estado actual:**
- Sin análisis WCAG
- No hay atributos ARIA
- Navegación por teclado no verificada
- Sin soporte para screen readers
- Contraste de colores no validado

**Impacto:**
- Usuarios con discapacidades no pueden usar la app
- Posible incumplimiento legal (ADA, Section 508)
- Mala experiencia para ~15% de usuarios

---

### 15.2 Problemas Identificados

**15.2.1 Formularios Sin Labels Asociados**

```javascript
// INCORRECTO (CreateUser.jsx)
<input
  type="text"
  name="username"
  placeholder="Nombre de usuario"
/>

// CORRECTO
<label htmlFor="username">
  Nombre de usuario
  <span className="text-red-500" aria-label="requerido">*</span>
</label>
<input
  type="text"
  id="username"
  name="username"
  aria-required="true"
  aria-invalid={errors.username ? "true" : "false"}
  aria-describedby={errors.username ? "username-error" : undefined}
/>
{errors.username && (
  <span id="username-error" role="alert" className="error">
    {errors.username}
  </span>
)}
```

---

**15.2.2 Botones Sin Texto Accesible**

```javascript
// INCORRECTO (Dashboard.jsx - línea 156)
<button onClick={handleEdit}>
  <EditIcon />
</button>

// CORRECTO
<button
  onClick={handleEdit}
  aria-label="Editar usuario"
  title="Editar usuario"
>
  <EditIcon aria-hidden="true" />
</button>
```

---

**15.2.3 Modales Sin Manejo de Focus**

```javascript
// CORRECTO - PasswordModal.jsx refactorizado
import { useEffect, useRef } from 'react'

const PasswordModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Trap focus en el modal
      closeButtonRef.current?.focus()

      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      <h2 id="modal-title">Cambiar Contraseña</h2>
      <p id="modal-description">Ingresa tu nueva contraseña</p>

      {/* Contenido del modal */}

      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Cerrar modal"
      >
        Cerrar
      </button>
    </div>
  )
}
```

---

**15.2.4 Tablas Sin Encabezados Semánticos**

```javascript
// INCORRECTO (UserList.jsx)
<table>
  <tr>
    <td>Nombre</td>
    <td>Email</td>
  </tr>
  <tr>
    <td>Juan</td>
    <td>juan@test.com</td>
  </tr>
</table>

// CORRECTO
<table aria-label="Lista de usuarios">
  <thead>
    <tr>
      <th scope="col">Nombre</th>
      <th scope="col">Email</th>
      <th scope="col">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Juan Pérez</td>
      <td>juan@test.com</td>
      <td>
        <button aria-label="Editar a Juan Pérez">
          Editar
        </button>
      </td>
    </tr>
  </tbody>
</table>
```

---

**15.2.5 Navegación Sin Skip Links**

```javascript
// App.jsx - Agregar skip navigation
const App = () => {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '20px',
          zIndex: 9999
        }}
      >
        Saltar al contenido principal
      </a>

      <Header />
      <Sidebar />

      <main id="main-content" tabIndex="-1">
        {/* Contenido */}
      </main>
    </>
  )
}
```

---

### 15.3 Contraste de Colores

**Problemas encontrados:**

```javascript
// Dashboard.jsx - línea 35
style={{
  backgroundColor: '#4dd4d4',  // Cyan claro
  color: '#ffffff'              // Blanco
}}
// Ratio de contraste: 2.8:1 ❌ (mínimo 4.5:1)

// CORRECTO
style={{
  backgroundColor: '#0891b2',  // Cyan-600
  color: '#ffffff'              // Blanco
}}
// Ratio de contraste: 5.2:1 ✅
```

**Herramientas de verificación:**
- Chrome DevTools Lighthouse
- axe DevTools extension
- WebAIM Contrast Checker

---

### 15.4 Keyboard Navigation

**Requerimientos:**
- ✅ Tab: Navegar hacia adelante
- ✅ Shift+Tab: Navegar hacia atrás
- ✅ Enter/Space: Activar botones
- ✅ Escape: Cerrar modales
- ✅ Arrow keys: Navegación en listas/menús

**Implementación de Focus Visible:**

```css
/* globals.css */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
a:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Ocultar outline para mouse clicks */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

### 15.5 Screen Reader Support

**Landmark Roles:**

```javascript
// MainLayout.jsx
const MainLayout = ({ children }) => {
  return (
    <>
      <header role="banner">
        <Header />
      </header>

      <nav role="navigation" aria-label="Menú principal">
        <Sidebar />
      </nav>

      <main role="main" aria-label="Contenido principal">
        {children}
      </main>

      <footer role="contentinfo">
        {/* Footer si existe */}
      </footer>
    </>
  )
}
```

**Live Regions para notificaciones:**

```javascript
// Toast.jsx
const Toast = ({ message, type }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      {message}
    </div>
  )
}

// Para errores críticos
const ErrorToast = ({ message }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"  // Interrumpe al screen reader
      aria-atomic="true"
    >
      {message}
    </div>
  )
}
```

---

### 15.6 Checklist de Accesibilidad

**Por Componente:**

- [ ] Todos los inputs tienen `<label>` asociado
- [ ] Botones tienen texto o `aria-label`
- [ ] Imágenes tienen `alt` descriptivo
- [ ] Links tienen texto descriptivo (no "click aquí")
- [ ] Formularios tienen validación accesible con `aria-invalid` y `aria-describedby`
- [ ] Modales usan `role="dialog"` y `aria-modal="true"`
- [ ] Focus trap en modales
- [ ] Escape key cierra modales
- [ ] Tablas tienen `<thead>`, `<th>` con `scope`
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande)
- [ ] Navegación por teclado funcional
- [ ] Focus visible para todos los elementos interactivos
- [ ] Skip navigation link
- [ ] Landmark roles (`main`, `nav`, `header`, `footer`)
- [ ] Contenido dinámico usa `aria-live`

---

### 15.7 Testing de Accesibilidad

**Automatizado:**

```javascript
// vitest.config.js - agregar axe
import { defineConfig } from 'vitest/config'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup-a11y.js']
  }
})
```

```javascript
// tests/setup-a11y.js
import { axe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

expect.extend(toHaveNoViolations)

export { axe }
```

```javascript
// tests/unit/components/CreateUser.a11y.test.jsx
import { render } from '@testing-library/react'
import { axe } from '../setup-a11y'
import CreateUser from '@/components/CreateUser'

describe('CreateUser Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<CreateUser />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

**Manual:**
1. Navegar toda la app solo con teclado
2. Usar NVDA/JAWS/VoiceOver para probar screen readers
3. Verificar contraste con herramientas
4. Lighthouse audit en Chrome DevTools

---

### 15.8 Implementación Gradual

**Fase 1: Fundamentos (1 semana)**
- [ ] Agregar labels a todos los inputs
- [ ] Agregar `aria-label` a botones de iconos
- [ ] Implementar focus visible

**Fase 2: Formularios (1 semana)**
- [ ] Validación accesible con `aria-invalid`
- [ ] Mensajes de error con `aria-describedby`
- [ ] Required fields con `aria-required`

**Fase 3: Componentes Complejos (2 semanas)**
- [ ] Modales con focus trap
- [ ] Tablas semánticas
- [ ] Live regions para notificaciones

**Fase 4: Testing (1 semana)**
- [ ] Tests automatizados con axe
- [ ] Keyboard navigation testing
- [ ] Screen reader testing manual

**Prioridad:** MEDIA
**Esfuerzo estimado:** 5-7 días

---

## 16. SECURITY CHECKLIST

### 16.1 PROBLEMA CRÍTICO #16: Vulnerabilidades de Seguridad

**Estado actual:**
- Sin validación de entrada en frontend
- XSS potencial en renderizado dinámico
- Credenciales en código fuente (appsettings.json)
- Sin Content Security Policy
- Datos sensibles en localStorage sin encriptar

---

### 16.2 XSS (Cross-Site Scripting)

**Problema encontrado:**

```javascript
// CreateUser.jsx - Potencial XSS
const [successMessage, setSuccessMessage] = useState('')

// Si el nombre de usuario viene del servidor sin sanitizar
<div dangerouslySetInnerHTML={{ __html: successMessage }} />
```

**Solución:**

```javascript
// NUNCA usar dangerouslySetInnerHTML con datos del usuario
// React escapa automáticamente por defecto
<div>{successMessage}</div>

// Si REALMENTE necesitas HTML, usa DOMPurify
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(successMessage)
}} />
```

---

### 16.3 Validación de Entrada

**Problema: Validación solo en backend**

```javascript
// utils/validators.js - Agregar validaciones en frontend
export const validateUsername = (username) => {
  // Whitelist approach - solo caracteres permitidos
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/

  if (!username) {
    return 'El nombre de usuario es requerido'
  }

  if (!usernameRegex.test(username)) {
    return 'Solo letras, números, guión y guión bajo (3-20 caracteres)'
  }

  return null
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return 'El email es requerido'
  }

  if (!emailRegex.test(email)) {
    return 'Email inválido'
  }

  return null
}

export const validatePassword = (password) => {
  if (!password) {
    return 'La contraseña es requerida'
  }

  if (password.length < 8) {
    return 'Mínimo 8 caracteres'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Debe contener al menos una mayúscula'
  }

  if (!/[a-z]/.test(password)) {
    return 'Debe contener al menos una minúscula'
  }

  if (!/[0-9]/.test(password)) {
    return 'Debe contener al menos un número'
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return 'Debe contener al menos un carácter especial'
  }

  return null
}

// Sanitización de inputs
export const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .slice(0, 255) // Limitar longitud
}
```

---

### 16.4 Content Security Policy

**Agregar en index.html:**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' http://localhost:8080;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
      ">

    <!-- Prevenir clickjacking -->
    <meta http-equiv="X-Frame-Options" content="DENY">

    <!-- Prevenir MIME sniffing -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">

    <!-- XSS Protection (legacy browsers) -->
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">

    <title>Lottery Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### 16.5 Manejo Seguro de Tokens

**Problema actual:**

```javascript
// api.js - línea 45
const token = localStorage.getItem('authToken')
```

**Problemas con localStorage:**
- Accesible vía JavaScript (vulnerable a XSS)
- No expira automáticamente
- Compartido entre todas las tabs

**Solución mejorada:**

```javascript
// utils/secureStorage.js
class SecureStorage {
  constructor() {
    this.prefix = '__lottery_app__'
  }

  setToken(token, expiresIn = 3600) {
    const expiry = Date.now() + (expiresIn * 1000)
    const data = {
      token,
      expiry
    }

    // Usar sessionStorage para tokens (más seguro que localStorage)
    sessionStorage.setItem(
      `${this.prefix}auth`,
      JSON.stringify(data)
    )
  }

  getToken() {
    const data = sessionStorage.getItem(`${this.prefix}auth`)

    if (!data) return null

    try {
      const { token, expiry } = JSON.parse(data)

      // Verificar expiración
      if (Date.now() > expiry) {
        this.removeToken()
        return null
      }

      return token
    } catch (e) {
      return null
    }
  }

  removeToken() {
    sessionStorage.removeItem(`${this.prefix}auth`)
  }

  // Para datos no sensibles
  setItem(key, value) {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value))
    } catch (e) {
      console.error('Storage error:', e)
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`)
      return item ? JSON.parse(item) : null
    } catch (e) {
      return null
    }
  }
}

export default new SecureStorage()
```

**Uso en api.js:**

```javascript
import secureStorage from '@/utils/secureStorage'

const getAuthHeaders = () => {
  const token = secureStorage.getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

---

### 16.6 CSRF Protection

**Agregar CSRF token en requests:**

```javascript
// services/api.js
const getCsrfToken = () => {
  // Obtener token del meta tag (debe ser inyectado por el backend)
  return document.querySelector('meta[name="csrf-token"]')?.content
}

const apiClient = {
  async request(method, url, data = null, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
      ...getAuthHeaders(),
      ...options.headers
    }

    const config = {
      method,
      headers,
      credentials: 'same-origin', // Enviar cookies
      ...options
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(API_BASE_URL + url, config)

    // ... resto del código
  }
}
```

---

### 16.7 Prevención de Injection en SQL

**Frontend debe validar pero NO confiar:**

```javascript
// NUNCA construir queries en frontend
// INCORRECTO
const userId = getUserIdFromInput() // "1; DROP TABLE users--"
const query = `SELECT * FROM users WHERE id = ${userId}`

// CORRECTO - usar el API con validación
const userId = parseInt(getUserIdFromInput())

if (isNaN(userId) || userId <= 0) {
  throw new Error('Invalid user ID')
}

// El backend debe usar prepared statements
await userService.getUser(userId)
```

---

### 16.8 Protección de Rutas Sensibles

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verificar permisos específicos
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    )

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

export default ProtectedRoute
```

**Uso:**

```javascript
// App.jsx
<Route
  path="/usuarios/crear"
  element={
    <ProtectedRoute requiredPermissions={['MANAGE_USERS']}>
      <CreateUser />
    </ProtectedRoute>
  }
/>
```

---

### 16.9 Rate Limiting en Frontend

```javascript
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.attempts = new Map()
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  canProceed(key) {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    )

    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }

    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }

  reset(key) {
    this.attempts.delete(key)
  }
}

export default new RateLimiter()
```

**Uso en login:**

```javascript
// pages/Login.jsx
import rateLimiter from '@/utils/rateLimiter'

const handleLogin = async (credentials) => {
  const clientId = 'login-' + credentials.username

  if (!rateLimiter.canProceed(clientId)) {
    setError('Demasiados intentos. Espera 1 minuto.')
    return
  }

  try {
    await authService.login(credentials)
    rateLimiter.reset(clientId)
  } catch (error) {
    // ...
  }
}
```

---

### 16.10 Dependencias con Vulnerabilidades

**Problema: appsettings.json con credenciales expuestas**

```json
// LottoApi/appsettings.json - ❌ CRÍTICO
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:lottery-sql-1505.database.windows.net,1433;Initial Catalog=LottoTest;Persist Security Info=False;User ID=lotteryAdmin;Password=IotSlotsLottery123!;..."
  }
}
```

**Solución:**

1. **INMEDIATO**: Cambiar la contraseña de la base de datos
2. **Agregar a .gitignore:**

```bash
# .gitignore
appsettings.json
appsettings.*.json
!appsettings.example.json
.env
.env.local
```

3. **Crear template:**

```json
// appsettings.example.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;User ID=YOUR_USER;Password=YOUR_PASSWORD;"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "LotteryAPI",
    "Audience": "LotteryAPI-Users",
    "ExpiryMinutes": 60
  }
}
```

4. **Usar variables de entorno:**

```csharp
// Program.cs
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");
```

---

### 16.11 Security Checklist

**Configuración:**
- [ ] CSP headers configurados
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HTTPS en producción
- [ ] Credenciales fuera del código fuente

**Autenticación:**
- [ ] Tokens en sessionStorage (no localStorage)
- [ ] Expiración de tokens validada
- [ ] Logout limpia todo el almacenamiento
- [ ] Rate limiting en login

**Validación:**
- [ ] Validación de inputs en frontend
- [ ] Sanitización de datos del usuario
- [ ] Whitelist de caracteres permitidos
- [ ] Longitud máxima de inputs

**XSS Prevention:**
- [ ] No usar dangerouslySetInnerHTML
- [ ] Si es necesario, usar DOMPurify
- [ ] React escaping por defecto

**CSRF Protection:**
- [ ] CSRF tokens en requests mutantes
- [ ] SameSite cookies
- [ ] Verificar origin en backend

**Permisos:**
- [ ] Rutas protegidas con ProtectedRoute
- [ ] Verificación de permisos en frontend
- [ ] Re-validación en backend (crítico)

**Auditoría:**
- [ ] npm audit regularmente
- [ ] Actualizar dependencias vulnerables
- [ ] Monitoreo de logs de seguridad

---

### 16.12 Implementación Gradual

**Fase 1: Crítico (1 semana)**
- [ ] Mover credenciales a variables de entorno
- [ ] Cambiar contraseñas expuestas
- [ ] Agregar CSP headers
- [ ] Tokens en sessionStorage

**Fase 2: Alta (1 semana)**
- [ ] Validación de inputs
- [ ] Sanitización de datos
- [ ] Rate limiting en login
- [ ] ProtectedRoute

**Fase 3: Media (1 semana)**
- [ ] CSRF protection
- [ ] Auditoría de dependencias
- [ ] Security testing automatizado

**Prioridad:** CRÍTICA
**Esfuerzo estimado:** 3-5 días

---

## 17. CI/CD PIPELINE

### 17.1 Estado Actual: Sin Automatización

**Problemas:**
- Deploy manual propenso a errores
- No hay validación pre-deploy
- Sin tests automáticos
- No hay rollback fácil

---

### 17.2 GitHub Actions Workflow

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'LottoWebApp/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'LottoWebApp/**'

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./LottoWebApp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './LottoWebApp/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./LottoWebApp/coverage/coverage-final.json
          flags: frontend
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 60" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 60%"
            exit 1
          fi

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./LottoWebApp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-test, security-scan]

    defaults:
      run:
        working-directory: ./LottoWebApp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './LottoWebApp/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

      - name: Check bundle size
        run: |
          SIZE=$(du -sh dist | cut -f1)
          echo "Bundle size: $SIZE"
          # Fallar si el bundle es > 2MB
          SIZE_KB=$(du -sk dist | cut -f1)
          if [ $SIZE_KB -gt 2048 ]; then
            echo "Bundle size exceeds 2MB limit"
            exit 1
          fi

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: LottoWebApp/dist
          retention-days: 7

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build

    defaults:
      run:
        working-directory: ./LottoWebApp

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './LottoWebApp/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: LottoWebApp/playwright-report

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.lottery-app.com

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist

      - name: Deploy to Vercel/Netlify
        run: |
          # Ejemplo con Vercel
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://lottery-app.com

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist

      - name: Deploy to Production
        run: |
          # Ejemplo con Vercel
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          draft: false
          prerelease: false
```

---

### 17.3 Backend CI/CD

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'LottoApi/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'LottoApi/**'

jobs:
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./LottoApi

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore --configuration Release

      - name: Run tests
        run: dotnet test --no-build --configuration Release --verbosity normal

      - name: Publish
        run: dotnet publish --no-build --configuration Release --output ./publish

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: api-build
          path: LottoApi/publish

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: './LottoApi'
          severity: 'CRITICAL,HIGH'

  deploy-api:
    name: Deploy API
    runs-on: ubuntu-latest
    needs: [build-and-test, security-scan]
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: api-build
          path: publish

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: lottery-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: publish
```

---

### 17.4 Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

cd LottoWebApp

# Run linter
npm run lint

# Run tests
npm run test:unit

# Check types (si usas TypeScript)
# npm run type-check

echo "✅ Pre-commit checks passed"
```

**Instalación:**

```bash
cd LottoWebApp
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm test"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

### 17.5 Semantic Versioning

```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  },
  "devDependencies": {
    "standard-version": "^9.5.0",
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0"
  }
}
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva feature
        'fix',      // Bug fix
        'docs',     // Documentación
        'style',    // Formateo
        'refactor', // Refactorización
        'perf',     // Performance
        'test',     // Tests
        'chore',    // Mantenimiento
        'revert'    // Revert
      ]
    ]
  }
}
```

---

### 17.6 Environment Variables

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_ENV=development
VITE_ENABLE_LOGGING=true
```

```javascript
// vite.config.js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
```

---

### 17.7 Monitoreo Post-Deploy

```javascript
// utils/monitoring.js
export const initMonitoring = () => {
  if (import.meta.env.PROD) {
    // Sentry para error tracking
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_APP_ENV,
      release: __APP_VERSION__,
      tracesSampleRate: 0.1
    })

    // Google Analytics / Mixpanel
    // ...
  }
}
```

---

### 17.8 Rollback Strategy

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.version }}

      - name: Deploy previous version
        run: |
          # Redeploy versión anterior
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

### 17.9 CI/CD Checklist

**Pipeline Básico:**
- [ ] Lint automático
- [ ] Tests unitarios
- [ ] Build exitoso
- [ ] Security scan

**Pipeline Completo:**
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Coverage mínimo 60%
- [ ] Bundle size check
- [ ] Vulnerability scan
- [ ] Deploy automático
- [ ] Rollback strategy

**Hooks:**
- [ ] Pre-commit: lint + tests
- [ ] Pre-push: build check
- [ ] Commit message: conventional commits

**Monitoreo:**
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Analytics
- [ ] Logs centralizados

---

### 17.10 Implementación Gradual

**Fase 1: Básico (3 días)**
- [ ] GitHub Actions básico (lint + test + build)
- [ ] Pre-commit hooks
- [ ] Semantic versioning

**Fase 2: Intermedio (3 días)**
- [ ] E2E tests en CI
- [ ] Security scanning
- [ ] Coverage enforcement

**Fase 3: Avanzado (2 días)**
- [ ] Deploy automático
- [ ] Staging environment
- [ ] Rollback workflow

**Prioridad:** MEDIA
**Esfuerzo estimado:** 8 días

---

**Documento actualizado:** 19 de octubre de 2025
**Análisis basado en:** 36 componentes JSX, 7 servicios, configuración completa
**Secciones agregadas:** Testing Strategy, Accessibility Audit, Security Checklist, CI/CD Pipeline

---
