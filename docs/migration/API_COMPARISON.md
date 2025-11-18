# Comparación: API Original (Vue.js) vs API .NET Actual

**Fecha:** 2025-11-16
**Propósito:** Identificar brechas de funcionalidad para migración

---

## 1. RESUMEN EJECUTIVO

### Estado General
- **API Original:** ~50+ endpoints (estimado)
- **API .NET:** 65+ endpoints implementados
- **Cobertura:** ~30% de funcionalidad core
- **Módulos críticos faltantes:** 12+

### Veredicto
La API .NET actual cubre bien la **infraestructura base** (usuarios, bancas, loterías, sorteos) pero **carece de la lógica de negocio core** (tickets, ventas, resultados, balances).

---

## 2. COMPARACIÓN DETALLADA

### IMPLEMENTADO EN .NET

| Módulo | API Original | API .NET | Estado |
|--------|-------------|----------|--------|
| **Autenticación** | POST /sessions | POST /auth/login | ✅ Equivalente |
| **Bancas (Betting Pools)** | PATCH /betting-pools | CRUD completo + config | ✅ Superado |
| **Usuarios** | Implícito | CRUD + permisos + zonas | ✅ Muy completo |
| **Loterías** | Implícito | CRUD completo + bet-types | ✅ Completo |
| **Sorteos (Draws)** | Implícito | CRUD completo | ✅ Completo |
| **Zonas** | Implícito | CRUD + usuarios | ✅ Completo |
| **Tipos de Apuesta** | Implícito | GET con prize fields | ✅ Completo |
| **Permisos** | Implícito | CRUD completo | ✅ Completo |

### NO IMPLEMENTADO EN .NET (CRÍTICO)

| Módulo | Endpoints Original | Funcionalidad | Prioridad |
|--------|-------------------|---------------|-----------|
| **Tickets** | /tickets/params/create | Crear, monitorear, consultar tickets | 🔴 CRÍTICA |
| **Resultados** | /results, /results/params | Publicar/consultar resultados de sorteos | 🔴 CRÍTICA |
| **Ventas** | /home?category=1 | Reportes diarios, históricos, por zona | 🔴 CRÍTICA |
| **Jugadas** | /play-amounts | Monitoreo de jugadas en tiempo real | 🔴 CRÍTICA |
| **Balances** | Implícito | Balance de bancas, bancos, zonas, grupos | 🟡 ALTA |
| **Transacciones** | Implícito | Cobros, pagos, aprobaciones | 🟡 ALTA |
| **Notificaciones** | /notifications | Sistema de avisos y alertas | 🟡 MEDIA |
| **Límites** | Implícito | Límites de apuestas, números calientes | 🟡 MEDIA |
| **Préstamos** | Implícito | CRUD de préstamos | 🟢 BAJA |
| **Excedentes** | Implícito | Gestión de excedentes | 🟢 BAJA |
| **Anomalías** | /anomaly | Detección de anomalías | 🟢 BAJA |
| **WebSocket** | Socket.io | Tiempo real | 🟡 ALTA |

---

## 3. ANÁLISIS POR MÓDULO

### 3.1 Tickets (NO IMPLEMENTADO) 🔴

**Funcionalidad requerida:**
- Crear ticket con múltiples jugadas
- Tipos: Directo, Pale & Tripleta, Cash 3, Play 4 & Pick 5
- Asociar a múltiples loterías/sorteos
- Calcular montos y premios
- Imprimir ticket
- Cancelar ticket
- Monitorear tickets en tiempo real
- Ver tickets por banca, zona, grupo

**Modelos existentes:**
- `Ticket.cs` ✅
- `TicketLine.cs` ✅

**Falta:**
- `TicketsController.cs`
- DTOs para crear/consultar tickets
- Lógica de validación de jugadas
- Cálculo de premios
- Sistema de cancelación

### 3.2 Resultados (NO IMPLEMENTADO) 🔴

**Funcionalidad requerida:**
- Publicar resultados de sorteos
- Consultar resultados por fecha
- Calcular premios ganados
- Notificar ganadores
- Histórico de resultados

**Modelos existentes:**
- `Result.cs` ✅
- `Prize.cs` ✅

**Falta:**
- `ResultsController.cs`
- Lógica de publicación
- Cálculo automático de premios
- Integración con tickets ganadores

### 3.3 Ventas/Reportes (NO IMPLEMENTADO) 🔴

**Funcionalidad requerida:**
- Ventas del día por banca
- Ventas históricas
- Ventas por zona
- Ventas por tipo de jugada
- Comisiones calculadas
- Reportes en tiempo real

**Modelos existentes:**
- `Balance.cs` ✅

**Falta:**
- `SalesController.cs` o `ReportsController.cs`
- Queries de agregación
- Cálculo de comisiones
- Dashboard de ventas

### 3.4 Balances (PARCIAL) 🟡

**Funcionalidad requerida:**
- Balance por banca
- Balance por banco
- Balance por zona
- Balance por grupo
- Histórico de movimientos

**Modelos existentes:**
- `Balance.cs` ✅
- `Bank.cs` ✅

**Falta:**
- `BalancesController.cs`
- Lógica de cálculo de balances
- Movimientos financieros

### 3.5 Transacciones/Cobros/Pagos (NO IMPLEMENTADO) 🟡

**Funcionalidad requerida:**
- Crear cobros a bancas
- Crear pagos a bancas
- Workflow de aprobación
- Categorías de gastos
- Resumen de transacciones

**Modelos existentes:**
- Ninguno específico

**Falta:**
- `TransactionsController.cs`
- Modelos: `Transaction`, `TransactionApproval`, `ExpenseCategory`
- Lógica de aprobación

---

## 4. ENDPOINTS FALTANTES CRÍTICOS

### Para Tickets (mínimo viable)
```
POST   /api/tickets                    # Crear ticket
GET    /api/tickets                    # Listar tickets (con filtros)
GET    /api/tickets/{id}               # Obtener ticket
DELETE /api/tickets/{id}               # Cancelar ticket
GET    /api/tickets/params/create      # Parámetros para crear
GET    /api/tickets/monitor            # Monitor en tiempo real
```

### Para Resultados (mínimo viable)
```
POST   /api/results                    # Publicar resultado
GET    /api/results                    # Listar resultados
GET    /api/results/{drawId}           # Resultado por sorteo
GET    /api/results/params             # Parámetros
GET    /api/results/winners/{drawId}   # Tickets ganadores
```

### Para Ventas/Reportes (mínimo viable)
```
GET    /api/sales/daily                # Ventas del día
GET    /api/sales/historical           # Ventas históricas
GET    /api/sales/by-betting-pool      # Por banca
GET    /api/sales/by-zone              # Por zona
GET    /api/sales/summary              # Resumen general
```

### Para Balances (mínimo viable)
```
GET    /api/balances/betting-pools     # Balances de bancas
GET    /api/balances/banks             # Balances de bancos
GET    /api/balances/zones             # Por zona
GET    /api/balances/{bettingPoolId}   # Balance específico
POST   /api/balances/adjustment        # Ajuste manual
```

---

## 5. MODELOS FALTANTES

### Críticos
```csharp
// Para Transacciones
AccountableTransaction
AccountableTransactionGroup
AccountableTransactionApproval
ExpenseCategory

// Para Límites
Limit
AutomaticLimit
HotNumber
BlockedNumber

// Para Excedentes
Excess
ExcessReport

// Para Préstamos
Loan
LoanPayment

// Para Cobradores
DebtCollector
DebtCollectorAssignment

// Para Notificaciones
Notification
NotificationRecipient

// Para Agentes Externos
ExternalAgent
ExternalTicket
```

### Opcionales
```csharp
// Para Reportes
SalesSummary
DailySalesReport
ZoneSalesReport

// Para Auditoría
LoginLog
AuditLog
AnomalyLog
```

---

## 6. DIFERENCIAS ARQUITECTÓNICAS

### API Original (Vue.js)
- Base: `https://api.lotocompany.com/api/v1/`
- Usa parámetros `?category=1` y `?category=2` extensivamente
- Endpoints `/params` para metadata
- WebSocket para tiempo real
- Sesiones con token
- Multi-tenant por dominio

### API .NET Actual
- Base: `http://88.223.95.55:5000/api/`
- Sin concepto de "category"
- Sin endpoints de parámetros
- Sin WebSocket
- JWT Bearer tokens
- Single tenant

### Adaptaciones Necesarias
1. Implementar concepto de "categoría" si es necesario
2. Agregar endpoints `/params` para metadata
3. Implementar WebSocket (SignalR)
4. Mapear parámetros de query similares

---

## 7. PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Core de Negocio (Crítico)
1. **TicketsController** - Crear, consultar, cancelar tickets
2. **ResultsController** - Publicar y consultar resultados
3. **Lógica de premios** - Cálculo automático

### Fase 2: Reportes (Alta)
4. **SalesController** - Reportes de ventas
5. **BalancesController** - Balances financieros
6. **Dashboard endpoints** - Resumen general

### Fase 3: Operaciones (Media)
7. **TransactionsController** - Cobros y pagos
8. **LimitsController** - Límites y bloqueos
9. **NotificationsController** - Alertas

### Fase 4: Extras (Baja)
10. **LoansController** - Préstamos
11. **ExcessesController** - Excedentes
12. **WebSocket** - Tiempo real

---

## 8. ESTIMACIÓN DE ESFUERZO

| Componente | Días Estimados | Complejidad |
|------------|----------------|-------------|
| TicketsController | 5-7 días | Alta |
| ResultsController | 3-4 días | Media |
| SalesController | 4-5 días | Media-Alta |
| BalancesController | 3-4 días | Media |
| TransactionsController | 4-5 días | Media-Alta |
| LimitsController | 3-4 días | Media |
| NotificationsController | 2-3 días | Baja |
| WebSocket (SignalR) | 3-4 días | Alta |
| **TOTAL** | **27-36 días** | - |

---

## 9. CONCLUSIÓN

La API .NET actual tiene una **base sólida** para la gestión de entidades (usuarios, bancas, loterías) pero **carece del core de negocio** necesario para operar un sistema de lotería:

### Lo que FUNCIONA:
- ✅ Autenticación y autorización
- ✅ Gestión de usuarios con permisos granulares
- ✅ CRUD de bancas con configuración
- ✅ Catálogo de loterías y sorteos
- ✅ Tipos de apuesta con premios configurables

### Lo que FALTA (sin esto, no hay negocio):
- ❌ Crear y vender tickets
- ❌ Publicar resultados
- ❌ Calcular premios ganadores
- ❌ Reportes de ventas
- ❌ Gestión de balances y cobros
- ❌ Comunicación en tiempo real

**Recomendación:** Antes de continuar con la migración del frontend, es CRÍTICO implementar al menos `TicketsController` y `ResultsController` en la API .NET.

---

**Documento generado por Claude Code**
**Para planificación de migración**
