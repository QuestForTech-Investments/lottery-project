namespace LotteryApi.Helpers;

/// <summary>
/// Helper class for date/time operations with timezone support.
/// Implements the "UTC everywhere, local only for display" pattern.
/// </summary>
public static class DateTimeHelper
{
    /// <summary>
    /// The business timezone for lottery operations (Santo Domingo, Dominican Republic).
    /// UTC-4, no daylight saving time.
    /// </summary>
    public const string BusinessTimezoneId = "America/Santo_Domingo";

    private static readonly TimeZoneInfo _businessTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById(BusinessTimezoneId);

    /// <summary>
    /// Gets the current date/time in the business timezone.
    /// Use this when you need "now" in the lottery's local time.
    /// </summary>
    public static DateTime NowInBusinessTimezone()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _businessTimeZone);
    }

    /// <summary>
    /// Gets today's date in the business timezone.
    /// Use this when you need "today" for lottery operations (e.g., filtering results, draws).
    /// </summary>
    public static DateTime TodayInBusinessTimezone()
    {
        return NowInBusinessTimezone().Date;
    }

    /// <summary>
    /// Converts a UTC datetime to the business timezone.
    /// </summary>
    public static DateTime ToBusinessTimezone(DateTime utcDateTime)
    {
        if (utcDateTime.Kind == DateTimeKind.Local)
        {
            utcDateTime = utcDateTime.ToUniversalTime();
        }
        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, _businessTimeZone);
    }

    /// <summary>
    /// Converts a business timezone datetime to UTC.
    /// </summary>
    public static DateTime ToUtc(DateTime businessDateTime)
    {
        return TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(businessDateTime, DateTimeKind.Unspecified),
            _businessTimeZone);
    }

    /// <summary>
    /// Gets the start of day (00:00:00) in UTC for a given date in the business timezone.
    /// Useful for date range queries.
    /// </summary>
    public static DateTime GetUtcStartOfDay(DateTime date)
    {
        var startOfDayLocal = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(startOfDayLocal, _businessTimeZone);
    }

    /// <summary>
    /// Gets the end of day (23:59:59.999) in UTC for a given date in the business timezone.
    /// Useful for date range queries.
    /// </summary>
    public static DateTime GetUtcEndOfDay(DateTime date)
    {
        var endOfDayLocal = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(endOfDayLocal, _businessTimeZone);
    }

    /// <summary>
    /// Gets the business timezone info object.
    /// </summary>
    public static TimeZoneInfo GetBusinessTimeZone() => _businessTimeZone;
}
