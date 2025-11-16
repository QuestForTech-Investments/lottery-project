-- =============================================
-- Migration: Convert configuration values from Spanish to English
-- Date: 2025-10-29
-- Description: Updates all configuration string values to use English
--              for multi-language support (UI translates, DB stores English)
-- =============================================

-- Update fall_type values
UPDATE betting_pool_config
SET fall_type = 'DAILY'
WHERE fall_type = 'DIARIA';
GO

UPDATE betting_pool_config
SET fall_type = 'COLLECTION'
WHERE fall_type = 'COBRO';
GO

UPDATE betting_pool_config
SET fall_type = 'MONTHLY'
WHERE fall_type = 'MENSUAL';
GO

UPDATE betting_pool_config
SET fall_type = 'WEEKLY'
WHERE fall_type = 'SEMANAL';
GO

-- Update payment_mode values
UPDATE betting_pool_config
SET payment_mode = 'POOL'
WHERE payment_mode = 'BANCA';
GO

UPDATE betting_pool_config
SET payment_mode = 'COLLECTOR'
WHERE payment_mode = 'COBRADOR';
GO

-- Update print_mode values in betting_pool_print_config
UPDATE betting_pool_print_config
SET print_mode = 'GENERIC'
WHERE print_mode = 'GENERICO';
GO

-- Update discount_provider values in betting_pool_discount_config
UPDATE betting_pool_discount_config
SET discount_provider = 'GROUP'
WHERE discount_provider = 'GRUPO';
GO

UPDATE betting_pool_discount_config
SET discount_provider = 'SELLER'
WHERE discount_provider = 'RIFERO';
GO

-- Update discount_mode values in betting_pool_discount_config
UPDATE betting_pool_discount_config
SET discount_mode = 'CASH'
WHERE discount_mode = 'EFECTIVO';
GO

UPDATE betting_pool_discount_config
SET discount_mode = 'FREE_TICKET'
WHERE discount_mode = 'TICKET_GRATIS';
GO

PRINT 'Migration completed successfully!';
PRINT 'Converted all configuration values from Spanish to English:';
PRINT '  - fall_type: DIARIA→DAILY, COBRO→COLLECTION, MENSUAL→MONTHLY, SEMANAL→WEEKLY';
PRINT '  - payment_mode: BANCA→POOL, COBRADOR→COLLECTOR';
PRINT '  - print_mode: GENERICO→GENERIC';
PRINT '  - discount_provider: GRUPO→GROUP, RIFERO→SELLER';
PRINT '  - discount_mode: EFECTIVO→CASH, TICKET_GRATIS→FREE_TICKET';
GO
