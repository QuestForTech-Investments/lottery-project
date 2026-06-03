using System.Security.Claims;
using LotteryApi.Data;
using LotteryApi.Exceptions;
using LotteryApi.Helpers;
using LotteryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

/// <summary>
/// Admin endpoints for the ResultSyncLog page: list sync history, list
/// pending conflicts, and resolve them. Read access requires
/// <c>VIEW_RESULT_SYNC</c>; resolutions require <c>PUBLISH_TODAY_RESULTS</c>
/// (same gate as approving a result).
/// </summary>
[ApiController]
[Route("api/result-sync")]
[Authorize]
public class ResultSyncController : ControllerBase
{
    private readonly LotteryDbContext _context;

    public ResultSyncController(LotteryDbContext context)
    {
        _context = context;
    }

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

    private int? CurrentUserId()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var id) ? id : null;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Log
    // ─────────────────────────────────────────────────────────────────────

    public class SyncLogRow
    {
        public int SyncLogId { get; set; }
        public string Direction { get; set; } = string.Empty;
        public string PartnerCode { get; set; } = string.Empty;
        public DateTime ResultDate { get; set; }
        public string LotteryCode { get; set; } = string.Empty;
        public string DrawCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Most recent first; capped at <paramref name="limit"/> rows.</summary>
    [HttpGet("log")]
    public async Task<ActionResult<List<SyncLogRow>>> GetLog(
        [FromQuery] string? status = null,
        [FromQuery] string? partnerCode = null,
        [FromQuery] DateTime? since = null,
        [FromQuery] int limit = 200)
    {
        if (!await HasPermissionAsync("VIEW_RESULT_SYNC")) return Forbid();

        var q = _context.ResultSyncLogs.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(l => l.Status == status);
        if (!string.IsNullOrEmpty(partnerCode)) q = q.Where(l => l.PartnerCode == partnerCode);
        if (since.HasValue) q = q.Where(l => l.CreatedAt >= since.Value);

        var rows = await q
            .OrderByDescending(l => l.CreatedAt)
            .Take(Math.Clamp(limit, 1, 1000))
            .Select(l => new SyncLogRow
            {
                SyncLogId = l.SyncLogId,
                Direction = l.Direction,
                PartnerCode = l.PartnerCode,
                ResultDate = l.ResultDate,
                LotteryCode = l.LotteryCode,
                DrawCode = l.DrawCode,
                Status = l.Status,
                ErrorMessage = l.ErrorMessage,
                CreatedAt = l.CreatedAt,
            })
            .ToListAsync();
        return Ok(rows);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Conflicts
    // ─────────────────────────────────────────────────────────────────────

    public class ConflictRow
    {
        public int ConflictId { get; set; }
        public string PartnerCode { get; set; } = string.Empty;
        public DateTime ResultDate { get; set; }
        public string LotteryCode { get; set; } = string.Empty;
        public string DrawCode { get; set; } = string.Empty;
        public string? LocalNum1 { get; set; }
        public string? LocalNum2 { get; set; }
        public string? PartnerNum1 { get; set; }
        public string? PartnerNum2 { get; set; }
        public string Resolution { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    [HttpGet("conflicts")]
    public async Task<ActionResult<List<ConflictRow>>> GetConflicts(
        [FromQuery] string resolution = "pending")
    {
        if (!await HasPermissionAsync("VIEW_RESULT_SYNC")) return Forbid();

        var q = _context.ResultSyncConflicts.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(resolution) && resolution != "all")
        {
            q = q.Where(c => c.Resolution == resolution);
        }

        var rows = await q
            .OrderByDescending(c => c.CreatedAt)
            .Take(500)
            .Select(c => new ConflictRow
            {
                ConflictId = c.ConflictId,
                PartnerCode = c.PartnerCode,
                ResultDate = c.ResultDate,
                LotteryCode = c.LotteryCode,
                DrawCode = c.DrawCode,
                LocalNum1 = c.LocalNum1,
                LocalNum2 = c.LocalNum2,
                PartnerNum1 = c.PartnerNum1,
                PartnerNum2 = c.PartnerNum2,
                Resolution = c.Resolution,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();
        return Ok(rows);
    }

    public class ResolveConflictDto
    {
        /// <summary>"kept_local" | "accepted_partner" | "reviewed"</summary>
        public string Resolution { get; set; } = ResultSyncConflictResolution.KeptLocal;
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Resolve a conflict. If <c>accepted_partner</c>, overwrite the local
    /// Result with the partner's numbers — recompute winners is the operator's
    /// responsibility (not auto-triggered to keep the action surgical).
    /// </summary>
    [HttpPost("conflicts/{id}/resolve")]
    public async Task<IActionResult> ResolveConflict(int id, [FromBody] ResolveConflictDto dto)
    {
        if (!await HasPermissionAsync("PUBLISH_TODAY_RESULTS")) return Forbid();

        var c = await _context.ResultSyncConflicts.FirstOrDefaultAsync(x => x.ConflictId == id);
        if (c == null) return ApiErrorResult.NotFound(ErrorCodes.NotFound, "Conflicto no encontrado");
        if (c.Resolution != ResultSyncConflictResolution.Pending)
        {
            return ApiErrorResult.BadRequest(ErrorCodes.Conflict, "El conflicto ya fue resuelto");
        }

        var allowed = new[]
        {
            ResultSyncConflictResolution.KeptLocal,
            ResultSyncConflictResolution.AcceptedPartner,
            ResultSyncConflictResolution.Reviewed,
        };
        if (!allowed.Contains(dto.Resolution))
        {
            return ApiErrorResult.BadRequest(ErrorCodes.BadRequest,
                $"Resolution debe ser uno de: {string.Join(", ", allowed)}");
        }

        if (dto.Resolution == ResultSyncConflictResolution.AcceptedPartner)
        {
            // Find the local result by (lottery_code, draw_code, date) and overwrite.
            var draw = await _context.Draws
                .Include(d => d.Lottery)
                .FirstOrDefaultAsync(d => d.DrawCode == c.DrawCode
                    && d.Lottery != null && d.Lottery.LotteryCode == c.LotteryCode);
            if (draw == null)
            {
                return ApiErrorResult.NotFound(ErrorCodes.NotFound,
                    "El sorteo local ya no existe — no se puede aplicar la resolución");
            }
            var local = await _context.Results
                .FirstOrDefaultAsync(r => r.DrawId == draw.DrawId && r.ResultDate == c.ResultDate);
            if (local != null)
            {
                local.WinningNumber = c.PartnerNum1 ?? local.WinningNumber;
                local.AdditionalNumber = c.PartnerNum2;
                local.UpdatedAt = DateTime.UtcNow;
                local.UpdatedBy = CurrentUserId();
            }
        }

        c.Resolution = dto.Resolution;
        c.Notes = dto.Notes;
        c.ResolvedBy = CurrentUserId();
        c.ResolvedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
