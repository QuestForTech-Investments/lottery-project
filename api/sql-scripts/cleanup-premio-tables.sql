USE [lottery-db];

-- Drop premio tables in correct order (child tables first)
IF OBJECT_ID('configuracion_sorteo_banca', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping configuracion_sorteo_banca...';
    DROP TABLE configuracion_sorteo_banca;
END

IF OBJECT_ID('banca_sorteos', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping banca_sorteos...';
    DROP TABLE banca_sorteos;
END

IF OBJECT_ID('configuracion_general_banca', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping configuracion_general_banca...';
    DROP TABLE configuracion_general_banca;
END

IF OBJECT_ID('auditoria_cambios_premios', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping auditoria_cambios_premios...';
    DROP TABLE auditoria_cambios_premios;
END

IF OBJECT_ID('campos_premio', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping campos_premio...';
    DROP TABLE campos_premio;
END

IF OBJECT_ID('tipos_apuesta', 'U') IS NOT NULL
BEGIN
    PRINT 'Dropping tipos_apuesta...';
    DROP TABLE tipos_apuesta;
END

PRINT 'All premio tables dropped successfully';
