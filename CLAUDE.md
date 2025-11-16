# CLAUDE.md - Lottery System Monorepo

Este archivo proporciona contexto a Claude Code sobre el sistema completo de lotería, consolidando 4 proyectos en un solo repositorio.

---

## 📦 ESTRUCTURA DEL MONOREPO

```
lottery-system/
├── CLAUDE.md                    # Este archivo
├── README.md                    # Documentación general
├── .gitignore
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

## 📞 CONTACTO Y SOPORTE

Para reportar issues o solicitar features:
1. Verificar estado de git con `git status`
2. Revisar logs de consola del frontend
3. Verificar API con `curl` o Postman
4. Consultar documentación en `/docs`

---

**Generado:** 2025-11-14
**Versión:** 1.0
**Autor:** Claude Code
**Status:** ✅ Todos los proyectos funcionando y sincronizados
