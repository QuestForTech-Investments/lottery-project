using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LotteryApi.Configuration;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LotteryApi.Services;

/// <summary>
/// Pushes locally-published results to partners that have
/// <c>share_results=true</c>. Receives inbound pushes through the
/// <c>PublicController</c> using the helpers here for consistency.
///
/// Fire-and-forget from <c>ResultsController</c>. Failures are logged to
/// <c>result_sync_log</c> — no retry; operators rerun via the UI.
/// </summary>
public class ResultSyncService
{
    private const string CentralKeyHeader = "X-Central-Key";
    public const string HttpClientName = "ResultSyncPush";

    private readonly LotteryDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly PublicApiOptions _publicApiOptions;
    private readonly ILogger<ResultSyncService> _logger;

    public ResultSyncService(
        LotteryDbContext context,
        IHttpClientFactory httpClientFactory,
        IOptions<PublicApiOptions> publicApiOptions,
        ILogger<ResultSyncService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _publicApiOptions = publicApiOptions.Value;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────
    // OUTBOUND: push a freshly saved result to all enabled partners.
    // ─────────────────────────────────────────────────────────────────────

    public async Task PushResultAsync(int resultId, CancellationToken cancellationToken = default)
    {
        var result = await _context.Results
            .AsNoTracking()
            .Include(r => r.Draw)
                .ThenInclude(d => d!.Lottery)
            .FirstOrDefaultAsync(r => r.ResultId == resultId, cancellationToken);

        if (result == null)
        {
            _logger.LogWarning("PushResultAsync: result {ResultId} not found", resultId);
            return;
        }

        var lotteryCode = result.Draw?.Lottery?.LotteryCode;
        var drawCode = result.Draw?.DrawCode;
        if (string.IsNullOrEmpty(lotteryCode) || string.IsNullOrEmpty(drawCode))
        {
            _logger.LogWarning(
                "PushResultAsync: result {ResultId} has no lottery_code/draw_code — skipping sync (re-run after migration)",
                resultId);
            return;
        }

        var partners = await _context.ExternalTenants
            .AsNoTracking()
            .Where(t => t.IsActive && t.ShareResults)
            .ToListAsync(cancellationToken);
        if (partners.Count == 0) return;

        var body = new PublicResultInboundDto
        {
            PartnerCode = _publicApiOptions.TenantCode,
            LotteryCode = lotteryCode,
            DrawCode = drawCode,
            ResultDate = result.ResultDate.Date,
            Num1 = result.WinningNumber,
            Num2 = result.AdditionalNumber,
            Position = result.Position,
            PublishedAt = result.CreatedAt ?? DateTime.UtcNow,
        };
        var payloadHash = HashPayload(body);

        foreach (var partner in partners)
        {
            await PushToPartnerAsync(partner, body, payloadHash, cancellationToken);
        }
    }

    private async Task PushToPartnerAsync(
        ExternalTenant partner,
        PublicResultInboundDto body,
        string payloadHash,
        CancellationToken cancellationToken)
    {
        var url = $"{partner.ApiBaseUrl}/api/public/v1/results/inbound";
        var client = _httpClientFactory.CreateClient(HttpClientName);

        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body),
        };
        req.Headers.TryAddWithoutValidation(CentralKeyHeader, partner.ApiKey);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var entry = new ResultSyncLog
        {
            Direction = ResultSyncDirection.Outbound,
            PartnerCode = partner.TenantCode,
            ResultDate = body.ResultDate,
            LotteryCode = body.LotteryCode,
            DrawCode = body.DrawCode,
            PayloadHash = payloadHash,
            CreatedAt = DateTime.UtcNow,
        };

        try
        {
            using var resp = await client.SendAsync(req, cancellationToken);
            if (resp.IsSuccessStatusCode)
            {
                // Distinguish "they accepted as new" vs "they already had it" by
                // peeking at the response body. Either way we mark it as sent —
                // the operator can drill into the log if they want detail.
                entry.Status = ResultSyncStatus.Sent;
            }
            else
            {
                entry.Status = ResultSyncStatus.Failed;
                entry.ErrorMessage = $"HTTP {(int)resp.StatusCode}";
                _logger.LogWarning(
                    "Result push to {Partner} failed: {Status}",
                    partner.TenantCode, (int)resp.StatusCode);
            }
        }
        catch (TaskCanceledException ex)
        {
            entry.Status = ResultSyncStatus.Failed;
            entry.ErrorMessage = Truncate("timeout: " + ex.Message, 2000);
        }
        catch (HttpRequestException ex)
        {
            entry.Status = ResultSyncStatus.Failed;
            entry.ErrorMessage = Truncate("network: " + ex.Message, 2000);
        }
        catch (Exception ex)
        {
            entry.Status = ResultSyncStatus.Failed;
            entry.ErrorMessage = Truncate(ex.Message, 2000);
            _logger.LogError(ex, "Unexpected error pushing result to {Partner}", partner.TenantCode);
        }

        _context.ResultSyncLogs.Add(entry);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // ─────────────────────────────────────────────────────────────────────
    // INBOUND: called by PublicController after the partner is authorized.
    // ─────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Apply a partner-pushed result locally. First-write-wins:
    /// — no local row → insert and return "received"
    /// — local row matches → no-op and return "noop"
    /// — local row differs → log to result_sync_conflicts and return "conflict"
    /// </summary>
    public async Task<PublicResultInboundResultDto> ReceiveInboundAsync(
        PublicResultInboundDto body, CancellationToken cancellationToken = default)
    {
        var resultDate = body.ResultDate.Date;
        var payloadHash = HashPayload(body);

        // Map the partner's draw_code → our local draw_id. If we don't have a
        // matching draw, log + reject so the operator can fix code alignment.
        var draw = await _context.Draws
            .Include(d => d.Lottery)
            .FirstOrDefaultAsync(d => d.DrawCode == body.DrawCode, cancellationToken);
        if (draw == null || draw.Lottery == null || draw.Lottery.LotteryCode != body.LotteryCode)
        {
            _context.ResultSyncLogs.Add(new ResultSyncLog
            {
                Direction = ResultSyncDirection.Inbound,
                PartnerCode = body.PartnerCode,
                ResultDate = resultDate,
                LotteryCode = body.LotteryCode,
                DrawCode = body.DrawCode,
                Status = ResultSyncStatus.Failed,
                ErrorMessage = "no local draw with matching (lottery_code, draw_code)",
                PayloadHash = payloadHash,
                CreatedAt = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync(cancellationToken);
            return new PublicResultInboundResultDto
            {
                Status = "failed",
                Message = "no local draw with matching (lottery_code, draw_code)",
            };
        }

        // Multiple positions may exist for the same draw+date. Match by position
        // when the partner sent one; otherwise match by (draw, date) and treat
        // null as the "main" position.
        var query = _context.Results
            .Where(r => r.DrawId == draw.DrawId && r.ResultDate == resultDate);
        var existing = body.Position.HasValue
            ? await query.FirstOrDefaultAsync(r => r.Position == body.Position.Value, cancellationToken)
            : await query.FirstOrDefaultAsync(r => r.Position == null, cancellationToken);

        if (existing == null)
        {
            _context.Results.Add(new Result
            {
                DrawId = draw.DrawId,
                WinningNumber = body.Num1,
                AdditionalNumber = body.Num2,
                Position = body.Position,
                ResultDate = resultDate,
                CreatedAt = DateTime.UtcNow,
                // CreatedBy stays null — system-inserted from partner.
            });
            _context.ResultSyncLogs.Add(new ResultSyncLog
            {
                Direction = ResultSyncDirection.Inbound,
                PartnerCode = body.PartnerCode,
                ResultDate = resultDate,
                LotteryCode = body.LotteryCode,
                DrawCode = body.DrawCode,
                Status = ResultSyncStatus.Received,
                PayloadHash = payloadHash,
                CreatedAt = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync(cancellationToken);
            return new PublicResultInboundResultDto { Status = "received" };
        }

        var matches = existing.WinningNumber == body.Num1
            && (existing.AdditionalNumber ?? string.Empty) == (body.Num2 ?? string.Empty);
        if (matches)
        {
            _context.ResultSyncLogs.Add(new ResultSyncLog
            {
                Direction = ResultSyncDirection.Inbound,
                PartnerCode = body.PartnerCode,
                ResultDate = resultDate,
                LotteryCode = body.LotteryCode,
                DrawCode = body.DrawCode,
                Status = ResultSyncStatus.Noop,
                PayloadHash = payloadHash,
                CreatedAt = DateTime.UtcNow,
            });
            await _context.SaveChangesAsync(cancellationToken);
            return new PublicResultInboundResultDto { Status = "noop" };
        }

        // Conflict — DO NOT overwrite. Capture both sides for operator review.
        _context.ResultSyncConflicts.Add(new ResultSyncConflict
        {
            PartnerCode = body.PartnerCode,
            ResultDate = resultDate,
            LotteryCode = body.LotteryCode,
            DrawCode = body.DrawCode,
            LocalNum1 = existing.WinningNumber,
            LocalNum2 = existing.AdditionalNumber,
            LocalNum3 = null,
            PartnerNum1 = body.Num1,
            PartnerNum2 = body.Num2,
            PartnerNum3 = body.Num3,
            Resolution = ResultSyncConflictResolution.Pending,
            CreatedAt = DateTime.UtcNow,
        });
        _context.ResultSyncLogs.Add(new ResultSyncLog
        {
            Direction = ResultSyncDirection.Inbound,
            PartnerCode = body.PartnerCode,
            ResultDate = resultDate,
            LotteryCode = body.LotteryCode,
            DrawCode = body.DrawCode,
            Status = ResultSyncStatus.Conflict,
            PayloadHash = payloadHash,
            CreatedAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync(cancellationToken);
        return new PublicResultInboundResultDto
        {
            Status = "conflict",
            Message = "Local result differs from partner; saved for manual review.",
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    private static string HashPayload(PublicResultInboundDto body)
    {
        var json = JsonSerializer.Serialize(body);
        var bytes = Encoding.UTF8.GetBytes(json);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string Truncate(string s, int max) =>
        string.IsNullOrEmpty(s) ? s : (s.Length <= max ? s : s[..max]);
}
