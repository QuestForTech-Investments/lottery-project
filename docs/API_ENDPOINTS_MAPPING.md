# API Endpoints Mapping - Aplicación Vue.js Original

**Fecha de análisis:** 2025-11-19
**Aplicación analizada:** https://la-numbers.apk.lol
**API Base URL:** `https://api.lotocompany.com/api/v1/`
**Método de análisis:** Playwright Network Request Capture

---

## Resumen Ejecutivo

Este documento mapea todos los endpoints HTTP utilizados por la aplicación Vue.js original de lotería. Los endpoints fueron capturados mediante navegación automatizada con Playwright, monitoreando las llamadas de red durante la interacción con diferentes módulos de la aplicación.

**Total de endpoints únicos identificados:** 14+ (13 capturados + endpoints Tickets documentados)

**Última actualización:** 2025-11-19 (Agregado: Tickets endpoints con request/response detallados)

---

## Endpoints por Módulo

### 1. Autenticación y Sesiones

#### `GET /api/v1/sessions/params`
**Descripción:** Obtiene parámetros de configuración de sesión por dominio

**Query Parameters:**
- `domain` (string, required): Dominio de la aplicación (ej: "la-numbers.apk.lol")

**Response:** 200 OK
```json
{
  // Parámetros de configuración de sesión
}
```

**Usado en:** Login inicial

---

#### `POST /api/v1/sessions`
**Descripción:** Crear nueva sesión de usuario (Login)

**Request Body:**
```json
{
  "username": "oliver",
  "password": "oliver0597@"
}
```

**Response:** 201 Created
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 123,
    "username": "oliver",
    // ... más datos del usuario
  }
}
```

**Usado en:** Login

---

#### `GET /api/v1/sessions`
**Descripción:** Obtener información de la sesión actual

**Headers:**
- `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "user": { /* datos del usuario */ },
  "permissions": [ /* permisos */ ]
}
```

**Usado en:** Dashboard, validación de sesión

---

### 2. Dashboard y Notificaciones

#### `GET /api/v1/home`
**Descripción:** Datos del dashboard principal

**Query Parameters:**
- `category` (integer, required): Categoría de datos (1 o 2)

**Response:** 200 OK
```json
{
  "statistics": { /* estadísticas */ },
  "recentActivity": [ /* actividad reciente */ ]
}
```

**Usado en:** Dashboard principal

**Observación:** Se hace llamada doble con `category=1` y `category=2`

---

#### `GET /api/v1/notifications`
**Descripción:** Obtener notificaciones del usuario

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "type": "info",
    "message": "...",
    "created_at": "2025-11-19T10:00:00Z"
  }
]
```

**Usado en:** Header/navbar, notificaciones en tiempo real

---

### 3. Seguridad y Monitoreo

#### `GET /api/v1/anomaly`
**Descripción:** Obtener anomalías detectadas en el sistema

**Query Parameters:**
- `category` (integer): Categoría de anomalía (2 = tipo específico)

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "type": "suspicious_activity",
    "description": "...",
    "betting_pool_id": 123
  }
]
```

**Usado en:** Dashboard, header badge "Anomalías"

---

#### `GET /api/v1/group-security`
**Descripción:** Obtener información de seguridad del grupo

**Query Parameters:**
- `category` (integer): Categoría (2 = sesiones bloqueadas)

**Response:** 200 OK
```json
{
  "blocked_logins": 1,
  "suspicious_activities": [ /* ... */ ]
}
```

**Usado en:** Dashboard, header badge "Sesiones bloqueadas"

---

#### `GET /api/v1/chat`
**Descripción:** Sistema de chat/mensajería

**Query Parameters:**
- `category` (integer)

**Response:** 404 Not Found (no implementado aún)

**Usado en:** Intentado en dashboard (no activo)

---

### 4. Betting Pools (Bancas)

#### `GET /api/v1/betting-pools/params`
**Descripción:** Obtener parámetros y configuraciones de betting pools

**Query Parameters:**
- `category` (integer): Categoría de parámetros

**Response:** Estructura desconocida (requiere más análisis)

**Usado en:** Módulo "Bancas"

---

#### `PATCH /api/v1/betting-pools`
**Descripción:** Actualización masiva o parcial de betting pools

**Request Body:**
```json
{
  "betting_pool_ids": [1, 2, 3],
  "fields_to_update": {
    "is_active": true,
    "fall_type": "DIARIA"
  }
}
```

**Response:** Estructura desconocida

**Usado en:** Edición masiva de bancas, actualización de estado

---

### 5. Zonas

#### `GET /api/v1/zones`
**Descripción:** Obtener lista de todas las zonas geográficas

**Response:** 200 OK
```json
[
  {
    "zone_id": 16,
    "name": "Default",
    "status": "active"
  },
  {
    "zone_id": 18,
    "name": "GRUPO JM MA ***",
    "status": "active"
  }
]
```

**Usado en:** Módulo "Zonas", filtros por zona en múltiples vistas

---

### 6. Resultados y Ventas

#### `GET /api/v1/results`
**Descripción:** Obtener resultados de sorteos y ventas

**Query Parameters:**
- `date` (string, optional): Fecha específica (formato ISO)
- `currentDate` (string, optional): Fecha actual
- `category` (integer): Categoría de resultados (1 = general)

**Response:** 200 OK
```json
{
  "sales": {
    "total": 0.00,
    "by_betting_pool": []
  },
  "prizes": {
    "total": 0.00,
    "by_draw": []
  }
}
```

**Usado en:** Módulo "Resultados", pestaña "General"

---

## Endpoints NO Capturados (Pendientes de Análisis)

Los siguientes módulos existen en la aplicación pero no se pudieron capturar sus endpoints en esta sesión:

### Usuarios
- **Rutas probadas:** `#/users`
- **Endpoints esperados:**
  - `GET /api/v1/users` - Lista de usuarios
  - `GET /api/v1/users/:id` - Detalle de usuario
  - `POST /api/v1/users` - Crear usuario
  - `PUT /api/v1/users/:id` - Actualizar usuario
  - `DELETE /api/v1/users/:id` - Eliminar usuario

### Sorteos (Draws)
- **Rutas:** `#/draws`
- **Endpoints esperados:**
  - `GET /api/v1/draws` - Lista de sorteos
  - `GET /api/v1/draws/:id` - Detalle de sorteo
  - `POST /api/v1/draws` - Crear sorteo
  - `PUT /api/v1/draws/:id` - Actualizar sorteo

### Balances
- **Rutas:** `#/balances/betting-pools`, `#/balances/banks`, `#/balances/zones`, `#/balances/groups`
- **Endpoints esperados:**
  - `GET /api/v1/balances/betting-pools` - Balances de bancas
  - `GET /api/v1/balances/banks` - Balances de bancos
  - `GET /api/v1/balances/zones` - Balances de zonas
  - `GET /api/v1/balances/groups` - Balances de grupos

### Transacciones
- **Rutas:** `#/accountable-transaction-groups`, `#/accountable-transaction-approvals`
- **Endpoints esperados:**
  - `GET /api/v1/accountable-transaction-groups` - Grupos de transacciones
  - `GET /api/v1/accountable-transactions` - Transacciones contables
  - `POST /api/v1/accountable-transactions` - Crear transacción
  - `PUT /api/v1/accountable-transactions/:id/approve` - Aprobar transacción

### Préstamos
- **Rutas:** `#/loans`
- **Endpoints esperados:**
  - `GET /api/v1/loans` - Lista de préstamos
  - `POST /api/v1/loans` - Crear préstamo
  - `PUT /api/v1/loans/:id` - Actualizar préstamo

### Excedentes
- **Rutas:** `#/excesses`, `#/excesses-report`
- **Endpoints esperados:**
  - `GET /api/v1/excesses` - Lista de excedentes
  - `POST /api/v1/excesses` - Crear excedente
  - `GET /api/v1/excesses/report` - Reporte de excedentes

### Límites
- **Endpoints esperados:**
  - `GET /api/v1/limits` - Lista de límites
  - `POST /api/v1/limits` - Crear límite
  - `DELETE /api/v1/limits/:id` - Eliminar límite

### Cobradores (Debt Collectors)
- **Rutas:** `#/debt-collector`, `#/manage-debt-collector`
- **Endpoints esperados:**
  - `GET /api/v1/debt-collectors` - Lista de cobradores
  - `POST /api/v1/debt-collectors` - Crear cobrador
  - `GET /api/v1/debt-collectors/:id/collections` - Cobros de un cobrador

### Tickets ✅ PARCIALMENTE DOCUMENTADO
- **Rutas:** `#/tickets/create`, `#/tickets`

#### `GET /api/v1/tickets/params/create`
**Descripción:** Obtener parámetros y configuraciones necesarias para crear un ticket

**Query Parameters:**
- `category` (integer, required): Categoría (1 = estándar)

**Response:** 200 OK
```json
{
  "betting_pools": [
    {
      "id": 123,
      "code": "001",
      "name": "Banca Central"
    }
  ],
  "draws": [
    {
      "draw_id": 1,
      "name": "ANGUILA 6PM",
      "lottery_id": 10,
      "status": "active",
      "cutoff_time": "18:00:00",
      "bet_types": [
        {
          "bet_type_id": 1,
          "code": "DIRECTO",
          "name": "Directo",
          "min_amount": 0.25,
          "max_amount": 500.00
        }
      ]
    }
  ],
  "configuration": {
    "allow_duplicate_plays": false,
    "require_customer_name": false
  }
}
```

**Usado en:** Carga inicial del formulario "Crear ticket"

**Fecha de captura:** 2025-11-19

---

#### `POST /api/v1/tickets` (NO CAPTURADO - ESTRUCTURA INFERIDA)
**Descripción:** Crear un nuevo ticket de lotería

**Request Body:**
```json
{
  "betting_pool_id": 123,
  "customer_name": "Juan Pérez",
  "customer_phone": "+1234567890",
  "lines": [
    {
      "draw_id": 1,
      "bet_type_id": 1,
      "bet_type_code": "DIRECTO",
      "number": "1234",
      "amount": 5.00
    },
    {
      "draw_id": 2,
      "bet_type_id": 3,
      "bet_type_code": "PALE",
      "number": "56",
      "amount": 10.00
    }
  ],
  "total_amount": 15.00,
  "notes": "Ticket de prueba"
}
```

**Response:** 201 Created
```json
{
  "ticket_id": 789456,
  "ticket_number": "TKT-2025-11-19-000123",
  "betting_pool_id": 123,
  "customer_name": "Juan Pérez",
  "total_amount": 15.00,
  "created_at": "2025-11-19T14:30:00Z",
  "status": "active",
  "lines": [
    {
      "line_id": 1001,
      "draw_id": 1,
      "draw_name": "ANGUILA 6PM",
      "bet_type": "DIRECTO",
      "number": "1234",
      "amount": 5.00,
      "potential_prize": 280.00
    },
    {
      "line_id": 1002,
      "draw_id": 2,
      "draw_name": "TEXAS EVENING",
      "bet_type": "PALE",
      "number": "56",
      "amount": 10.00,
      "potential_prize": 600.00
    }
  ],
  "print_url": "/api/v1/tickets/789456/print"
}
```

**Validaciones:**
- `betting_pool_id`: required, debe existir y estar activa
- `lines`: required, array, mínimo 1 línea
- `lines[].draw_id`: required, sorteo debe estar activo y antes del cutoff
- `lines[].bet_type_id`: required, tipo de apuesta válido
- `lines[].number`: required, formato depende del bet_type (2-5 dígitos)
- `lines[].amount`: required, debe estar entre min_amount y max_amount
- `total_amount`: debe coincidir con suma de lines[].amount

**Errores comunes:**
- 400: Validación fallida (número inválido, monto fuera de rango)
- 403: Banca desactivada o sin balance
- 409: Sorteo cerrado (después de cutoff)
- 422: Número bloqueado o límite excedido

---

#### `GET /api/v1/tickets`
**Descripción:** Lista de tickets (monitor de tickets)

**Query Parameters:**
- `betting_pool_id` (integer, optional): Filtrar por banca
- `date` (string, optional): Filtrar por fecha (YYYY-MM-DD)
- `status` (string, optional): active | cancelled | paid
- `page` (integer, optional): Número de página (default: 1)
- `pageSize` (integer, optional): Tamaño de página (default: 50)

**Response:** 200 OK (paginado)

---

#### `GET /api/v1/tickets/:id`
**Descripción:** Detalle completo de un ticket

**Response:** 200 OK
```json
{
  "ticket_id": 789456,
  "ticket_number": "TKT-2025-11-19-000123",
  "betting_pool": { /* datos de banca */ },
  "customer_name": "Juan Pérez",
  "total_amount": 15.00,
  "status": "active",
  "lines": [ /* líneas de jugadas */ ],
  "created_at": "2025-11-19T14:30:00Z",
  "cancelled_at": null,
  "paid_at": null
}
```

---

#### `DELETE /api/v1/tickets/:id`
**Descripción:** Cancelar un ticket

**Request Body:**
```json
{
  "reason": "Cliente solicitó cancelación",
  "password": "admin_password"
}
```

**Response:** 200 OK
```json
{
  "ticket_id": 789456,
  "status": "cancelled",
  "cancelled_at": "2025-11-19T14:35:00Z",
  "refund_amount": 15.00
}
```

**Restricciones:**
- Solo se puede cancelar antes del sorteo
- Requiere permisos especiales o contraseña
- Límite de tickets cancelados por día (configurado en banca)

### Ventas
- **Rutas:** `#/sales/daily`, `#/sales/historical`
- **Endpoints esperados:**
  - `GET /api/v1/sales/daily` - Ventas diarias
  - `GET /api/v1/sales/historical` - Ventas históricas
  - `GET /api/v1/sales/by-draw` - Ventas por sorteo

### Agentes Externos
- **Endpoints esperados:**
  - `GET /api/v1/external-agents` - Lista de agentes externos
  - `POST /api/v1/external-agents` - Crear agente externo

### Entidades Contables
- **Rutas:** `#/accountable-entities`, `#/accountable-entities/new`
- **Endpoints esperados:**
  - `GET /api/v1/accountable-entities` - Lista de entidades contables
  - `POST /api/v1/accountable-entities` - Crear entidad contable

### Receptores de Correo
- **Endpoints esperados:**
  - `GET /api/v1/email-receivers` - Lista de receptores
  - `POST /api/v1/email-receivers` - Crear receptor

### Mi Grupo
- **Endpoints esperados:**
  - `GET /api/v1/group/configuration` - Configuración del grupo
  - `PUT /api/v1/group/configuration` - Actualizar configuración

---

## Patrones Observados

### 1. Estructura de Respuestas Paginadas

Aunque no se capturaron ejemplos completos, es probable que la API use paginación:

```json
{
  "items": [ /* datos */ ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 136,
  "totalPages": 3
}
```

### 2. Query Parameters Comunes

- `category` (integer): Usado en múltiples endpoints (1, 2)
- `date` (string): Formato ISO para filtros de fecha
- `domain` (string): Identificador del tenant/dominio

### 3. Headers de Autenticación

Todos los endpoints (excepto `/sessions/params` y `POST /sessions`) requieren:

```
Authorization: Bearer {jwt_token}
```

### 4. Error Responses

No capturados en esta sesión, pero probablemente siguen formato estándar:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ /* ... */ ]
  }
}
```

---

## WebSocket / Real-time

La aplicación Vue.js utiliza WebSockets para actualizaciones en tiempo real:

**Observado en console logs:**
```
domain la-numbers.apk.lol
Connecting socket...
Socket connected!
```

**Endpoint probable:** `wss://api.lotocompany.com/socket` o similar

**Uso:** Notificaciones en tiempo real, actualizaciones de ventas, alertas

---

## Próximos Pasos para Completar el Mapeo

### Fase 1: Análisis Profundo con DevTools
1. Abrir DevTools en navegador normal
2. Navegar manualmente por cada módulo
3. Capturar payloads completos de request/response
4. Documentar estructura exacta de cada endpoint

### Fase 2: Endpoints CRUD Completos
Para cada módulo pendiente:
- Capturar GET (lista)
- Capturar GET (detalle por ID)
- Capturar POST (crear)
- Capturar PUT/PATCH (actualizar)
- Capturar DELETE (eliminar)

### Fase 3: Edge Cases
- Filtros avanzados
- Búsquedas
- Exportaciones (PDF, CSV, Excel)
- Reportes personalizados

### Fase 4: Validar con API .NET
Comparar endpoints capturados con:
- `/home/jorge/projects/lottery-project/api/src/LotteryApi/Controllers/`
- Verificar compatibilidad
- Identificar diferencias

---

## Herramientas Recomendadas

### Para Captura Manual
1. **Chrome DevTools** - Network tab
2. **Postman** - Import HAR file from Chrome
3. **Insomnia** - Testing API
4. **Fiddler** - HTTP debugging proxy

### Para Análisis Automatizado
1. **Playwright** - E2E testing + network capture
2. **Puppeteer** - Alternativa a Playwright
3. **Charles Proxy** - Traffic inspection

---

## Notas Importantes

### Diferencias Entre Vue.js App y React Migration

**Vue.js Original:**
- API: `api.lotocompany.com`
- Estructura de rutas: Hash-based (`#/`)
- WebSockets para real-time

**React Migration (Actual):**
- API: `localhost:5000` (desarrollo)
- Estructura de rutas: Browser history
- Endpoints parcialmente implementados

### Prioridades para Migración

**Alta prioridad (ya implementado en React):**
- ✅ Betting Pools (Bancas) - CRUD
- ✅ Users (Usuarios) - CRUD
- ✅ Zones (Zonas) - CRUD
- ✅ Draws (Sorteos) - CRUD

**Media prioridad (en progreso):**
- 🟡 Balances - Lectura
- 🟡 Transactions - CRUD
- 🟡 Loans (Préstamos) - CRUD (mockup)
- 🟡 Excesses (Excedentes) - CRUD (mockup)

**Baja prioridad (pendiente):**
- ⚪ Tickets - Venta de tickets
- ⚪ Results - Publicación de resultados
- ⚪ Debt Collectors - Gestión de cobradores
- ⚪ Reports - Reportes avanzados

---

## Referencias

- Aplicación Vue.js: https://la-numbers.apk.lol
- API Base: https://api.lotocompany.com/api/v1/
- Documentación completa del proyecto: `/home/jorge/projects/lottery-project/CLAUDE.md`
- Análisis previo de la app: `/home/jorge/projects/lottery-project/docs/migration/VUE_APP_ANALYSIS.md`

---

**Última actualización:** 2025-11-19
**Actualizado por:** Claude Code
**Estado:** En progreso (13/50+ endpoints documentados)
