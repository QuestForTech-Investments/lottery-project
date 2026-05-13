using LotteryApi.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LotteryApi.Services;

public class ZoneScopeService : IZoneScopeService
{
    private readonly IHttpContextAccessor _http;
    private readonly LotteryDbContext _context;

    // Per-request cache — avoids repeating the user_zones query inside a single endpoint.
    private bool _resolved;
    private List<int>? _allowedZoneIds;
    private List<int>? _allowedBettingPoolIds;

    public ZoneScopeService(IHttpContextAccessor http, LotteryDbContext context)
    {
        _http = http;
        _context = context;
    }

    public async Task<List<int>?> GetAllowedZoneIdsAsync()
    {
        if (_resolved) return _allowedZoneIds;
        await ResolveAsync();
        return _allowedZoneIds;
    }

    public async Task<List<int>?> GetAllowedBettingPoolIdsAsync()
    {
        if (_resolved) return _allowedBettingPoolIds;
        await ResolveAsync();
        return _allowedBettingPoolIds;
    }

    public async Task<bool> IsZoneAllowedAsync(int zoneId)
    {
        var allowed = await GetAllowedZoneIdsAsync();
        return allowed == null || allowed.Contains(zoneId);
    }

    public async Task<bool> IsBettingPoolAllowedAsync(int bettingPoolId)
    {
        var allowed = await GetAllowedBettingPoolIdsAsync();
        return allowed == null || allowed.Contains(bettingPoolId);
    }

    private async Task ResolveAsync()
    {
        _resolved = true;

        var user = _http.HttpContext?.User;
        if (user == null || !user.Identity?.IsAuthenticated == true)
        {
            // Anonymous — no scope enforced. Endpoint-level [Authorize] handles auth.
            _allowedZoneIds = null;
            _allowedBettingPoolIds = null;
            return;
        }

        // POS users are scoped through their banca, not zones. Bypass.
        var role = user.FindFirst(ClaimTypes.Role)?.Value
                ?? user.FindFirst("role")?.Value;
        if (string.Equals(role, "POS", StringComparison.OrdinalIgnoreCase))
        {
            _allowedZoneIds = null;
            _allowedBettingPoolIds = null;
            return;
        }

        var userIdRaw = user.FindFirst("userId")?.Value
                     ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            _allowedZoneIds = null;
            _allowedBettingPoolIds = null;
            return;
        }

        var zoneIds = await _context.UserZones
            .AsNoTracking()
            .Where(uz => uz.UserId == userId && uz.IsActive)
            .Select(uz => uz.ZoneId)
            .Distinct()
            .ToListAsync();

        // No zones assigned → super-admin (no restriction).
        if (zoneIds.Count == 0)
        {
            _allowedZoneIds = null;
            _allowedBettingPoolIds = null;
            return;
        }

        _allowedZoneIds = zoneIds;
        _allowedBettingPoolIds = await _context.BettingPools
            .AsNoTracking()
            .Where(bp => zoneIds.Contains(bp.ZoneId))
            .Select(bp => bp.BettingPoolId)
            .ToListAsync();
    }
}
