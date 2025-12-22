using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Models;

namespace LotteryApi.Services;

public class LoginSessionService : ILoginSessionService
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<LoginSessionService> _logger;

    public LoginSessionService(LotteryDbContext context, ILogger<LoginSessionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LoginSessionsResponseDto> GetLoginSessionsAsync(LoginSessionQueryDto query)
    {
        var date = query.Date ?? DateTimeHelper.TodayInBusinessTimezone();
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Build base query
        var sessionsQuery = _context.LoginSessions
            .Include(ls => ls.User)
            .Include(ls => ls.BettingPool)
            .Include(ls => ls.Zone)
            .Where(ls => ls.LoginAt >= startOfDay && ls.LoginAt < endOfDay)
            .AsQueryable();

        // Filter by zones if provided
        if (query.ZoneIds != null && query.ZoneIds.Any())
        {
            sessionsQuery = sessionsQuery.Where(ls => ls.ZoneId.HasValue && query.ZoneIds.Contains(ls.ZoneId.Value));
        }

        // Filter by betting pool if provided
        if (query.BettingPoolId.HasValue)
        {
            sessionsQuery = sessionsQuery.Where(ls => ls.BettingPoolId == query.BettingPoolId);
        }

        // Get all sessions for the day
        var sessions = await sessionsQuery.ToListAsync();

        // Group by betting pool/user to create summary
        var bancaSummaries = sessions
            .GroupBy(s => new { s.BettingPoolId, s.UserId })
            .Select((g, index) => {
                var first = g.First();
                var webSessions = g.Where(s => s.DeviceType == DeviceTypes.Web).OrderBy(s => s.LoginAt).ToList();
                var mobileSessions = g.Where(s => s.DeviceType == DeviceTypes.MobileBrowser).OrderBy(s => s.LoginAt).ToList();
                var appSessions = g.Where(s => s.DeviceType == DeviceTypes.App).OrderBy(s => s.LoginAt).ToList();

                return new BancaLoginSummaryDto
                {
                    Id = index + 1,
                    Banca = first.BettingPool != null
                        ? $"{first.BettingPool.BettingPoolName}({first.BettingPool.BettingPoolCode})"
                        : first.User?.Username ?? "N/A",
                    Usuario = first.User?.Username ?? "N/A",
                    BettingPoolId = first.BettingPoolId,
                    ZoneId = first.ZoneId,
                    PrimeraWeb = webSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                    UltimaWeb = webSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                    PrimeraCelular = mobileSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                    UltimaCelular = mobileSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                    PrimeraApp = appSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                    UltimaApp = appSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                };
            })
            .ToList();

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var search = query.SearchText.ToLower();
            bancaSummaries = bancaSummaries
                .Where(b => b.Banca.ToLower().Contains(search) || b.Usuario.ToLower().Contains(search))
                .ToList();
        }

        // Find IP collisions (same IP used by different users/bancas)
        var ipCollisions = sessions
            .Where(s => !string.IsNullOrEmpty(s.IpAddress))
            .GroupBy(s => s.IpAddress)
            .Where(g => g.Select(s => s.BettingPoolId).Distinct().Count() > 1)
            .Select(g => new IpCollisionDto
            {
                IpAddress = g.Key!,
                SessionCount = g.Count(),
                Sessions = g
                    .GroupBy(s => new { s.BettingPoolId, s.UserId })
                    .Select((sg, index) => {
                        var first = sg.First();
                        var webSessions = sg.Where(s => s.DeviceType == DeviceTypes.Web).OrderBy(s => s.LoginAt).ToList();
                        var mobileSessions = sg.Where(s => s.DeviceType == DeviceTypes.MobileBrowser).OrderBy(s => s.LoginAt).ToList();
                        var appSessions = sg.Where(s => s.DeviceType == DeviceTypes.App).OrderBy(s => s.LoginAt).ToList();

                        return new BancaLoginSummaryDto
                        {
                            Id = index + 1,
                            Banca = first.BettingPool != null
                                ? $"{first.BettingPool.BettingPoolName}({first.BettingPool.BettingPoolCode})"
                                : first.User?.Username ?? "N/A",
                            Usuario = first.User?.Username ?? "N/A",
                            BettingPoolId = first.BettingPoolId,
                            ZoneId = first.ZoneId,
                            PrimeraWeb = webSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                            UltimaWeb = webSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                            PrimeraCelular = mobileSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                            UltimaCelular = mobileSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                            PrimeraApp = appSessions.FirstOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                            UltimaApp = appSessions.LastOrDefault()?.LoginAt.ToString("MM/dd/yyyy hh:mm tt"),
                        };
                    })
                    .ToList()
            })
            .ToList();

        return new LoginSessionsResponseDto
        {
            Bancas = bancaSummaries,
            Colisiones = ipCollisions,
            TotalRecords = bancaSummaries.Count,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<int> CreateLoginSessionAsync(CreateLoginSessionDto dto)
    {
        var session = new LoginSession
        {
            UserId = dto.UserId,
            BettingPoolId = dto.BettingPoolId,
            ZoneId = dto.ZoneId,
            DeviceType = dto.DeviceType,
            IpAddress = dto.IpAddress,
            UserAgent = dto.UserAgent,
            LoginAt = DateTime.UtcNow,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.LoginSessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Login session created for user {UserId}, device type {DeviceType}",
            dto.UserId, DeviceTypes.GetName(dto.DeviceType));

        return session.SessionId;
    }

    public async Task EndLoginSessionAsync(int sessionId)
    {
        var session = await _context.LoginSessions.FindAsync(sessionId);
        if (session != null)
        {
            session.LogoutAt = DateTime.UtcNow;
            session.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task EndAllUserSessionsAsync(int userId)
    {
        var activeSessions = await _context.LoginSessions
            .Where(ls => ls.UserId == userId && ls.IsActive)
            .ToListAsync();

        foreach (var session in activeSessions)
        {
            session.LogoutAt = DateTime.UtcNow;
            session.IsActive = false;
        }

        await _context.SaveChangesAsync();
    }
}
