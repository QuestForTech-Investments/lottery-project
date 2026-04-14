using LotteryApi.Helpers;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Services.Loans;

public class LoanPaymentSettings
{
    public const string SectionName = "LoanPayment";
    public bool Enabled { get; set; } = true;
    /// <summary>Time of day (business timezone) to process automatic payments. Default: 06:00 AM.</summary>
    public string ProcessTimeLocal { get; set; } = "06:00";
    public string TimezoneId { get; set; } = "America/Santo_Domingo";
}

public class LoanPaymentWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LoanPaymentWorker> _logger;
    private readonly LoanPaymentSettings _settings;

    public LoanPaymentWorker(
        IServiceProvider serviceProvider,
        ILogger<LoanPaymentWorker> logger,
        Microsoft.Extensions.Options.IOptions<LoanPaymentSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("LoanPaymentWorker started. Process time: {Time} ({Tz})",
            _settings.ProcessTimeLocal, _settings.TimezoneId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var delay = GetDelayUntilNextRun();
                _logger.LogInformation("Next loan payment processing in {Minutes:F1} minutes", delay.TotalMinutes);

                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await ProcessLoanPaymentsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LoanPaymentWorker");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("LoanPaymentWorker stopped");
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
        {
            todayRun = todayRun.AddDays(1);
        }

        var runUtc = TimeZoneInfo.ConvertTimeToUtc(todayRun, tz);
        return runUtc - DateTime.UtcNow;
    }

    private async Task ProcessLoanPaymentsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var dayOfWeek = (int)today.DayOfWeek; // 0=Sunday, 1=Monday, ... 6=Saturday

        var activeLoans = await context.Loans
            .Where(l => l.Status == "active" && l.StartDate <= today)
            .ToListAsync(stoppingToken);

        var processedCount = 0;

        foreach (var loan in activeLoans)
        {
            if (stoppingToken.IsCancellationRequested) break;

            var shouldProcess = ShouldProcessToday(loan, today, dayOfWeek);
            if (!shouldProcess) continue;

            // Check if payment already processed today for this loan
            var alreadyPaidToday = await context.LoanPayments
                .AnyAsync(p => p.LoanId == loan.LoanId
                    && p.PaymentDate >= today
                    && p.PaymentDate < today.AddDays(1),
                    stoppingToken);

            if (alreadyPaidToday) continue;

            var amountToPay = Math.Min(loan.InstallmentAmount, loan.RemainingBalance);
            if (amountToPay <= 0) continue;

            using var transaction = await context.Database.BeginTransactionAsync(stoppingToken);
            try
            {
                var payment = new LoanPayment
                {
                    LoanId = loan.LoanId,
                    PaymentDate = DateTime.UtcNow,
                    AmountPaid = amountToPay,
                    Notes = $"Pago automático - {loan.Frequency}",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = null // System-generated
                };

                context.LoanPayments.Add(payment);

                loan.TotalPaid += amountToPay;
                loan.RemainingBalance -= amountToPay;
                loan.UpdatedAt = DateTime.UtcNow;

                if (loan.RemainingBalance <= 0)
                {
                    loan.RemainingBalance = 0;
                    loan.Status = "completed";
                }

                // Deduct installment from banca balance (banca is paying back what they owe)
                if (loan.EntityType == "bettingPool")
                {
                    var balance = await context.Balances
                        .FirstOrDefaultAsync(b => b.BettingPoolId == loan.EntityId, stoppingToken);
                    if (balance != null)
                    {
                        balance.CurrentBalance -= amountToPay;
                        balance.LastUpdated = DateTime.UtcNow;
                    }
                }

                await context.SaveChangesAsync(stoppingToken);
                await transaction.CommitAsync(stoppingToken);

                processedCount++;
                _logger.LogInformation("Auto-payment processed: Loan {LoanNumber}, Amount {Amount}, Remaining {Remaining}",
                    loan.LoanNumber, amountToPay, loan.RemainingBalance);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(stoppingToken);
                _logger.LogError(ex, "Error processing auto-payment for loan {LoanNumber}", loan.LoanNumber);
            }
        }

        _logger.LogInformation("Loan payment processing complete: {Count} payments processed for {Date}",
            processedCount, today);
    }

    private static bool ShouldProcessToday(Loan loan, DateTime today, int dayOfWeek)
    {
        // Frontend stores: 0=Mon, 1=Tue, ..., 6=Sun
        // C# DayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
        // Convert C# dayOfWeek to frontend format: Sun(0)->6, Mon(1)->0, Tue(2)->1, ...
        var frontendDow = dayOfWeek == 0 ? 6 : dayOfWeek - 1;

        return loan.Frequency switch
        {
            "daily" => true,
            "weekly" => loan.PaymentDay.HasValue && loan.PaymentDay.Value == frontendDow,
            "monthly" => today.Day == loan.StartDate.Day
                || (today.Day == DateTime.DaysInMonth(today.Year, today.Month)
                    && loan.StartDate.Day > DateTime.DaysInMonth(today.Year, today.Month)),
            "annual" => today.Month == loan.StartDate.Month && today.Day == loan.StartDate.Day,
            _ => false
        };
    }
}
