# CLAUDE.md - Lottery System Monorepo

Sistema de lotería con 2 frontends (React) y API (.NET). Migración de Vue.js en curso.

---

## ⚠️ INSTRUCCIONES CRÍTICAS

### Proceso Obligatorio

1. **LEER** este archivo antes de modificar código
2. **VERIFICAR** patrones y convenciones existentes
3. **USAR PLAYWRIGHT** para verificar coherencia visual en formularios
4. **DOCUMENTAR** cambios importantes en `docs/FIXES_HISTORY.md`

### Reglas Clave

- ❌ NO usar español en nombres de variables/componentes/rutas
- ❌ NO crear rutas sin conectarlas al menú (`menuItems.js`)
- ❌ NO modificar formularios sin revisar otros primero
- ✅ Código en inglés, UI visible al usuario en español

### 🚨 REGLA DE IDIOMA (MUY IMPORTANTE)

**TODO el código debe estar en inglés**, excepto textos visibles al usuario (UI).

```typescript
// ❌ INCORRECTO - Propiedades en español
interface Bet {
  sorteo: string;      // ❌
  numero: string;      // ❌
  monto: number;       // ❌
}

// ✅ CORRECTO - Propiedades en inglés
interface Bet {
  drawName: string;    // ✅
  betNumber: string;   // ✅
  betAmount: number;   // ✅
}

// ❌ INCORRECTO - Variables en español
const selectedBanca = useState();
const jugadasDirecto = [];
function calcularTotal() {}

// ✅ CORRECTO - Variables en inglés
const selectedPool = useState();
const directBets = [];
function calculateTotal() {}

// ✅ UI EN ESPAÑOL (esto SÍ está bien)
<Button>Crear Ticket</Button>
<Typography>Seleccione un sorteo</Typography>
placeholder="Buscar banca..."
```

**Resumen:**
| Elemento | Idioma |
|----------|--------|
| Variables, funciones, interfaces | Inglés |
| Propiedades de objetos/interfaces | Inglés |
| Nombres de componentes | Inglés |
| Textos en botones, labels, placeholders | Español |
| Mensajes de error al usuario | Español |
| Comentarios de código | Inglés preferido |

### Proceso de Rutas (3 Pasos)

```javascript
// 1. Crear componente
// 2. Agregar ruta en App.jsx
<Route path="/entities/list" element={<Component />} />
// 3. Conectar en menuItems.js ⚠️ NO OLVIDAR
{ path: '/entities/list', label: 'Lista' }
```

---

## 📦 ESTRUCTURA

```
lottery-project/
├── CLAUDE.md              # Este archivo
├── DESIGN_SYSTEM.md       # Colores, tipografía, componentes
├── docs/
│   ├── FIXES_HISTORY.md           # Historial de fixes
│   ├── MAINTAINABILITY_ANALYSIS.md # Análisis de código
│   ├── API_ENDPOINTS_MAPPING.md   # Endpoints Vue.js original
│   └── migration/                  # Documentación migración
├── frontend-v1/           # React + Bootstrap (puerto 4200)
├── frontend-v2/           # React + Material-UI (puerto 4000)
├── api/                   # .NET 8.0 API (puerto 5000)
└── database/              # Scripts SQL
```

---

## 🏗️ STACK TECNOLÓGICO

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| Frontend V1 | React 18 + Vite + Bootstrap 5 | 4200 |
| Frontend V2 | React 18 + Vite + Material-UI | 4000 |
| API Backend | .NET 8.0 + EF Core 8.0 | 5000 |
| Database | SQL Server | 1433 |

---

## 🚀 COMANDOS DE DESARROLLO

```bash
# API Backend
cd api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"

# Frontend V1
cd frontend-v1 && npm install && npm run dev

# Frontend V2
cd frontend-v2 && npm install && npm run dev

# Verificar puertos
lsof -ti:4200  # V1
lsof -ti:4000  # V2
lsof -ti:5000  # API
```

---

## 🔑 CREDENCIALES

| Uso | Usuario | Contraseña |
|-----|---------|------------|
| Login | `admin` | `Admin123456` |
| Vue.js Original | `oliver` | `oliver0597@` |

**Banca de Prueba:** ID 9, Nombre: admin, Código: RB003333

---

## 📂 ESTRUCTURA DE FRONTENDS

### V1 (Bootstrap)
```
frontend-v1/src/
├── components/
│   ├── EditBanca.jsx      # ⚠️ 2,724 líneas - necesita refactor
│   └── tabs/              # Tabs de edición
├── services/
│   ├── api.js             # Cliente HTTP (retorna data directamente)
│   └── prizeFieldService.js
└── constants/menuItems.js
```

### V2 (Material-UI)
```
frontend-v2/src/
├── components/features/
│   └── betting-pools/
│       ├── EditBettingPool/
│       │   └── hooks/     # Custom hooks para estado
│       └── tabs/
├── services/
│   └── prizeService.js    # Con transformación prizeTypes → prizeFields
└── constants/menuItems.js
```

---

## 📂 API BACKEND

### Endpoints Principales

```
POST   /api/auth/login
GET    /api/bet-types/with-fields      # Bet types con prize fields
GET    /api/betting-pools
GET    /api/betting-pools/{id}
GET    /api/betting-pools/{id}/prize-config
PATCH  /api/betting-pools/{id}/prize-config
GET    /api/draws
GET    /api/zones
GET    /health
```

### Estructura
```
api/src/LotteryApi/
├── Controllers/
│   ├── AuthController.cs
│   ├── BettingPoolsController.cs
│   └── DrawsController.cs
├── Models/
├── DTOs/
└── Validators/
```

---

## 📋 PATRONES Y CONVENCIONES

### Nomenclatura

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| DB tables | snake_case | `betting_pool_prize_config` |
| C# | PascalCase | `BettingPoolId` |
| JS/React | camelCase/PascalCase | `getPrizeFields`, `PrizesTab.jsx` |
| CSS | kebab-case | `prize-field-input` |

### Transformación Prize Fields (IMPORTANTE)

```javascript
// API devuelve prizeTypes, frontend espera prizeFields
// Transformar SIEMPRE en service layer:
data.forEach(betType => {
  if (betType.prizeTypes) {
    betType.prizeFields = betType.prizeTypes;
  }
});
```

### API Response Pattern

```javascript
// api.get() retorna DATA directamente (no response.data)
const data = await api.get('/endpoint');  // ← Ya es data
```

### useEffect Dependencies

```javascript
// ❌ Objeto como dependencia - re-render cada vez
useEffect(() => {}, [selectedSorteo]);

// ✅ Primitivo como dependencia
useEffect(() => {}, [selectedSorteo?.sorteo_id]);
```

---

## 🎨 DISEÑO Y COLORES

```css
--primary-color: #51cbce;     /* Turquesa - botones principales */
--primary-hover: #45b8bb;     /* Hover */
--success-color: #28a745;     /* Verde - estados exitosos */
--text-color: #2c2c2c;        /* Negro - texto general */
--background: #f5f5f5;        /* Gris claro - fondo */
--font-family: Montserrat, sans-serif;
```

### Botones MUI Estándar

```javascript
sx={{
  bgcolor: '#51cbce',
  '&:hover': { bgcolor: '#45b8bb' },
  color: 'white',
  textTransform: 'none',
}}
```

---

## 🚨 GOTCHAS

1. **Puertos:** V2 usa 4002 si 4000 está ocupado (Vite auto-increment)
2. **CORS:** API tiene CORS habilitado para todos los orígenes
3. **Respuestas paginadas:** `response.items || response` para arrays

---

## 🚨 MIGRACIÓN VUE.JS

**Aplicación original:** https://la-numbers.apk.lol

**Estrategia:**
1. Análisis con Playwright
2. Ingeniería inversa de endpoints
3. Replicar en React
4. Conectar a API .NET

**Documentación:** Ver `docs/migration/VUE_APP_ANALYSIS.md`

---

## 📝 DOCUMENTACIÓN ADICIONAL

| Archivo | Contenido |
|---------|-----------|
| `docs/FIXES_HISTORY.md` | Historial detallado de fixes |
| `docs/MAINTAINABILITY_ANALYSIS.md` | Análisis de calidad de código |
| `docs/API_ENDPOINTS_MAPPING.md` | Endpoints de API Vue.js original |
| `DESIGN_SYSTEM.md` | Sistema de diseño completo |

---

## 🔧 SCRIPTS DE UTILIDAD

```bash
# Verificar nomenclatura
./scripts/verify-naming.sh

# Verificar coherencia de diseño
./scripts/check-design-consistency.sh

# ESLint personalizado
npx eslint . -c .eslintrc.custom.cjs
```

---

## 🧪 TESTING

### Playwright (E2E)

```bash
cd frontend-v2
npx playwright install
```

### Selectores V1 (Bootstrap)
```javascript
'input[placeholder*="Usuario" i]'
'button:has-text("INICIAR SESIÓN")'
```

### Selectores V2 (MUI)
```javascript
'input#username'
'button[type="submit"]'
```

### API Testing
```bash
curl http://localhost:5000/health
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/draws
```

---

## ⚡ PROBLEMAS CONOCIDOS (Ver MAINTAINABILITY_ANALYSIS.md)

| Problema | Severidad | Acción |
|----------|-----------|--------|
| EditBanca.jsx 2,724 líneas | 🔴 CRÍTICO | Dividir en sub-componentes |
| 700+ console.log | 🔴 CRÍTICO | Remover o usar logger |
| Token en localStorage | 🔴 CRÍTICO | Migrar a solución segura |
| Sin tests | 🟠 ALTO | Agregar tests E2E |

---

**Última actualización:** 2025-11-21
**Versión:** 2.0 (reorganizado)
