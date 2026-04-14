using LotteryApi.Helpers;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Services.AutoExpenses;

public class AutoExpenseSettings
{
    public const string SectionName = "AutoExpenses";
    public bool Enabled { get; set; } = true;
    public string ProcessTimeLocal { get; set; } = "00:00";
    public string TimezoneId { get; set; } = "America/Santo_Domingo";
}

public class AutoExpenseWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AutoExpenseWorker> _logger;
    private readonly AutoExpenseSettings _settings;

    public AutoExpenseWorker(
        IServiceProvider serviceProvider,
        ILogger<AutoExpenseWorker> logger,
        Microsoft.Extensions.Options.IOptions<AutoExpenseSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoExpenseWorker started. Process time: {Time} ({Tz})",
            _settings.ProcessTimeLocal, _settings.TimezoneId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var delay = GetDelayUntilNextRun();
                _logger.LogInformation("Next auto expense processing in {Minutes:F1} minutes", delay.TotalMinutes);

                await Task.Delay(delay, stoppingToken);
                if (stoppingToken.IsCancellationRequested) break;

                await ProcessAutoExpensesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AutoExpenseWorker");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("AutoExpenseWorker stopped");
    }

    private TimeSpan GetDelayUntilNextRun()
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(_settings.TimezoneId);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

        var timeParts = _settings.ProcessTimeLocal.Split(':');
        var hour = int.Parse(timeParts[0]);
        var minute = int.Parse(timeParts[1]);

        var todayRun = new DateTime(nowLocal.Year, nowLocal.Month, nowLocal.Day,
            hour, minute, 0, DateTimeKind.Unspecified);

        if (nowLocal >= todayRun)
            todayRun = todayRun.AddDays(1);

        var runUtc = TimeZoneInfo.ConvertTimeToUtc(todayRun, tz);
        return runUtc - DateTime.UtcNow;
    }

    private async Task ProcessAutoExpensesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var todayDate = DateOnly.FromDateTime(today);
        var dayOfWeek = (int)today.DayOfWeek; // C#: 0=Sun, 1=Mon...6=Sat
        // Convert to frontend format: Mon=0, Tue=1, ..., Sun=6
        var frontendDow = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        var lastDayOfMonth = DateTime.DaysInMonth(today.Year, today.Month);

        var activeExpenses = await context.BettingPoolAutomaticExpenses
            .Where(e => e.IsActive && e.Amount > 0)
            .ToListAsync(stoppingToken);

        var processedCount = 0;

        foreach (var expense in activeExpenses)
        {
            if (stoppingToken.IsCancellationRequested) break;

            if (!ShouldProcessToday(expense, today, frontendDow, lastDayOfMonth)) continue;

            // Check if already processed today
            var alreadyProcessed = await context.AutoExpenseHistories
                .AnyAsync(h => h.ExpenseId == expense.ExpenseId
                    && h.ChargeDate == today.Date, stoppingToken);

            if (alreadyProcessed) continue;

            var amount = expense.Amount ?? 0;
            if (amount <= 0) continue;

            using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
            try
            {
                // Deduct from balance
                var balance = await context.Balances
                    .FirstOrDefaultAsync(b => b.BettingPoolId == expense.BettingPoolId, stoppingToken);

                if (balance != null)
                {
                    balance.CurrentBalance -= amount;
                    balance.LastUpdated = DateTime.UtcNow;
                }

                // Record history
                context.AutoExpenseHistories.Add(new AutoExpenseHistory
                {
                    ExpenseId = expense.ExpenseId,
                    BettingPoolId = expense.BettingPoolId,
                    ChargeDate = today.Date,
                    Amount = amount,
                    CreatedAt = DateTime.UtcNow
                });

                await context.SaveChangesAsync(stoppingToken);
                await transaction.CommitAsync(stoppingToken);

                processedCount++;
                _logger.LogInformation(
                    "Auto expense charged: Pool={PoolId}, Expense='{Type}', Amount={Amount}, Freq={Freq}",
                    expense.BettingPoolId, expense.ExpenseType, amount, expense.Frequency);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(stoppingToken);
                _logger.LogError(ex, "Error processing auto expense {ExpenseId} for pool {PoolId}",
                    expense.ExpenseId, expense.BettingPoolId);
            }
        }

        _logger.LogInformation("Auto expense processing complete: {Count} charges for {Date}",
            processedCount, today.ToString("yyyy-MM-dd"));
    }

    private static bool ShouldProcessToday(BettingPoolAutomaticExpense expense, DateTime today, int frontendDow, int lastDayOfMonth)
    {
        return expense.Frequency switch
        {
            "semanal" => expense.DayOfWeek.HasValue && expense.DayOfWeek.Value == frontendDow,
            "quincenal" => today.Day == 15 || today.Day == lastDayOfMonth,
            "mensual" => expense.DayOfMonth.HasValue &&
                (today.Day == expense.DayOfMonth.Value
                || (today.Day == lastDayOfMonth && expense.DayOfMonth.Value > lastDayOfMonth)),
            _ => false
        };
    }
}
