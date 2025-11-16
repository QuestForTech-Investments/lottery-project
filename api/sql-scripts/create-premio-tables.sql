USE [lottery-db];
GO

-- =============================================
-- Create all 7 Premio Configuration Tables
-- System for managing prize multipliers with 3-level precedence:
-- Default → Banca General → Specific Sorteo Override
-- =============================================

PRINT '================================================================================'
PRINT 'CREATING PREMIO CONFIGURATION TABLES'
PRINT '================================================================================'
PRINT ''

-- =============================================
-- TABLE 1: tipos_apuesta (Bet Types - Seed Data)
-- 24 unique bet types (DIRECTO, PALE, TRIPLETA, etc.)
-- =============================================

PRINT 'Creating tipos_apuesta table...'

IF OBJECT_ID('tipos_apuesta', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: tipos_apuesta table already exists. Dropping...'
    DROP TABLE tipos_apuesta;
END

CREATE TABLE tipos_apuesta (
    tipo_apuesta_id INT IDENTITY(1,1) PRIMARY KEY,
    bet_type_code NVARCHAR(50) NOT NULL UNIQUE,
    bet_type_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE NONCLUSTERED INDEX IX_tipos_apuesta_active
    ON tipos_apuesta(is_active, display_order);

PRINT '✓ tipos_apuesta table created'
GO

-- =============================================
-- TABLE 2: campos_premio (Prize Fields - Seed Data)
-- 62 prize fields across all bet types
-- =============================================

PRINT 'Creating campos_premio table...'

IF OBJECT_ID('campos_premio', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: campos_premio table already exists. Dropping...'
    DROP TABLE campos_premio;
END

CREATE TABLE campos_premio (
    campo_premio_id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_apuesta_id INT NOT NULL,
    field_code NVARCHAR(100) NOT NULL UNIQUE,
    field_name NVARCHAR(255) NOT NULL,
    default_multiplier DECIMAL(18,2) NOT NULL DEFAULT 0,
    min_multiplier DECIMAL(18,2) NOT NULL DEFAULT 0,
    max_multiplier DECIMAL(18,2) NOT NULL DEFAULT 9999999.99,
    display_order INT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_campos_premio_tipo_apuesta FOREIGN KEY (tipo_apuesta_id)
        REFERENCES tipos_apuesta(tipo_apuesta_id),

    CONSTRAINT CK_campos_premio_default_range CHECK (
        default_multiplier >= min_multiplier AND default_multiplier <= max_multiplier
    )
);

CREATE NONCLUSTERED INDEX IX_campos_premio_tipo
    ON campos_premio(tipo_apuesta_id, is_active);

CREATE NONCLUSTERED INDEX IX_campos_premio_active
    ON campos_premio(is_active, display_order);

PRINT '✓ campos_premio table created'
GO

-- =============================================
-- TABLE 3: configuracion_general_banca
-- General prize configuration per banca (62 records per banca)
-- Auto-created when banca is created
-- =============================================

PRINT 'Creating configuracion_general_banca table...'

IF OBJECT_ID('configuracion_general_banca', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: configuracion_general_banca table already exists. Dropping...'
    DROP TABLE configuracion_general_banca;
END

CREATE TABLE configuracion_general_banca (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    banca_id INT NOT NULL,
    campo_premio_id INT NOT NULL,
    monto_multiplicador DECIMAL(18,2) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NULL,
    updated_by INT NULL,

    CONSTRAINT FK_config_general_banca FOREIGN KEY (banca_id)
        REFERENCES betting_pools(betting_pool_id),

    CONSTRAINT FK_config_general_campo FOREIGN KEY (campo_premio_id)
        REFERENCES campos_premio(campo_premio_id),

    CONSTRAINT FK_config_general_created_by FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    CONSTRAINT FK_config_general_updated_by FOREIGN KEY (updated_by)
        REFERENCES users(user_id),

    -- Each banca can only have one config per campo_premio
    CONSTRAINT UQ_config_general_banca_campo UNIQUE (banca_id, campo_premio_id),

    CONSTRAINT CK_config_general_multiplier CHECK (
        monto_multiplicador >= 0 AND monto_multiplicador <= 9999999.99
    )
);

CREATE NONCLUSTERED INDEX IX_config_general_banca
    ON configuracion_general_banca(banca_id, is_active);

CREATE NONCLUSTERED INDEX IX_config_general_campo
    ON configuracion_general_banca(campo_premio_id);

PRINT '✓ configuracion_general_banca table created'
GO

-- =============================================
-- TABLE 4: banca_sorteos (N:N Relationship)
-- Which sorteos does each banca work with
-- =============================================

PRINT 'Creating banca_sorteos table...'

IF OBJECT_ID('banca_sorteos', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: banca_sorteos table already exists. Dropping...'
    DROP TABLE banca_sorteos;
END

CREATE TABLE banca_sorteos (
    banca_sorteo_id INT IDENTITY(1,1) PRIMARY KEY,
    banca_id INT NOT NULL,
    sorteo_id INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_banca_sorteos_banca FOREIGN KEY (banca_id)
        REFERENCES betting_pools(betting_pool_id),

    CONSTRAINT FK_banca_sorteos_sorteo FOREIGN KEY (sorteo_id)
        REFERENCES sorteos(sorteo_id),

    -- Each banca-sorteo combination must be unique
    CONSTRAINT UQ_banca_sorteo UNIQUE (banca_id, sorteo_id)
);

CREATE NONCLUSTERED INDEX IX_banca_sorteos_banca
    ON banca_sorteos(banca_id, is_active);

CREATE NONCLUSTERED INDEX IX_banca_sorteos_sorteo
    ON banca_sorteos(sorteo_id, is_active);

PRINT '✓ banca_sorteos table created'
GO

-- =============================================
-- TABLE 5: configuracion_sorteo_banca
-- Sparse overrides for specific sorteos
-- Only stores differences from general banca config
-- =============================================

PRINT 'Creating configuracion_sorteo_banca table...'

IF OBJECT_ID('configuracion_sorteo_banca', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: configuracion_sorteo_banca table already exists. Dropping...'
    DROP TABLE configuracion_sorteo_banca;
END

CREATE TABLE configuracion_sorteo_banca (
    config_sorteo_id INT IDENTITY(1,1) PRIMARY KEY,
    banca_id INT NOT NULL,
    sorteo_id INT NOT NULL,
    campo_premio_id INT NOT NULL,
    monto_multiplicador DECIMAL(18,2) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NULL,
    updated_by INT NULL,

    CONSTRAINT FK_config_sorteo_banca FOREIGN KEY (banca_id)
        REFERENCES betting_pools(betting_pool_id),

    CONSTRAINT FK_config_sorteo_sorteo FOREIGN KEY (sorteo_id)
        REFERENCES sorteos(sorteo_id),

    CONSTRAINT FK_config_sorteo_campo FOREIGN KEY (campo_premio_id)
        REFERENCES campos_premio(campo_premio_id),

    CONSTRAINT FK_config_sorteo_created_by FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    CONSTRAINT FK_config_sorteo_updated_by FOREIGN KEY (updated_by)
        REFERENCES users(user_id),

    -- Each banca-sorteo-campo combination must be unique
    CONSTRAINT UQ_config_sorteo_banca_sorteo_campo UNIQUE (banca_id, sorteo_id, campo_premio_id),

    CONSTRAINT CK_config_sorteo_multiplier CHECK (
        monto_multiplicador >= 0 AND monto_multiplicador <= 9999999.99
    )
);

CREATE NONCLUSTERED INDEX IX_config_sorteo_banca
    ON configuracion_sorteo_banca(banca_id, sorteo_id, is_active);

CREATE NONCLUSTERED INDEX IX_config_sorteo_campo
    ON configuracion_sorteo_banca(campo_premio_id);

PRINT '✓ configuracion_sorteo_banca table created'
GO

-- =============================================
-- TABLE 6: auditoria_cambios_premios
-- Audit trail for all prize configuration changes
-- =============================================

PRINT 'Creating auditoria_cambios_premios table...'

IF OBJECT_ID('auditoria_cambios_premios', 'U') IS NOT NULL
BEGIN
    PRINT 'WARNING: auditoria_cambios_premios table already exists. Dropping...'
    DROP TABLE auditoria_cambios_premios;
END

CREATE TABLE auditoria_cambios_premios (
    audit_id INT IDENTITY(1,1) PRIMARY KEY,
    table_name NVARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    banca_id INT NOT NULL,
    sorteo_id INT NULL,
    campo_premio_id INT NOT NULL,
    old_value DECIMAL(18,2) NULL,
    new_value DECIMAL(18,2) NOT NULL,
    change_type NVARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(500) NULL,
    notes NVARCHAR(MAX) NULL,

    CONSTRAINT FK_audit_premios_banca FOREIGN KEY (banca_id)
        REFERENCES betting_pools(betting_pool_id),

    CONSTRAINT FK_audit_premios_sorteo FOREIGN KEY (sorteo_id)
        REFERENCES sorteos(sorteo_id),

    CONSTRAINT FK_audit_premios_campo FOREIGN KEY (campo_premio_id)
        REFERENCES campos_premio(campo_premio_id),

    CONSTRAINT FK_audit_premios_user FOREIGN KEY (changed_by)
        REFERENCES users(user_id),

    CONSTRAINT CK_audit_change_type CHECK (
        change_type IN ('INSERT', 'UPDATE', 'DELETE', 'AUTO_CREATE')
    )
);

CREATE NONCLUSTERED INDEX IX_audit_premios_banca
    ON auditoria_cambios_premios(banca_id, changed_at DESC);

CREATE NONCLUSTERED INDEX IX_audit_premios_sorteo
    ON auditoria_cambios_premios(sorteo_id, changed_at DESC);

CREATE NONCLUSTERED INDEX IX_audit_premios_campo
    ON auditoria_cambios_premios(campo_premio_id, changed_at DESC);

CREATE NONCLUSTERED INDEX IX_audit_premios_user
    ON auditoria_cambios_premios(changed_by, changed_at DESC);

CREATE NONCLUSTERED INDEX IX_audit_premios_date
    ON auditoria_cambios_premios(changed_at DESC);

PRINT '✓ auditoria_cambios_premios table created'
GO

-- =============================================
-- Create triggers for updated_at timestamps
-- =============================================

PRINT ''
PRINT 'Creating updated_at triggers...'
GO

-- Trigger for tipos_apuesta
CREATE TRIGGER trg_tipos_apuesta_updated_at
ON tipos_apuesta
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tipos_apuesta
    SET updated_at = GETDATE()
    FROM tipos_apuesta t
    INNER JOIN inserted i ON t.tipo_apuesta_id = i.tipo_apuesta_id;
END;
GO

-- Trigger for campos_premio
CREATE TRIGGER trg_campos_premio_updated_at
ON campos_premio
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE campos_premio
    SET updated_at = GETDATE()
    FROM campos_premio c
    INNER JOIN inserted i ON c.campo_premio_id = i.campo_premio_id;
END;
GO

-- Trigger for configuracion_general_banca
CREATE TRIGGER trg_config_general_updated_at
ON configuracion_general_banca
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE configuracion_general_banca
    SET updated_at = GETDATE()
    FROM configuracion_general_banca c
    INNER JOIN inserted i ON c.config_id = i.config_id;
END;
GO

-- Trigger for banca_sorteos
CREATE TRIGGER trg_banca_sorteos_updated_at
ON banca_sorteos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE banca_sorteos
    SET updated_at = GETDATE()
    FROM banca_sorteos b
    INNER JOIN inserted i ON b.banca_sorteo_id = i.banca_sorteo_id;
END;
GO

-- Trigger for configuracion_sorteo_banca
CREATE TRIGGER trg_config_sorteo_updated_at
ON configuracion_sorteo_banca
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE configuracion_sorteo_banca
    SET updated_at = GETDATE()
    FROM configuracion_sorteo_banca c
    INNER JOIN inserted i ON c.config_sorteo_id = i.config_sorteo_id;
END;
GO

PRINT '✓ All triggers created'
PRINT ''
PRINT '================================================================================'
PRINT 'ALL PREMIO CONFIGURATION TABLES CREATED SUCCESSFULLY'
PRINT '================================================================================'
PRINT ''
PRINT 'Tables Created:'
PRINT '1. tipos_apuesta (24 bet types - will be seeded next)'
PRINT '2. campos_premio (62 prize fields - will be seeded next)'
PRINT '3. configuracion_general_banca (auto-created per banca - 62 records each)'
PRINT '4. banca_sorteos (N:N relationship: bancas to sorteos)'
PRINT '5. configuracion_sorteo_banca (sparse overrides for specific sorteos)'
PRINT '6. auditoria_cambios_premios (audit trail for all changes)'
PRINT ''
PRINT 'Prize Calculation Precedence:'
PRINT 'Level 1: Default (campos_premio.default_multiplier)'
PRINT 'Level 2: Banca General (configuracion_general_banca.monto_multiplicador)'
PRINT 'Level 3: Specific Sorteo (configuracion_sorteo_banca.monto_multiplicador) ⭐ WINS'
PRINT ''
PRINT 'Next Steps:'
PRINT '1. Run seed-tipos-apuesta.sql to insert 24 bet types'
PRINT '2. Run seed-campos-premio.sql to insert 62 prize fields'
PRINT '3. Implement auto-creation trigger/stored procedure for new bancas'
PRINT '================================================================================'

GO

