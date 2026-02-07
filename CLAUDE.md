# CLAUDE.md - Lottery System Monorepo

Sistema de lotería con frontend React (TypeScript) y API (.NET).

---

## 🚨 FRONTEND: frontend-v4

**IMPORTANTE:** Todo el desarrollo de frontend se realiza en `frontend-v4`.

```bash
cd frontend-v4 && npm run dev  # Puerto 4001
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
- ✅ Screenshots de Playwright siempre en `captures/` (desde la raíz del proyecto)

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
// 1. Crear componente en src/components/features/
// 2. Agregar lazy import y ruta en App.tsx
const ComponentMUI = lazy(() => import('@components/features/module/Component'))
<Route path="/module/path" element={<LazyRoute component={ComponentMUI} />} />
// 3. Conectar en menuItems.ts ⚠️ NO OLVIDAR
{ path: '/module/path', label: 'Nombre Visible' }
```

---

## 📦 ESTRUCTURA DEL PROYECTO

```
lottery-project/
├── CLAUDE.md                    # Este archivo
├── DESIGN_SYSTEM.md             # Colores, tipografía, componentes
├── docs/
│   ├── FIXES_HISTORY.md         # Historial de fixes
│   ├── TPV_ROUTING_ARCHITECTURE.md  # Arquitectura routing TPV
│   └── migration/               # Documentación migración
├── frontend-v4/                 # React + TypeScript + MUI (puerto 4001)
├── api/                         # .NET 8.0 API (puerto 5000)
└── database/                    # Scripts SQL
```

---

## 🏗️ STACK TECNOLÓGICO

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| Frontend | React 18 + Vite + TypeScript + Material-UI | 4001 |
| API Backend | .NET 8.0 + EF Core 8.0 | 5000 |
| Database | Azure SQL Server | 1433 |

---

## 🌐 INFRAESTRUCTURA DE PRODUCCIÓN (AZURE)

### ⚠️ IMPORTANTE - MEMORIZAR ESTO

**TODA la infraestructura de producción está en Azure:**

| Componente | Ubicación |
|------------|-----------|
| **Frontend** | Azure Static Web Apps → **https://lottobook.net** |
| **API Backend** | Azure |
| **Base de datos** | Azure SQL Server |

### URLs del Sistema

| Entorno | URL | Descripción |
|---------|-----|-------------|
| **🚀 Producción** | **https://lottobook.net** | Frontend desplegado en Azure |
| **📱 App Original** | https://la-numbers.apk.lol | Vue.js (referencia/scraping) |
| **💻 Local Frontend** | http://localhost:4001 | Desarrollo local |
| **💻 Local API** | http://localhost:5000 | Desarrollo local |

---

## 📂 ESTRUCTURA DEL FRONTEND

```
frontend-v4/src/
├── components/
│   ├── common/              # Componentes reutilizables
│   │   ├── ErrorBoundary.tsx
│   │   ├── LazyRoute.tsx
│   │   └── PrivateRoute.tsx
│   ├── layout/
│   │   └── MainLayout/      # Layout principal con sidebar
│   └── features/            # Módulos por funcionalidad
│       ├── balances/        # Balances (bancas, bancos, zonas, grupos)
│       ├── betting-pools/   # Gestión de bancas
│       ├── collectors/      # Cobradores
│       ├── dashboard/       # Dashboard widgets
│       ├── draws/           # Sorteos y horarios
│       ├── excesses/        # Excedentes
│       ├── expenses/        # Categorías de gastos
│       ├── external-agents/ # Agentes externos
│       ├── f8/              # Monitor F8
│       ├── limits/          # Límites y números calientes
│       ├── loans/           # Préstamos
│       ├── payments/        # Cobros y pagos
│       ├── results/         # Resultados de lotería
│       ├── sales/           # Ventas (diarias, históricas, por fecha)
│       ├── tickets/         # Tickets (crear, monitoreo, jugadas)
│       ├── transactions/    # Transacciones contables
│       ├── users/           # Gestión de usuarios
│       └── zones/           # Zonas
├── constants/
│   └── menuItems.ts         # Configuración del menú sidebar
├── context/                 # React Context providers
├── hooks/                   # Custom hooks globales
├── pages/
│   ├── LoginMUI.tsx
│   └── DashboardMUI.tsx
├── services/                # Servicios API
├── types/                   # Tipos TypeScript globales
└── utils/                   # Utilidades
```

---

## 🛣️ RUTAS IMPLEMENTADAS

### Dashboard
| Ruta | Componente |
|------|------------|
| `/dashboard` | DashboardMUI |

### Usuarios
| Ruta | Componente |
|------|------------|
| `/users/list` | UsersTabbedMUI (con tabs: Lista, Administradores, Bancas) |
| `/users/new` | CreateUserMUI |
| `/users/edit/:userId` | EditUserMUI |
| `/users/login-history` | UserSessionsMUI |
| `/users/blocked-sessions` | UserBlockedSessionsMUI |

### Bancas
| Ruta | Componente |
|------|------------|
| `/betting-pools/list` | BettingPoolsListMUI |
| `/betting-pools/new` | CreateBettingPoolMUI |
| `/betting-pools/edit/:id` | EditBettingPoolMUI |
| `/betting-pools/mass-edit` | MassEditBettingPoolsMUI |
| `/betting-pools/access` | BettingPoolAccessMUI |
| `/betting-pools/clear-pending` | CleanPendingPaymentsMUI |
| `/betting-pools/no-sales` | BettingPoolsWithoutSalesMUI |
| `/betting-pools/days-report` | DaysWithoutSalesReportMUI |

### Tickets
| Ruta | Componente |
|------|------------|
| `/tickets/new` | CreateTicketsMUI |
| `/tickets/monitoring` | TicketMonitoringMUI |
| `/tickets/external-agents` | ExternalAgentsMonitoringMUI |
| `/tickets/plays` | PlayMonitoringMUI |
| `/tickets/winners` | WinningPlaysMUI |
| `/tickets/board` | BlackboardMUI |
| `/tickets/anomalies` | TicketAnomaliesMUI |

### Ventas
| Ruta | Componente |
|------|------------|
| `/sales/day` | DailySalesMUI |
| `/sales/history` | HistoricalSalesMUI |
| `/sales/by-date` | SalesByDateMUI |
| `/sales/prizes` | PlayTypePrizesMUI |
| `/sales/percentages` | PlayTypePrizesPercentagesMUI |
| `/sales/betting-pools` | BettingPoolSalesMUI |
| `/sales/zones` | ZoneSalesMUI |

### Balances
| Ruta | Componente |
|------|------------|
| `/balances/betting-pools` | BettingPoolBalancesMUI |
| `/balances/banks` | BankBalancesMUI |
| `/balances/zones` | ZoneBalancesMUI |
| `/balances/groups` | GroupBalancesMUI |

### Transacciones
| Ruta | Componente |
|------|------------|
| `/accountable-transactions` | TransactionsListMUI |
| `/accountable-transactions/betting-pool` | TransactionsByBettingPoolMUI |
| `/accountable-transactions/summary` | TransactionsSummaryMUI |
| `/accountable-transactions-groups` | TransactionGroupsListMUI |
| `/accountable-transaction-approvals` | TransactionApprovalsMUI |

### Otros Módulos
| Ruta | Componente |
|------|------------|
| `/results` | ResultsMUI |
| `/zones/list` | ZonesListMUI |
| `/zones/new` | CreateZoneMUI |
| `/zones/edit/:id` | EditZoneMUI |
| `/zones/manage` | ManageZonesMUI |
| `/draws/list` | DrawsListMUI |
| `/draws/schedules` | DrawSchedulesMUI |
| `/limits/list` | LimitsListMUI |
| `/limits/new` | CreateLimitMUI |
| `/limits/automatic` | AutomaticLimitsMUI |
| `/limits/hot-numbers` | HotNumbersMUI |
| `/loans/list` | LoansListMUI |
| `/loans/new` | CreateLoanMUI |
| `/surpluses/manage` | ManageExcessesMUI |
| `/surpluses/report` | ExcessesReportMUI |
| `/collectors` | DebtCollectorsMUI |
| `/collector-management` | ManageDebtCollectorsMUI |
| `/f8` | F8MonitorMUI |
| `/external-agents/list` | ExternalAgentsListMUI |
| `/external-agents/new` | CreateExternalAgentMUI |
| `/entities/list` | AccountableEntitiesMUI |
| `/entities/new` | CreateAccountableEntityMUI |
| `/receivers/list` | EmailReceiversListMUI |
| `/receivers/new` | CreateEmailReceiverMUI |
| `/expenses/categories` | ExpenseCategoriesMUI |
| `/collections-payments/list` | CollectionsPaymentsListMUI |
| `/my-group/configuration` | GroupConfigurationMUI |

---

## 📡 SERVICIOS API

```
frontend-v4/src/services/
├── api.ts                      # Cliente HTTP base (axios)
├── authService.ts              # Login, logout, token management
├── bettingPoolService.ts       # CRUD bancas
├── betTypeCompatibilityService.ts
├── branchService.ts
├── drawScheduleService.ts      # Horarios de sorteos
├── drawService.ts              # Sorteos
├── lotteryService.ts           # Loterías
├── permissionService.ts        # Permisos de usuario
├── playService.ts              # Jugadas
├── prizeFieldService.ts        # Campos de premio
├── prizeService.ts             # Configuración de premios
├── resultsService.ts           # Resultados de lotería
├── roleService.ts              # Roles
├── scheduleService.ts          # Horarios
├── sortitionService.ts
├── ticketService.ts            # Tickets CRUD
├── userService.ts              # Usuarios CRUD
├── winningPlayService.ts       # Jugadas ganadoras
└── zoneService.ts              # Zonas
```

---

## 🎰 SINCRONIZACIÓN DE RESULTADOS

**IMPORTANTE:** NO usar acceso directo a la API de lotocompany (`api.lotocompany.com`).

Los datos de resultados de lotería se obtienen mediante **web scraping de la aplicación original**:
- **URL:** https://la-numbers.apk.lol
- **Credenciales:** `oliver` / `oliver0597@`
- **Método:** Playwright para extraer datos visualmente de la interfaz

**Razón:** La API de lotocompany bloquea acceso directo (returns "Forbidden").

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
lsof -ti:4001  # Frontend
lsof -ti:5000  # API
```

---

## 🔑 CREDENCIALES

| Uso | Usuario | Contraseña |
|-----|---------|------------|
| Login Local | `admin` | `Admin123456` |
| Vue.js Original | `oliver` | `oliver0597@` |

**Banca de Prueba:** ID 9, Nombre: admin, Código: RB003333

---

## 📋 PATRONES Y CONVENCIONES

### Estructura de Componentes Feature

```
components/features/module-name/
├── ComponentName/
│   ├── index.tsx           # Componente principal
│   ├── hooks/
│   │   └── useComponentName.ts  # Custom hook con lógica
│   ├── components/         # Sub-componentes (opcional)
│   ├── types.ts            # Tipos locales (opcional)
│   └── constants.ts        # Constantes locales (opcional)
```

### Nomenclatura

| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| DB tables | snake_case | `betting_pool_prize_config` |
| C# | PascalCase | `BettingPoolId` |
| TypeScript/React | camelCase/PascalCase | `getPrizeFields`, `PrizesTab.tsx` |
| CSS | kebab-case | `prize-field-input` |

### API Response Pattern

```typescript
// api.get() retorna DATA directamente (no response.data)
const data = await api.get('/endpoint');  // ← Ya es data

// Para respuestas paginadas:
const items = response.items || response;
```

### useEffect Dependencies

```typescript
// ❌ Objeto como dependencia - re-render cada vez
useEffect(() => {}, [selectedItem]);

// ✅ Primitivo como dependencia
useEffect(() => {}, [selectedItem?.id]);
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
3. **Lazy Loading:** Todos los componentes feature usan `React.lazy()`
4. **Puerto Frontend:** Configurado en `vite.config.ts` como `4001`

---

## 📝 DOCUMENTACIÓN ADICIONAL

| Archivo | Contenido |
|---------|-----------|
| `docs/FIXES_HISTORY.md` | Historial detallado de fixes |
| `docs/TPV_ROUTING_ARCHITECTURE.md` | Arquitectura de routing TPV vs Admin |
| `DESIGN_SYSTEM.md` | Sistema de diseño completo |

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

**Última actualización:** 2026-01-28
**Versión:** 4.1
