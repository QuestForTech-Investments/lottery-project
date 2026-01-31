-- Script para actualizar los colores y abreviaciones de sorteos
-- Basado en datos extraídos de la aplicación original (la-numbers.apk.lol)
-- Fecha: 2026-01-29

-- =====================================================
-- ANGUILA QUINIELA - Colores amarillos
-- =====================================================
UPDATE draws SET display_color = '#FFEA00', abbreviation = 'AG AM' WHERE draw_id = 159; -- Anguila 10am
UPDATE draws SET display_color = '#F2DF10', abbreviation = 'AN AM' WHERE draw_id = 160; -- Anguila 1pm
UPDATE draws SET display_color = '#F2D118', abbreviation = 'AN PM' WHERE draw_id = 146; -- Anguila 6PM
UPDATE draws SET display_color = '#F5D905', abbreviation = 'AG PM' WHERE draw_id = 154; -- Anguila 9pm

-- =====================================================
-- TEXAS - Color celeste #37B9F9
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'TM AM' WHERE draw_id = 139; -- TEXAS MORNING
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'TD AM' WHERE draw_id = 140; -- TEXAS DAY
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'TE PM' WHERE draw_id = 141; -- TEXAS EVENING
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'TN PM' WHERE draw_id = 145; -- TEXAS NIGHT

-- =====================================================
-- GEORGIA - Colores púrpura/magenta
-- =====================================================
UPDATE draws SET display_color = '#AD06B0', abbreviation = 'GM AM' WHERE draw_id = 121; -- GEORGIA-MID AM
UPDATE draws SET display_color = '#E901FF', abbreviation = 'GE PM' WHERE draw_id = 122; -- GEORGIA EVENING
UPDATE draws SET display_color = '#FF01F2', abbreviation = 'GN PM' WHERE draw_id = 147; -- GEORGIA NIGHT

-- =====================================================
-- NEW YORK - Color azul
-- =====================================================
UPDATE draws SET display_color = '#0130FF', abbreviation = 'NYAM' WHERE draw_id = 123; -- NEW YORK DAY
UPDATE draws SET display_color = '#001EFF', abbreviation = 'NYPM' WHERE draw_id = 124; -- NEW YORK NIGHT
UPDATE draws SET display_color = '#FCAC00', abbreviation = 'NYM6' WHERE draw_id = 169; -- NY AM 6x1
UPDATE draws SET display_color = '#FFB500', abbreviation = 'NYE6' WHERE draw_id = 170; -- NY PM 6x1

-- =====================================================
-- FLORIDA - Color negro
-- =====================================================
UPDATE draws SET display_color = '#000000', abbreviation = 'FL AM' WHERE draw_id = 119; -- FLORIDA AM
UPDATE draws SET display_color = '#000000', abbreviation = 'FL PM' WHERE draw_id = 120; -- FLORIDA PM
UPDATE draws SET display_color = '#F9AC03', abbreviation = 'FLA6' WHERE draw_id = 171; -- FL AM 6X1
UPDATE draws SET display_color = '#FEA400', abbreviation = 'FLP6' WHERE draw_id = 172; -- FL PM 6X1
UPDATE draws SET display_color = '#00A6BB', abbreviation = 'FL2AM' WHERE draw_id = 186; -- FL PICK2 AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'FL2PM' WHERE draw_id = 187; -- FL PICK2 PM

-- =====================================================
-- NEW JERSEY - Color verde
-- =====================================================
UPDATE draws SET display_color = '#17A901', abbreviation = 'NJ AM' WHERE draw_id = 130; -- NEW JERSEY AM
UPDATE draws SET display_color = '#0D9D00', abbreviation = 'NJ PM' WHERE draw_id = 149; -- NEW JERSEY PM

-- =====================================================
-- CALIFORNIA - Color turquesa
-- =====================================================
UPDATE draws SET display_color = '#00BDE1', abbreviation = 'CA AM' WHERE draw_id = 125; -- CALIFORNIA AM
UPDATE draws SET display_color = '#00A9BB', abbreviation = 'CA PM' WHERE draw_id = 132; -- CALIFORNIA PM

-- =====================================================
-- CHICAGO - Color turquesa
-- =====================================================
UPDATE draws SET display_color = '#02A4CD', abbreviation = 'IL AM' WHERE draw_id = 133; -- CHICAGO AM
UPDATE draws SET display_color = '#00BCEB', abbreviation = 'IL PM' WHERE draw_id = 155; -- CHICAGO PM

-- =====================================================
-- INDIANA - Colores naranja/azul
-- =====================================================
UPDATE draws SET display_color = '#F96437', abbreviation = 'IN AM' WHERE draw_id = 135; -- INDIANA MIDDAY
UPDATE draws SET display_color = '#0D7BCB', abbreviation = 'IN PM' WHERE draw_id = 148; -- INDIANA EVENING

-- =====================================================
-- PENNSYLVANIA - Color verde agua
-- =====================================================
UPDATE draws SET display_color = '#71FCCD', abbreviation = 'PE AM' WHERE draw_id = 134; -- PENN MIDDAY
UPDATE draws SET display_color = '#82FBA1', abbreviation = 'PE PM' WHERE draw_id = 150; -- PENN EVENING

-- =====================================================
-- CONNECTICUT - Color blanco
-- =====================================================
UPDATE draws SET display_color = '#FFFFFF', abbreviation = 'CT AM' WHERE draw_id = 131; -- CONNECTICUT AM
UPDATE draws SET display_color = '#FFFFFF', abbreviation = 'CT PM' WHERE draw_id = 156; -- CONNECTICUT PM

-- =====================================================
-- DELAWARE - Color turquesa
-- =====================================================
UPDATE draws SET display_color = '#019DC4', abbreviation = 'DAM' WHERE draw_id = 129; -- DELAWARE AM
UPDATE draws SET display_color = '#00AED6', abbreviation = 'DPM' WHERE draw_id = 152; -- DELAWARE PM

-- =====================================================
-- VIRGINIA - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'VG AM' WHERE draw_id = 142; -- VIRGINIA AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'VG PM' WHERE draw_id = 151; -- VIRGINIA PM

-- =====================================================
-- MARYLAND - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'MM AM' WHERE draw_id = 144; -- MARYLAND MIDDAY
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'ME PM' WHERE draw_id = 157; -- MARYLAND EVENING

-- =====================================================
-- MASSACHUSETTS - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'MS AM' WHERE draw_id = 128; -- MASS AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'MS PM' WHERE draw_id = 136; -- MASS PM

-- =====================================================
-- SOUTH CAROLINA - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'SC AM' WHERE draw_id = 143; -- SOUTH CAROLINA AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'SC PM' WHERE draw_id = 158; -- SOUTH CAROLINA PM

-- =====================================================
-- NORTH CAROLINA - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'NC AM' WHERE draw_id = 153; -- NORTH CAROLINA AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'NC PM' WHERE draw_id = 166; -- NORTH CAROLINA PM

-- =====================================================
-- KING LOTTERY - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF2500', abbreviation = 'SMA' WHERE draw_id = 126; -- King Lottery AM
UPDATE draws SET display_color = '#CC1036', abbreviation = 'SMP' WHERE draw_id = 185; -- King Lottery PM

-- =====================================================
-- LA PRIMERA - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF1900', abbreviation = 'LP' WHERE draw_id = 161; -- LA PRIMERA

-- =====================================================
-- LA SUERTE DOMINICANA - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF0000', abbreviation = 'LS' WHERE draw_id = 162; -- LA SUERTE
UPDATE draws SET display_color = '#FF0900', abbreviation = 'LS6PM' WHERE draw_id = 137; -- LA SUERTE 6:00pm

-- =====================================================
-- LOTERIA NACIONAL - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF0000', abbreviation = 'GM' WHERE draw_id = 163; -- GANA MAS
UPDATE draws SET display_color = '#FF0900', abbreviation = 'LN' WHERE draw_id = 165; -- NACIONAL

-- =====================================================
-- LOTEDOM - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF0000', abbreviation = 'LTD' WHERE draw_id = 164; -- LOTEDOM

-- =====================================================
-- LOTEKA - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF0101', abbreviation = 'LK' WHERE draw_id = 127; -- LOTEKA

-- =====================================================
-- LOTERIA REAL - Color rojo
-- =====================================================
UPDATE draws SET display_color = '#FF0000', abbreviation = 'LR' WHERE draw_id = 167; -- REAL

-- =====================================================
-- QUINIELA PALE / LEIDSA - Color rojo oscuro
-- =====================================================
UPDATE draws SET display_color = '#D91B0E', abbreviation = 'QP' WHERE draw_id = 138; -- QUINIELA PALE
UPDATE draws SET display_color = '#D91B0E', abbreviation = 'LS' WHERE draw_id = 168; -- LEIDSA

-- =====================================================
-- SUPER PALE (RD) - Color turquesa
-- =====================================================
UPDATE draws SET display_color = '#00B6BC', abbreviation = 'SPR' WHERE draw_id = 175; -- SUPER PALE TARDE
UPDATE draws SET display_color = '#04B4E7', abbreviation = 'SPQN' WHERE draw_id = 176; -- SUPER PALE NOCHE

-- =====================================================
-- SUPER PALE (USA) - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'SPFN' WHERE draw_id = 177; -- SUPER PALE NY-FL AM
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'SFNP' WHERE draw_id = 178; -- SUPER PALE NY-FL PM

-- =====================================================
-- L.E. PUERTO RICO - Colores verde/rojo
-- =====================================================
UPDATE draws SET display_color = '#11C814', abbreviation = 'LE 2' WHERE draw_id = 173; -- L.E. PUERTO RICO 2PM
UPDATE draws SET display_color = '#B4133B', abbreviation = 'LE 10' WHERE draw_id = 174; -- L.E. PUERTO RICO 10PM

-- =====================================================
-- DIARIA HONDURAS - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'D11' WHERE draw_id = 179; -- DIARIA 11AM
UPDATE draws SET display_color = '#00B9CF', abbreviation = 'D3PM' WHERE draw_id = 180; -- DIARIA 3PM
UPDATE draws SET display_color = '#0290CC', abbreviation = 'D9PM' WHERE draw_id = 181; -- DIARIA 9PM

-- =====================================================
-- LA CHICA - Color celeste
-- =====================================================
UPDATE draws SET display_color = '#37B9F9', abbreviation = 'CHA' WHERE draw_id = 184; -- LA CHICA

-- =====================================================
-- PANAMA LNB - Color blanco
-- =====================================================
UPDATE draws SET display_color = '#FFFEFE', abbreviation = 'PLNB' WHERE draw_id = 182; -- PANAMA MIERCOLES
UPDATE draws SET display_color = '#FFFFFF', abbreviation = 'DLNB' WHERE draw_id = 183; -- PANAMA DOMINGO

-- Actualizar timestamp de todos los registros modificados
UPDATE draws SET updated_at = GETUTCDATE() WHERE draw_id IN (
    159, 160, 146, 154,  -- Anguila
    139, 140, 141, 145,  -- Texas
    121, 122, 147,       -- Georgia
    123, 124, 169, 170,  -- New York
    119, 120, 171, 172, 186, 187,  -- Florida
    130, 149,            -- New Jersey
    125, 132,            -- California
    133, 155,            -- Chicago
    135, 148,            -- Indiana
    134, 150,            -- Pennsylvania
    131, 156,            -- Connecticut
    129, 152,            -- Delaware
    142, 151,            -- Virginia
    144, 157,            -- Maryland
    128, 136,            -- Massachusetts
    143, 158,            -- South Carolina
    153, 166,            -- North Carolina
    126, 185,            -- King Lottery
    161,                 -- La Primera
    162, 137,            -- La Suerte
    163, 165,            -- Lotería Nacional
    164,                 -- Lotedom
    127,                 -- Loteka
    167,                 -- Lotería Real
    138, 168,            -- Quiniela Pale / Leidsa
    175, 176,            -- Super Pale (RD)
    177, 178,            -- Super Pale (USA)
    173, 174,            -- Puerto Rico
    179, 180, 181,       -- Diaria Honduras
    184,                 -- La Chica
    182, 183             -- Panama
);

PRINT 'Colores y abreviaciones de sorteos actualizados exitosamente';
