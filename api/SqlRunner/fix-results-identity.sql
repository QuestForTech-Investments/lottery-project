-- Fix results table to add IDENTITY to result_id column
-- This allows auto-increment for external results fetching

-- Step 1: Find and drop foreign keys referencing results table
DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(fk.parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(fk.parent_object_id))
    + ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';' + CHAR(13)
FROM sys.foreign_keys fk
WHERE OBJECT_NAME(fk.referenced_object_id) = 'results';

IF @sql <> ''
BEGIN
    PRINT 'Dropping foreign key constraints...'
    PRINT @sql
    EXEC sp_executesql @sql;
END

-- Step 2: Create new table with IDENTITY
PRINT 'Creating new results table with IDENTITY...'

CREATE TABLE results_new (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    draw_id INT NOT NULL,
    winning_number NVARCHAR(20) NOT NULL,
    additional_number NVARCHAR(10) NULL,
    position INT NULL,
    result_date DATETIME NOT NULL,
    user_id INT NULL,
    created_at DATETIME NULL,
    created_by INT NULL,
    updated_at DATETIME NULL,
    updated_by INT NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL
);

-- Step 3: Copy existing data
PRINT 'Copying existing data...'

SET IDENTITY_INSERT results_new ON;

INSERT INTO results_new (result_id, draw_id, winning_number, additional_number, position, result_date, user_id, created_at, created_by, updated_at, updated_by, approved_by, approved_at)
SELECT result_id, draw_id, winning_number, additional_number, position, result_date, user_id, created_at, created_by, updated_at, updated_by, approved_by, approved_at
FROM results;

SET IDENTITY_INSERT results_new OFF;

-- Step 4: Drop old table and rename new one
PRINT 'Dropping old table and renaming new one...'

DROP TABLE results;
EXEC sp_rename 'results_new', 'results';

-- Step 5: Add back foreign key from draws
PRINT 'Re-adding foreign key constraints...'

ALTER TABLE results
ADD CONSTRAINT FK_results_draws FOREIGN KEY (draw_id) REFERENCES draws(draw_id);

-- Step 6: Recreate foreign key from prizes to results (if exists)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'prizes')
BEGIN
    IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'prizes' AND COLUMN_NAME = 'result_id')
    BEGIN
        ALTER TABLE prizes
        ADD CONSTRAINT FK_prizes_results FOREIGN KEY (result_id) REFERENCES results(result_id);
    END
END

-- Step 7: Reseed identity to continue from max ID
DECLARE @maxId INT = (SELECT ISNULL(MAX(result_id), 0) FROM results);
DBCC CHECKIDENT ('results', RESEED, @maxId);

PRINT 'Results table fixed with IDENTITY on result_id';
PRINT 'New identity seed: ' + CAST(@maxId AS VARCHAR(20));
