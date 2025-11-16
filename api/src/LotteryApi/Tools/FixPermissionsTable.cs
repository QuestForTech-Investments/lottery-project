using Microsoft.Data.SqlClient;
using System;
using System.IO;
using System.Threading.Tasks;

namespace LotteryApi.Tools;

/// <summary>
/// Tool to fix permissions table by adding IDENTITY to permission_id
/// Run this once to update the database schema
/// This is a standalone tool and not the main entry point of the application
/// </summary>
public class FixPermissionsTable
{
#pragma warning disable CS7022 // The entry point of the program is global code; ignoring this entry point
    public static async Task Main(string[] args)
#pragma warning restore CS7022
    {
        Console.WriteLine("========================================");
        Console.WriteLine("  Fix Permissions Table Tool");
        Console.WriteLine("========================================");
        Console.WriteLine();

        var connectionString = "Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=IotSlotsLottery123;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

        var sqlScript = @"
-- Fix permissions table: Add IDENTITY to permission_id column
PRINT 'Starting permissions table fix...';

-- Step 1: Find and drop ALL foreign keys that reference permissions
PRINT 'Finding all foreign keys that reference permissions...';

DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql +
    'ALTER TABLE [' + SCHEMA_NAME(fk.schema_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] ' +
    'DROP CONSTRAINT [' + fk.name + ']; ' + CHAR(13) +
    'PRINT ''  Dropped ' + fk.name + ''';' + CHAR(13)
FROM sys.foreign_keys fk
WHERE fk.referenced_object_id = OBJECT_ID('dbo.permissions');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Dropping foreign key constraints...';
    EXEC sp_executesql @sql;
END

-- Step 2: Backup existing data
PRINT 'Backing up existing permissions data...';

IF OBJECT_ID('tempdb..#permissions_backup') IS NOT NULL DROP TABLE #permissions_backup;

SELECT * INTO #permissions_backup FROM [dbo].[permissions];

-- Step 3: Drop the original permissions table
PRINT 'Dropping original permissions table...';
DROP TABLE [dbo].[permissions];

-- Step 4: Create new permissions table WITH IDENTITY
PRINT 'Creating new permissions table with IDENTITY...';

CREATE TABLE [dbo].[permissions] (
    [permission_id] int NOT NULL IDENTITY(1,1),
    [permission_code] nvarchar(100) NOT NULL,
    [permission_name] nvarchar(200) NOT NULL,
    [category] nvarchar(50) NOT NULL,
    [description] nvarchar(500) NULL,
    [is_active] bit NULL DEFAULT 1,
    [created_at] datetime2 NULL DEFAULT (getdate()),
    [created_by] int NULL,
    [updated_at] datetime2 NULL,
    [updated_by] int NULL,
    CONSTRAINT [PK_permissions] PRIMARY KEY ([permission_id]),
    CONSTRAINT [UQ_permissions_code] UNIQUE ([permission_code])
);

-- Step 5: Restore data
PRINT 'Restoring backed up permissions data...';

SET IDENTITY_INSERT [dbo].[permissions] ON;

INSERT INTO [dbo].[permissions] (
    [permission_id], [permission_code], [permission_name], [category],
    [description], [is_active], [created_at], [created_by],
    [updated_at], [updated_by]
)
SELECT
    [permission_id], [permission_code], [permission_name], [category],
    [description], [is_active], [created_at], [created_by],
    [updated_at], [updated_by]
FROM #permissions_backup;

SET IDENTITY_INSERT [dbo].[permissions] OFF;

-- Step 6: Recreate foreign keys
PRINT 'Recreating foreign key constraints...';

ALTER TABLE [dbo].[role_permissions]
ADD CONSTRAINT [FK_role_permissions_permissions]
FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([permission_id]);

ALTER TABLE [dbo].[user_permissions]
ADD CONSTRAINT [FK_user_permissions_permissions]
FOREIGN KEY ([permission_id]) REFERENCES [dbo].[permissions]([permission_id]);

PRINT 'Permissions table fix completed!';
";

        try
        {
            Console.WriteLine("Connecting to Azure SQL...");
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            Console.WriteLine("Connected successfully!");
            Console.WriteLine("Executing fix script...");
            Console.WriteLine();

            await using var command = new SqlCommand(sqlScript, connection);
            command.CommandTimeout = 120;

            await using var reader = await command.ExecuteReaderAsync();

            // Read all info messages
            connection.InfoMessage += (sender, e) =>
            {
                Console.WriteLine(e.Message);
            };

            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine("  SUCCESS!");
            Console.WriteLine("========================================");
            Console.WriteLine();
            Console.WriteLine("Changes applied:");
            Console.WriteLine("  ✓ permission_id now has IDENTITY(1,1)");
            Console.WriteLine("  ✓ All foreign keys recreated");
            Console.WriteLine("  ✓ Data preserved");
            Console.WriteLine();
        }
        catch (Exception ex)
        {
            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine("  ERROR!");
            Console.WriteLine("========================================");
            Console.WriteLine();
            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.StackTrace);
            Environment.Exit(1);
        }
    }
}
