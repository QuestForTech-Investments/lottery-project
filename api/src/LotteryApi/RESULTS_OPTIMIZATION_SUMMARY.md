# Results Module Backend Optimization

## Overview
Optimized the Results module backend to reduce database round trips, eliminate in-memory filtering, and improve query performance with Azure SQL Database.

**Date:** 2025-12-13
**File:** `/home/jorge/projects/lottery-project/api/src/LotteryApi/Controllers/ResultsController.cs`

---

## Problems Identified

### 1. GetDrawsForResults Endpoint (Lines 364-419)
**Original Issues:**
- ❌ Loaded ALL active draws with `Include(d => d.WeeklySchedules)` into memory
- ❌ Filtered by day of week in C# (LINQ in-memory)
- ❌ Filtered by time in C# (LINQ in-memory)
- ❌ Caused N+1 query problem with WeeklySchedules
- ❌ Azure SQL latency (~100-150ms) multiplied by number of draws

**Example of Original Inefficiency:**
```csharp
// BAD: Load everything, filter in memory
var allDraws = await _context.Draws
    .Include(d => d.WeeklySchedules)  // ← Loads ALL schedules
    .Where(d => d.IsActive == true)
    .ToListAsync();  // ← Materializes to memory

// Then filter in C#
var scheduledDraws = allDraws
    .Where(d => d.UseWeeklySchedule != true ||
                d.WeeklySchedules.Any(...))  // ← C# filtering
    .ToList();
```

### 2. GetResults Endpoint (Lines 36-57)
**Original Issues:**
- ❌ Used `Include(r => r.Draw)` causing eager loading of full Draw entities
- ❌ No projection before `ToListAsync()` - loaded unnecessary columns

---

## Optimizations Applied

### 1. GetDrawsForResults - SQL-Side Filtering ✅

**Before:**
```csharp
// Load all draws + schedules to memory, then filter
var allDraws = await _context.Draws
    .Include(d => d.WeeklySchedules)
    .Where(d => d.IsActive == true)
    .ToListAsync();

var scheduledDraws = allDraws
    .Where(d => d.UseWeeklySchedule != true ||
                d.WeeklySchedules.Any(s => s.DayOfWeek == dayOfWeekByte && s.IsActive))
    .ToList();

var filteredDraws = scheduledDraws
    .Where(d => !isToday || d.DrawTime <= currentTime)
    .Select(...)
    .ToList();
```

**After (Optimized):**
```csharp
// Filter in SQL using WHERE clauses
var drawsQuery = _context.Draws
    .Where(d => d.IsActive == true)
    .Where(d => d.UseWeeklySchedule != true ||
                d.WeeklySchedules.Any(s => s.DayOfWeek == dayOfWeekByte && s.IsActive));

// Filter by time in SQL (for "today" queries)
if (isToday)
{
    drawsQuery = drawsQuery.Where(d => d.DrawTime <= currentTime);
}

// Project only needed fields BEFORE materializing
var filteredDraws = await drawsQuery
    .OrderBy(d => d.DrawTime)
    .ThenBy(d => d.DrawName)
    .Select(d => new { d.DrawId, d.DrawName, d.Abbreviation, ... })
    .ToListAsync();  // ← Only executes ONE optimized SQL query
```

**SQL Generated (After Optimization):**
```sql
SELECT d.draw_id, d.draw_name, d.abbreviation, d.draw_time, d.display_color
FROM draws d
WHERE d.is_active = 1
  AND (d.use_weekly_schedule = 0 OR
       EXISTS (SELECT 1 FROM draw_weekly_schedules s
               WHERE s.draw_id = d.draw_id
                 AND s.day_of_week = @dayOfWeek
                 AND s.is_active = 1))
  AND d.draw_time <= @currentTime  -- Only for "today" queries
ORDER BY d.draw_time, d.draw_name;
```

**Performance Impact:**
- ✅ **1 SQL query** instead of N+1 queries
- ✅ Filtering happens in SQL Server (leverages indexes)
- ✅ Only required columns transmitted over network
- ✅ No in-memory LINQ operations

---

### 2. GetResults - Projection Optimization ✅

**Before:**
```csharp
var results = await query
    .Include(r => r.Draw)  // ← Loads full Draw entity
    .OrderBy(r => r.Draw!.DrawName)
    .Select(r => MapToDto(r))  // ← MapToDto accesses r.Draw navigation property
    .ToListAsync();
```

**After (Optimized):**
```csharp
var query = _context.Results
    .Where(r => r.ResultDate.Date == targetDate.Date)
    .Join(_context.Draws,
        r => r.DrawId,
        d => d.DrawId,
        (r, d) => new { Result = r, Draw = d })
    .Where(joined => joined.Draw.IsActive);

var results = await query
    .OrderBy(joined => joined.Draw.DrawName)
    .Select(joined => MapToDtoFromProjection(joined.Result, joined.Draw))
    .ToListAsync();  // ← Only loads needed data
```

**Benefits:**
- ✅ Explicit JOIN instead of Include (better query plan)
- ✅ Only draws with `IsActive = true` are fetched
- ✅ No navigation property lazy loading

---

### 3. Database Indexes Added ✅

**New indexes for optimal query performance:**

```sql
-- Draw filtering by active status and time
CREATE NONCLUSTERED INDEX IX_draws_IsActive_DrawTime_DrawName
ON draws (is_active, draw_time, draw_name)
INCLUDE (draw_id, abbreviation, display_color);

-- Draw filtering by weekly schedule usage
CREATE NONCLUSTERED INDEX IX_draws_IsActive_UseWeeklySchedule
ON draws (is_active, use_weekly_schedule)
INCLUDE (draw_id, draw_time, draw_name, abbreviation, display_color);

-- DrawWeeklySchedule filtering by day of week
CREATE NONCLUSTERED INDEX IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive
ON draw_weekly_schedules (draw_id, day_of_week, is_active);

-- Results filtering by date
CREATE NONCLUSTERED INDEX IX_results_ResultDate_DrawId
ON results (result_date, draw_id)
INCLUDE (result_id, winning_number, additional_number, position, created_at, ...);

-- Results filtering by draw
CREATE NONCLUSTERED INDEX IX_results_DrawId
ON results (draw_id)
INCLUDE (result_id, result_date, winning_number, ...);
```

**Index Benefits:**
- ✅ Covering indexes with INCLUDE columns (no lookups needed)
- ✅ Supports WHERE, JOIN, and ORDER BY clauses
- ✅ Optimized for common query patterns

---

## Performance Improvements

### Expected Results (Estimated)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **GetDrawsForResults** | | | |
| SQL Queries | N+1 (1 + number of draws) | 1 | 95%+ reduction |
| Database Latency | ~100-150ms × N queries | ~100-150ms × 1 | 90%+ faster |
| Memory Usage | Load all Draw + WeeklySchedule entities | Only projected fields | 70%+ reduction |
| Network I/O | Full entities transmitted | Only 5 fields per draw | 80%+ reduction |
| **GetResults** | | | |
| Include Overhead | Full Draw entities loaded | Explicit JOIN with projection | 50%+ faster |
| Query Plan | Less optimal (Include) | Optimized JOIN | Better execution |

### Real-World Scenarios

**Scenario 1: GetDrawsForResults for "today"**
- Typical: ~65 active draws, ~10 with weekly schedules
- **Before:** 1 query for Draws + 10 queries for WeeklySchedules = 11 queries (~1.1-1.5s)
- **After:** 1 query with EXISTS subquery (~100-150ms)
- **Improvement:** ~85-90% faster

**Scenario 2: GetResults for a specific date**
- Typical: ~60-70 results for one date
- **Before:** Load 70 Result entities + 70 Draw entities via Include (~200-300ms)
- **After:** Single JOIN query with projection (~100-150ms)
- **Improvement:** ~50% faster

---

## Code Changes Summary

### Files Modified

1. **ResultsController.cs**
   - `GetResults()` - Added explicit JOIN and projection
   - `GetDrawsForResults()` - Moved filtering to SQL queries
   - `MapToDtoFromProjection()` - New helper method for projection mapping

2. **LotteryDbContext.cs**
   - Added 5 new indexes in `ConfigureIndexes()` method

3. **New Files Created**
   - `Data/add-results-indexes.sql` - SQL migration script for indexes

---

## Testing Recommendations

### 1. Verify Functionality
```bash
# Test GetDrawsForResults
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/results/draws"

curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/results/draws?date=2025-12-10"

# Test GetResults
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/results?date=2025-12-13"
```

### 2. Check SQL Query Plans
```sql
-- Enable query statistics
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Monitor actual queries executed
SELECT * FROM sys.dm_exec_query_stats;
```

### 3. Performance Testing
- Use Application Insights or similar to measure response times
- Compare before/after latency metrics
- Monitor Azure SQL DTU/resource usage

---

## Migration Instructions

### 1. Apply Code Changes
```bash
cd /home/jorge/projects/lottery-project/api/src/LotteryApi
dotnet build
```

### 2. Apply Database Indexes
```bash
# Option 1: Via SqlRunner
cd /home/jorge/projects/lottery-project/api/SqlRunner
# Update Program.cs to use add-results-indexes.sql
dotnet run

# Option 2: Via Azure Portal Query Editor
# Copy contents of Data/add-results-indexes.sql and execute

# Option 3: Via sqlcmd
sqlcmd -S lottery-sql-1505.database.windows.net -d lottery-db \
  -U lotteryAdmin -P 'NewLottery2025' \
  -i /home/jorge/projects/lottery-project/api/src/LotteryApi/Data/add-results-indexes.sql
```

### 3. Verify Indexes
```sql
-- Check if indexes were created
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

### 4. Test Application
```bash
# Start API
cd /home/jorge/projects/lottery-project/api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run --urls "http://0.0.0.0:5000"

# Test endpoints (in another terminal)
# ... run curl commands from Testing section
```

---

## Maintenance Notes

### Index Maintenance
- Azure SQL auto-updates statistics
- For heavy write loads, consider scheduled index rebuilds:
  ```sql
  ALTER INDEX IX_results_ResultDate_DrawId ON results REBUILD;
  ```

### Monitoring
- Watch for:
  - Missing index suggestions in Azure Portal
  - Query execution plans showing table scans
  - Increased CPU/DTU usage

### Future Optimizations
1. Consider caching for `GetDrawsForResults` (draws don't change often)
2. Add Redis cache for frequently-accessed results
3. Implement pagination for large result sets
4. Add database query logging for slow queries

---

## Rollback Plan

If issues occur:

1. **Remove indexes:**
   ```sql
   DROP INDEX IX_draws_IsActive_DrawTime_DrawName ON draws;
   DROP INDEX IX_draws_IsActive_UseWeeklySchedule ON draws;
   DROP INDEX IX_draw_weekly_schedules_DrawId_DayOfWeek_IsActive ON draw_weekly_schedules;
   DROP INDEX IX_results_ResultDate_DrawId ON results;
   DROP INDEX IX_results_DrawId ON results;
   ```

2. **Revert code changes:**
   ```bash
   git checkout HEAD -- Controllers/ResultsController.cs Data/LotteryDbContext.cs
   ```

---

## References

- Azure SQL Performance Best Practices: https://docs.microsoft.com/azure/azure-sql/performance-best-practices
- EF Core Query Performance: https://docs.microsoft.com/ef/core/performance/
- SQL Server Index Design Guide: https://docs.microsoft.com/sql/relational-databases/sql-server-index-design-guide

---

**Author:** Claude Code
**Last Updated:** 2025-12-13
