# Result Logs Implementation Guide

## Overview

The `result_logs` table provides a complete audit trail for all lottery result operations, tracking:
- Result creation
- Result updates/modifications
- Result deletions
- Result approvals
- User actions and IP addresses

## Database Schema

### Table: `result_logs`

| Column | Type | Description |
|--------|------|-------------|
| `log_id` | INT IDENTITY(1,1) | Primary key |
| `result_id` | INT | FK to results table |
| `user_id` | INT | FK to users table (who performed action) |
| `action` | VARCHAR(20) | Action type: CREATED, UPDATED, DELETED, APPROVED, REJECTED |
| `created_at` | DATETIME | Timestamp of action |
| `ip_address` | VARCHAR(45) | IP address of user |
| `details` | NVARCHAR(MAX) | Additional JSON/text details |
| `old_winning_number` | VARCHAR(20) | Previous winning number (for updates) |
| `new_winning_number` | VARCHAR(20) | New winning number |
| `old_additional_number` | VARCHAR(10) | Previous additional number |
| `new_additional_number` | VARCHAR(10) | New additional number |
| `draw_id` | INT | Draw ID (cached for quick access) |
| `result_date` | DATETIME | Result date (cached for quick access) |

## Installation Steps

### 1. Create Database Table

```bash
cd /home/jorge/projects/lottery-project/database/scripts
# Run the SQL script via SqlRunner or direct connection
```

Or via SQL Server Management Studio:
```sql
-- Execute: create_result_logs_table.sql
```

### 2. Update DbContext

Edit `/home/jorge/projects/lottery-project/api/src/LotteryApi/Data/LotteryDbContext.cs`:

```csharp
// Add DbSet after Results (around line 29)
public DbSet<Result> Results { get; set; }
public DbSet<ResultLog> ResultLogs { get; set; }  // <-- ADD THIS

// Add indexes in ConfigureIndexes method (around line 152)
// ResultLog indexes
modelBuilder.Entity<ResultLog>()
    .HasIndex(rl => rl.ResultId);

modelBuilder.Entity<ResultLog>()
    .HasIndex(rl => rl.UserId);

modelBuilder.Entity<ResultLog>()
    .HasIndex(rl => rl.CreatedAt);

modelBuilder.Entity<ResultLog>()
    .HasIndex(rl => new { rl.UserId, rl.CreatedAt });

modelBuilder.Entity<ResultLog>()
    .HasIndex(rl => new { rl.ResultId, rl.CreatedAt });

// Add relationships in ConfigureRelationships method (around line 321)
// ResultLog -> Result
modelBuilder.Entity<ResultLog>()
    .HasOne(rl => rl.Result)
    .WithMany()
    .HasForeignKey(rl => rl.ResultId)
    .OnDelete(DeleteBehavior.Restrict);

// ResultLog -> User
modelBuilder.Entity<ResultLog>()
    .HasOne(rl => rl.User)
    .WithMany()
    .HasForeignKey(rl => rl.UserId)
    .OnDelete(DeleteBehavior.Restrict);
```

### 3. Register Service

Edit `Program.cs` or `Startup.cs`:

```csharp
// Add service registration
builder.Services.AddScoped<IResultLogService, ResultLogService>();
```

## Usage Examples

### In ResultsController

```csharp
using LotteryApi.Services;

public class ResultsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly IResultLogService _resultLogService;

    public ResultsController(
        LotteryDbContext context,
        IResultLogService resultLogService)
    {
        _context = context;
        _resultLogService = resultLogService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateResult([FromBody] CreateResultDto dto)
    {
        // Get user ID from JWT token
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Create the result
        var result = new Result
        {
            DrawId = dto.DrawId,
            WinningNumber = dto.WinningNumber,
            AdditionalNumber = dto.AdditionalNumber,
            ResultDate = dto.ResultDate,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Results.Add(result);
        await _context.SaveChangesAsync();

        // Log the creation
        await _resultLogService.LogResultCreatedAsync(
            resultId: result.ResultId,
            userId: userId,
            winningNumber: result.WinningNumber,
            additionalNumber: result.AdditionalNumber,
            ipAddress: ipAddress,
            drawId: result.DrawId,
            resultDate: result.ResultDate
        );

        return CreatedAtAction(nameof(GetResult), new { id = result.ResultId }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateResult(int id, [FromBody] UpdateResultDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _context.Results.FindAsync(id);
        if (result == null)
            return NotFound();

        // Store old values
        var oldWinningNumber = result.WinningNumber;
        var oldAdditionalNumber = result.AdditionalNumber;

        // Update result
        result.WinningNumber = dto.WinningNumber;
        result.AdditionalNumber = dto.AdditionalNumber;
        result.UpdatedBy = userId;
        result.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log the update
        await _resultLogService.LogResultUpdatedAsync(
            resultId: result.ResultId,
            userId: userId,
            oldWinningNumber: oldWinningNumber,
            newWinningNumber: result.WinningNumber,
            oldAdditionalNumber: oldAdditionalNumber,
            newAdditionalNumber: result.AdditionalNumber,
            ipAddress: ipAddress,
            details: dto.Reason // Optional reason for change
        );

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteResult(int id, [FromQuery] string? reason)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _context.Results.FindAsync(id);
        if (result == null)
            return NotFound();

        _context.Results.Remove(result);
        await _context.SaveChangesAsync();

        // Log the deletion
        await _resultLogService.LogResultDeletedAsync(
            resultId: id,
            userId: userId,
            ipAddress: ipAddress,
            reason: reason
        );

        return NoContent();
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveResult(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var result = await _context.Results.FindAsync(id);
        if (result == null)
            return NotFound();

        result.ApprovedBy = userId;
        result.ApprovedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Log the approval
        await _resultLogService.LogResultApprovedAsync(
            resultId: id,
            userId: userId,
            ipAddress: ipAddress
        );

        return Ok(result);
    }

    // Get audit history for a result
    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetResultHistory(int id)
    {
        var logs = await _resultLogService.GetLogsByResultIdAsync(id);
        return Ok(logs);
    }

    // Get user's result publication activity
    [HttpGet("user/{userId}/activity")]
    public async Task<IActionResult> GetUserActivity(
        int userId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var logs = await _resultLogService.GetLogsByUserIdAsync(userId, startDate, endDate);
        return Ok(logs);
    }

    // Get recent result changes
    [HttpGet("recent-changes")]
    public async Task<IActionResult> GetRecentChanges([FromQuery] int count = 50)
    {
        var logs = await _resultLogService.GetRecentLogsAsync(count);
        return Ok(logs);
    }
}
```

## Query Examples

### Get all logs for a specific result
```sql
SELECT
    rl.log_id,
    rl.action,
    rl.created_at,
    u.username,
    rl.old_winning_number,
    rl.new_winning_number,
    rl.ip_address
FROM result_logs rl
INNER JOIN users u ON rl.user_id = u.user_id
WHERE rl.result_id = 123
ORDER BY rl.created_at;
```

### Get user's activity in the last 7 days
```sql
SELECT
    rl.action,
    COUNT(*) as action_count,
    u.username
FROM result_logs rl
INNER JOIN users u ON rl.user_id = u.user_id
WHERE rl.created_at >= DATEADD(day, -7, GETDATE())
GROUP BY rl.action, u.username
ORDER BY action_count DESC;
```

### Detect suspicious activity (multiple changes from same IP)
```sql
SELECT
    rl.ip_address,
    COUNT(DISTINCT rl.user_id) as user_count,
    COUNT(*) as total_actions,
    MIN(rl.created_at) as first_action,
    MAX(rl.created_at) as last_action
FROM result_logs rl
WHERE rl.created_at >= DATEADD(day, -1, GETDATE())
GROUP BY rl.ip_address
HAVING COUNT(*) > 10
ORDER BY total_actions DESC;
```

### Find all modified results
```sql
SELECT
    rl.result_id,
    r.winning_number as current_number,
    rl.old_winning_number,
    rl.new_winning_number,
    u.username as modified_by,
    rl.created_at as modified_at,
    rl.details as reason
FROM result_logs rl
INNER JOIN results r ON rl.result_id = r.result_id
INNER JOIN users u ON rl.user_id = u.user_id
WHERE rl.action = 'UPDATED'
ORDER BY rl.created_at DESC;
```

## API Endpoints

Add these endpoints to your ResultsController:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results/{id}/history` | Get audit log for specific result |
| GET | `/api/results/user/{userId}/activity` | Get user's result activity |
| GET | `/api/results/recent-changes` | Get recent result changes |
| GET | `/api/results/audit-report` | Generate audit report |

## Security Considerations

1. **IP Address Logging**: Always capture IP address for accountability
2. **Read-Only Logs**: Never allow modification of log entries
3. **Retention Policy**: Consider archiving old logs after 1-2 years
4. **Access Control**: Restrict log viewing to authorized personnel only
5. **Sensitive Data**: Don't store passwords or sensitive user data in details field

## Monitoring & Alerts

Set up alerts for:
- Multiple result changes in short time period
- Results modified after approval
- Unusual activity from specific IP addresses
- Results created/modified outside business hours

## Testing

```bash
# Run API tests
cd /home/jorge/projects/lottery-project/api
dotnet test

# Query log table directly
sqlcmd -S lottery-sql-1505.database.windows.net -d lottery-db -U lotteryAdmin -P NewLottery2025
SELECT TOP 10 * FROM result_logs ORDER BY created_at DESC;
```

## Troubleshooting

### Logs not being created
1. Check if table exists: `SELECT * FROM sys.tables WHERE name = 'result_logs'`
2. Verify foreign keys: `result_id` and `user_id` must exist in their respective tables
3. Check service registration in `Program.cs`

### Performance issues
1. Verify indexes are created: `sp_helpindex 'result_logs'`
2. Archive old logs periodically
3. Use pagination for large log queries

## Migration from Existing System

If you already have results in the database, optionally create initial log entries:

```sql
-- Create initial CREATED logs for existing results
INSERT INTO result_logs (result_id, user_id, action, created_at, new_winning_number, new_additional_number, draw_id, result_date)
SELECT
    result_id,
    COALESCE(created_by, 1) as user_id, -- Default to admin if null
    'CREATED' as action,
    COALESCE(created_at, GETDATE()) as created_at,
    winning_number,
    additional_number,
    draw_id,
    result_date
FROM results
WHERE result_id NOT IN (SELECT DISTINCT result_id FROM result_logs);
```

## Related Files

- Model: `/home/jorge/projects/lottery-project/api/src/LotteryApi/Models/ResultLog.cs`
- DTOs: `/home/jorge/projects/lottery-project/api/src/LotteryApi/DTOs/ResultLogDto.cs`
- Service: `/home/jorge/projects/lottery-project/api/src/LotteryApi/Services/ResultLogService.cs`
- SQL Script: `/home/jorge/projects/lottery-project/database/scripts/create_result_logs_table.sql`
- DbContext Update: `/home/jorge/projects/lottery-project/api/src/LotteryApi/Data/DbContext_ResultLogs_Update.txt`
