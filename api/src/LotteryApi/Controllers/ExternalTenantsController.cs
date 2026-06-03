using System.Net.Http.Headers;
using System.Security.Claims;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Exceptions;
using LotteryApi.Helpers;
using LotteryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

/// <summary>
/// CRUD over the local <see cref="ExternalTenant"/> registry plus thin proxy
/// endpoints that fetch a partner's public data and surface it to the
/// frontend. The api_key never leaves the server.
/// </summary>
[ApiController]
[Route("api/external-tenants")]
[Authorize]
public class ExternalTenantsController : ControllerBase
{
    private const string CentralKeyHeader = "X-Central-Key";
    private const string HttpClientName = "ExternalTenantsProxy";

    private readonly LotteryDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ExternalTenantsController> _logger;

    public ExternalTenantsController(
        LotteryDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<ExternalTenantsController> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    private async Task<bool> HasPermissionAsync(string code)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    private static ExternalTenantDto ToDto(ExternalTenant t) => new()
    {
        ExternalTenantId = t.ExternalTenantId,
        TenantCode = t.TenantCode,
        DisplayName = t.DisplayName,
        ApiBaseUrl = t.ApiBaseUrl,
        LogoUrl = t.LogoUrl,
        SortOrder = t.SortOrder,
        IsActive = t.IsActive,
        CanViewTodaySales = t.CanViewTodaySales,
        ShareResults = t.ShareResults,
        // Last-4 hint so admins can recognize/rotate keys without seeing the secret.
        ApiKeyHint = t.ApiKey.Length >= 4 ? "…" + t.ApiKey[^4..] : "…",
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
    };

    // ─────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<ActionResult<List<ExternalTenantDto>>> List()
    {
        if (!await HasPermissionAsync("VIEW_EXTERNAL_TENANTS")) return Forbid();

        var rows = await _context.ExternalTenants
            .AsNoTracking()
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.DisplayName)
            .ToListAsync();
        return Ok(rows.Select(ToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExternalTenantDto>> Get(int id)
    {
        if (!await HasPermissionAsync("VIEW_EXTERNAL_TENANTS")) return Forbid();

        var t = await _context.ExternalTenants.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalTenantId == id);
        return t == null
            ? ApiErrorResult.NotFound(ErrorCodes.NotFound, "Tenant externo no encontrado")
            : Ok(ToDto(t));
    }

    [HttpPost]
    public async Task<ActionResult<ExternalTenantDto>> Create([FromBody] CreateExternalTenantDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_EXTERNAL_TENANTS")) return Forbid();

        var dup = await _context.ExternalTenants.AsNoTracking()
            .AnyAsync(x => x.TenantCode == dto.TenantCode);
        if (dup)
        {
            return ApiErrorResult.BadRequest(ErrorCodes.Conflict,
                $"Ya existe un tenant externo con código '{dto.TenantCode}'");
        }

        var t = new ExternalTenant
        {
            TenantCode = dto.TenantCode,
            DisplayName = dto.DisplayName,
            ApiBaseUrl = dto.ApiBaseUrl.TrimEnd('/'),
            ApiKey = dto.ApiKey,
            LogoUrl = dto.LogoUrl,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            CanViewTodaySales = dto.CanViewTodaySales,
            ShareResults = dto.ShareResults,
            CreatedAt = DateTime.UtcNow,
        };
        _context.ExternalTenants.Add(t);
        await _context.SaveChangesAsync();
        return Ok(ToDto(t));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExternalTenantDto>> Update(int id, [FromBody] UpdateExternalTenantDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_EXTERNAL_TENANTS")) return Forbid();

        var t = await _context.ExternalTenants
            .FirstOrDefaultAsync(x => x.ExternalTenantId == id);
        if (t == null)
        {
            return ApiErrorResult.NotFound(ErrorCodes.NotFound, "Tenant externo no encontrado");
        }

        t.DisplayName = dto.DisplayName;
        t.ApiBaseUrl = dto.ApiBaseUrl.TrimEnd('/');
        t.LogoUrl = dto.LogoUrl;
        t.SortOrder = dto.SortOrder;
        t.IsActive = dto.IsActive;
        t.CanViewTodaySales = dto.CanViewTodaySales;
        t.ShareResults = dto.ShareResults;
        t.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(ToDto(t));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        if (!await HasPermissionAsync("MANAGE_EXTERNAL_TENANTS")) return Forbid();

        var t = await _context.ExternalTenants
            .FirstOrDefaultAsync(x => x.ExternalTenantId == id);
        if (t == null) return NoContent();

        _context.ExternalTenants.Remove(t);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Replaces the api_key in place. Used by the "regenerar key" flow in the
    /// admin UI when a key may have leaked.
    /// </summary>
    [HttpPost("{id}/rotate-key")]
    public async Task<ActionResult<ExternalTenantDto>> RotateKey(int id, [FromBody] RotateApiKeyDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_EXTERNAL_TENANTS")) return Forbid();

        var t = await _context.ExternalTenants
            .FirstOrDefaultAsync(x => x.ExternalTenantId == id);
        if (t == null)
        {
            return ApiErrorResult.NotFound(ErrorCodes.NotFound, "Tenant externo no encontrado");
        }

        t.ApiKey = dto.ApiKey;
        t.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(ToDto(t));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Proxy endpoints → call the partner's PublicController and forward.
    // ─────────────────────────────────────────────────────────────────────

    [HttpGet("{id}/today-sales")]
    public Task<ActionResult> ProxyTodaySales(int id, [FromQuery] DateTime? date = null)
        => ProxyAsync<PublicTodaySalesDto>(id, "today-sales", date, requireShareSales: true);

    [HttpGet("{id}/today-sales/by-banca")]
    public Task<ActionResult> ProxyTodaySalesByBanca(int id, [FromQuery] DateTime? date = null)
        => ProxyAsync<List<PublicTodaySalesByBancaRow>>(id, "today-sales/by-banca", date, requireShareSales: true);

    [HttpGet("{id}/today-sales/by-draw")]
    public Task<ActionResult> ProxyTodaySalesByDraw(int id, [FromQuery] DateTime? date = null)
        => ProxyAsync<List<PublicTodaySalesByDrawRow>>(id, "today-sales/by-draw", date, requireShareSales: true);

    private async Task<ActionResult> ProxyAsync<T>(
        int externalTenantId,
        string relativePath,
        DateTime? date,
        bool requireShareSales)
    {
        if (!await HasPermissionAsync("VIEW_EXTERNAL_TENANTS")) return Forbid();

        var t = await _context.ExternalTenants.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalTenantId == externalTenantId);
        if (t == null || !t.IsActive)
        {
            return ApiErrorResult.NotFound(ErrorCodes.NotFound, "Tenant externo no encontrado o inactivo");
        }
        if (requireShareSales && !t.CanViewTodaySales)
        {
            return ApiErrorResult.Error(ErrorCodes.Forbidden,
                "Este tenant no está autorizado para compartir ventas del día", 403);
        }

        var qs = date.HasValue ? $"?date={date.Value:yyyy-MM-dd}" : string.Empty;
        var url = $"{t.ApiBaseUrl}/api/public/v1/{relativePath}{qs}";

        var client = _httpClientFactory.CreateClient(HttpClientName);
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.TryAddWithoutValidation(CentralKeyHeader, t.ApiKey);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        try
        {
            using var resp = await client.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Proxy to partner {Partner} {Path} returned {Status}",
                    t.TenantCode, relativePath, (int)resp.StatusCode);
                return StatusCode((int)resp.StatusCode, new
                {
                    error = "partner_error",
                    partnerStatus = (int)resp.StatusCode,
                    partnerCode = t.TenantCode,
                });
            }
            var payload = await resp.Content.ReadAsStringAsync();
            return Content(payload, "application/json");
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Proxy to partner {Partner} timed out", t.TenantCode);
            return StatusCode(504, new { error = "partner_timeout", partnerCode = t.TenantCode });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Proxy to partner {Partner} network error", t.TenantCode);
            return StatusCode(502, new { error = "partner_unreachable", partnerCode = t.TenantCode });
        }
    }
}
