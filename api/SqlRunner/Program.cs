using Microsoft.Data.SqlClient;

var connectionString = "Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

// Get SQL script path from command line arguments or use default
var scriptPath = args.Length > 0 ? args[0] : "../fix-footer-table.sql";

Console.WriteLine("========================================");
Console.WriteLine("  SQL Script Runner");
Console.WriteLine("========================================");
Console.WriteLine($"Script: {scriptPath}");
Console.WriteLine();

if (!File.Exists(scriptPath))
{
    Console.WriteLine($"❌ ERROR: Script file not found: {scriptPath}");
    Environment.Exit(1);
}

var sqlScript = File.ReadAllText(scriptPath);

try
{
    Console.WriteLine("Connecting to Azure SQL...");
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    Console.WriteLine("✓ Connected successfully!");
    Console.WriteLine("Executing script...");
    Console.WriteLine();

    connection.InfoMessage += (sender, e) => Console.WriteLine($"  {e.Message}");

    // Start explicit transaction
    using var transaction = connection.BeginTransaction();

    try
    {
        // Split by GO statements and execute each batch
        var batches = sqlScript.Split(new[] { "\nGO\n", "\nGO\r\n", "\r\nGO\r\n", "\r\nGO\n" }, StringSplitOptions.RemoveEmptyEntries);

        int batchNumber = 0;
        foreach (var batch in batches)
        {
            var trimmedBatch = batch.Trim();
            if (string.IsNullOrWhiteSpace(trimmedBatch)) continue;

            batchNumber++;
            Console.WriteLine($"Executing batch {batchNumber}...");

            using var command = new SqlCommand(trimmedBatch, connection, transaction);
            command.CommandTimeout = 120;
            await command.ExecuteNonQueryAsync();
        }

        // COMMIT the transaction
        await transaction.CommitAsync();
        Console.WriteLine("✓ Transaction COMMITTED");
    }
    catch
    {
        await transaction.RollbackAsync();
        Console.WriteLine("✗ Transaction ROLLED BACK");
        throw;
    }

    Console.WriteLine();
    Console.WriteLine("========================================");
    Console.WriteLine("  ✅ SUCCESS!");
    Console.WriteLine("========================================");
    Console.WriteLine();
    Console.WriteLine($"Script executed successfully: {scriptPath}");
    Console.WriteLine();
}
catch (Exception ex)
{
    Console.WriteLine();
    Console.WriteLine("========================================");
    Console.WriteLine("  ❌ ERROR!");
    Console.WriteLine("========================================");
    Console.WriteLine();
    Console.WriteLine($"Error: {ex.Message}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner: {ex.InnerException.Message}");
    }
    Console.WriteLine();
    Console.WriteLine(ex.StackTrace);
    Environment.Exit(1);
}
