using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/group-config")]
public class GroupConfigController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<GroupConfigController> _logger;

    public GroupConfigController(LotteryDbContext context, ILogger<GroupConfigController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private async Task<bool> CurrentUserCanManageGroup()
    {
        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(userIdClaim, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission!.PermissionCode == "MANAGE_MY_GROUP");
    }

    public class GroupDefaultConfigDto
    {
        public string GameType { get; set; } = string.Empty;
        public decimal? PrizePayment1 { get; set; }
        public decimal? PrizePayment2 { get; set; }
        public decimal? PrizePayment3 { get; set; }
        public decimal? PrizePayment4 { get; set; }
        public decimal? PrizePayment5 { get; set; }
        public decimal? PrizePayment6 { get; set; }
        public decimal? Commission1 { get; set; }
        public decimal? Commission2 { get; set; }
        public decimal? Commission3 { get; set; }
        public decimal? Commission4 { get; set; }
    }

    public class SaveDefaultsRequest
    {
        public List<GroupDefaultConfigDto> Configs { get; set; } = new();
    }

    /// <summary>
    /// Get all group default prize/commission configs.
    /// </summary>
    [HttpGet("defaults")]
    public async Task<ActionResult<List<GroupDefaultConfigDto>>> GetDefaults()
    {
        var rows = await _context.GroupDefaultConfigs
            .AsNoTracking()
            .Select(r => new GroupDefaultConfigDto
            {
                GameType = r.GameType,
                PrizePayment1 = r.PrizePayment1,
                PrizePayment2 = r.PrizePayment2,
                PrizePayment3 = r.PrizePayment3,
                PrizePayment4 = r.PrizePayment4,
                PrizePayment5 = r.PrizePayment5,
                PrizePayment6 = r.PrizePayment6,
                Commission1 = r.Commission1,
                Commission2 = r.Commission2,
                Commission3 = r.Commission3,
                Commission4 = r.Commission4
            })
            .ToListAsync();

        return Ok(rows);
    }

    /// <summary>
    /// Bulk upsert group default configs. One row per gameType.
    /// </summary>
    [HttpPut("defaults")]
    public async Task<ActionResult> SaveDefaults([FromBody] SaveDefaultsRequest request)
    {
        if (!await CurrentUserCanManageGroup())
            return StatusCode(403, new { message = "No tiene permiso para manejar el grupo" });

        if (request?.Configs == null || request.Configs.Count == 0)
        {
            return BadRequest(new { message = "No hay configuraciones para guardar" });
        }

        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

        var existing = await _context.GroupDefaultConfigs.ToDictionaryAsync(r => r.GameType);
        var now = DateTime.UtcNow;

        foreach (var dto in request.Configs)
        {
            if (string.IsNullOrWhiteSpace(dto.GameType)) continue;

            if (existing.TryGetValue(dto.GameType, out var row))
            {
                row.PrizePayment1 = dto.PrizePayment1;
                row.PrizePayment2 = dto.PrizePayment2;
                row.PrizePayment3 = dto.PrizePayment3;
                row.PrizePayment4 = dto.PrizePayment4;
                row.PrizePayment5 = dto.PrizePayment5;
                row.PrizePayment6 = dto.PrizePayment6;
                row.Commission1 = dto.Commission1;
                row.Commission2 = dto.Commission2;
                row.Commission3 = dto.Commission3;
                row.Commission4 = dto.Commission4;
                row.UpdatedAt = now;
                row.UpdatedBy = userId;
            }
            else
            {
                _context.GroupDefaultConfigs.Add(new GroupDefaultConfig
                {
                    GameType = dto.GameType,
                    PrizePayment1 = dto.PrizePayment1,
                    PrizePayment2 = dto.PrizePayment2,
                    PrizePayment3 = dto.PrizePayment3,
                    PrizePayment4 = dto.PrizePayment4,
                    PrizePayment5 = dto.PrizePayment5,
                    PrizePayment6 = dto.PrizePayment6,
                    Commission1 = dto.Commission1,
                    Commission2 = dto.Commission2,
                    Commission3 = dto.Commission3,
                    Commission4 = dto.Commission4,
                    UpdatedAt = now,
                    UpdatedBy = userId
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Saved {Count} group default configs by user {UserId}", request.Configs.Count, userId);
        return Ok(new { message = "Configuraciones guardadas", count = request.Configs.Count });
    }

    // ============================================================================
    // Allowed Values
    // ============================================================================

    public class AllowedValuesGroupDto
    {
        public string GameType { get; set; } = string.Empty;
        public string FieldKey { get; set; } = string.Empty;
        public List<decimal> Values { get; set; } = new();
    }

    public class SaveAllowedValuesRequest
    {
        public List<AllowedValuesGroupDto> Groups { get; set; } = new();
    }

    /// <summary>
    /// Get all allowed-values lists grouped by (gameType, fieldKey).
    /// </summary>
    [HttpGet("allowed-values")]
    public async Task<ActionResult<List<AllowedValuesGroupDto>>> GetAllowedValues()
    {
        var rows = await _context.GroupAllowedValues
            .AsNoTracking()
            .OrderBy(r => r.GameType).ThenBy(r => r.FieldKey).ThenBy(r => r.DisplayOrder).ThenBy(r => r.Value)
            .ToListAsync();

        var groups = rows
            .GroupBy(r => new { r.GameType, r.FieldKey })
            .Select(g => new AllowedValuesGroupDto
            {
                GameType = g.Key.GameType,
                FieldKey = g.Key.FieldKey,
                Values = g.Select(r => r.Value).ToList()
            })
            .ToList();

        return Ok(groups);
    }

    /// <summary>
    /// Bulk replace allowed values. For each (gameType, fieldKey) in the request,
    /// existing rows are deleted and the provided values are inserted.
    /// </summary>
    [HttpPut("allowed-values")]
    public async Task<ActionResult> SaveAllowedValues([FromBody] SaveAllowedValuesRequest request)
    {
        if (!await CurrentUserCanManageGroup())
            return StatusCode(403, new { message = "No tiene permiso para manejar el grupo" });

        if (request?.Groups == null)
        {
            return BadRequest(new { message = "No hay datos para guardar" });
        }

        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;
        var now = DateTime.UtcNow;

        foreach (var group in request.Groups)
        {
            if (string.IsNullOrWhiteSpace(group.GameType) || string.IsNullOrWhiteSpace(group.FieldKey)) continue;

            var existing = await _context.GroupAllowedValues
                .Where(r => r.GameType == group.GameType && r.FieldKey == group.FieldKey)
                .ToListAsync();
            _context.GroupAllowedValues.RemoveRange(existing);

            var order = 0;
            var distinctValues = (group.Values ?? new List<decimal>()).Distinct().ToList();
            foreach (var value in distinctValues)
            {
                _context.GroupAllowedValues.Add(new GroupAllowedValue
                {
                    GameType = group.GameType,
                    FieldKey = group.FieldKey,
                    Value = value,
                    DisplayOrder = order++,
                    UpdatedAt = now,
                    UpdatedBy = userId
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Saved allowed values for {Count} (gameType, fieldKey) groups by user {UserId}", request.Groups.Count, userId);
        return Ok(new { message = "Valores permitidos guardados", count = request.Groups.Count });
    }

    // ============================================================================
    // Footer Defaults (up to 8 lines, max 30 chars each)
    // ============================================================================

    public class FooterLineDto
    {
        public int LineNumber { get; set; }
        public string LineText { get; set; } = string.Empty;
    }

    public class SaveFooterRequest
    {
        public List<FooterLineDto> Lines { get; set; } = new();
    }

    /// <summary>
    /// Get all footer default lines, ordered by line_number (1..8).
    /// </summary>
    [HttpGet("footer")]
    public async Task<ActionResult<List<FooterLineDto>>> GetFooterDefaults()
    {
        var rows = await _context.GroupFooterDefaults
            .AsNoTracking()
            .OrderBy(r => r.LineNumber)
            .Select(r => new FooterLineDto { LineNumber = r.LineNumber, LineText = r.LineText })
            .ToListAsync();
        return Ok(rows);
    }

    /// <summary>
    /// Upsert footer default lines. Each line max 30 chars, line_number 1..8.
    /// </summary>
    [HttpPut("footer")]
    public async Task<ActionResult> SaveFooterDefaults([FromBody] SaveFooterRequest request)
    {
        if (!await CurrentUserCanManageGroup())
            return StatusCode(403, new { message = "No tiene permiso para manejar el grupo" });

        if (request?.Lines == null)
        {
            return BadRequest(new { message = "No hay datos para guardar" });
        }

        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;
        var now = DateTime.UtcNow;

        var existing = await _context.GroupFooterDefaults.ToDictionaryAsync(r => r.LineNumber);

        foreach (var line in request.Lines)
        {
            if (line.LineNumber < 1 || line.LineNumber > 8) continue;
            var text = (line.LineText ?? string.Empty);
            if (text.Length > 30) text = text.Substring(0, 30);

            if (existing.TryGetValue(line.LineNumber, out var row))
            {
                row.LineText = text;
                row.UpdatedAt = now;
                row.UpdatedBy = userId;
            }
            else
            {
                _context.GroupFooterDefaults.Add(new GroupFooterDefault
                {
                    LineNumber = line.LineNumber,
                    LineText = text,
                    UpdatedAt = now,
                    UpdatedBy = userId
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Saved {Count} footer lines by user {UserId}", request.Lines.Count, userId);
        return Ok(new { message = "Footer guardado", count = request.Lines.Count });
    }

    // ============================================================================
    // BP Configuration Defaults (key-value)
    // ============================================================================

    public class SaveBpDefaultsRequest
    {
        public Dictionary<string, string> Values { get; set; } = new();
    }

    /// <summary>
    /// Get all betting-pool configuration defaults as a key→value map.
    /// </summary>
    [HttpGet("bp-defaults")]
    public async Task<ActionResult<Dictionary<string, string>>> GetBpDefaults()
    {
        var rows = await _context.GroupDefaultBpConfigs
            .AsNoTracking()
            .ToListAsync();
        var map = rows.ToDictionary(r => r.ConfigKey, r => r.ConfigValue);
        return Ok(map);
    }

    /// <summary>
    /// Bulk upsert betting-pool configuration defaults.
    /// </summary>
    [HttpPut("bp-defaults")]
    public async Task<ActionResult> SaveBpDefaults([FromBody] SaveBpDefaultsRequest request)
    {
        if (!await CurrentUserCanManageGroup())
            return StatusCode(403, new { message = "No tiene permiso para manejar el grupo" });

        if (request?.Values == null)
        {
            return BadRequest(new { message = "No hay datos para guardar" });
        }

        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;
        var now = DateTime.UtcNow;

        // Exclude banca-specific keys that should never be group defaults
        var excludedKeys = new HashSet<string> { "isActive", "bettingPoolId" };

        var existing = await _context.GroupDefaultBpConfigs.ToDictionaryAsync(r => r.ConfigKey);

        foreach (var kv in request.Values)
        {
            if (string.IsNullOrWhiteSpace(kv.Key) || excludedKeys.Contains(kv.Key)) continue;
            var value = kv.Value ?? string.Empty;
            if (value.Length > 200) value = value.Substring(0, 200);

            if (existing.TryGetValue(kv.Key, out var row))
            {
                row.ConfigValue = value;
                row.UpdatedAt = now;
                row.UpdatedBy = userId;
            }
            else
            {
                _context.GroupDefaultBpConfigs.Add(new GroupDefaultBpConfig
                {
                    ConfigKey = kv.Key,
                    ConfigValue = value,
                    UpdatedAt = now,
                    UpdatedBy = userId
                });
            }
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Saved {Count} BP config defaults by user {UserId}", request.Values.Count, userId);
        return Ok(new { message = "Configuración predeterminada guardada", count = request.Values.Count });
    }
}
