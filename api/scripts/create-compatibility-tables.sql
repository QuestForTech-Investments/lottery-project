-- ===================================================================
-- Create Missing Compatibility Tables
-- Purpose: Add lottery_game_compatibility and lottery_bet_type_compatibility tables
-- Date: 2025-11-14
-- ===================================================================

USE [lottery-db];
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '=== Creating Missing Compatibility Tables ===';
PRINT '';

-- ===================================================================
-- 1. CREATE lottery_game_compatibility TABLE
-- ===================================================================
PRINT '1. Creating lottery_game_compatibility table...';

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[lottery_game_compatibility]') AND type in (N'U'))
BEGIN
    CREATE TABLE [lottery_game_compatibility] (
        [compatibility_id] int IDENTITY(1,1) NOT NULL,
        [lottery_id] int NOT NULL,
        [game_type_id] int NOT NULL,
        [is_active] bit NOT NULL DEFAULT ((1)),
        [created_at] datetime2 NOT NULL DEFAULT (getdate()),
        [created_by] int NULL,
        [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
        [updated_by] int NULL,
        CONSTRAINT [PK_lottery_game_compatibility] PRIMARY KEY CLUSTERED ([compatibility_id])
    );

    -- Add foreign keys
    ALTER TABLE [lottery_game_compatibility]
    ADD CONSTRAINT [FK_lottery_game_compatibility_lottery]
    FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);

    ALTER TABLE [lottery_game_compatibility]
    ADD CONSTRAINT [FK_lottery_game_compatibility_game_type]
    FOREIGN KEY ([game_type_id]) REFERENCES [game_types] ([game_type_id]);

    -- Add unique constraint (one lottery can have a game type only once)
    CREATE UNIQUE NONCLUSTERED INDEX [UX_lottery_game_compatibility_lottery_game]
    ON [lottery_game_compatibility] ([lottery_id], [game_type_id]);

    PRINT '  ✓ Created lottery_game_compatibility table';
END
ELSE
    PRINT '  - lottery_game_compatibility already exists';

PRINT '';

-- ===================================================================
-- 2. CREATE lottery_bet_type_compatibility TABLE
-- ===================================================================
PRINT '2. Creating lottery_bet_type_compatibility table...';

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[lottery_bet_type_compatibility]') AND type in (N'U'))
BEGIN
    CREATE TABLE [lottery_bet_type_compatibility] (
        [compatibility_id] int IDENTITY(1,1) NOT NULL,
        [lottery_id] int NOT NULL,
        [bet_type_id] int NOT NULL,
        [is_active] bit NOT NULL DEFAULT ((1)),
        [created_at] datetime2 NOT NULL DEFAULT (getdate()),
        [created_by] int NULL,
        [updated_at] datetime2 NOT NULL DEFAULT (getdate()),
        [updated_by] int NULL,
        CONSTRAINT [PK_lottery_bet_type_compatibility] PRIMARY KEY CLUSTERED ([compatibility_id])
    );

    -- Add foreign keys
    ALTER TABLE [lottery_bet_type_compatibility]
    ADD CONSTRAINT [FK_lottery_bet_type_compatibility_lottery]
    FOREIGN KEY ([lottery_id]) REFERENCES [lotteries] ([lottery_id]);

    ALTER TABLE [lottery_bet_type_compatibility]
    ADD CONSTRAINT [FK_lottery_bet_type_compatibility_bet_type]
    FOREIGN KEY ([bet_type_id]) REFERENCES [bet_types] ([bet_type_id]);

    -- Add unique constraint
    CREATE UNIQUE NONCLUSTERED INDEX [UX_lottery_bet_type_compatibility_lottery_bet]
    ON [lottery_bet_type_compatibility] ([lottery_id], [bet_type_id]);

    PRINT '  ✓ Created lottery_bet_type_compatibility table';
END
ELSE
    PRINT '  - lottery_bet_type_compatibility already exists';

PRINT '';

-- ===================================================================
-- 3. VERIFY TABLES
-- ===================================================================
PRINT '3. Verifying tables...';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[lottery_game_compatibility]') AND type in (N'U'))
    PRINT '  ✓ lottery_game_compatibility exists';
ELSE
    PRINT '  ❌ lottery_game_compatibility does NOT exist';

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[lottery_bet_type_compatibility]') AND type in (N'U'))
    PRINT '  ✓ lottery_bet_type_compatibility exists';
ELSE
    PRINT '  ❌ lottery_bet_type_compatibility does NOT exist';

PRINT '';
PRINT '=== Compatibility Tables Creation Complete ===';
GO
