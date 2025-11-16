# 🔍 Elementos Faltantes en la Base de Datos

## Basado en la Documentación Funcional de Octubre 2025

---

## 1️⃣ **MÓDULOS FINANCIEROS**

### A) Sistema de Préstamos (Sección 10)
**Tablas necesarias:**
```sql
-- Préstamos
CREATE TABLE loans (
    loan_id INT PRIMARY KEY IDENTITY,
    loan_code VARCHAR(20) UNIQUE NOT NULL, -- Ej: LN10023
    entity_type VARCHAR(20) NOT NULL, -- 'betting_pool', 'employee', 'other'
    entity_id INT NOT NULL,
    principal_amount DECIMAL(18,2) NOT NULL,
    interest_rate DECIMAL(5,4) DEFAULT 0.00,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'annual'
    installment_amount DECIMAL(18,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_paid DECIMAL(18,2) DEFAULT 0.00,
    balance DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'defaulted'
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT
);

-- Pagos de préstamos
CREATE TABLE loan_payments (
    payment_id INT PRIMARY KEY IDENTITY,
    loan_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(18,2) NOT NULL,
    payment_method VARCHAR(50),
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
);
```

**APIs mencionadas:**
- `POST /loans`
- `GET /loans?status&zone`
- Cronograma automático de pagos

---

### B) Sistema de Excedentes (Sección 11)
**Tablas necesarias:**
```sql
-- Excedentes por jugada
CREATE TABLE excesses (
    excess_id INT PRIMARY KEY IDENTITY,
    lottery_id INT,
    bet_number VARCHAR(10) NOT NULL,
    excess_amount DECIMAL(18,2) NOT NULL,
    adjustment_reason NVARCHAR(500),
    applied_date DATE DEFAULT CAST(GETDATE() AS DATE),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id)
);

-- Auditoría de excedentes
CREATE TABLE excess_audit_log (
    audit_id INT PRIMARY KEY IDENTITY,
    excess_id INT,
    action_type VARCHAR(20), -- 'create', 'update', 'delete'
    old_value DECIMAL(18,2),
    new_value DECIMAL(18,2),
    user_id INT,
    ip_address VARCHAR(45),
    created_at DATETIME2 DEFAULT GETDATE()
);
```

**APIs mencionadas:**
- `POST /excesses`
- `DELETE /excesses`
- `GET /excesses/report?lottery&type&from&to`

---

### C) Sistema de Transacciones (Sección 9)
**Tablas necesarias:**
```sql
-- Categorías de transacciones
CREATE TABLE transaction_categories (
    category_id INT PRIMARY KEY IDENTITY,
    category_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    transaction_type VARCHAR(20), -- 'income', 'expense'
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT
);

-- Transacciones
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY IDENTITY,
    transaction_type VARCHAR(50) NOT NULL, -- 'sale', 'payment', 'loan', 'excess'
    category_id INT,
    source_entity_type VARCHAR(20), -- 'betting_pool', 'bank', 'user'
    source_entity_id INT,
    destination_entity_type VARCHAR(20),
    destination_entity_id INT,
    amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    description NVARCHAR(500),
    approval_date DATETIME2,
    approved_by INT,
    rejection_reason NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (category_id) REFERENCES transaction_categories(category_id)
);
```

**APIs mencionadas:**
- `GET /transactions?type&state&category`
- `PUT /transactions/{id}/approve`
- `PUT /transactions/{id}/reject`
- `GET /transaction-categories`

---

### D) Sistema de Cobros y Pagos Rápidos (Sección 8)
**Tabla necesaria:**
```sql
CREATE TABLE quick_movements (
    movement_id INT PRIMARY KEY IDENTITY,
    movement_type VARCHAR(20) NOT NULL, -- 'payment', 'collection'
    betting_pool_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    description NVARCHAR(500),
    movement_date DATE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id)
);
```

**API mencionada:**
- `POST /quick-movements`
- `GET /quick-movements?branch&from&to`

---

## 2️⃣ **SISTEMA DE LÍMITES Y RIESGO**

### Tablas de Límites (Sección 12)
```sql
-- Reglas de límites
CREATE TABLE limit_rules (
    rule_id INT PRIMARY KEY IDENTITY,
    rule_type VARCHAR(50) NOT NULL, -- 'general', 'lottery', 'zone', 'betting_pool'
    lottery_id INT,
    zone_id INT,
    betting_pool_id INT,
    game_type_id INT,
    max_amount DECIMAL(18,2) NOT NULL,
    applies_to_days VARCHAR(20), -- Ej: 'L,M,X,J,V,S,D' o '1,2,3,4,5,6,7'
    start_date DATE,
    end_date DATE,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id),
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id),
    FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
);

-- Números bloqueados
CREATE TABLE number_blocks (
    block_id INT PRIMARY KEY IDENTITY,
    lottery_id INT NOT NULL,
    draw_id INT,
    bet_number VARCHAR(10) NOT NULL,
    block_reason NVARCHAR(500),
    blocked_until DATETIME2,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id)
);

-- Números calientes (hot numbers)
CREATE TABLE hot_numbers (
    hot_number_id INT PRIMARY KEY IDENTITY,
    lottery_id INT NOT NULL,
    draw_date DATE NOT NULL,
    bet_number VARCHAR(10) NOT NULL,
    game_type_id INT NOT NULL,
    total_amount DECIMAL(18,2) DEFAULT 0.00,
    ticket_count INT DEFAULT 0,
    risk_level VARCHAR(20), -- 'low', 'moderate', 'high', 'critical'
    risk_percentage DECIMAL(5,2),
    last_updated DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
);

-- Configuración de límites automáticos
CREATE TABLE automatic_limit_config (
    config_id INT PRIMARY KEY IDENTITY,
    is_enabled BIT DEFAULT 0,
    warning_threshold DECIMAL(5,2) DEFAULT 70.00, -- 70%
    block_threshold DECIMAL(5,2) DEFAULT 90.00, -- 90%
    random_block_enabled BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2
);
```

**APIs mencionadas:**
- `GET /limits?lottery&type&day`
- `POST /limits`
- `POST /limits/automatic`
- `DELETE /limits/bulk`
- `GET /limits/hot-numbers`
- `POST /numbers/block`

---

## 3️⃣ **SISTEMA DE COBRADORES Y AGENTES**

### Cobradores y Agentes (Sección 13)
```sql
-- Cobradores (Debt Collectors)
CREATE TABLE debt_collectors (
    collector_id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    collector_name NVARCHAR(100) NOT NULL,
    zone_id INT,
    bank_id INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id),
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
);

-- Relación cobradores con bancas (N:M)
CREATE TABLE collector_betting_pools (
    collector_pool_id INT PRIMARY KEY IDENTITY,
    collector_id INT NOT NULL,
    betting_pool_id INT NOT NULL,
    is_active BIT DEFAULT 1,
    assigned_date DATE DEFAULT CAST(GETDATE() AS DATE),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (collector_id) REFERENCES debt_collectors(collector_id),
    FOREIGN KEY (betting_pool_id) REFERENCES betting_pools(betting_pool_id),
    UNIQUE (collector_id, betting_pool_id)
);

-- Agentes externos
CREATE TABLE external_agents (
    agent_id INT PRIMARY KEY IDENTITY,
    agent_code VARCHAR(20) UNIQUE NOT NULL,
    agent_name NVARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10),
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    daily_limit DECIMAL(18,2),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT
);

-- Comisiones específicas de agentes
CREATE TABLE agent_commission_schema (
    schema_id INT PRIMARY KEY IDENTITY,
    agent_id INT NOT NULL,
    lottery_id INT NOT NULL,
    game_type_id INT NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (agent_id) REFERENCES external_agents(agent_id),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
);
```

**APIs mencionadas:**
- `GET /debt-collector/balances`
- `GET /debt-collector/transactions?collectorId&from&to`
- `POST /manage-debt-collector`
- `GET /external-agents`
- `GET /tickets/external?agentId`

---

## 4️⃣ **SISTEMA DE COMUNICACIONES**

### Receptores de Correo y Notificaciones (Secciones 16 y 17)
```sql
-- Receptores de correo
CREATE TABLE mail_receptors (
    receptor_id INT PRIMARY KEY IDENTITY,
    email VARCHAR(255) NOT NULL,
    zone_id INT,
    notification_types NVARCHAR(500), -- JSON array o CSV: 'balance,monitoring,alerts'
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
);

-- Notificaciones internas
CREATE TABLE internal_notifications (
    notification_id INT PRIMARY KEY IDENTITY,
    recipient_type VARCHAR(20) NOT NULL, -- 'betting_pool', 'user', 'zone', 'all'
    recipient_id INT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    notification_type VARCHAR(50), -- 'read', 'expires'
    message NVARCHAR(500) NOT NULL,
    expires_at DATETIME2,
    is_read BIT DEFAULT 0,
    read_at DATETIME2,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT
);

-- Log de notificaciones enviadas
CREATE TABLE notification_log (
    log_id INT PRIMARY KEY IDENTITY,
    notification_id INT,
    recipient_email VARCHAR(255),
    status VARCHAR(20), -- 'sent', 'failed', 'pending'
    error_message NVARCHAR(500),
    sent_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (notification_id) REFERENCES internal_notifications(notification_id)
);
```

**APIs mencionadas:**
- `GET /mail-receptors`
- `POST /mail-receptors`
- `POST /notifications`
- `GET /notifications`
- `PATCH /notifications/{id}/read`

---

## 5️⃣ **SISTEMA DE BOTE (IMPORT/EXPORT)**

### Bote Importado y Exportado (Sección 3.7 y 3.8)
```sql
-- Bote importado
CREATE TABLE bote_imports (
    import_id INT PRIMARY KEY IDENTITY,
    origin_system VARCHAR(100),
    import_date DATE NOT NULL,
    lottery_id INT NOT NULL,
    draw_id INT,
    bet_numbers NVARCHAR(MAX), -- JSON array de números
    total_amount DECIMAL(18,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'validated', 'rejected', 'confirmed'
    validation_notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id)
);

-- Bote exportado
CREATE TABLE bote_exports (
    export_id INT PRIMARY KEY IDENTITY,
    destination_system VARCHAR(100),
    export_date DATE NOT NULL,
    lottery_id INT NOT NULL,
    draw_id INT,
    bet_numbers NVARCHAR(MAX), -- JSON array
    total_amount DECIMAL(18,2) NOT NULL,
    percentage_exported DECIMAL(5,2),
    trigger_reason VARCHAR(100), -- 'manual', 'auto_limit_exceeded'
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id)
);

-- Configuración de exportación automática
CREATE TABLE auto_export_config (
    config_id INT PRIMARY KEY IDENTITY,
    lottery_id INT,
    trigger_percentage DECIMAL(5,2) DEFAULT 80.00, -- Al superar 80% del límite
    export_percentage DECIMAL(5,2) DEFAULT 50.00, -- Exportar 50% del exceso
    is_enabled BIT DEFAULT 0,
    destination_systems NVARCHAR(500), -- JSON array de sistemas destino
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id)
);
```

**APIs mencionadas:**
- `POST /pots/import`
- `POST /pots/export`

---

## 6️⃣ **SISTEMA DE AUDITORÍA Y LOGS**

### Logs de Auditoría Específicos (Mencionados en toda la documentación)
```sql
-- Log de sistema (ElasticSearch en producción, SQL para desarrollo)
CREATE TABLE system_log (
    log_id BIGINT PRIMARY KEY IDENTITY,
    event_type VARCHAR(50) NOT NULL, -- 'TicketCreated', 'ResultPublished', etc.
    user_id INT,
    betting_pool_id INT,
    entity_type VARCHAR(50),
    entity_id INT,
    action VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent NVARCHAR(500),
    request_data NVARCHAR(MAX), -- JSON
    response_data NVARCHAR(MAX), -- JSON
    severity VARCHAR(20), -- 'info', 'warning', 'error', 'critical'
    created_at DATETIME2 DEFAULT GETDATE(),
    INDEX IX_system_log_event_date (event_type, created_at DESC),
    INDEX IX_system_log_user (user_id, created_at DESC)
);

-- Log de cancelaciones de tickets
CREATE TABLE ticket_cancel_log (
    cancel_log_id INT PRIMARY KEY IDENTITY,
    ticket_id INT NOT NULL,
    cancelled_by INT NOT NULL,
    cancel_reason NVARCHAR(500),
    cancel_type VARCHAR(20), -- 'pre_draw', 'post_draw'
    original_status VARCHAR(20),
    cancelled_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    FOREIGN KEY (cancelled_by) REFERENCES users(user_id)
);

-- Log de auditoría de resultados
CREATE TABLE result_audit_log (
    audit_id INT PRIMARY KEY IDENTITY,
    result_id INT NOT NULL,
    action_type VARCHAR(20), -- 'publish', 'modify', 'verify'
    old_value NVARCHAR(100),
    new_value NVARCHAR(100),
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (result_id) REFERENCES results(result_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Log de visualización de balances
CREATE TABLE balance_view_log (
    view_log_id BIGINT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    view_type VARCHAR(50), -- 'betting_pool', 'zone', 'bank'
    entity_id INT,
    ip_address VARCHAR(45),
    viewed_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Log de movimientos de excedentes
CREATE TABLE movements_log (
    movement_log_id BIGINT PRIMARY KEY IDENTITY,
    transaction_type VARCHAR(50),
    source_type VARCHAR(20),
    source_id INT,
    destination_type VARCHAR(20),
    destination_id INT,
    amount DECIMAL(18,2),
    description NVARCHAR(500),
    user_id INT,
    ip_address VARCHAR(45),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 7️⃣ **ENTIDADES CONTABLES (Sección 15)**

### Sistema de Entidades Contables
```sql
-- Entidades contables (Generalización)
CREATE TABLE accountable_entities (
    entity_id INT PRIMARY KEY IDENTITY,
    entity_type VARCHAR(20) NOT NULL, -- 'betting_pool', 'employee', 'bank', 'zone', 'other'
    entity_code VARCHAR(20) UNIQUE NOT NULL,
    entity_name NVARCHAR(100) NOT NULL,
    zone_id INT,
    balance DECIMAL(18,2) DEFAULT 0.00,
    accumulated_loss DECIMAL(18,2) DEFAULT 0.00,
    total_loans DECIMAL(18,2) DEFAULT 0.00,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by INT,
    updated_at DATETIME2,
    updated_by INT,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id)
);

-- Log de creación de entidades
CREATE TABLE entity_creation_log (
    log_id INT PRIMARY KEY IDENTITY,
    entity_id INT NOT NULL,
    created_by INT NOT NULL,
    ip_address VARCHAR(45),
    creation_data NVARCHAR(MAX), -- JSON con datos iniciales
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (entity_id) REFERENCES accountable_entities(entity_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

**APIs mencionadas:**
- `GET /accountable-entities/{tab}`
- `GET /accountable-entities/summary`
- `POST /accountable-entities`

---

## 8️⃣ **TABLA DE ANOMALÍAS (Sección 3.9)**

```sql
-- Anomalías detectadas
CREATE TABLE anomalies (
    anomaly_id INT PRIMARY KEY IDENTITY,
    anomaly_type VARCHAR(50) NOT NULL, -- 'post_draw_cancel', 'unusual_amount', 'duplicate', 'unauthorized_change'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    entity_type VARCHAR(50), -- 'ticket', 'result', 'user', 'betting_pool'
    entity_id INT,
    description NVARCHAR(500),
    detection_date DATETIME2 DEFAULT GETDATE(),
    resolution_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'false_positive'
    resolved_by INT,
    resolved_at DATETIME2,
    resolution_notes NVARCHAR(500),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id)
);
```

**APIs mencionadas:**
- `GET /anomalies/tickets`
- `GET /anomalies/results`

---

## 9️⃣ **REPORTES Y VISTAS ADICIONALES**

### Vistas Faltantes Mencionadas en la Documentación

```sql
-- Vista de bancas sin ventas
CREATE VIEW vw_betting_pools_no_sales AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_code,
    bp.betting_pool_name,
    z.zone_name,
    DATEDIFF(DAY, MAX(t.created_at), GETDATE()) AS days_without_sales,
    MAX(t.created_at) AS last_sale_date
FROM betting_pools bp
INNER JOIN zones z ON bp.zone_id = z.zone_id
LEFT JOIN tickets t ON bp.betting_pool_id = t.betting_pool_id
WHERE bp.is_active = 1
GROUP BY bp.betting_pool_id, bp.betting_pool_code, bp.betting_pool_name, z.zone_name
HAVING MAX(t.created_at) < DATEADD(DAY, -7, GETDATE()) OR MAX(t.created_at) IS NULL;

-- Vista de distribución porcentual de ventas
CREATE VIEW vw_sales_distribution AS
SELECT 
    bp.betting_pool_id,
    bp.betting_pool_name,
    gt.game_name,
    SUM(tl.bet_amount) AS total_amount,
    COUNT(tl.line_id) AS total_bets,
    (SUM(tl.bet_amount) * 100.0 / (
        SELECT SUM(bet_amount) 
        FROM ticket_lines tl2 
        INNER JOIN tickets t2 ON tl2.ticket_id = t2.ticket_id 
        WHERE t2.betting_pool_id = bp.betting_pool_id
    )) AS percentage
FROM betting_pools bp
INNER JOIN tickets t ON bp.betting_pool_id = t.betting_pool_id
INNER JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
INNER JOIN game_types gt ON tl.game_type_id = gt.game_type_id
WHERE CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY bp.betting_pool_id, bp.betting_pool_name, gt.game_name;

-- Vista de ventas por zona
CREATE VIEW vw_sales_by_zone AS
SELECT 
    z.zone_id,
    z.zone_name,
    COUNT(DISTINCT bp.betting_pool_id) AS total_betting_pools,
    SUM(t.total_amount) AS total_sales,
    SUM(t.commission_amount) AS total_commissions,
    SUM(t.total_amount - t.commission_amount) AS net_amount,
    COUNT(t.ticket_id) AS total_tickets
FROM zones z
INNER JOIN betting_pools bp ON z.zone_id = bp.zone_id
LEFT JOIN tickets t ON bp.betting_pool_id = t.betting_pool_id
WHERE CAST(t.created_at AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY z.zone_id, z.zone_name;
```

---

## 🔟 **STORED PROCEDURES ADICIONALES**

Según la documentación, faltan estos procedimientos importantes:

```sql
-- Procesamiento de tickets del día
CREATE PROCEDURE sp_ProcessDailyTickets
    @process_date DATE = NULL,
    @betting_pool_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @process_date IS NULL
        SET @process_date = CAST(GETDATE() AS DATE);
    
    -- Recalcular ventas, premios y comisiones
    -- Actualizar balances
    -- Generar reportes
    
    -- Implementación aquí...
END;
GO

-- Verificación de límites
CREATE PROCEDURE sp_ValidateBetLimits
    @lottery_id INT,
    @draw_id INT,
    @betting_pool_id INT,
    @game_type_id INT,
    @bet_number VARCHAR(10),
    @bet_amount DECIMAL(18,2),
    @is_valid BIT OUTPUT,
    @remaining_amount DECIMAL(18,2) OUTPUT,
    @message NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verificar límites aplicables
    -- Calcular ventas actuales del número
    -- Determinar si se puede aceptar la apuesta
    
    -- Implementación aquí...
END;
GO

-- Publicación de resultados
CREATE PROCEDURE sp_PublishResults
    @draw_id INT,
    @winning_numbers NVARCHAR(MAX), -- JSON array
    @published_by INT,
    @is_verified BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Insertar resultados
        -- Marcar tickets ganadores
        -- Calcular premios
        -- Auditoría
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Consulta de números calientes
CREATE PROCEDURE sp_GetHotNumbers
    @lottery_id INT,
    @draw_date DATE = NULL,
    @top_count INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @draw_date IS NULL
        SET @draw_date = CAST(GETDATE() AS DATE);
    
    -- Consultar números más vendidos
    -- Calcular porcentajes de riesgo
    -- Retornar top N números
    
    -- Implementación aquí...
END;
GO
```

---

## ✅ **RESUMEN DE PRIORIDADES**

### 🔴 **Alta Prioridad** (Core del negocio)
1. ✅ Sistema de Límites y Riesgo
2. ✅ Sistema de Préstamos
3. ✅ Sistema de Transacciones y Categorías
4. ✅ Logs de Auditoría Completos
5. ✅ Tablas de Anomalías

### 🟡 **Media Prioridad** (Operación diaria)
6. ✅ Sistema de Excedentes
7. ✅ Cobradores y Agentes Externos
8. ✅ Cobros y Pagos Rápidos
9. ✅ Entidades Contables
10. ✅ Sistema de Bote (Import/Export)

### 🟢 **Baja Prioridad** (Comunicación)
11. ✅ Receptores de Correo
12. ✅ Notificaciones Internas
13. ✅ Vistas Adicionales de Reportes

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

```
☐ Crear tablas de préstamos (loans, loan_payments)
☐ Crear tablas de límites (limit_rules, number_blocks, hot_numbers)
☐ Crear tablas de transacciones (transactions, transaction_categories)
☐ Crear tablas de excedentes (excesses, excess_audit_log)
☐ Crear tablas de cobradores (debt_collectors, collector_betting_pools)
☐ Crear tablas de agentes (external_agents, agent_commission_schema)
☐ Crear tablas de bote (bote_imports, bote_exports, auto_export_config)
☐ Crear tablas de comunicaciones (mail_receptors, internal_notifications)
☐ Crear tablas de entidades contables (accountable_entities)
☐ Crear tablas de anomalías (anomalies)
☐ Crear logs adicionales (system_log, ticket_cancel_log, etc.)
☐ Crear vistas adicionales de reportes
☐ Crear stored procedures adicionales
☐ Agregar índices para nuevas tablas
☐ Agregar foreign keys correspondientes
☐ Crear triggers de auditoría para nuevas tablas
```

---

## 📊 **ESTADÍSTICAS FINALES**

**Base de Datos Actual:**
- ✅ 31+ tablas implementadas
- ✅ Sistema de usuarios y permisos completo
- ✅ Sistema de tickets refactorizado
- ✅ Sistema de betting pools modular

**Elementos por Agregar:**
- ⚠️ ~25 tablas adicionales
- ⚠️ ~15 stored procedures
- ⚠️ ~8 vistas adicionales
- ⚠️ Índices y foreign keys correspondientes

**Total Estimado Final:** ~56-60 tablas
