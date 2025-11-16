-- ============================================================================
-- Script: fix_betting_pool_schedules_identity.sql
-- Propósito: Agregar IDENTITY al campo schedule_id en betting_pool_schedules
-- Fecha: 2025-11-07
-- Autor: Claude Code
-- ============================================================================

USE [lottery-db];
GO

PRINT 'Iniciando migración de betting_pool_schedules para agregar IDENTITY...';
GO

-- Verificar si la tabla existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'betting_pool_schedules')
BEGIN
    PRINT 'ERROR: La tabla betting_pool_schedules no existe';
    RETURN;
END
GO

-- Paso 1: Crear tabla temporal con IDENTITY
PRINT 'Paso 1: Creando tabla temporal con IDENTITY...';
GO

CREATE TABLE [dbo].[betting_pool_schedules_temp] (
    [schedule_id] int IDENTITY(1,1) NOT NULL,  -- ✅ Ahora con IDENTITY
    [betting_pool_id] int NOT NULL,
    [day_of_week] int NOT NULL,
    [close_time] time NULL,
    [draw_time] time NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [updated_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_betting_pool_schedules_temp] PRIMARY KEY ([schedule_id]),
    CONSTRAINT [UQ_pool_day_temp] UNIQUE ([betting_pool_id], [day_of_week])
);
GO

-- Paso 2: Copiar datos existentes (si hay)
PRINT 'Paso 2: Copiando datos existentes...';
GO

SET IDENTITY_INSERT [dbo].[betting_pool_schedules_temp] ON;
GO

INSERT INTO [dbo].[betting_pool_schedules_temp] (
    [schedule_id],
    [betting_pool_id],
    [day_of_week],
    [close_time],
    [draw_time],
    [is_active],
    [created_at],
    [updated_at],
    [created_by],
    [updated_by]
)
SELECT
    [schedule_id],
    [betting_pool_id],
    [day_of_week],
    [close_time],
    [draw_time],
    [is_active],
    [created_at],
    [updated_at],
    [created_by],
    [updated_by]
FROM [dbo].[betting_pool_schedules];
GO

SET IDENTITY_INSERT [dbo].[betting_pool_schedules_temp] OFF;
GO

PRINT 'Registros copiados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));
GO

-- Paso 3: Eliminar foreign keys que apuntan a la tabla original (si existen)
PRINT 'Paso 3: Eliminando constraints y foreign keys...';
GO

-- Verificar y eliminar foreign keys
IF EXISTS (
    SELECT * FROM sys.foreign_keys
    WHERE name = 'FK_betting_pool_schedules_betting_pools'
)
BEGIN
    ALTER TABLE [dbo].[betting_pool_schedules]
    DROP CONSTRAINT [FK_betting_pool_schedules_betting_pools];
    PRINT 'Foreign key FK_betting_pool_schedules_betting_pools eliminada';
END
GO

-- Paso 4: Eliminar tabla original
PRINT 'Paso 4: Eliminando tabla original...';
GO

DROP TABLE [dbo].[betting_pool_schedules];
GO

-- Paso 5: Renombrar tabla temporal
PRINT 'Paso 5: Renombrando tabla temporal...';
GO

EXEC sp_rename 'betting_pool_schedules_temp', 'betting_pool_schedules';
GO

EXEC sp_rename 'PK_betting_pool_schedules_temp', 'PK_betting_pool_schedules', 'OBJECT';
GO

EXEC sp_rename 'UQ_pool_day_temp', 'UQ_pool_day', 'OBJECT';
GO

-- Paso 6: Recrear foreign keys
PRINT 'Paso 6: Recreando foreign keys...';
GO

ALTER TABLE [dbo].[betting_pool_schedules]
ADD CONSTRAINT [FK_betting_pool_schedules_betting_pools]
FOREIGN KEY ([betting_pool_id])
REFERENCES [dbo].[betting_pools] ([betting_pool_id])
ON DELETE CASCADE;
GO

-- Paso 7: Verificar estructura final
PRINT 'Paso 7: Verificando estructura final...';
GO

SELECT
    c.name AS ColumnName,
    t.name AS DataType,
    c.is_identity AS IsIdentity,
    c.is_nullable AS IsNullable
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('betting_pool_schedules')
ORDER BY c.column_id;
GO

PRINT '✅ Migración completada exitosamente!';
PRINT 'La tabla betting_pool_schedules ahora tiene IDENTITY en schedule_id';
GO
