# Apply Results Optimization Indexes

## Quick Guide

### Option 1: Azure Portal Query Editor (Recommended for Testing)

1. Open Azure Portal: https://portal.azure.com
2. Navigate to: **lottery-sql-1505** > **lottery-db** database
3. Click **Query editor** in left menu
4. Login with:
   - Username: `lotteryAdmin`
   - Password: `NewLottery2025`
5. Copy and paste the contents of `add-results-indexes.sql`
6. Click **Run**
7. Verify output shows "Created index" messages

### Option 2: Using sqlcmd (Command Line)

```bash
# Install sqlcmd if not already installed (Ubuntu/WSL)
sudo apt-get update
sudo apt-get install -y mssql-tools unixodbc-dev

# Run the script
sqlcmd -S lottery-sql-1505.database.windows.net -d lottery-db \
  -U lotteryAdmin -P 'NewLottery2025' \
  -i /home/jorge/projects/lottery-project/api/src/LotteryApi/Data/add-results-indexes.sql
```

### Option 3: Via SqlRunner Project

```bash
cd /home/jorge/projects/lottery-project/api/SqlRunner

# Edit Program.cs to point to add-results-indexes.sql
# Then run:
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run
```

## Verification

After applying, verify indexes were created:

```sql
SELECT
    i.name AS IndexName,
    t.name AS TableName,
    i.type_desc AS IndexType,
    STATS_DATE(i.object_id, i.index_id) AS LastUpdated
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('draws', 'draw_weekly_schedules', 'results')
    AND i.name LIKE 'IX_%'
ORDER BY t.name, i.name;
```

Expected output should show:
- `IX_draws_IsActive_DrawTime_DrawName`
- `IX_draws_IsActive_UseWeeklySchedule`
- `IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive`
- `IX_results_ResultDate_DrawId`
- `IX_results_DrawId`

## Impact

These indexes are **safe to apply** and will:
- ✅ Improve query performance for Results module
- ✅ Not break existing functionality
- ✅ Use minimal disk space (<10MB estimated)
- ✅ Auto-maintained by Azure SQL

## Rollback (if needed)

If any issues occur, remove indexes with:

```sql
DROP INDEX IF EXISTS IX_draws_IsActive_DrawTime_DrawName ON dbo.draws;
DROP INDEX IF EXISTS IX_draws_IsActive_UseWeeklySchedule ON dbo.draws;
DROP INDEX IF EXISTS IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive ON dbo.draw_weekly_schedules;
DROP INDEX IF EXISTS IX_results_ResultDate_DrawId ON dbo.results;
DROP INDEX IF EXISTS IX_results_DrawId ON dbo.results;
```
