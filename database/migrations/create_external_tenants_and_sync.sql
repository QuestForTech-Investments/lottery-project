-- ============================================================================
-- Migration: Cross-tenant partner table + result-sync auxiliary tables.
--
-- Applies to every tenant DB (both Lottobook's existing DB and any new
-- tenant from Fase 3 onward). The tables stay empty until partners are
-- configured via the ExternalTenantsAdmin UI in V1.
--
--   external_tenants         — partner list with per-feature flags
--   result_sync_log          — every push/inbound attempt for auditing
--   result_sync_conflicts    — captures discrepancies the operator must resolve
--
-- Idempotent.
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'external_tenants')
BEGIN
    CREATE TABLE dbo.external_tenants (
        external_tenant_id  INT IDENTITY(1,1) PRIMARY KEY,
        tenant_code         NVARCHAR(50)  NOT NULL,
        display_name        NVARCHAR(200) NOT NULL,
        api_base_url        NVARCHAR(500) NOT NULL,
        api_key             NVARCHAR(500) NOT NULL,
        logo_url            NVARCHAR(500) NULL,
        sort_order          INT NOT NULL DEFAULT 0,
        is_active           BIT NOT NULL DEFAULT 1,
        -- Feature flags: each gates one cross-tenant capability so partners
        -- can opt in / out per feature independently.
        can_view_today_sales BIT NOT NULL DEFAULT 0,
        share_results        BIT NOT NULL DEFAULT 0,
        created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at  DATETIME2 NULL,
        CONSTRAINT UX_external_tenants_code UNIQUE (tenant_code)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'result_sync_log')
BEGIN
    CREATE TABLE dbo.result_sync_log (
        sync_log_id   INT IDENTITY(1,1) PRIMARY KEY,
        -- 'outbound' = we pushed to partner; 'inbound' = partner pushed to us
        direction     NVARCHAR(10) NOT NULL,
        partner_code  NVARCHAR(50) NOT NULL,
        result_date   DATE NOT NULL,
        lottery_code  NVARCHAR(50) NOT NULL,
        draw_code     NVARCHAR(50) NOT NULL,
        -- 'sent' | 'received' | 'noop' | 'conflict' | 'failed'
        status        NVARCHAR(20) NOT NULL,
        error_message NVARCHAR(2000) NULL,
        -- SHA-256 of the payload so operators can spot duplicate retries.
        payload_hash  NVARCHAR(64) NULL,
        created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_result_sync_log_partner_date
        ON dbo.result_sync_log(partner_code, result_date);
    CREATE INDEX IX_result_sync_log_status_date
        ON dbo.result_sync_log(status, created_at);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'result_sync_conflicts')
BEGIN
    CREATE TABLE dbo.result_sync_conflicts (
        conflict_id     INT IDENTITY(1,1) PRIMARY KEY,
        partner_code    NVARCHAR(50) NOT NULL,
        result_date     DATE NOT NULL,
        lottery_code    NVARCHAR(50) NOT NULL,
        draw_code       NVARCHAR(50) NOT NULL,
        -- Local row already stored when the partner push arrived.
        local_num1      NVARCHAR(20) NULL,
        local_num2      NVARCHAR(20) NULL,
        local_num3      NVARCHAR(20) NULL,
        -- What the partner sent.
        partner_num1    NVARCHAR(20) NULL,
        partner_num2    NVARCHAR(20) NULL,
        partner_num3    NVARCHAR(20) NULL,
        -- Resolution metadata.
        -- 'pending' | 'kept_local' | 'accepted_partner' | 'reviewed'
        resolution      NVARCHAR(20) NOT NULL DEFAULT 'pending',
        resolved_by     INT NULL,
        resolved_at     DATETIME2 NULL,
        notes           NVARCHAR(500) NULL,
        created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_result_sync_conflicts_pending
        ON dbo.result_sync_conflicts(resolution, created_at)
        WHERE resolution = 'pending';
END;
GO

-- ----------------------------------------------------------------------------
-- Permissions for the ExternalTenantsAdmin UI + sync log review.
-- Inserted idempotently so re-running won't duplicate. Assigned to the
-- "Admin" role if it exists (the typical seed role for full access).
-- ----------------------------------------------------------------------------

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE permission_code = 'VIEW_EXTERNAL_TENANTS')
BEGIN
    INSERT INTO dbo.permissions (permission_code, permission_name, category, description, is_active)
    VALUES ('VIEW_EXTERNAL_TENANTS', 'Ver Sistemas Externos', 'Sistemas Externos',
            'Listar los tenants asociados y sus configuraciones', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE permission_code = 'MANAGE_EXTERNAL_TENANTS')
BEGIN
    INSERT INTO dbo.permissions (permission_code, permission_name, category, description, is_active)
    VALUES ('MANAGE_EXTERNAL_TENANTS', 'Administrar Sistemas Externos', 'Sistemas Externos',
            'Crear/editar/eliminar tenants asociados y rotar sus API keys', 1);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.permissions WHERE permission_code = 'VIEW_RESULT_SYNC')
BEGIN
    INSERT INTO dbo.permissions (permission_code, permission_name, category, description, is_active)
    VALUES ('VIEW_RESULT_SYNC', 'Ver log de sincronización de resultados', 'Sistemas Externos',
            'Ver el historial de syncs de resultados y resolver conflictos', 1);
END;
GO
