-- =============================================
-- EJEMPLOS DE CREACIÓN DE TICKETS
-- Sistema de Lotería - Octubre 2025
-- =============================================

-- =============================================
-- EJEMPLO 1: TICKET SIMPLE (1 número, 1 sorteo)
-- =============================================

PRINT '📝 EJEMPLO 1: Ticket Simple';
PRINT '   - 1 número (23)';
PRINT '   - 1 sorteo (LEIDSA 12:00)';
PRINT '   - Sin descuentos ni multiplicadores';
GO

BEGIN TRANSACTION;

-- Paso 1: Crear el ticket (cabecera)
DECLARE @ticket_id_1 BIGINT;

INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    created_at,
    global_multiplier,
    global_discount,
    currency_code,
    status,
    ip_address,
    terminal_id
)
VALUES (
    'LAN-20251022-0001',    -- Código único del ticket
    1,                       -- ID de la banca (betting_pool_id)
    5,                       -- ID del usuario vendedor
    GETDATE(),              -- Fecha/hora actual
    1.00,                   -- Sin multiplicador
    0.00,                   -- Sin descuento
    'DOP',                  -- Pesos dominicanos
    'pending',              -- Estado inicial
    '192.168.1.100',        -- IP de la terminal
    'CAJA-01'               -- ID de la caja/terminal
);

-- Obtener el ID generado
SET @ticket_id_1 = SCOPE_IDENTITY();

-- Paso 2: Agregar las líneas (jugadas)
INSERT INTO ticket_lines (
    ticket_id,
    line_number,
    lottery_id,
    draw_id,
    draw_date,
    draw_time,
    bet_number,
    bet_type_id,
    position,
    bet_amount,
    multiplier,
    discount_percentage,
    discount_amount,
    subtotal,
    total_with_multiplier,
    commission_percentage,
    commission_amount,
    net_amount,
    line_status,
    created_at
)
VALUES (
    @ticket_id_1,           -- ID del ticket
    1,                      -- Línea #1
    5,                      -- LEIDSA (lottery_id)
    150,                    -- Sorteo específico (draw_id)
    '2025-10-22',           -- Fecha del sorteo
    '12:00:00',             -- Hora del sorteo (mediodía)
    '23',                   -- Número jugado
    1,                      -- Tipo: DIRECTO (game_type_id)
    1,                      -- Posición: PRIMERA
    100.00,                 -- Apuesta: $100
    1.00,                   -- Sin multiplicador
    0.00,                   -- Sin descuento
    0.00,                   -- $0 de descuento
    100.00,                 -- Subtotal = $100
    100.00,                 -- Total con multiplicador = $100
    10.00,                  -- Comisión: 10%
    10.00,                  -- Comisión en dinero: $10
    90.00,                  -- Neto después de comisión: $90
    'pending',              -- Estado de la línea
    GETDATE()
);

-- Paso 3: Calcular totales del ticket
EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_1;

-- Paso 4: Ver resultado
SELECT 
    ticket_code,
    total_lines,
    grand_total,
    total_commission,
    status
FROM tickets 
WHERE ticket_id = @ticket_id_1;

COMMIT TRANSACTION;
PRINT '✅ Ticket simple creado exitosamente';
PRINT '';
GO

-- =============================================
-- EJEMPLO 2: TICKET CON MÚLTIPLES NÚMEROS
-- =============================================

PRINT '📝 EJEMPLO 2: Ticket con Múltiples Números';
PRINT '   - 5 números diferentes';
PRINT '   - Mismo sorteo';
PRINT '   - Diferentes tipos de jugada';
GO

BEGIN TRANSACTION;

DECLARE @ticket_id_2 BIGINT;

-- Crear ticket
INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    global_multiplier,
    global_discount,
    currency_code,
    status
)
VALUES (
    'LAN-20251022-0002',
    1,
    5,
    1.00,
    0.00,
    'DOP',
    'pending'
);

SET @ticket_id_2 = SCOPE_IDENTITY();

-- Insertar múltiples líneas
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id, draw_date, draw_time,
    bet_number, bet_type_id, position, bet_amount, multiplier,
    discount_percentage, discount_amount, subtotal, total_with_multiplier,
    commission_percentage, commission_amount, net_amount, line_status
)
VALUES
    -- Línea 1: Directo Primera
    (@ticket_id_2, 1, 5, 150, '2025-10-22', '12:00', '23', 1, 1, 100.00, 1.00, 0, 0, 100.00, 100.00, 10.00, 10.00, 90.00, 'pending'),
    
    -- Línea 2: Directo Segunda
    (@ticket_id_2, 2, 5, 150, '2025-10-22', '12:00', '45', 1, 2, 50.00, 1.00, 0, 0, 50.00, 50.00, 10.00, 5.00, 45.00, 'pending'),
    
    -- Línea 3: Pale
    (@ticket_id_2, 3, 5, 150, '2025-10-22', '12:00', '67', 2, NULL, 30.00, 1.00, 0, 0, 30.00, 30.00, 10.00, 3.00, 27.00, 'pending'),
    
    -- Línea 4: Tripleta
    (@ticket_id_2, 4, 5, 150, '2025-10-22', '12:00', '89', 3, NULL, 20.00, 1.00, 0, 0, 20.00, 20.00, 10.00, 2.00, 18.00, 'pending'),
    
    -- Línea 5: Directo Primera (otro número)
    (@ticket_id_2, 5, 5, 150, '2025-10-22', '12:00', '12', 1, 1, 25.00, 1.00, 0, 0, 25.00, 25.00, 10.00, 2.50, 22.50, 'pending');

-- Calcular totales
EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_2;

-- Ver resultado
SELECT * FROM tickets WHERE ticket_id = @ticket_id_2;
SELECT * FROM ticket_lines WHERE ticket_id = @ticket_id_2 ORDER BY line_number;

COMMIT TRANSACTION;
PRINT '✅ Ticket con múltiples números creado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 3: TICKET CON MULTIPLICADOR x5
-- =============================================

PRINT '📝 EJEMPLO 3: Ticket con Multiplicador x5';
PRINT '   - 2 números';
PRINT '   - Multiplicador global x5';
GO

BEGIN TRANSACTION;

DECLARE @ticket_id_3 BIGINT;

INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    global_multiplier,      -- ⭐ MULTIPLICADOR GLOBAL
    global_discount,
    currency_code,
    status
)
VALUES (
    'LAN-20251022-0003',
    1,
    5,
    5.00,                    -- ⭐ x5 MULTIPLICADOR
    0.00,
    'DOP',
    'pending'
);

SET @ticket_id_3 = SCOPE_IDENTITY();

-- Líneas con multiplicador
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id, draw_date, draw_time,
    bet_number, bet_type_id, position, bet_amount, 
    multiplier,              -- ⭐ Multiplicador aplicado
    discount_percentage, discount_amount, subtotal, 
    total_with_multiplier,   -- ⭐ Total después de multiplicar
    commission_percentage, commission_amount, net_amount, line_status
)
VALUES
    -- $20 x 5 = $100
    (@ticket_id_3, 1, 5, 150, '2025-10-22', '12:00', '23', 1, 1, 
     20.00,     -- Apuesta base
     5.00,      -- x5
     0, 0, 20.00, 
     100.00,    -- 20 x 5 = 100
     10.00, 10.00, 90.00, 'pending'),
    
    -- $10 x 5 = $50
    (@ticket_id_3, 2, 5, 150, '2025-10-22', '12:00', '45', 2, NULL, 
     10.00,     -- Apuesta base
     5.00,      -- x5
     0, 0, 10.00, 
     50.00,     -- 10 x 5 = 50
     10.00, 5.00, 45.00, 'pending');

EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_3;

-- Ver resultado
SELECT 
    ticket_code,
    global_multiplier,
    total_bet_amount,
    total_with_multiplier,
    grand_total
FROM tickets 
WHERE ticket_id = @ticket_id_3;

COMMIT TRANSACTION;
PRINT '✅ Ticket con multiplicador creado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 4: TICKET CON DESCUENTO 15%
-- =============================================

PRINT '📝 EJEMPLO 4: Ticket con Descuento 15%';
PRINT '   - 3 números';
PRINT '   - Descuento global 15%';
GO

BEGIN TRANSACTION;

DECLARE @ticket_id_4 BIGINT;

INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    global_multiplier,
    global_discount,         -- ⭐ DESCUENTO GLOBAL
    currency_code,
    status
)
VALUES (
    'LAN-20251022-0004',
    1,
    5,
    1.00,
    15.00,                   -- ⭐ 15% DESCUENTO
    'DOP',
    'pending'
);

SET @ticket_id_4 = SCOPE_IDENTITY();

-- Líneas con descuento
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id, draw_date, draw_time,
    bet_number, bet_type_id, position, bet_amount, multiplier,
    discount_percentage,     -- ⭐ Descuento %
    discount_amount,         -- ⭐ Descuento $
    subtotal,                -- ⭐ Después del descuento
    total_with_multiplier,
    commission_percentage, commission_amount, net_amount, line_status
)
VALUES
    -- $100 - 15% = $85
    (@ticket_id_4, 1, 5, 150, '2025-10-22', '12:00', '23', 1, 1, 
     100.00,    -- Base
     1.00,
     15.00,     -- 15% descuento
     15.00,     -- $15 de descuento
     85.00,     -- 100 - 15 = 85
     85.00,
     10.00, 8.50, 76.50, 'pending'),
    
    -- $50 - 15% = $42.50
    (@ticket_id_4, 2, 5, 150, '2025-10-22', '12:00', '45', 2, NULL, 
     50.00,
     1.00,
     15.00,
     7.50,      -- $7.50 de descuento
     42.50,     -- 50 - 7.50 = 42.50
     42.50,
     10.00, 4.25, 38.25, 'pending'),
    
    -- $30 - 15% = $25.50
    (@ticket_id_4, 3, 5, 150, '2025-10-22', '12:00', '67', 3, NULL, 
     30.00,
     1.00,
     15.00,
     4.50,      -- $4.50 de descuento
     25.50,     -- 30 - 4.50 = 25.50
     25.50,
     10.00, 2.55, 22.95, 'pending');

EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_4;

SELECT 
    ticket_code,
    global_discount,
    total_bet_amount,
    total_discount,
    total_subtotal,
    grand_total
FROM tickets 
WHERE ticket_id = @ticket_id_4;

COMMIT TRANSACTION;
PRINT '✅ Ticket con descuento creado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 5: TICKET CON MÚLTIPLES SORTEOS
-- =============================================

PRINT '📝 EJEMPLO 5: Ticket con Múltiples Sorteos';
PRINT '   - 1 número (23)';
PRINT '   - 3 sorteos diferentes (LEIDSA 12:00, 6:00 PM, 9:00 PM)';
GO

BEGIN TRANSACTION;

DECLARE @ticket_id_5 BIGINT;

INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    global_multiplier,
    global_discount,
    currency_code,
    status,
    total_lotteries          -- ⭐ Cantidad de loterías
)
VALUES (
    'LAN-20251022-0005',
    1,
    5,
    1.00,
    0.00,
    'DOP',
    'pending',
    1                        -- 1 lotería (LEIDSA) pero 3 sorteos
);

SET @ticket_id_5 = SCOPE_IDENTITY();

-- El mismo número en 3 sorteos diferentes
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id, 
    draw_date, draw_time,    -- ⭐ Diferentes horarios
    bet_number, bet_type_id, position, bet_amount, multiplier,
    discount_percentage, discount_amount, subtotal, total_with_multiplier,
    commission_percentage, commission_amount, net_amount, line_status
)
VALUES
    -- Sorteo 12:00 PM
    (@ticket_id_5, 1, 5, 150, '2025-10-22', '12:00:00', '23', 1, 1, 
     50.00, 1.00, 0, 0, 50.00, 50.00, 10.00, 5.00, 45.00, 'pending'),
    
    -- Sorteo 6:00 PM
    (@ticket_id_5, 2, 5, 151, '2025-10-22', '18:00:00', '23', 1, 1, 
     50.00, 1.00, 0, 0, 50.00, 50.00, 10.00, 5.00, 45.00, 'pending'),
    
    -- Sorteo 9:00 PM
    (@ticket_id_5, 3, 5, 152, '2025-10-22', '21:00:00', '23', 1, 1, 
     50.00, 1.00, 0, 0, 50.00, 50.00, 10.00, 5.00, 45.00, 'pending');

EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_5;

-- Ver sorteos
SELECT 
    line_number,
    draw_time,
    bet_number,
    bet_amount
FROM ticket_lines 
WHERE ticket_id = @ticket_id_5 
ORDER BY draw_time;

COMMIT TRANSACTION;
PRINT '✅ Ticket con múltiples sorteos creado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 6: TICKET CON INFORMACIÓN DE CLIENTE
-- =============================================

PRINT '📝 EJEMPLO 6: Ticket con Información de Cliente';
PRINT '   - Ticket grande ($1,000+)';
PRINT '   - Requiere datos del cliente';
GO

BEGIN TRANSACTION;

DECLARE @ticket_id_6 BIGINT;

INSERT INTO tickets (
    ticket_code,
    betting_pool_id,
    user_id,
    global_multiplier,
    global_discount,
    currency_code,
    status,
    -- ⭐ INFORMACIÓN DEL CLIENTE
    customer_name,
    customer_phone,
    customer_email,
    customer_id_number
)
VALUES (
    'LAN-20251022-0006',
    1,
    5,
    1.00,
    0.00,
    'DOP',
    'pending',
    'Juan Pérez García',     -- ⭐ Nombre
    '809-555-1234',          -- ⭐ Teléfono
    'juan.perez@email.com',  -- ⭐ Email
    '001-1234567-8'          -- ⭐ Cédula
);

SET @ticket_id_6 = SCOPE_IDENTITY();

-- Apuesta grande
INSERT INTO ticket_lines (
    ticket_id, line_number, lottery_id, draw_id, draw_date, draw_time,
    bet_number, bet_type_id, position, bet_amount, multiplier,
    discount_percentage, discount_amount, subtotal, total_with_multiplier,
    commission_percentage, commission_amount, net_amount, line_status
)
VALUES
    (@ticket_id_6, 1, 5, 150, '2025-10-22', '12:00', '23', 1, 1, 
     1000.00, 1.00, 0, 0, 1000.00, 1000.00, 10.00, 100.00, 900.00, 'pending');

EXEC sp_CalculateTicketTotals @ticket_id = @ticket_id_6;

-- Ver con información de cliente
SELECT 
    ticket_code,
    grand_total,
    customer_name,
    customer_phone,
    customer_id_number
FROM tickets 
WHERE ticket_id = @ticket_id_6;

COMMIT TRANSACTION;
PRINT '✅ Ticket con datos de cliente creado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 7: VERIFICAR GANADORES Y PAGAR
-- =============================================

PRINT '📝 EJEMPLO 7: Verificar Ganadores y Pagar Premio';
PRINT '   - Simula que el número 23 ganó';
PRINT '   - Verifica ganadores';
PRINT '   - Paga el premio';
GO

BEGIN TRANSACTION;

-- Usar el primer ticket de ejemplo
DECLARE @ticket_to_check BIGINT = 1;  -- Ticket del Ejemplo 1

-- Simular que publicaron resultados (el 23 salió en primera)
-- Esto normalmente lo haría el sistema al publicar resultados
INSERT INTO results (
    result_id,
    draw_id,
    lottery_id,
    draw_date,
    winning_number,
    position,
    created_at
)
VALUES
    (1, 150, 5, '2025-10-22', '23', 1, GETDATE());

-- Verificar ganadores del ticket
EXEC sp_CheckTicketWinners @ticket_id = @ticket_to_check;

-- Ver ticket ganador
SELECT 
    t.ticket_code,
    t.status,
    t.total_prize,
    t.winning_lines,
    tl.bet_number,
    tl.is_winner,
    tl.prize_amount
FROM tickets t
INNER JOIN ticket_lines tl ON t.ticket_id = tl.ticket_id
WHERE t.ticket_id = @ticket_to_check;

-- Pagar el premio
EXEC sp_PayTicketPrize 
    @ticket_id = @ticket_to_check,
    @paid_by = 5,
    @payment_method = 'efectivo',
    @payment_reference = 'PAGO-001';

-- Ver estado final
SELECT 
    ticket_code,
    status,
    is_paid,
    paid_at,
    total_prize,
    payment_method
FROM tickets 
WHERE ticket_id = @ticket_to_check;

ROLLBACK TRANSACTION;  -- Revertir para no afectar ejemplos anteriores
PRINT '✅ Proceso de verificación y pago completado';
PRINT '';
GO

-- =============================================
-- EJEMPLO 8: CONSULTAS ÚTILES
-- =============================================

PRINT '📝 EJEMPLO 8: Consultas Útiles';
GO

-- Ver todos los tickets del día
PRINT 'Tickets del día:';
SELECT 
    ticket_code,
    betting_pool_id,
    grand_total,
    status,
    created_at
FROM tickets
WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY created_at DESC;

-- Ver números más jugados hoy
PRINT '';
PRINT 'Números calientes del día:';
SELECT TOP 10 * FROM vw_hot_numbers_today 
ORDER BY total_bet DESC;

-- Ver tickets ganadores pendientes
PRINT '';
PRINT 'Ganadores pendientes de pago:';
SELECT * FROM vw_pending_winners;

-- Ver ventas del día por banca
PRINT '';
PRINT 'Ventas por banca:';
SELECT * FROM vw_daily_sales_by_betting_pool
ORDER BY total_sales DESC;

GO

-- =============================================
-- RESUMEN DE FUNCIONES DISPONIBLES
-- =============================================

PRINT '';
PRINT '========================================';
PRINT '🎫 RESUMEN DE STORED PROCEDURES';
PRINT '========================================';
PRINT '';
PRINT '1. sp_CalculateTicketTotals';
PRINT '   Recalcula todos los totales de un ticket';
PRINT '   EXEC sp_CalculateTicketTotals @ticket_id = 1;';
PRINT '';
PRINT '2. sp_CancelTicket';
PRINT '   Cancela un ticket con auditoría completa';
PRINT '   EXEC sp_CancelTicket @ticket_id=1, @cancelled_by=10, @cancellation_reason=''Error'';';
PRINT '';
PRINT '3. sp_CheckTicketWinners';
PRINT '   Verifica números ganadores en un ticket';
PRINT '   EXEC sp_CheckTicketWinners @ticket_id = 1;';
PRINT '';
PRINT '4. sp_PayTicketPrize';
PRINT '   Registra el pago de un premio';
PRINT '   EXEC sp_PayTicketPrize @ticket_id=1, @paid_by=10, @payment_method=''efectivo'';';
PRINT '';
PRINT '5. sp_GetNumberSales';
PRINT '   Consulta ventas de un número específico';
PRINT '   EXEC sp_GetNumberSales @bet_number=''23'', @lottery_id=5, @draw_date=''2025-10-22'';';
PRINT '';
PRINT '========================================';
GO
