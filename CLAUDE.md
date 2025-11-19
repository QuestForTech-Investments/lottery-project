# CLAUDE.md - Lottery System Monorepo

Este archivo proporciona contexto a Claude Code sobre el sistema completo de lotería, consolidando 4 proyectos en un solo repositorio.

---

## ⚠️ INSTRUCCIONES CRÍTICAS PARA CLAUDE CODE

### 📖 LEER ESTE ARCHIVO ES OBLIGATORIO

**PARA EL USUARIO:**
Al inicio de cada nueva sesión con Claude Code, SIEMPRE escribe:
```
Lee el archivo CLAUDE.md antes de hacer cualquier cambio
```

**PARA CLAUDE CODE:**
Antes de realizar CUALQUIER modificación en el proyecto (código, CSS, componentes, etc.):

1. ✅ **LEER** `/home/jorge/projects/lottery-project/CLAUDE.md` COMPLETO
2. ✅ **VERIFICAR** secciones relevantes:
   - Regla de Idioma para Código (línea 666)
   - Coherencia de Diseño en Formularios (línea 809)
   - Nomenclatura y Convenciones (línea 654)
   - Fixes Recientes (línea 529 y 584)
   - Patrones del proyecto
3. ✅ **APLICAR** las reglas y convenciones documentadas
4. ✅ **USAR PLAYWRIGHT** para verificar coherencia cuando se modifiquen formularios

### 🚫 NO ASUMIR - SIEMPRE VERIFICAR

- ❌ NO crear componentes sin verificar convenciones de nombres
- ❌ NO modificar formularios sin revisar otros formularios primero
- ❌ NO usar español en nombres de variables/componentes/rutas
- ❌ NO cambiar estilos sin verificar coherencia visual
- ❌ **NO crear rutas sin conectarlas al menú de navegación**

### ✅ PROCESO CORRECTO

1. Usuario: "Modifica el formulario X"
2. Claude:
   - Lee CLAUDE.md
   - Verifica reglas de nomenclatura
   - Usa Playwright para revisar formularios similares (si aplica)
   - Aplica cambios siguiendo convenciones
   - **DOCUMENTA el fix/cambio en CLAUDE.md (OBLIGATORIO)**

**Flujo Completo:**
```
Leer CLAUDE.md → Hacer cambios → Verificar → Documentar en CLAUDE.md → Commit
```

**⚠️ NO OLVIDAR:** La documentación NO es opcional, es parte del fix.

### 🔗 RUTAS Y NAVEGACIÓN - PROCESO OBLIGATORIO

**CRÍTICO:** Cada vez que crees una nueva ruta/componente, SIEMPRE debes conectarla al menú de navegación.

#### Proceso de 3 Pasos:

**1. Crear el Componente**
```javascript
// Ejemplo: TransactionsByBettingPool.jsx
```

**2. Agregar la Ruta en App.jsx**
```javascript
// V1: frontend-v1/src/App.jsx
<Route path="/accountable-transactions/betting-pool" element={<TransactionsByBettingPool />} />

// V2: frontend-v2/src/App.jsx
<Route path="/accountable-transactions/betting-pool" element={<TransactionsByBettingPoolMUI />} />
```

**3. Conectar al Menú en menuItems.js** ⚠️ **¡NO OLVIDAR ESTE PASO!**
```javascript
// V1: frontend-v1/src/constants/menuItems.js
// V2: frontend-v2/src/constants/menuItems.js

{
  id: 'transacciones',
  label: 'TRANSACCIONES',
  icon: 'nc-credit-card',
  submenu: [
    { id: 'trans-bancas', label: 'Bancas', shortcut: 'B', path: '/accountable-transactions/betting-pool' }
  ]
}
```

#### Verificación:
- ✅ La ruta en `App.jsx` coincide con el `path` en `menuItems.js`
- ✅ El menú muestra el nuevo item
- ✅ Al hacer clic en el item, navega al componente correcto

#### Archivos a Modificar SIEMPRE:
1. `frontend-v1/src/App.jsx` - Agregar Route
2. `frontend-v1/src/constants/menuItems.js` - Agregar menu item
3. `frontend-v2/src/App.jsx` - Agregar Route
4. `frontend-v2/src/constants/menuItems.js` - Agregar menu item

### 📝 DOCUMENTAR TODOS LOS FIXES EN ESTE ARCHIVO (OBLIGATORIO)

**CRÍTICO:** CADA fix, cambio importante, o solución DEBE documentarse en este archivo INMEDIATAMENTE después de completarlo.

#### ¿Cuándo Documentar?

Documenta SIEMPRE que:
- ✅ Corrijas un bug o error
- ✅ Implementes una nueva funcionalidad
- ✅ Cambies patrones o convenciones
- ✅ Modifiques diseño o estilos
- ✅ Agregues/modifiques rutas o navegación
- ✅ Refactorices código importante
- ✅ Descubras algo no obvio o tricky
- ✅ El usuario reporte un problema y lo soluciones

#### Formato de Documentación

```markdown
### Fix: [Título Descriptivo] (YYYY-MM-DD)

**Problema:** [Descripción clara del problema]

**Causa Raíz:** [Por qué ocurrió el problema]

**Archivos Modificados:**
- `ruta/archivo1.ext` (líneas X-Y)
- `ruta/archivo2.ext` (líneas A-B)

**Solución Aplicada:**
[Explicación de la solución]

```javascript
// Código relevante si aplica
```

**Resultado:** [Qué se logró, cómo verificarlo]

**Lección Aprendida:** [Qué aprendimos para prevenir en el futuro]
```

#### Ubicación de la Documentación

Agregar en la sección **"🔧 FIXES RECIENTES"** ordenados por fecha (más reciente primero).

#### ¿Por Qué Es Obligatorio?

- ✅ **Continuidad entre sesiones**: Cuando Claude Code se reinicia, lee CLAUDE.md para recuperar contexto
- ✅ **Prevención de errores repetidos**: Evita cometer los mismos errores
- ✅ **Onboarding rápido**: Cualquiera puede entender el proyecto leyendo este archivo
- ✅ **Debugging eficiente**: Si algo falla, se puede revisar qué se cambió y por qué
- ✅ **Memoria del proyecto**: Este archivo ES la memoria persistente del proyecto

#### Ejemplo de Buen Fix Documentado

Ver sección "🔧 FIXES RECIENTES" líneas 584-776 para ejemplos completos.

---

## 🛠️ HERRAMIENTAS Y SCRIPTS (Creados 2025-11-18)

### Scripts de Verificación

**1. Verificar Nomenclatura en Inglés**
```bash
./scripts/verify-naming.sh
```
- Busca nombres de archivos y componentes en español
- Verifica que se cumplan las reglas de nomenclatura
- Ejecutar antes de commits importantes

**2. Verificar Coherencia de Diseño**
```bash
./scripts/check-design-consistency.sh
```
- Detecta colores no autorizados (ej: morado #667eea)
- Verifica uso de Montserrat font-family
- Compara contra DESIGN_SYSTEM.md

### Configuraciones de Calidad

**1. ESLint Personalizado** (`.eslintrc.custom.cjs`)
- Reglas que refuerzan nomenclatura en inglés
- Límites de complejidad y tamaño de archivos
- Mejores prácticas de React Hooks
- Uso: `npx eslint . -c .eslintrc.custom.cjs`

**2. Prettier** (`.prettierrc.json`)
- Formateo consistente de código
- Single quotes, semi-colons, 100 caracteres
- Uso: `npx prettier --write "frontend-v1/src/**/*.{js,jsx}"`

### Documentación

**DESIGN_SYSTEM.md** - Sistema de diseño completo
- Paleta de colores corporativos (#51cbce, #28a745, etc.)
- Tipografía (Montserrat, tamaños, pesos)
- Sistema de espaciado (múltiplos de 8px)
- Componentes (botones, inputs, tablas, títulos)
- Shadows, borders, responsive breakpoints
- **Checklist de coherencia**

**Uso:**
- Consultar ANTES de crear/modificar componentes
- Verificar que todos los colores estén autorizados
- Aplicar tamaños de fuente y espaciado definidos

---

## 🚨 MIGRACIÓN EN CURSO - INFORMACIÓN CRÍTICA

### Objetivo Principal
**Migrar aplicación de Vue.js a React + Vite SIN código fuente disponible.**

### Aplicación Original (Vue.js)
- **URL:** https://la-numbers.apk.lol
- **Usuario:** oliver
- **Contraseña:** oliver0597@
- **Framework:** Vue.js (versión a determinar)
- **Estado:** En producción, funcional

### Estrategia de Migración
1. **Análisis con Playwright** - Automatizar navegación para entender flujos
2. **Ingeniería inversa** - Inspeccionar red, DOM, comportamientos
3. **Replicar funcionalidad** - Crear equivalente en React + Vite
4. **Conectar a API existente** - Usar endpoints ya documentados

### Herramientas de Análisis
```bash
# Playwright para automatización
npx playwright install
npx playwright codegen https://la-numbers.apk.lol

# DevTools del navegador
# - Network tab: capturar endpoints y payloads
# - Elements: analizar estructura de componentes
# - Vue DevTools: si está disponible
```

### Tareas Pendientes de Migración
- [x] Mapear todas las rutas/vistas de la app Vue (70+ rutas documentadas)
- [x] Documentar endpoints consumidos (API: api.lotocompany.com/api/v1/)
- [x] Identificar flujos de usuario principales (23 módulos)
- [ ] Replicar lógica de negocio en React
- [ ] Migrar estilos y componentes UI
- [ ] Interceptar payloads completos de endpoints
- [ ] Mapear endpoints Vue → .NET API

### Documentación Generada
- **`docs/migration/VUE_APP_ANALYSIS.md`** - Análisis completo de la app Vue.js
  - 70+ rutas mapeadas
  - 70+ loterías/sorteos identificados
  - Endpoints de API documentados
  - Módulos y funcionalidades detallados

---

## 📦 ESTRUCTURA DEL MONOREPO

```
lottery-system/
├── CLAUDE.md                    # Este archivo - Contexto del proyecto
├── DESIGN_SYSTEM.md             # ⭐ Sistema de diseño (colores, tipografía, componentes)
├── README.md                    # Documentación general
├── .gitignore
├── .eslintrc.custom.cjs         # ⭐ ESLint con reglas personalizadas
├── .prettierrc.json             # ⭐ Prettier configuration
│
├── scripts/                     # ⭐ Scripts de utilidad
│   ├── verify-naming.sh         # Verifica nombres en inglés
│   └── check-design-consistency.sh  # Verifica coherencia de diseño
│
├── frontend-v1/                 # Frontend Bootstrap (Legacy)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── frontend-v2/                 # Frontend Material-UI (Nuevo)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── api/                         # Backend .NET API
│   ├── src/LotteryApi/
│   ├── LotteryApi.sln
│   └── docs/
│
└── database/                    # Scripts SQL y migraciones
    ├── migrations/
    ├── seeds/
    └── docs/
```

---

## 🏗️ ARQUITECTURA GENERAL

### Stack Tecnológico

| Componente | Tecnología | Puerto | Ubicación |
|------------|------------|--------|-----------|
| **Frontend V1** | React 18 + Vite + Bootstrap 5 | 4200 | `/frontend-v1` |
| **Frontend V2** | React 18 + Vite + Material-UI | 4000/4002 | `/frontend-v2` |
| **API Backend** | .NET 8.0 + EF Core 8.0 | 5000 | `/api` |
| **Database** | SQL Server (Azure SQL) | 1433 | `/database` |

### Flujo de Datos

```
┌─────────────┐     ┌─────────────┐
│ Frontend V1 │     │ Frontend V2 │
│  (Bootstrap) │     │  (MUI)      │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
          ┌──────▼──────┐
          │  .NET API   │
          │  (Port 5000) │
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │  SQL Server │
          │  Database   │
          └─────────────┘
```

---

## 🚀 COMANDOS DE DESARROLLO

### Iniciar Todo el Sistema

```bash
# 1. Base de datos (asumiendo SQL Server corriendo)

# 2. API Backend
cd api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"

# 3. Frontend V1 (Bootstrap)
cd frontend-v1
npm install
npm run dev  # Puerto 4200

# 4. Frontend V2 (Material-UI)
cd frontend-v2
npm install
npm run dev  # Puerto 4000 o 4002
```

### Verificar Puertos

```bash
lsof -ti:4200  # Frontend V1
lsof -ti:4000  # Frontend V2
lsof -ti:5000  # API
lsof -ti:1433  # SQL Server
```

---

## 📂 FRONTEND V1 (Bootstrap Legacy)

### Información

- **Framework:** React 18 + Vite
- **UI Library:** Bootstrap 5 + jQuery + Font Awesome
- **Puerto:** 4200
- **Estado:** En producción, legacy

### Estructura de Carpetas

```
frontend-v1/src/
├── assets/css/           # Estilos CSS
├── components/
│   ├── common/          # Componentes compartidos
│   ├── tabs/            # Tabs de edición (PremiosComisionesTab, etc.)
│   ├── dashboard/       # Widgets del dashboard
│   ├── EditBanca.jsx    # Editor principal de bancas
│   └── CreateBanca.jsx  # Crear nueva banca
├── pages/
│   └── Dashboard.jsx
├── services/
│   ├── api.js                    # Cliente HTTP base
│   ├── prizeFieldService.js      # ⚡ Servicios de premios
│   └── sortitionService.js       # Servicios de sorteos
└── CLAUDE.md                     # Documentación específica V1
```

### Archivos Clave

- **`src/services/prizeFieldService.js`** - Transformación `prizeTypes` → `prizeFields`
- **`src/components/tabs/PremiosComisionesTab.jsx`** - Tab de configuración de premios
- **`src/components/EditBanca.jsx`** - Componente principal de edición
- **`src/services/api.js`** - Cliente HTTP (retorna data directamente, no response.data)

### Patrones Importantes

```javascript
// api.js retorna data directamente:
const response = await api.get('/endpoint');
return response; // NO response.data

// Fallback pattern para prizeFields:
const prizeFields = betType.prizeFields || betType.PrizeFields || [];

// useEffect con IDs, no objetos:
useEffect(() => { ... }, [selectedSorteo?.sorteo_id]); // Correcto
// NO: [selectedSorteo] - causa re-renders innecesarios
```

### Rutas Principales

- `/` - Login
- `/dashboard` - Dashboard principal
- `/bancas/lista` - Lista de bancas
- `/bancas/editar/:id` - Editar banca (incluye Premios & Comisiones)
- `/bancas/crear` - Crear nueva banca

---

## 📂 FRONTEND V2 (Material-UI)

### Información

- **Framework:** React 18 + Vite
- **UI Library:** Material-UI + Emotion + Lucide Icons
- **Puerto:** 4000 (o 4002 si 4000 ocupado)
- **Estado:** En desarrollo activo

### Estructura de Carpetas

```
frontend-v2/src/
├── components/
│   ├── features/
│   │   └── betting-pools/
│   │       ├── CreateBettingPool/
│   │       │   └── tabs/
│   │       │       ├── GeneralTab.jsx
│   │       │       ├── PrizesTab.jsx      # ⚡ Tab de premios
│   │       │       └── CommissionsTab.jsx
│   │       └── EditBettingPool/
│   ├── layout/
│   └── common/
├── services/
│   ├── api.js
│   ├── prizeService.js           # ⚡ Servicios de premios optimizados
│   └── bettingPoolService.js
├── hooks/
├── utils/
└── styles/
```

### Archivos Clave

- **`src/services/prizeService.js`** - Transformación + caching + endpoint optimizado
- **`src/components/features/betting-pools/CreateBettingPool/tabs/PrizesTab.jsx`** - Tab de premios
- **`vite.config.js`** - Proxy API configurado

### Patrones Importantes

```javascript
// Endpoint optimizado con caching:
const betTypesData = await getAllBetTypesWithFields();
// Uses: /api/bet-types/with-fields (single call, cached)

// Transformación con sorting:
if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
  betType.prizeFields = betType.prizeTypes;
  betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
}

// Path aliases en vite.config.js:
import Component from '@components/Component';
import { service } from '@services/service';
```

### Rutas Principales

- `/` - Login
- `/dashboard` - Dashboard
- `/betting-pools` - Lista de bancas
- `/betting-pools/edit/:id` - Editar banca
- `/betting-pools/create` - Crear banca

---

## 📂 API BACKEND (.NET)

### Información

- **Framework:** .NET 8.0 + Entity Framework Core 8.0
- **Database:** SQL Server
- **Auth:** JWT Bearer Token
- **Puerto:** 5000

### Estructura

```
api/src/LotteryApi/
├── Controllers/
│   ├── AuthController.cs
│   ├── BettingPoolsController.cs    # ⚡ Bancas + Prize Config
│   ├── BetTypesController.cs        # ⚡ Tipos de apuesta
│   ├── LotteriesController.cs
│   ├── DrawsController.cs
│   ├── UsersController.cs
│   ├── ZonesController.cs
│   └── TestController.cs
├── Models/
│   ├── Entities.cs                  # Entidades de dominio
│   ├── DTOs.cs                      # Data Transfer Objects
│   └── LotteryDbContext.cs          # EF Core DbContext
├── Services/
│   └── UserPermissionService.cs
├── Program.cs
├── appsettings.json
└── LotteryApi.csproj
```

### Endpoints Principales

```
GET    /api/auth/login                              # Login
GET    /api/bet-types/with-fields                   # ⚡ Todos los bet types con prize fields
GET    /api/prize-fields                            # ⚡ Prize fields agrupados
GET    /api/betting-pools                           # Lista de bancas
GET    /api/betting-pools/{id}                      # Detalle de banca
GET    /api/betting-pools/{id}/prize-config         # ⚡ Config de premios de banca
PATCH  /api/betting-pools/{id}/prize-config         # ⚡ Actualizar config parcialmente
POST   /api/betting-pools/{id}/prize-config         # Guardar config completa
DELETE /api/betting-pools/{id}/prize-config         # Eliminar config
GET    /api/lotteries                               # Lista de loterías
GET    /api/draws                                   # Lista de sorteos
GET    /api/zones                                   # Zonas geográficas
GET    /health                                      # Health check
GET    /info                                        # Info del API
```

### Respuesta de /api/bet-types/with-fields

```json
[
  {
    "betTypeId": 1,
    "betTypeCode": "DIRECTO",
    "betTypeName": "Directo",
    "prizeTypes": [                    // ← API devuelve "prizeTypes"
      {
        "prizeTypeId": 61,
        "fieldCode": "DIRECTO_PRIMER_PAGO",
        "fieldName": "Directo - Primer Pago",
        "defaultMultiplier": 56.0,
        "displayOrder": 1
      }
    ]
  }
]
```

### Configuración

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=LottoTest;..."
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "LotteryAPI",
    "Audience": "LotteryApp",
    "ExpiryInMinutes": 60
  }
}
```

---

## 📂 DATABASE

### Información

- **Engine:** SQL Server (Azure SQL Database)
- **Schema:** lottery_db / LottoTest
- **Naming:** snake_case para tablas y columnas

### Tablas Principales

```sql
-- Usuarios y Permisos
users
roles
permissions
user_permissions (N:M)
role_permissions (N:M)
user_zones (N:M)

-- Geográfico
countries
zones
branches (bancas)

-- Loterías
lotteries
draws
game_types
game_categories

-- Premios (⚡ Relevante para fix)
bet_types                        -- Tipos de apuesta (Directo, Palé, etc.)
prize_types                      -- Campos de premio por bet_type
betting_pool_prize_config        -- Config de premios por banca
draw_prize_config                -- Config de premios por sorteo específico

-- Tickets
tickets
ticket_lines
results
prizes

-- Financiero
balances
```

### Relación Prize Types

```sql
-- bet_types → prize_types (1:N)
CREATE TABLE prize_types (
  prize_type_id INT PRIMARY KEY,
  bet_type_id INT FOREIGN KEY,
  field_code VARCHAR(50),        -- DIRECTO_PRIMER_PAGO
  field_name VARCHAR(100),       -- Directo - Primer Pago
  default_multiplier DECIMAL,    -- 56.00
  display_order INT              -- 1, 2, 3, 4...
);

-- betting_pool_prize_config (config por banca)
CREATE TABLE betting_pool_prize_config (
  config_id INT PRIMARY KEY,
  betting_pool_id INT FOREIGN KEY,
  prize_type_id INT FOREIGN KEY,
  value DECIMAL                  -- Valor personalizado
);
```

---

## 🆕 NUEVAS FUNCIONALIDADES (2025-11-16)

### Mass Edit Betting Pools / Edición Masiva de Bancas

**Commit:** `5017ba3`

Componente para actualizar múltiples bancas simultáneamente, replicando la funcionalidad de la aplicación Vue.js original.

#### Archivos Creados

**V1 (Bootstrap):**
- `frontend-v1/src/components/MassEditBancas.jsx` - Componente principal
- `frontend-v1/src/components/common/form/` - Componentes reutilizables:
  - `ToggleButtonGroup.jsx` - Botones toggle (ENCENDER/APAGAR/NO CAMBIAR)
  - `IPhoneToggle.jsx` - Switch estilo iOS
  - `SelectableBadgeGroup.jsx` - Badges clickeables para selección
  - `constants.js` - Constantes de estilos (colores, tamaños)
  - `index.js` - Exports

**V2 (Material-UI):**
- `frontend-v2/src/components/features/betting-pools/MassEditBettingPools/index.jsx`

#### Layout Implementado

```
┌─────────────────────────────────────────────────┐
│ SECCIÓN 1 (Full-width)                          │
│ ├─ Zona (label izq, select der)                 │
│ ├─ Tipo de caída (6 botones en UNA línea)       │
│ ├─ Balance de desactivación                     │
│ └─ Límite de venta diaria                       │
├─────────────────────────────────────────────────┤
│ SECCIÓN 2 (Dos columnas lado a lado)            │
│ │ Columna Izquierda  │ Columna Derecha         │
│ │ ─────────────────  │ ─────────────────       │
│ │ Imprimir copia...  │ Idioma                  │
│ │ Activa             │ Modo de impresión       │
│ │ Control tickets... │ Proveedor descuento     │
│ │ Usar premios...    │ Modo de descuento       │
│ │ Permitir pasar...  │ Permitir cambiar pwd    │
│ │ Minutos cancelar   │                          │
│ │ Tickets cancelar   │                          │
├─────────────────────────────────────────────────┤
│ SECCIÓN 3 (Full-width)                          │
│ ├─ SORTEOS (badges/chips clickeables)           │
│ ├─ BANCAS (badges/chips clickeables)            │
│ ├─ ZONAS (badges/chips clickeables)             │
│ ├─ Switch "Actualizar valores generales"        │
│ └─ Botón ACTUALIZAR                             │
└─────────────────────────────────────────────────┘
```

#### Características Clave

- **Labels y botones centrados verticalmente** (alignItems: center)
- **Tipo de caída**: 6 botones en una sola línea (OFF, COBRO, DIARIA, MENSUAL, SEMANAL CON ACUMULADO, SEMANAL SIN ACUMULADO)
- **Color emerald** (#5bc0be) para seleccionados con hover effects
- **Botones más grandes**: font-size 11px, padding 4px 10px
- **Responsive**: Dos columnas se adaptan en pantallas anchas (1400px+)

#### Rutas

- **V1**: `/bancas/edicion-masiva` → `MassEditBancas`
- **V2**: `/betting-pools/mass-edit` → `MassEditBettingPools`

#### API Endpoint

```javascript
PATCH /api/betting-pools/mass-update
{
  bettingPoolIds: [1, 2, 3],
  drawIds: [1, 2],
  zoneIds: [1],
  configuration: {
    fallType: 'DIARIA',
    deactivationBalance: '1000',
    printTicketCopy: 'NO CAMBIAR',
    // ... más campos
  }
}
```

---

## 🔧 FIXES RECIENTES (2025-11-14)

### Fix Principal: Missing Prize Input Fields

**Problema:** Inputs de premios no se mostraban en tab "Premios & Comisiones"

**Causa Raíz:**
- API devuelve `prizeTypes` array
- Frontend espera `prizeFields` array
- Condición `betType.prizeFields.length > 0` fallaba

**Solución Aplicada:**

#### V1 (`frontend-v1/src/services/prizeFieldService.js`)
```javascript
export const getPrizeFields = async () => {
  const response = await api.get('/prize-fields');

  // Transformación
  if (Array.isArray(response)) {
    response.forEach(betType => {
      if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
        betType.prizeFields = betType.prizeTypes;  // ← Fix
      }
    });
  }
  return response;
};
```

#### V2 (`frontend-v2/src/services/prizeService.js`)
```javascript
export const getAllBetTypesWithFields = async () => {
  const data = await api.get('/bet-types/with-fields');

  data.forEach(betType => {
    if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
      betType.prizeFields = betType.prizeTypes;  // ← Fix
      betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  });
  return data;
};
```

#### API (`api/src/LotteryApi/`)
- Refactor: Renombrado `prize_fields` → `prize_types` para consistencia

**Commits:**
- V1: `5211df7` en `refactor/simplify-prize-mapping`
- V2: `cadb56c` en `main`
- API: `e644337` en `main`

---

## 🔧 FIXES RECIENTES (2025-11-18)

### Fix: Documentación Obligatoria de Todos los Fixes en CLAUDE.md (2025-11-18)

**Problema:** Las sesiones de Claude Code se cierran por timeout de inactividad, causando pérdida de contexto entre sesiones. Aunque existe continuación de sesiones, la documentación de fixes no era obligatoria ni estaba estandarizada.

**Causa Raíz:**
- No existía un proceso formal para documentar fixes
- La documentación era opcional en lugar de obligatoria
- No había un formato estándar para documentar cambios

**Archivos Modificados:**
- `/home/jorge/projects/lottery-project/CLAUDE.md` (líneas 94-149)
  - Nueva sección: "📝 DOCUMENTAR TODOS LOS FIXES EN ESTE ARCHIVO (OBLIGATORIO)"
  - Actualizada sección: "✅ PROCESO CORRECTO" (líneas 38-53)

**Solución Aplicada:**

1. **Agregada sección de documentación obligatoria** con:
   - Lista clara de cuándo documentar
   - Formato estándar de documentación
   - Explicación de por qué es obligatorio
   - Referencias a ejemplos existentes

2. **Formato estandarizado de documentación:**
```markdown
### Fix: [Título] (YYYY-MM-DD)
**Problema:** [descripción]
**Causa Raíz:** [por qué ocurrió]
**Archivos Modificados:** [lista con líneas]
**Solución Aplicada:** [explicación + código]
**Resultado:** [qué se logró]
**Lección Aprendida:** [prevención futura]
```

3. **Actualizado flujo de trabajo:**
```
Leer CLAUDE.md → Hacer cambios → Verificar → Documentar en CLAUDE.md → Commit
```

**Resultado:**
- ✅ Cada fix quedará documentado permanentemente
- ✅ Continuidad entre sesiones garantizada
- ✅ Nuevo Claude Code puede leer CLAUDE.md y conocer todo el historial
- ✅ Prevención de errores repetidos
- ✅ Onboarding más rápido para cualquier desarrollador

**Lección Aprendida:**
CLAUDE.md es la memoria persistente del proyecto. Documentar TODO en este archivo no es opcional - es crítico para la continuidad del proyecto cuando las sesiones de Claude Code se reinician.

**Beneficios Adicionales:**
- Sirve como documentación técnica completa
- Facilita debugging (revisar qué cambió y cuándo)
- Permite entender decisiones de diseño pasadas
- Crea un knowledge base del proyecto

---

### Fix: Color Coherence in V2 Loans and Excesses Modules (2025-11-19)

**Problema:** Botones en los módulos de Préstamos y Excedentes de V2 no mantenían coherencia de colores con el sistema de diseño. Usaban propiedades y valores inconsistentes.

**Causa Raíz:**
- Usaban `backgroundColor` en lugar de `bgcolor` (convención Material-UI)
- Hover color incorrecto: `#45b5b8` en lugar de `#45b8bb`
- Faltaba `color: 'white'` explícito
- Usaban `textTransform: 'uppercase'` en lugar de `'none'`

**Archivos Modificados:**
- `frontend-v2/src/components/features/loans/CreateLoan/index.jsx` (línea 275)
- `frontend-v2/src/components/features/loans/LoansList/index.jsx` (línea 407)
- `frontend-v2/src/components/features/excesses/ManageExcesses/index.jsx` (líneas 205, 253)
- `frontend-v2/src/components/features/excesses/ExcessesReport/index.jsx` (línea 216)

**Solución Aplicada:**

Estandarización de todos los botones primarios para usar:

```javascript
sx={{
  bgcolor: '#51cbce',              // Turquesa corporativo
  '&:hover': { bgcolor: '#45b8bb' }, // Hover color correcto
  color: 'white',                  // Texto blanco explícito
  textTransform: 'none',           // Sin uppercase
  // ... otros estilos
}}
```

**Botones Corregidos:**
1. **CreateLoan** - Botón "Crear"
2. **LoansList** - Botón "PAGAR" (modal de pago)
3. **ManageExcesses** - Botones "BORRAR TODO" y "CREAR"
4. **ExcessesReport** - Botón "REFRESCAR"

**Testing con Playwright:**
```
✅ Create Loan "Crear": rgb(81, 203, 206) / rgb(255, 255, 255) / none
✅ Loans List "PAGAR": rgb(81, 203, 206) / rgb(255, 255, 255) / none
✅ Manage Excesses "BORRAR TODO": rgb(81, 203, 206) / rgb(255, 255, 255) / none
✅ Manage Excesses "CREAR": rgb(81, 203, 206) / rgb(255, 255, 255) / none
✅ Excesses Report "REFRESCAR": rgb(81, 203, 206) / rgb(255, 255, 255) / none
```

**Resultado:**
- ✅ Todos los botones primarios usan color turquoise #51cbce coherente
- ✅ Hover color correcto #45b8bb en todos los botones
- ✅ Texto blanco explícito en todos los botones
- ✅ Sin transformación uppercase innecesaria
- ✅ Screenshots capturados para verificación

**Lección Aprendida:**
- Material-UI usa `bgcolor` en `sx` prop, no `backgroundColor`
- Siempre especificar `color: 'white'` explícitamente (no confiar en defaults)
- Verificar sistema de diseño (DESIGN_SYSTEM.md) para colores correctos
- Usar Playwright para verificar coherencia visual después de cambios
- El hover color debe ser ligeramente más oscuro: #45b8bb (no #45b5b8)

**Referencias:**
- Sistema de diseño: `/home/jorge/projects/lottery-project/DESIGN_SYSTEM.md`
- Commit: `8650d78`

---

### Fix: Inconsistencia de Color en Título de USUARIOS > Bancas

**Problema:** El título del formulario "Lista de usuarios" (USUARIOS > Bancas) tenía fondo turquesa con texto blanco, mientras que todos los demás formularios tienen títulos en texto negro sin fondo de color.

**Diagnóstico:**
- Se usó Playwright para revisar múltiples formularios:
  - BANCAS > Lista: "Lista de bancas" - Texto negro ✅
  - BALANCES > Bancas: "Balances de bancas" - Texto negro con línea ✅
  - USUARIOS > Bancas: "Lista de usuarios" - Fondo turquesa ❌

**Solución Aplicada:**

**Archivo:** `frontend-v1/src/assets/css/user-bancas.css`

```css
/* ANTES */
.user-bancas-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Morado */
  /* Luego cambiado a #51cbce (turquesa) */
}
.user-bancas-header-text {
  color: white;
}

/* DESPUÉS */
.user-bancas-card-header {
  background: transparent;  /* Sin fondo */
  padding: 20px;
  text-align: center;
  border-bottom: none;
}
.user-bancas-header-text {
  color: #2c2c2c;  /* Texto negro */
}
```

**Resultado:** Ahora el título "Lista de usuarios" es coherente con todos los demás formularios de la aplicación.

**Metodología:** Se utilizó Playwright para navegar y capturar screenshots de diferentes formularios antes de hacer el cambio, asegurando coherencia visual en toda la aplicación.

---

### Fix: Rutas Creadas Sin Conexión al Menú de Navegación (2025-11-18)

**Problema:** Al implementar el módulo de Transacciones (Issue #36 - Por banca), se crearon los componentes y rutas pero no se conectaron al menú de navegación. El usuario reportó que al hacer clic en el botón "Lista" del módulo TRANSACCIONES no pasaba nada en V1 ni V2.

**Causa Raíz:**
- ✅ Componentes creados correctamente en ambos frontends
- ✅ Rutas agregadas en `App.jsx` de ambos frontends: `/accountable-transactions/betting-pool`
- ❌ Menu items apuntaban a rutas diferentes:
  - V1: `/transacciones/bancas`
  - V2: `/transactions/betting-pools`
- ❌ NO coincidían con las rutas creadas

**Solución Aplicada:**

**Archivos Modificados:**
1. `frontend-v1/src/constants/menuItems.js` (líneas 101-112)
2. `frontend-v2/src/constants/menuItems.js` (líneas 97-109)

```javascript
// ANTES (V1)
{ id: 'trans-bancas', label: 'Bancas', shortcut: 'B', path: '/transacciones/bancas' }

// DESPUÉS (V1)
{ id: 'trans-bancas', label: 'Bancas', shortcut: 'B', path: '/accountable-transactions/betting-pool' }

// ANTES (V2)
{ id: 'transactions-betting-pools', label: 'Bancas', shortcut: 'B', path: '/transactions/betting-pools' }

// DESPUÉS (V2)
{ id: 'transactions-betting-pools', label: 'Bancas', shortcut: 'B', path: '/accountable-transactions/betting-pool' }
```

**Lección Aprendida:**
Al crear una nueva funcionalidad, SIEMPRE seguir el proceso de 3 pasos:
1. ✅ Crear el componente
2. ✅ Agregar la ruta en `App.jsx`
3. ⚠️ **NO OLVIDAR:** Conectar la ruta al menú en `menuItems.js`

**Documentación Actualizada:**
- Agregada sección "🔗 RUTAS Y NAVEGACIÓN - PROCESO OBLIGATORIO" en CLAUDE.md (líneas 48-92)
- Agregada regla "NO crear rutas sin conectarlas al menú de navegación" en checklist crítico

---

### Loans Module Implementation (2025-11-18)

**Problema:** Se necesitaba implementar el módulo de PRÉSTAMOS (Loans) con 2 secciones (Crear préstamo y Lista de préstamos) en ambos frontends (V1 Bootstrap y V2 Material-UI), replicando la funcionalidad de la aplicación Vue.js original.

**Análisis Original:**
- Aplicación Vue.js: https://la-numbers.apk.lol
- Ambas secciones ("Crear" y "Lista") se encuentran en una sola página en el original
- Decisión: Mantener rutas separadas en React para mejor mantenibilidad

**Archivos Creados:**

**V1 (Bootstrap):**
1. `frontend-v1/src/components/loans/CreateLoan.jsx` (296 líneas)
   - Formulario con 8 campos:
     - Tipo de entidad (dropdown)
     - Entidad (dropdown dependiente)
     - Monto a prestar (currency input con $)
     - Monto cuota (currency input con $)
     - Frecuencia de pago (radio: diario/semanal/mensual/anual)
     - Fecha de inicio del préstamo (date picker)
     - Tasa de interés (number input con %)
     - Notas (textarea)
   - Botón "Crear" centrado con color turquesa (#51cbce)

2. `frontend-v1/src/components/loans/LoansList.jsx` (500+ líneas)
   - Tabla con 14 columnas: #, Total prestado, Tasa de interés, Total pagado, Total a pagar, Fecha de creación, Último pago, Cuota, Cuotas pendientes, Frecuencia, Día de pago, Estado, Pendientes de pago, Actions
   - Filtros: 2 toggles (Sólo activos, Filtrar por zonas), 2 búsquedas (Número de banca, Filtrado rápido)
   - Tab "Bancas" (seleccionado)
   - Badges de estado: Activo (verde), Completo (azul), Inactivo (rojo)
   - Botones de acción: info, edit, delete
   - Fila de totales calculados dinámicamente
   - Footer con contador de entradas
   - 20 loans mockup

**V2 (Material-UI):**
1. `frontend-v2/src/components/features/loans/CreateLoan/index.jsx` (296 líneas)
   - Mismos 8 campos que V1 pero usando componentes Material-UI
   - Box, Card, CardContent, TextField, Select, MenuItem, RadioGroup, Button
   - InputAdornment para símbolos $ y %
   - Color turquesa (#51cbce) coherente con V1

2. `frontend-v2/src/components/features/loans/LoansList/index.jsx` (17,401 bytes)
   - Misma funcionalidad que V1 pero con componentes MUI
   - Table, TableHead, TableBody, TableRow, TableCell
   - Checkbox, FormControlLabel para toggles
   - Tabs, Tab para "Bancas"
   - TextField con InputAdornment para búsquedas
   - Chip para badges de estado (color: success/info/error)
   - IconButton para acciones (InfoIcon, EditIcon, DeleteIcon)
   - TableContainer, Paper para wrapper

**Archivos Modificados:**

**V1:**
- `frontend-v1/src/App.jsx` (líneas 60-61, 137-138)
  - Agregados imports: `CreateLoan`, `LoansList`
  - Agregadas rutas:
    - `/prestamos/crear` → CreateLoan
    - `/prestamos/lista` → LoansList

**V2:**
- `frontend-v2/src/App.jsx` (líneas 84-85, 168-169)
  - Agregados lazy imports: `CreateLoanMUI`, `LoansListMUI`
  - Agregadas rutas con Suspense:
    - `/loans/new` → CreateLoanMUI
    - `/loans/list` → LoansListMUI

**Menú de Navegación (Ya Configurado):**
- V1: `frontend-v1/src/constants/menuItems.js` - Módulo "PRÉSTAMOS" con submenu Crear/Lista
- V2: `frontend-v2/src/constants/menuItems.js` - Módulo "PRÉSTAMOS" con submenu Crear/Lista
- ✅ Rutas ya estaban correctamente conectadas al menú

**Solución Aplicada:**

**GitHub Issues Creados:**
1. Issue #38: [Epic] Módulo Préstamos - 2 subsecciones
2. Issue #39: Implementar "Crear préstamo" (V1 + V2)
3. Issue #40: Implementar "Lista de préstamos" (V1 + V2)

**Implementación:**
1. Análisis de aplicación Vue.js original para identificar campos y funcionalidades
2. Creación de componentes V1 con Bootstrap 5
3. Creación de componentes V2 con Material-UI v5
4. Agregado de rutas en ambos App.jsx
5. Verificación de conexión con menú de navegación

**Testing con Playwright:**
- ✅ V1 Create Loan: Formulario con 8 campos funcionando
- ✅ V1 Loans List: Tabla con 18 loans activos (de 20 total)
- ✅ V2 Create Loan: Formulario Material-UI funcionando
- ✅ V2 Loans List: Tabla Material-UI funcionando (después de fix)
- Screenshots capturados: 4 total (v1-loans-create.png, v1-loans-list.png, v2-loans-create.png, v2-loans-list.png)

**Problema Encontrado Durante Testing:**

**Error:** Al navegar a `/loans/list` en V2, se obtuvo error: "EISDIR: illegal operation on a directory, read /home/jorge/projects/lottery-project/frontend-v2/src/components/features/loans/LoansList"

**Diagnóstico:**
- Estructura de archivos correcta (LoansList/index.jsx existía)
- Error de cache HMR (Hot Module Replacement) de Vite
- Vite trataba el directorio como un archivo

**Solución:**
1. Detenido el servidor de desarrollo V2 (shell ID 5a4f8b)
2. Reiniciado el servidor con `npm run dev`
3. Navegado nuevamente a `/loans/list`
4. ✅ Página cargó correctamente con todos los loans

**Resultado:**
- ✅ Módulo Préstamos completamente implementado en V1 y V2
- ✅ 2 componentes por frontend (Crear + Lista)
- ✅ Rutas conectadas correctamente
- ✅ Menú de navegación funcionando
- ✅ Mockup data: 20 loans con diferentes estados
- ✅ Funcionalidades: filtros, sorting, búsqueda, totales, badges de estado
- ✅ Testing completo con Playwright
- ✅ Screenshots capturados como evidencia
- ✅ GitHub issues creados para tracking

**Mockup Data:**
- 20 préstamos con estados: Activo (18), Completo (1), Inactivo (1)
- Totales: $168,500.00 prestado, $102,855.00 pagado, $76,297.50 por pagar
- Filtros funcionando: "Sólo activos" muestra 18 de 20

**Lección Aprendida:**
1. Los errores de cache de Vite HMR se resuelven reiniciando el dev server
2. Mantener coherencia entre V1 y V2: misma funcionalidad, diferentes componentes UI
3. Siempre capturar screenshots con Playwright para documentar implementaciones
4. Verificar que las rutas en App.jsx coincidan con las del menú en menuItems.js

**Nota Importante:**
En la aplicación Vue.js original, ambas secciones (Crear y Lista) están en una sola página. En nuestra implementación React, se decidió mantenerlas separadas en rutas distintas para:
- Mejor organización del código
- Lazy loading más eficiente (especialmente en V2)
- Mantenibilidad a largo plazo
- Separación de responsabilidades

---

### Excesses Module Implementation (2025-11-18)

**Problema:** Se necesitaba implementar el módulo de EXCEDENTES (Surpluses) con 2 subsecciones (Manejar excedentes y Reporte de excedentes) en ambos frontends (V1 Bootstrap y V2 Material-UI), replicando la funcionalidad de la aplicación Vue.js original.

**Análisis Original:**
- Aplicación Vue.js: https://la-numbers.apk.lol/#/excesses y https://la-numbers.apk.lol/#/excesses-report
- Screenshots de referencia capturados con Playwright
- Ambas secciones identificadas y analizadas

**Archivos Creados:**

**V1 (Bootstrap):**
1. `frontend-v1/src/components/excedentes/ManageExcesses.jsx` (367 líneas)
   - Título "Manejar excedentes" centrado
   - Dropdown Sorteo (General, Anguila 10am, NY 12pm, FL 1pm, GA 7pm, REAL, GANA MAS, LA PRIMERA)
   - Botón BORRAR TODO (turquesa #51cbce)
   - Formulario con 25 campos numéricos en grid de 3 columnas:
     * General, Directo, Pale
     * Cash3 Straight, Cash3 Box, Play4 Straight
     * Play4 Box, Super Pale, Bolita 1, Bolita 2
     * Singulación 1, 2, 3
     * Pick5 Straight, Pick5 Box, Pick Two
     * Cash3 Front Straight/Box, Cash3 Back Straight/Box
     * Pick Two Front/Back/Middle
     * Panamá, Tripleta
   - Botón CREAR (turquesa #51cbce)
   - Tabla "Lista de excedentes" con columnas: #, Sorteo, Tipo de jugada, Excedente, Fecha, Usuario, Acciones
   - Mockup data con funcionalidad de crear/eliminar

2. `frontend-v1/src/components/excedentes/ExcessesReport.jsx` (297 líneas)
   - Título "Reporte de excedentes" centrado
   - Multi-select Sorteo con indicador "X seleccionadas" (11 sorteos disponibles)
   - Multi-select Tipo de jugada con indicador "X seleccionadas" (13 tipos disponibles)
   - Botón REFRESCAR (turquesa #51cbce)
   - Input "Filtrado rápido" con icono de búsqueda
   - Tabla con 6 columnas: Sorteo, Tipo de jugada, Excedente, Fecha de creación, Usuario, Acciones
   - Botones de acciones: info (azul), edit (azul), delete (rojo)
   - Footer "Mostrando X de Y entradas"
   - 8 registros de mockup data
   - Funcionalidad de filtrado por multi-select y quick filter

**V2 (Material-UI):**
1. `frontend-v2/src/components/features/excesses/ManageExcesses/index.jsx` (357 líneas)
   - Misma funcionalidad que V1 pero con componentes Material-UI
   - Box, Card, CardContent, Typography
   - Select, MenuItem, FormControl, InputLabel
   - TextField con InputProps para alineación derecha
   - Grid container/item para layout responsive
   - Button con sx prop para estilos
   - Table, TableContainer, TableHead, TableBody, TableRow, TableCell
   - IconButton con DeleteIcon

2. `frontend-v2/src/components/features/excesses/ExcessesReport/index.jsx` (319 líneas)
   - Misma funcionalidad que V1 pero con componentes MUI
   - Multi-select con OutlinedInput y renderValue personalizado
   - TextField con endAdornment para icono de búsqueda
   - Chip components (no usado en mockup pero disponible)
   - IconButton para acciones: InfoIcon, EditIcon, DeleteIcon
   - Table responsiva con hover effects

**Archivos Modificados:**

**V1:**
- `frontend-v1/src/App.jsx` (líneas 62-63, 141-142)
  - Agregados imports: ManageExcesses, ExcessesReport
  - Agregadas rutas:
    * `/excedentes/manejar` → ManageExcesses
    * `/excedentes/reporte` → ExcessesReport

**V2:**
- `frontend-v2/src/App.jsx` (líneas 88-89, 174-175)
  - Agregados lazy imports: ManageExcessesMUI, ExcessesReportMUI
  - Agregadas rutas con Suspense:
    * `/surpluses/manage` → ManageExcessesMUI
    * `/surpluses/report` → ExcessesReportMUI

**Menú de Navegación (Ya Configurado):**
- V1: `frontend-v1/src/constants/menuItems.js` - Módulo "EXCEDENTES" con submenu Manejar/Reporte
- V2: `frontend-v2/src/constants/menuItems.js` - Módulo "EXCEDENTES" con submenu Manejar/Reporte
- ✅ Rutas ya estaban correctamente conectadas al menú desde el inicio

**Solución Aplicada:**

1. Análisis de aplicación Vue.js original con Playwright
2. Identificación de campos y funcionalidades específicas
3. Creación de componentes V1 con Bootstrap 5 y estilos consistentes
4. Creación de componentes V2 con Material-UI v5
5. Agregado de rutas en ambos App.jsx
6. Verificación de conexión con menú de navegación (ya configurado)

**Testing con Playwright:**

**V1 (Bootstrap):**
- ✅ ManageExcesses: Formulario con 25 campos funcionando, dropdown sorteo, botones BORRAR TODO y CREAR
- ✅ ExcessesReport: Multi-selects (11 sorteos, 13 tipos), botón REFRESCAR, tabla con 8 registros mockup
- ✅ Quick filter funcional
- ✅ Screenshots capturados: v1-excedentes-manejar.png, v1-excedentes-reporte.png, v1-excedentes-reporte-con-datos.png

**V2 (Material-UI):**
- ✅ ManageExcesses: Formulario Material-UI con 25 campos, dropdown sorteo, botones funcionando
- ✅ ExcessesReport: Multi-selects con indicadores "X seleccionadas", tabla con 8 registros
- ✅ Estilos coherentes con sistema de diseño (#51cbce)
- ✅ Screenshots capturados: v2-excedentes-manejar.png, v2-excedentes-reporte.png, v2-excedentes-reporte-con-datos.png

**GitHub Issues:**
- Issue #44: [Epic] Módulo EXCEDENTES - 2 subsecciones
- Issue #45: Implementar Manejar excedentes (V1 + V2)
- Issue #46: Implementar Reporte de excedentes (V1 + V2)
- ✅ Todos completados exitosamente

**Resultado:**
- ✅ Módulo Excedentes completamente implementado en V1 y V2
- ✅ 2 componentes por frontend (Manejar + Reporte)
- ✅ Rutas conectadas correctamente al menú
- ✅ Mockup data: 25 campos numéricos, 8 registros de reporte, 11 sorteos, 13 tipos de jugada
- ✅ Funcionalidades: filtros multi-select, quick filter, crear/eliminar excedentes, BORRAR TODO
- ✅ Testing completo con Playwright
- ✅ Screenshots capturados como evidencia
- ✅ Coherencia de diseño mantenida (color turquesa #51cbce, tipografía Montserrat)

**Características Técnicas:**

**Validación de Inputs:**
- Solo acepta números y decimales (regex: `/^\d*\.?\d*$/`)
- Placeholder "0.00" en todos los campos
- Alineación derecha para valores numéricos

**Multi-Select Implementation:**
- V1: HTML native `<select multiple>` con indicador de cantidad
- V2: Material-UI Select con `renderValue` personalizado

**Estado y Gestión:**
- useState para formularios y tablas
- useEffect para inicialización y filtrado en tiempo real
- Transformación de datos (string → number al guardar)

**Mockup Data Structure:**
```javascript
const mockExcess = {
  id: 1,
  draw: 'Anguila 10am',
  betType: 'Directo',
  excess: 1000.00,
  date: '18/11/2025',
  user: 'admin'
};
```

**Lección Aprendida:**
1. El menú ya tenía las rutas configuradas, solo faltaba crear los componentes
2. Multi-select en HTML nativo requiere manejo manual de selectedOptions
3. Material-UI simplifica multi-select con mejor UX
4. Grid de 3 columnas se adapta bien tanto en Bootstrap como en MUI (Grid con xs/sm/md)
5. Mockup data facilita el desarrollo y testing sin backend

**Próximos Pasos (Futuro):**
- Conectar a API real para CRUD de excedentes
- Implementar paginación en tabla de reportes
- Agregar validaciones de negocio (límites, rangos)
- Exportar reportes a PDF/Excel

---

## 🔑 CREDENCIALES DE PRUEBA

### Login
- **Usuario:** `admin`
- **Contraseña:** `Admin123456`

### Banca de Prueba
- **ID:** 9
- **Nombre:** admin
- **Código:** RB003333

### JWT Token (Ejemplo)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 TESTING

### Playwright (E2E)

```bash
# Instalar
cd frontend-v2
npm install playwright
npx playwright install

# Ejecutar test
node /tmp/playwright-test-*.js
```

### Selectores Importantes

**V1 (Bootstrap):**
```javascript
'input[placeholder*="Usuario" i]'
'input[placeholder*="Contraseña" i]'
'button:has-text("INICIAR SESIÓN")'
'text=Premios'
```

**V2 (Material-UI):**
```javascript
'input#username'
'input#password'
'button[type="submit"]'
'[role="tab"]:has-text("Premios")'
```

### API Testing

```bash
# Health check
curl http://localhost:5000/health

# Obtener bet types
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/bet-types/with-fields

# Obtener prize config de banca
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/betting-pools/9/prize-config
```

---

## 📋 PATRONES Y CONVENCIONES

### Nomenclatura

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| Database tables | snake_case | `betting_pool_prize_config` |
| C# Properties | PascalCase | `BettingPoolId` |
| C# methods | PascalCase | `GetPrizeConfig()` |
| JS/React components | PascalCase | `PrizesTab.jsx` |
| JS functions | camelCase | `getPrizeFields()` |
| JS constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS classes | kebab-case | `prize-field-input` |

### 🌍 Regla de Idioma para Código

**IMPORTANTE:** Todo el código interno DEBE estar en inglés:

✅ **EN INGLÉS (Siempre):**
- Nombres de variables, funciones, métodos
- Nombres de componentes React
- Nombres de archivos y carpetas
- Rutas de la aplicación (URLs)
- Nombres de clases CSS
- Nombres de tablas y columnas en BD
- Comentarios de código (preferiblemente)
- Nombres de constantes y enums
- Props de componentes
- Tipos TypeScript/interfaces

❌ **EN ESPAÑOL (Solo para UI visible al usuario):**
- Textos mostrados en pantalla
- Labels de formularios
- Mensajes de error/éxito
- Títulos de páginas
- Contenido de botones
- Tooltips y ayudas

**Ejemplos:**

```javascript
// ✅ CORRECTO
const UserBancas = () => {
  const [selectedZones, setSelectedZones] = useState([]);
  return <h3>Lista de usuarios</h3>;  // Texto UI en español OK
};

// ❌ INCORRECTO
const ListaUsuarios = () => {
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState([]);
  return <h3>Lista de usuarios</h3>;
};
```

**Rutas:**
```javascript
// ✅ CORRECTO
/usuarios/bancas
/balances/betting-pools

// ❌ INCORRECTO
/usuarios/lista-bancas
/balances/bancas-apuestas
```

### Service Layer Pattern

```javascript
// Siempre transformar en service layer, no en componentes
// Ventajas: Single source of truth, backward compatible

// ✅ Correcto
const service = {
  getData: async () => {
    const data = await api.get('/endpoint');
    // Transform here
    return transformedData;
  }
};

// ❌ Incorrecto - transformar en componente
const Component = () => {
  useEffect(() => {
    const data = await service.getData();
    const transformed = data.map(...);  // NO!
  }, []);
};
```

### Error Handling

```javascript
// Frontend
try {
  const data = await service.getData();
} catch (error) {
  console.error('Error al obtener datos:', error);
  throw error;  // Re-throw para que componente maneje
}

// API (.NET)
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id) {
  try {
    var data = await _context.Entity.FindAsync(id);
    if (data == null) return NotFound();
    return Ok(data);
  } catch (Exception ex) {
    return StatusCode(500, ex.Message);
  }
}
```

### 🎨 Coherencia de Diseño en Formularios

**REGLA CRÍTICA:** Al agregar o modificar cualquier formulario, SIEMPRE verificar coherencia con formularios existentes.

#### Proceso Obligatorio:

1. **ANTES de crear/modificar un formulario:**
   ```bash
   # Usar Playwright para revisar formularios similares
   # Capturar screenshots de 2-3 formularios existentes
   # Identificar patrones comunes
   ```

2. **Elementos a mantener coherentes:**
   - ✅ **Títulos de página**: Color de texto, tamaño de fuente, fondo
   - ✅ **Botones**: Colores (#51cbce para principal), tamaños, estilos
   - ✅ **Filtros**: Posición, estilo, comportamiento
   - ✅ **Tablas**: Headers, estilos de filas, paginación
   - ✅ **Forms**: Labels, inputs, validaciones
   - ✅ **Espaciado**: Márgenes y padding consistentes
   - ✅ **Tipografía**: Montserrat font-family, tamaños consistentes
   - ✅ **Iconos**: Font Awesome o Lucide Icons (según versión)

3. **Verificación con Playwright:**
   ```javascript
   // Navegar a formularios similares
   await page.goto('http://localhost:4200/bancas/lista');
   await page.screenshot({ path: 'bancas-lista-reference.png' });

   await page.goto('http://localhost:4200/balances/bancas');
   await page.screenshot({ path: 'balances-bancas-reference.png' });

   // Comparar visualmente antes de implementar
   ```

4. **Colores corporativos a respetar:**
   ```css
   --primary-color: #51cbce;        /* Turquesa - Botones principales */
   --success-color: #28a745;        /* Verde - Estados exitosos */
   --text-color: #2c2c2c;          /* Negro - Texto general */
   --background: #f5f5f5;          /* Gris claro - Fondo de página */
   ```

5. **Ejemplo de verificación:**
   ```
   ❌ INCORRECTO: Crear título con fondo morado
   ✅ CORRECTO: Revisar 3 formularios existentes → todos tienen texto negro → usar texto negro
   ```

**Si encuentras inconsistencia en formularios existentes:**
- Documentar en GitHub Issue
- Corregir ANTES de crear nuevo formulario
- Actualizar este CLAUDE.md con el fix

**Referencia del último fix (2025-11-18):**
- Se detectó título con fondo turquesa en USUARIOS > Bancas
- Se revisaron múltiples formularios con Playwright
- Se corrigió para mantener coherencia (texto negro, sin fondo)

---

## 🚨 GOTCHAS Y ADVERTENCIAS

### 1. API Response Format
```javascript
// V1: api.get() retorna DATA directamente
const data = await api.get('/endpoint');  // ← Ya es data, no response

// V2: También retorna DATA directamente
const data = await api.get('/endpoint');  // ← Mismo patrón
```

### 2. Prize Fields vs Prize Types
```javascript
// API devuelve:
{ prizeTypes: [...] }

// Frontend espera:
{ prizeFields: [...] }

// Siempre aplicar transformación en service layer
```

### 3. useEffect Dependencies
```javascript
// ❌ Incorrecto - objeto como dependencia
useEffect(() => { ... }, [selectedSorteo]);  // Re-render cada vez

// ✅ Correcto - primitivo como dependencia
useEffect(() => { ... }, [selectedSorteo?.sorteo_id]);  // Solo cuando ID cambia
```

### 4. CORS
- API tiene CORS habilitado para TODOS los orígenes
- Configurado en `Program.cs`

### 5. Puertos en Conflicto
- V2 puede usar 4002 si 4000 está ocupado (Vite auto-increment)
- Siempre verificar con `lsof -ti:PORT`

---

## 📝 DOCUMENTACIÓN RELACIONADA

### En `/tmp/` (Archivos temporales de trabajo)
- `V1_FIX_CONFIRMADO.md` - Confirmación del fix V1
- `RESUMEN_FINAL_AMBOS_FRONTENDS.md` - Comparación V1 vs V2
- `GIT_COMMITS_SUMMARY.md` - Commits subidos
- `v1-premios-result.png` - Screenshot de V1 funcionando

### En cada proyecto
- `frontend-v1/CLAUDE.md` - Contexto específico V1
- `frontend-v2/docs/*.md` - Documentación de refactoring
- `api/docs/*.md` - Documentación de API

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. **Consolidar repositorios** - Mover todo a estructura de monorepo
2. **Unificar API response** - Considerar si API debería devolver `prizeFields` directamente
3. **Testing E2E** - Crear suite de tests automatizados
4. **CI/CD** - Configurar pipelines para cada componente
5. **Documentación** - Generar API docs con Swagger/OpenAPI
6. **Migrar V1 → V2** - Plan de deprecación de V1

---

## 🎨 ESTILOS Y PATRONES UI - FRONTEND V1

### Variables CSS del Sistema (FormStyles.css)

```css
:root {
  /* Colores */
  --form-label-color: rgb(120, 120, 120);
  --form-input-text-color: rgb(60, 60, 60);
  --form-input-border-color: rgb(221, 221, 221);
  --form-input-focus-color: #51cbce;          /* Color principal turquesa */
  --form-button-active-bg: rgb(81, 203, 206);  /* #51cbce */
  --form-toggle-active-bg: #51cbce;

  /* Tipografía */
  --form-font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
  --form-label-size: 12px;
  --form-input-size: 14px;
  --form-button-size: 14px;

  /* Espaciado */
  --form-label-width: 280px;
  --form-input-height: 31px;
  --form-border-radius: 4px;
}
```

### Clases CSS Principales

| Clase | Uso | Descripción |
|-------|-----|-------------|
| `create-branch-container` | Contenedor principal | Fondo gris #f5f5f5, padding 20px |
| `page-title h1` | Título página | 24px, Montserrat, centrado |
| `tabs-container` | Contenedor de tabs | Flex, border-bottom 2px |
| `tab` | Tab individual | 14px, color #51cbce, height 40px |
| `tab.active` | Tab activo | Background #51cbce, color white |
| `branch-form` | Contenedor formulario | Background white, shadow, padding 30px |
| `form-tab-container` | Contenido del tab | Background white, padding 20px |
| `form-group` | Grupo de campo | Flex, align-items flex-start, margin-bottom 8px |
| `form-label` | Etiqueta | 12px, width 280px, color gris |
| `form-control` | Input/Select | 14px, height 31px, border-radius 4px |

### Patrones de Componentes

#### 1. Badges Seleccionables (Sorteos, Bancas, Zonas)
```javascript
const badgeStyle = {
  padding: '4px 12px',
  border: '1px solid #51cbce',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '12px',
  background: '#fff',
  color: '#51cbce',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  margin: '2px'
};

const badgeSelectedStyle = {
  ...badgeStyle,
  background: '#51cbce',  // Fondo turquesa cuando seleccionado
  color: '#fff'
};
```

#### 2. Toggle Buttons (ENCENDER/APAGAR/NO CAMBIAR)
```jsx
<button
  className={`btn btn-sm ${value === opt ? 'btn-info' : 'btn-outline-secondary'}`}
  style={{
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '4px'
  }}
>
  {opt}
</button>
```

#### 3. Option Buttons (Radio-like)
- Click para seleccionar
- Click de nuevo para deseleccionar (null)
- Múltiples opciones, solo una activa

### Archivos CSS Importantes

```
frontend-v1/src/assets/css/
├── FormStyles.css          # Variables y clases base de formularios
├── CreateBranchGeneral.css # Contenedores y tabs
├── PremiosComisiones.css   # Tab de premios
├── HorariosSorteos.css     # Tab de horarios
└── Sorteos.css             # Tab de sorteos
```

### Importaciones Requeridas

```javascript
import '../assets/css/FormStyles.css';
import '../assets/css/CreateBranchGeneral.css';
// Agregar según necesidad:
// import '../assets/css/PremiosComisiones.css';
// import '../assets/css/HorariosSorteos.css';
```

### Componentes Creados (2025-11-16)

#### MassEditBancas.jsx
- **Ubicación:** `frontend-v1/src/components/MassEditBancas.jsx`
- **Ruta:** `/bancas/edicion-masiva`
- **Funcionalidad:** Actualización masiva de configuración de bancas
- **Estructura:**
  - 4 tabs (Configuración, Pies de página, Premios & Comisiones, Sorteos)
  - Badges seleccionables para Sorteos/Bancas/Zonas
  - Toggle buttons para opciones booleanas
  - Integración con API paginada

#### MassEditBettingPools (V2)
- **Ubicación:** `frontend-v2/src/components/features/betting-pools/MassEditBettingPools/index.jsx`
- **Ruta:** `/betting-pools/mass-edit`
- **Usa:** Material-UI components (ToggleButtonGroup, Checkbox, etc.)

### Manejo de Respuestas Paginadas de API

```javascript
// API devuelve objetos paginados:
{
  items: [...],
  pageNumber: 1,
  pageSize: 50,
  totalCount: 16,
  ...
}

// Pattern correcto:
const [zonesData, drawsData, poolsData] = await Promise.all([...]);
setZones(zonesData?.items || zonesData || []);
setDraws(drawsData?.items || drawsData || []);
setBettingPools(poolsData?.items || poolsData || []);
```

---

## 📞 CONTACTO Y SOPORTE

Para reportar issues o solicitar features:
1. Verificar estado de git con `git status`
2. Revisar logs de consola del frontend
3. Verificar API con `curl` o Postman
4. Consultar documentación en `/docs`

---

**Generado:** 2025-11-16
**Versión:** 1.1
**Autor:** Claude Code
**Status:** ✅ Todos los proyectos funcionando y sincronizados
