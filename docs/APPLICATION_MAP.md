# Mapa de la Aplicación - Sistema de Lotería

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                     │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│  Frontend V2    │  Frontend V4    │     Vue.js Original             │
│  (Bootstrap)    │  (MUI)          │     (Referencia)                │
│  Puerto 4000    │  Puerto 4200    │     la-numbers.apk.lol          │
└────────┬────────┴────────┬────────┴─────────────────────────────────┘
         │                 │
         └────────┬────────┘
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API .NET 8.0                                    │
│                      Puerto 5000                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Controllers: Auth, Users, BettingPools, Tickets, Draws...   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Entity Framework Core 8.0                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SQL Server                                      │
│                      Puerto 1433                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flujos Principales

### 1. Autenticación
```
Usuario → Login → POST /api/auth/login → JWT Token → Almacenado en localStorage
                                                    → Usado en header Authorization
```

### 2. Creación de Ticket
```
1. Usuario selecciona Banca
2. GET /api/tickets/params/create → Obtiene sorteos activos, tipos de jugada
3. Usuario ingresa jugadas (número, monto, tipo)
4. POST /api/tickets → Crea ticket con líneas
   → Genera código único (EA-{BANCA}-{SEQ})
   → Genera barcode (12 dígitos)
   → Retorna ticket completo
```

### 3. Monitor de Tickets
```
1. GET /api/betting-pools → Lista de bancas
2. GET /api/lotteries → Lista de loterías
3. PATCH /api/tickets (filtros) → Lista paginada de tickets
   Filtros: date, bettingPoolId, lotteryId, status
```

---

## Estructura de Base de Datos (Tablas Principales)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │     │  BettingPools   │     │     Zones       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ UserId (PK)     │     │ BettingPoolId   │     │ ZoneId (PK)     │
│ Username        │◄────┤ ZoneId (FK)     │────►│ ZoneName        │
│ PasswordHash    │     │ BettingPoolName │     │ IsActive        │
│ CommissionRate  │     │ BettingPoolCode │     └─────────────────┘
│ IsActive        │     │ IsActive        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Tickets                                   │
├─────────────────────────────────────────────────────────────────────┤
│ TicketId (PK)    │ TicketCode      │ Barcode         │ CreatedAt    │
│ BettingPoolId(FK)│ UserId (FK)     │ GrandTotal      │ TotalPrize   │
│ Status           │ IsCancelled     │ IsPaid          │ ...          │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          TicketLines                                 │
├─────────────────────────────────────────────────────────────────────┤
│ LineId (PK)      │ TicketId (FK)   │ DrawId (FK)     │ BetTypeId    │
│ BetNumber        │ BetAmount       │ PrizeAmount     │ IsWinner     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    Lotteries    │     │     Draws       │
├─────────────────┤     ├─────────────────┤
│ LotteryId (PK)  │◄────┤ LotteryId (FK)  │
│ LotteryName     │     │ DrawId (PK)     │
│ Timezone        │     │ DrawName        │
│ IsActive        │     │ DrawTime        │
└─────────────────┘     │ IsActive        │
                        └─────────────────┘

┌─────────────────┐
│   GameTypes     │  (Tipos de jugada: Directo, Pale, Tripleta...)
├─────────────────┤
│ GameTypeId (PK) │
│ GameTypeCode    │
│ GameName        │
│ NumberLength    │
└─────────────────┘
```

---

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, retorna JWT |
| GET | `/api/health` | Health check |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Lista usuarios |
| GET | `/api/users/{id}` | Detalle usuario |
| POST | `/api/users/with-permissions` | Crear usuario con permisos |
| PUT | `/api/users/{id}` | Actualizar usuario |
| GET | `/api/users/{id}/permissions` | Permisos del usuario |

### Bancas (Betting Pools)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/betting-pools` | Lista bancas |
| GET | `/api/betting-pools/{id}` | Detalle banca |
| POST | `/api/betting-pools` | Crear banca |
| PUT | `/api/betting-pools/{id}` | Actualizar banca |
| GET | `/api/betting-pools/{id}/prize-config` | Config premios |
| PATCH | `/api/betting-pools/{id}/prize-config` | Actualizar premios |

### Tickets
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/tickets` | Crear ticket |
| GET | `/api/tickets/{id}` | Detalle ticket |
| PATCH | `/api/tickets` | Filtrar tickets (body: filtros) |
| PATCH | `/api/tickets/{id}/cancel` | Cancelar ticket |
| PATCH | `/api/tickets/{id}/pay` | Pagar ticket |
| GET | `/api/tickets/params/create` | Params para crear |
| GET | `/api/tickets/params/index` | Params para monitor |

### Sorteos y Loterías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/draws` | Lista sorteos |
| GET | `/api/draws/active` | Sorteos activos |
| GET | `/api/lotteries` | Lista loterías |

### Zonas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/zones` | Lista zonas |
| POST | `/api/zones` | Crear zona |

### Permisos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/permissions/categories` | Categorías de permisos |

---

## Frontend V4 - Estructura de Componentes

```
src/
├── App.tsx                 # Router principal (~70 rutas)
├── pages/
│   ├── LoginMUI.tsx       # Página de login
│   └── DashboardMUI.tsx   # Dashboard principal
│
├── components/
│   ├── common/            # Componentes compartidos
│   │   ├── PrivateRoute.tsx
│   │   ├── LazyRoute.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── layout/            # Layout principal
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   │
│   ├── shared/            # Componentes de formulario reutilizables
│   │   ├── FormField.tsx
│   │   ├── SelectField.tsx
│   │   └── Pagination.tsx
│   │
│   └── features/          # Componentes por dominio
│       ├── users/
│       │   ├── CreateUser/
│       │   │   ├── index.tsx
│       │   │   └── hooks/useUserForm.ts
│       │   ├── EditUser/
│       │   ├── UserList/
│       │   └── ...
│       │
│       ├── betting-pools/
│       │   ├── BettingPoolsList/
│       │   ├── CreateBettingPool/
│       │   ├── EditBettingPool/
│       │   │   └── hooks/
│       │   │       ├── useEditBettingPoolForm.ts
│       │   │       ├── types.ts
│       │   │       ├── constants.ts
│       │   │       └── utils.ts
│       │   └── ...
│       │
│       ├── tickets/
│       │   ├── CreateTickets/
│       │   ├── TicketMonitoring/
│       │   └── ...
│       │
│       ├── sales/
│       ├── balances/
│       ├── transactions/
│       ├── limits/
│       └── ...
│
├── services/              # Clientes API
│   ├── api.ts            # Cliente HTTP base (axios)
│   ├── userService.ts
│   ├── bettingPoolService.ts
│   ├── ticketService.ts
│   ├── lotteryService.ts
│   └── index.ts          # Barrel exports
│
├── hooks/                 # Hooks globales
│   ├── useBetDetection.ts
│   └── useKeyboardShortcuts.ts
│
├── utils/                 # Utilidades
│   ├── logger.ts
│   ├── apiErrorHandler.ts
│   └── validators.ts
│
└── types/                 # Tipos TypeScript
    └── user.ts
```

---

## Menú de Navegación (menuItems.js)

```
├── Dashboard
│
├── Usuarios
│   ├── Crear Usuario
│   ├── Lista de Usuarios
│   ├── Administradores
│   ├── Sesiones de Usuarios
│   └── Usuarios Bloqueados
│
├── Bancas
│   ├── Lista de Bancas
│   ├── Crear Banca
│   ├── Usuarios por Banca
│   ├── Edición Masiva
│   └── Acceso a Bancas
│
├── Tickets
│   ├── Crear Tickets
│   ├── Monitor de Tickets
│   ├── Monitor de Jugadas
│   ├── Jugadas Ganadoras
│   └── Pizarra
│
├── Ventas
│   ├── Ventas Diarias
│   ├── Ventas Históricas
│   ├── Ventas por Zona
│   └── Premios por Tipo
│
├── Balances
│   ├── Balance de Bancas
│   ├── Balance de Zonas
│   └── Balance del Grupo
│
├── Transacciones
│   ├── Lista de Transacciones
│   ├── Por Banca
│   ├── Grupos
│   └── Aprobaciones
│
├── Límites
│   ├── Lista de Límites
│   ├── Crear Límite
│   ├── Límites Automáticos
│   └── Números Calientes
│
├── Sorteos
│   └── Horarios de Sorteos
│
├── Resultados
│
└── Configuración
    ├── Zonas
    ├── Gastos
    └── Mi Grupo
```

---

## Credenciales de Desarrollo

| Uso | Usuario | Contraseña |
|-----|---------|------------|
| API/Frontend | `admin` | `Admin123456` |
| Banca de Prueba | ID: 9, Code: RB003333 | - |

---

## Comandos Rápidos

```bash
# API
cd api/src/LotteryApi
dotnet run --urls "http://0.0.0.0:5000"

# Frontend V4
cd frontend-v4
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Puertos

| Servicio | Puerto |
|----------|--------|
| API .NET | 5000 |
| Frontend V2 | 4000 |
| Frontend V4 | 4200 |
| SQL Server | 1433 |

---

*Última actualización: 2025-11-29*
