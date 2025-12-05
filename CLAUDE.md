# CLAUDE.md - Lottery System Monorepo

Sistema de lotería con frontend React (TypeScript) y API (.NET).

---

## 🚨 FRONTEND: frontend-v4

**IMPORTANTE:** Todo el desarrollo de frontend se realiza en `frontend-v4`.

```bash
cd frontend-v4 && npm run dev  # Puerto 5173
```

---

## ⚠️ INSTRUCCIONES CRÍTICAS

### Proceso Obligatorio

1. **LEER** este archivo antes de modificar código
2. **VERIFICAR** patrones y convenciones existentes
3. **USAR PLAYWRIGHT** para verificar coherencia visual en formularios
4. **DOCUMENTAR** cambios importantes en `docs/FIXES_HISTORY.md`

### Reglas Clave

- ❌ NO usar español en nombres de variables/componentes/rutas
- ❌ NO crear rutas sin conectarlas al menú (`menuItems.ts`)
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

```typescript
// 1. Crear componente
// 2. Agregar ruta en App.tsx
<Route path="/entities/list" element={<Component />} />
// 3. Conectar en menuItems.ts ⚠️ NO OLVIDAR
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
├── frontend-v4/           # React + TypeScript + Material-UI (puerto 5173)
├── api/                   # .NET 8.0 API (puerto 5000)
└── database/              # Scripts SQL
```

---

## 🏗️ STACK TECNOLÓGICO

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| Frontend | React 18 + Vite + TypeScript + Material-UI | 5173 |
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

# Frontend
cd frontend-v4 && npm install && npm run dev

# Verificar puertos
lsof -ti:5173  # Frontend
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

## 📂 ESTRUCTURA DEL FRONTEND

```
frontend-v4/src/
├── components/features/
│   └── betting-pools/
│       ├── EditBettingPool/
│       │   └── hooks/     # Custom hooks para estado
│       └── tabs/
├── services/
│   └── prizeService.ts    # Con transformación prizeTypes → prizeFields
└── constants/menuItems.ts
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
| TypeScript/React | camelCase/PascalCase | `getPrizeFields`, `PrizesTab.tsx` |
| CSS | kebab-case | `prize-field-input` |

### Transformación Prize Fields (IMPORTANTE)

```typescript
// API devuelve prizeTypes, frontend espera prizeFields
// Transformar SIEMPRE en service layer:
data.forEach(betType => {
  if (betType.prizeTypes) {
    betType.prizeFields = betType.prizeTypes;
  }
});
```

### API Response Pattern

```typescript
// api.get() retorna DATA directamente (no response.data)
const data = await api.get('/endpoint');  // ← Ya es data
```

### useEffect Dependencies

```typescript
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

```typescript
sx={{
  bgcolor: '#51cbce',
  '&:hover': { bgcolor: '#45b8bb' },
  color: 'white',
  textTransform: 'none',
}}
```

---

## 🚨 GOTCHAS

1. **CORS:** API tiene CORS habilitado para todos los orígenes
2. **Respuestas paginadas:** `response.items || response` para arrays

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
cd frontend-v4
npx playwright install
```

### API Testing
```bash
curl http://localhost:5000/health
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/draws
```

---

**Última actualización:** 2025-12-04
**Versión:** 3.0 (simplificado - solo frontend-v4)
