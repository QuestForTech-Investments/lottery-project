-- ============================================
-- CREATE STORED PROCEDURES
-- ============================================

-- Stored Procedure: sp_CalculateTicketTotals
-- ============================================================================
-- SP: Calcular totales de un ticket
-- ============================================================================
CREATE   PROCEDURE sp_CalculateTicketTotals
    @ticket_id
GO

-- Stored Procedure: sp_CancelTicket
-- ============================================================================
-- SP: Cancelar un ticket
-- ============================================================================
CREATE   PROCEDURE sp_CancelTicket
    @ticket_id BIGINT,
    @cancel
GO

-- Stored Procedure: sp_CheckTicketWinners
-- ============================================================================
-- SP: Verificar números ganadores en un ticket
-- IMPROVED: 2025-10-22 - Added comprehensive validation and error handling
-- ================================================
GO

-- Stored Procedure: sp_CopyBettingPoolConfig
-- SP: Copiar toda la configuración de una banca a otra
-- IMPROVED: 2025-10-22 - Added validation to prevent source = target and comprehensive error handling
CREATE   PROCEDURE sp_CopyBettingPoolConfig
    @source_betting_pool_id INT,
    @target_betting
GO

-- Stored Procedure: sp_CopyBettingPoolSection
-- SP: Copiar solo una sección específica
CREATE   PROCEDURE sp_CopyBettingPoolSection
    @source_betting_pool_id INT,
    @target_betting_pool_id INT,
    @section VARCHAR(50) -- 'CONFIGURACION', 'PIES', 'PREMIOS', 'HORARIOS', 'SORTEOS', 'ESTILOS', 'GAS
GO

-- Stored Procedure: sp_ExpireOldPermissions
-- SP: Expirar permisos vencidos (ejecutar periódicamente)
CREATE   PROCEDURE sp_ExpireOldPermissions
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE user_permissions
    SET is_active = 0,
        updated_at = GETDATE(),
        updated_by = -1, -- Sistema
GO

-- Stored Procedure: sp_GetNumberSales
-- ============================================================================
-- SP: Obtener ventas por número (para límites)
-- ============================================================================
CREATE   PROCEDURE sp_GetNumberSales
    @bet_n
GO

-- Stored Procedure: sp_GetUserPermissions
-- SP: Ver todos los permisos de un usuario (directos + por rol)
CREATE   PROCEDURE sp_GetUserPermissions
    @user_id INT = NULL,
    @username NVARCHAR(50) = NULL,
    @include_expired BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @username IS NOT NU
GO

-- Stored Procedure: sp_GetUsersWithPermission
-- SP: Obtener usuarios con un permiso específico
CREATE   PROCEDURE sp_GetUsersWithPermission
    @permission_code NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @permission_id INT;
    SET @permission_id = (SELECT permission_id FROM permiss
GO

-- Stored Procedure: sp_GrantMultiplePermissions
-- SP: Otorgar múltiples permisos a usuario
CREATE   PROCEDURE sp_GrantMultiplePermissions
    @user_id INT,
    @permission_codes NVARCHAR(MAX), -- Separados por comas: "tickets.create,tickets.cancel"
    @grant_reason NVARCHAR(500) = NULL
AS
BEGIN
    S
GO

-- Stored Procedure: sp_GrantPermissionToUser
-- SP: Otorgar permiso directo a usuario
CREATE   PROCEDURE sp_GrantPermissionToUser
    @user_id INT,
    @permission_id INT,
    @grant_reason NVARCHAR(500) = NULL,
    @expires_at DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
GO

-- Stored Procedure: sp_PayTicketPrize
-- ============================================================================
-- SP: Registrar pago de premio
-- IMPROVED: 2025-10-22 - Added comprehensive validation and financial transaction logging
-- =================================================
GO

-- Stored Procedure: sp_RevokePermissionFromUser
-- SP: Revocar permiso directo de usuario
CREATE   PROCEDURE sp_RevokePermissionFromUser
    @user_id INT,
    @permission_id INT,
    @revoke_reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE user_permissions
    SET is_active = 0,
GO

