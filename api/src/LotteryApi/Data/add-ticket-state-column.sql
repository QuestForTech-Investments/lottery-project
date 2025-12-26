-- Script para agregar la columna ticket_state a la tabla tickets
-- Estado del ticket según resultados: P=Pending, W=Winner, L=Loser
-- Fecha: 2025-12-26

-- Verificar si la columna ya existe antes de agregarla
IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'tickets'
    AND COLUMN_NAME = 'ticket_state'
)
BEGIN
    ALTER TABLE tickets
    ADD ticket_state CHAR(1) NOT NULL DEFAULT 'P';

    PRINT 'Columna ticket_state agregada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La columna ticket_state ya existe.';
END
GO

-- Crear índice para mejorar consultas por estado
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_tickets_ticket_state'
    AND object_id = OBJECT_ID('tickets')
)
BEGIN
    CREATE INDEX IX_tickets_ticket_state ON tickets(ticket_state);
    PRINT 'Índice IX_tickets_ticket_state creado.';
END
GO

-- Agregar constraint para validar valores permitidos
IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_tickets_ticket_state'
)
BEGIN
    ALTER TABLE tickets
    ADD CONSTRAINT CK_tickets_ticket_state
    CHECK (ticket_state IN ('P', 'W', 'L'));

    PRINT 'Constraint CK_tickets_ticket_state agregado.';
END
GO

-- Comentario de la columna
EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Estado del ticket según resultados: P=Pending (pendiente), W=Winner (ganador), L=Loser (perdedor)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'tickets',
    @level2type = N'COLUMN', @level2name = N'ticket_state';
GO

PRINT 'Script completado exitosamente.';
