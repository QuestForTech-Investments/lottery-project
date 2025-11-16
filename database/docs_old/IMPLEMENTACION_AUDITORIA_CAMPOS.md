# 🎯 GUÍA DE IMPLEMENTACIÓN - AUDITORÍA CON CAMPOS

**Sistema:** Lotería con Auditoría Completa  
**Estrategia:** Campos de Auditoría + Triggers Automáticos  
**Fecha:** 22 de Octubre, 2025

---

## 📋 ¿QUÉ VAMOS A IMPLEMENTAR?

Auditoría completa usando **campos en las tablas** que se llenan **automáticamente** con triggers.

### ✅ Ventajas de esta estrategia:
- ✨ **Simple** - Solo campos y triggers
- ⚡ **Rápida** - Mínimo overhead
- 🎯 **Efectiva** - 100% de cobertura
- 💾 **Eficiente** - Mínimo espacio extra
- 🔧 **Mantenible** - Fácil de entender

---

## 🚀 PLAN DE IMPLEMENTACIÓN (3 PASOS)

```
PASO 1: Crear schema con campos de auditoría  ⏱️ 5 min
PASO 2: Crear triggers automáticos              ⏱️ 3 min
PASO 3: Crear vistas de consulta                ⏱️ 2 min
────────────────────────────────────────────────────────
TOTAL                                            ⏱️ 10 min
```

---

## 📦 ARCHIVOS NECESARIOS

1. **lottery_schema_WITH_AUDIT.sql** - Schema completo con campos
2. **lottery_triggers_COMPLETE.sql** - Triggers automáticos
3. **lottery_audit_views.sql** - Vistas de consulta
4. **initial_data.sql** - Datos de prueba (opcional)

---

## 🔧 PASO 1: CREAR SCHEMA CON CAMPOS DE AUDITORÍA

### 1.1 Backup (IMPORTANTE)

```sql
-- Si ya tienes una base de datos, haz backup ANTES
BACKUP DATABASE LotterySystem 
TO DISK = 'C:\Backups\LotterySystem_Before_Audit_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak'
WITH COMPRESSION, INIT;
```

### 1.2 Ejecutar Schema

```sql
-- Ejecutar: lottery_schema_WITH_AUDIT.sql
-- Este archivo crea TODAS las tablas con campos de auditoría incluidos

-- Verificar que se crearon las tablas
SELECT 
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = t.TABLE_NAME 
     AND COLUMN_NAME IN ('created_by', 'updated_by', 'deleted_by')) as audit_fields
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

### 1.3 ¿Qué incluye el schema?

Cada tabla crítica ahora tiene estos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `created_by` | int | Usuario que creó el registro |
| `created_at` | datetime2 | Fecha/hora de creación |
| `updated_by` | int | Usuario que modificó |
| `updated_at` | datetime2 | Fecha/hora última modificación |
| `deleted_by` | int | Usuario que desactivó |
| `deleted_at` | datetime2 | Fecha/hora de desactivación |

**Tablas con auditoría COMPLETA:**
- ✅ tickets (+ `cancelled_by`, `cancellation_reason`, `created_from_ip`)
- ✅ ticket_lines (+ `created_from_ip`)
- ✅ results (+ `approved_by`, `approved_at`)
- ✅ prizes (+ `paid_by`, `paid_at`, `payment_method`)
- ✅ users (+ `deletion_reason`, `last_modified_ip`)
- ✅ betting_pools (+ `deletion_reason`)
- ✅ Todas las tablas maestras

---

## ⚡ PASO 2: CREAR TRIGGERS AUTOMÁTICOS

### 2.1 Ejecutar Script de Triggers

```sql
-- Ejecutar: lottery_triggers_COMPLETE.sql
-- Este archivo crea 25+ triggers que llenan los campos automáticamente
```

### 2.2 Verificar Triggers Creados

```sql
-- Ver todos los triggers creados
SELECT 
    OBJECT_NAME(parent_id) as tabla,
    name as trigger_name,
    CASE 
        WHEN is_instead_of_trigger = 1 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as tipo,
    OBJECT_DEFINITION(object_id) as codigo
FROM sys.triggers
WHERE parent_class = 1
ORDER BY OBJECT_NAME(parent_id);

-- Debe mostrar triggers como:
-- tickets -> trg_tickets_insert
-- tickets -> trg_tickets_update
-- users -> trg_users_insert
-- users -> trg_users_update
-- etc.
```

### 2.3 Funciones Creadas

```sql
-- Verificar función helper
SELECT * FROM sys.objects 
WHERE name = 'fn_GetCurrentUserId' AND type = 'FN';

-- Verificar procedure de contexto
SELECT * FROM sys.objects 
WHERE name = 'sp_SetAuditContext' AND type = 'P';
```

---

## 📊 PASO 3: CREAR VISTAS DE CONSULTA

### 3.1 Ejecutar Script de Vistas

```sql
-- Ejecutar: lottery_audit_views.sql
-- Crea 5 vistas y 3 procedures útiles
```

### 3.2 Verificar Vistas Creadas

```sql
-- Ver vistas creadas
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_NAME LIKE 'vw_%audit%'
ORDER BY TABLE_NAME;

-- Debe mostrar:
-- vw_betting_pools_audit
-- vw_prizes_audit
-- vw_results_audit
-- vw_tickets_audit
-- vw_users_audit
```

---

## 🧪 PASO 4: PROBAR EL SISTEMA

### 4.1 Configurar Contexto de Usuario

```sql
-- SIEMPRE hacer esto ANTES de cualquier operación
-- En tu aplicación, esto se hace automáticamente

-- Establecer contexto para usuario con ID 1
EXEC sp_SetAuditContext @user_id = 1;
```

### 4.2 Crear un Ticket de Prueba

```sql
-- 1. Establecer contexto
EXEC sp_SetAuditContext @user_id = 3; -- Vendedor

-- 2. Crear ticket
INSERT INTO tickets (ticket_id, ticket_number, user_id, betting_pool_id, total_amount, status)
VALUES (1, 'TK20251022TEST001', 3, 1, 150.00, 'Active');

-- 3. Verificar que la auditoría funcionó
SELECT 
    ticket_number,
    created_at,
    created_by,
    created_from_ip,
    status
FROM tickets
WHERE ticket_number = 'TK20251022TEST001';

-- ✅ Debería mostrar:
-- created_by = 3
-- created_at = (fecha/hora actual)
-- created_from_ip = (tu IP)
```

### 4.3 Modificar el Ticket

```sql
-- 1. Cambiar contexto a supervisor
EXEC sp_SetAuditContext @user_id = 2;

-- 2. Actualizar ticket
UPDATE tickets 
SET total_amount = 200.00
WHERE ticket_number = 'TK20251022TEST001';

-- 3. Verificar auditoría
SELECT 
    ticket_number,
    created_by,
    created_at,
    updated_by,
    updated_at
FROM tickets
WHERE ticket_number = 'TK20251022TEST001';

-- ✅ Debería mostrar:
-- created_by = 3 (vendedor original)
-- updated_by = 2 (supervisor que modificó)
-- updated_at = (nueva fecha/hora)
```

### 4.4 Cancelar el Ticket

```sql
-- 1. Establecer contexto
EXEC sp_SetAuditContext @user_id = 2;

-- 2. Cancelar ticket
UPDATE tickets 
SET 
    status = 'Cancelled',
    cancellation_reason = 'Cliente solicitó cancelación'
WHERE ticket_number = 'TK20251022TEST001';

-- 3. Ver auditoría completa
SELECT * FROM vw_tickets_audit 
WHERE ticket_number = 'TK20251022TEST001';

-- ✅ Debería mostrar:
-- created_by_username = vendedor1
-- updated_by_username = supervisor1
-- cancelled_by_username = supervisor1
-- cancellation_reason = Cliente solicitó cancelación
```

---

## 📖 CÓMO USAR EN TU APLICACIÓN

### Ejemplo en C# / .NET

```csharp
public class LotteryAuditService
{
    private readonly string _connectionString;
    
    public async Task SetUserContext(int userId)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        using var command = new SqlCommand("EXEC sp_SetAuditContext @user_id", connection);
        command.Parameters.AddWithValue("@user_id", userId);
        await command.ExecuteNonQueryAsync();
    }
    
    public async Task<int> CreateTicket(int userId, TicketDto ticket)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        
        // 1. Establecer contexto PRIMERO
        await SetUserContext(userId);
        
        // 2. Crear ticket normalmente
        using var command = new SqlCommand(@"
            INSERT INTO tickets (ticket_id, ticket_number, user_id, total_amount, status)
            VALUES (@id, @number, @user_id, @amount, 'Active');
            SELECT SCOPE_IDENTITY();
        ", connection);
        
        command.Parameters.AddWithValue("@id", ticket.Id);
        command.Parameters.AddWithValue("@number", ticket.Number);
        command.Parameters.AddWithValue("@user_id", userId);
        command.Parameters.AddWithValue("@amount", ticket.TotalAmount);
        
        // 3. Los triggers automáticamente llenan created_by, created_at, etc.
        return Convert.ToInt32(await command.ExecuteScalarAsync());
    }
}
```

### Ejemplo en Python

```python
import pyodbc

class LotteryAuditService:
    def __init__(self, connection_string):
        self.connection_string = connection_string
    
    def set_user_context(self, conn, user_id):
        cursor = conn.cursor()
        cursor.execute("EXEC sp_SetAuditContext @user_id = ?", user_id)
        cursor.commit()
    
    def create_ticket(self, user_id, ticket_data):
        conn = pyodbc.connect(self.connection_string)
        
        # 1. Establecer contexto
        self.set_user_context(conn, user_id)
        
        # 2. Crear ticket
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tickets (ticket_id, ticket_number, user_id, total_amount, status)
            VALUES (?, ?, ?, ?, 'Active')
        """, ticket_data['id'], ticket_data['number'], user_id, ticket_data['amount'])
        
        conn.commit()
        conn.close()
        
        # 3. Auditoría se llenó automáticamente
```

### Ejemplo en Node.js

```javascript
const sql = require('mssql');

class LotteryAuditService {
    async setUserContext(pool, userId) {
        await pool.request()
            .input('user_id', sql.Int, userId)
            .execute('sp_SetAuditContext');
    }
    
    async createTicket(userId, ticketData) {
        const pool = await sql.connect(connectionString);
        
        // 1. Establecer contexto
        await this.setUserContext(pool, userId);
        
        // 2. Crear ticket
        await pool.request()
            .input('id', sql.Int, ticketData.id)
            .input('number', sql.NVarChar, ticketData.number)
            .input('user_id', sql.Int, userId)
            .input('amount', sql.Decimal(10, 2), ticketData.amount)
            .query(`
                INSERT INTO tickets (ticket_id, ticket_number, user_id, total_amount, status)
                VALUES (@id, @number, @user_id, @amount, 'Active')
            `);
        
        // 3. Auditoría automática
    }
}
```

---

## 🔍 CONSULTAS ÚTILES

### Ver quién creó un ticket

```sql
SELECT 
    ticket_number,
    created_by_username,
    created_by_name,
    created_at,
    created_from_ip
FROM vw_tickets_audit
WHERE ticket_number = 'TK20251022001234';
```

### Ver actividad de un usuario HOY

```sql
EXEC sp_GetUserActivity @username = 'vendedor1';
```

### Ver tickets cancelados esta semana

```sql
SELECT *
FROM vw_tickets_audit
WHERE cancelled_at >= DATEADD(DAY, -7, GETDATE())
ORDER BY cancelled_at DESC;
```

### Ver quién pagó premios hoy

```sql
SELECT 
    prize_amount,
    ticket_number,
    paid_by_username,
    paid_at,
    payment_method
FROM vw_prizes_audit
WHERE CAST(paid_at AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY prize_amount DESC;
```

### Ver cambios sospechosos

```sql
EXEC sp_GetSuspiciousChanges @hours_back = 24;
```

### Reporte de actividad diaria

```sql
SELECT 
    created_by_username,
    COUNT(*) as total_tickets,
    SUM(total_amount) as total_ventas
FROM vw_tickets_audit
WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY created_by_username
ORDER BY total_ventas DESC;
```

---

## 📊 DASHBOARD SQL - Vista Rápida

```sql
-- DASHBOARD DEL DÍA
DECLARE @today DATE = CAST(GETDATE() AS DATE);

SELECT 'MÉTRICAS DEL DÍA' as seccion;

-- Tickets
SELECT 
    'Tickets creados' as metrica,
    COUNT(*) as cantidad,
    SUM(total_amount) as monto,
    COUNT(DISTINCT created_by) as usuarios_activos
FROM tickets
WHERE CAST(created_at AS DATE) = @today;

-- Cancelaciones
SELECT 
    'Tickets cancelados' as metrica,
    COUNT(*) as cantidad,
    SUM(total_amount) as monto,
    COUNT(DISTINCT cancelled_by) as usuarios
FROM tickets
WHERE CAST(cancelled_at AS DATE) = @today;

-- Premios
SELECT 
    'Premios pagados' as metrica,
    COUNT(*) as cantidad,
    SUM(prize_amount) as monto,
    COUNT(DISTINCT paid_by) as cajeros
FROM prizes
WHERE CAST(paid_at AS DATE) = @today;

-- Top vendedores del día
SELECT TOP 5
    created_by_username as vendedor,
    COUNT(*) as tickets,
    SUM(total_amount) as ventas
FROM vw_tickets_audit
WHERE CAST(created_at AS DATE) = @today
GROUP BY created_by_username
ORDER BY ventas DESC;
```

---

## ⚠️ TROUBLESHOOTING

### Problema 1: Los campos created_by están NULL

**Causa:** No se configuró el contexto de usuario  
**Solución:**
```sql
-- SIEMPRE ejecutar esto primero
EXEC sp_SetAuditContext @user_id = [tu_user_id];
```

### Problema 2: Error "CONTEXT_INFO not set"

**Causa:** El contexto se pierde entre queries  
**Solución:** Configurar el contexto en CADA conexión/sesión nueva

```csharp
// C# - Configurar al abrir conexión
connection.Open();
await SetUserContext(userId); // Hacer esto SIEMPRE después de Open()
```

### Problema 3: Los triggers no se disparan

**Verificar:**
```sql
-- Ver si los triggers existen
SELECT * FROM sys.triggers 
WHERE name LIKE 'trg_%';

-- Ver si están habilitados
SELECT 
    OBJECT_NAME(parent_id) as tabla,
    name,
    is_disabled
FROM sys.triggers
WHERE parent_class = 1;

-- Habilitar un trigger deshabilitado
ENABLE TRIGGER trg_tickets_insert ON tickets;
```

### Problema 4: Performance lento

**Verificar índices:**
```sql
-- Crear índices en campos de auditoría si es necesario
CREATE NONCLUSTERED INDEX IX_tickets_created_by 
ON tickets(created_by, created_at DESC);

CREATE NONCLUSTERED INDEX IX_tickets_cancelled_by 
ON tickets(cancelled_by, cancelled_at DESC);
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Backup de base de datos actual
- [ ] Ejecutar lottery_schema_WITH_AUDIT.sql
- [ ] Verificar que tablas tienen campos de auditoría
- [ ] Ejecutar lottery_triggers_COMPLETE.sql
- [ ] Verificar que triggers están creados
- [ ] Ejecutar lottery_audit_views.sql
- [ ] Verificar que vistas están creadas
- [ ] Probar: EXEC sp_SetAuditContext @user_id = 1
- [ ] Probar: Crear un ticket de prueba
- [ ] Verificar: SELECT * FROM vw_tickets_audit
- [ ] Probar: Modificar el ticket
- [ ] Probar: Cancelar el ticket
- [ ] Integrar sp_SetAuditContext en tu aplicación
- [ ] Probar desde tu aplicación
- [ ] Crear reportes automáticos
- [ ] Documentar para el equipo
- [ ] Capacitar usuarios

---

## 📚 MANTENIMIENTO

### Diario
```sql
-- Ver actividad del día
EXEC sp_GetUserActivity @start_date = [hoy];
```

### Semanal
```sql
-- Ver cambios sospechosos
EXEC sp_GetSuspiciousChanges @hours_back = 168; -- 1 semana
```

### Mensual
```sql
-- Optimizar índices
UPDATE STATISTICS;
EXEC sp_updatestats;
```

---

## ✅ SISTEMA LISTO

**Cobertura:** 100% - Todas las operaciones auditadas  
**Automatización:** Total - Cero código manual  
**Performance:** Excelente - Overhead mínimo  
**Mantenimiento:** Simple - Todo automático

**¡Tu sistema de lotería ahora tiene auditoría completa!** 🎉
