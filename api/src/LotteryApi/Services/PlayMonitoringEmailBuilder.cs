using System.Globalization;
using System.Text;

namespace LotteryApi.Services;

/// <summary>
/// Builds the HTML body for the "Monitoreo de Jugadas" automated email.
///
/// The markup is intentionally email-client-safe:
///  - Table-based layout (Outlook ignores flex/grid).
///  - All styling inline (Gmail strips most &lt;style&gt; blocks).
///  - "Charts" are pure CSS horizontal bars (filled table cells) — no JS,
///    no SVG, no external images, so they render everywhere.
///
/// Visual structure, top to bottom:
///   1. Header band (title + date + zones)
///   2. KPI tiles (total wagered, # plays, # draws)
///   3. Per-draw card: a bar chart of bet-type totals + detailed
///      (number, amount) grid per bet type, each with its own total.
/// </summary>
public static class PlayMonitoringEmailBuilder
{
    // ---- Domain input shapes (populated by the controller's query) --------

    public class ReportPlay
    {
        public string BetNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class ReportBetType
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public int DisplayOrder { get; set; }
        public List<ReportPlay> Plays { get; set; } = new();
    }

    public class ReportDraw
    {
        public int DrawId { get; set; }
        public string DrawName { get; set; } = string.Empty;
        public decimal Total { get; set; }
        /// <summary>Lottery icon URL (absolute, hosted). Falls back to a colored
        /// badge with the abbreviation when null.</summary>
        public string? LogoUrl { get; set; }
        public string? Color { get; set; }
        public string? Abbreviation { get; set; }
        public List<ReportBetType> BetTypes { get; set; } = new();
    }

    public class ReportModel
    {
        public DateTime Date { get; set; }
        public List<string> ZoneNames { get; set; } = new();
        public List<ReportDraw> Draws { get; set; } = new();
        public decimal GrandTotal { get; set; }
        public int TotalPlays { get; set; }
        /// <summary>Distinct bet numbers played across the report (a quick
        /// "spread" signal for the single-draw monitoring email).</summary>
        public int DistinctNumbers { get; set; }
    }

    // ---- Palette ----------------------------------------------------------

    private const string Brand = "#8b5cf6";
    private const string BrandDark = "#6d28d9";
    private const string Ink = "#1e293b";
    private const string Muted = "#64748b";
    private const string Line = "#e2e8f0";
    private const string SoftBg = "#f5f3ff";

    // Fallback branding when the caller doesn't pass tenant values —
    // keeps pre-multi-tenant behavior for the original tenant.
    private const string DefaultBrandName = "Lottobook";
    private const string DefaultAppBaseUrl = "https://lottobook.net";

    private static readonly CultureInfo Money = CultureInfo.GetCultureInfo("en-US");

    private static string Fmt(decimal v) => "$" + v.ToString("N2", Money);

    private static string Esc(string s) => System.Net.WebUtility.HtmlEncode(s ?? string.Empty);

    // ---- Bet-number display formatting (mirrors blackboardService.ts) ------

    private static readonly Dictionary<string, int[]> ComboFormat = new()
    {
        ["PALE"] = new[] { 2, 2 },
        ["SUPER_PALE"] = new[] { 2, 2 },
        ["TRIPLETA"] = new[] { 2, 2, 2 },
        ["BOLITA"] = new[] { 2, 2 },
    };

    private static readonly HashSet<string> BoxSuffix = new()
    {
        "CASH3_BOX", "CASH3_FRONT_BOX", "CASH3_BACK_BOX", "PLAY4_BOX",
    };

    private static readonly HashSet<string> StraightSuffix = new()
    {
        "CASH3_STRAIGHT", "CASH3_FRONT_STRAIGHT", "CASH3_BACK_STRAIGHT", "PLAY4_STRAIGHT",
    };

    private static string FormatBetNumber(string code, string number)
    {
        var suffix = BoxSuffix.Contains(code) ? " B" : StraightSuffix.Contains(code) ? " S" : "";
        if (ComboFormat.TryGetValue(code, out var chunks))
        {
            var total = chunks.Sum();
            if (number.Length == total)
            {
                var parts = new List<string>();
                var i = 0;
                foreach (var len in chunks) { parts.Add(number.Substring(i, len)); i += len; }
                return string.Join("-", parts) + suffix;
            }
        }
        return number + suffix;
    }

    // ---- Public entry points ----------------------------------------------

    public static string BuildSubject(ReportModel model)
    {
        var d = model.Date.ToString("dd/MM/yyyy", Money);
        // Real emails are sent one-per-draw (on each lottery publication), so
        // the subject names the lottery when there's exactly one.
        if (model.Draws.Count == 1)
        {
            return $"Monitoreo de Jugadas — {model.Draws[0].DrawName} — {d}";
        }
        return $"Monitoreo de Jugadas — {d}";
    }

    /// <param name="model">Report data.</param>
    /// <param name="brandName">Tenant display name for the CTA button and
    /// footer ("Ver en {brandName}"). Null/empty → Lottobook.</param>
    /// <param name="frontendBaseUrl">Tenant admin frontend the deep links
    /// point at. Null/empty → https://lottobook.net.</param>
    public static string BuildHtml(ReportModel model, string? brandName = null, string? frontendBaseUrl = null)
    {
        var brand = string.IsNullOrWhiteSpace(brandName) ? DefaultBrandName : brandName.Trim();
        var appBaseUrl = (string.IsNullOrWhiteSpace(frontendBaseUrl) ? DefaultAppBaseUrl : frontendBaseUrl.Trim()).TrimEnd('/');

        var sb = new StringBuilder(8192);
        var dateStr = model.Date.ToString("dd/MM/yyyy", Money);
        var zones = model.ZoneNames.Count > 0 ? string.Join(", ", model.ZoneNames) : "Todas las zonas";

        // One email == one lottery publication, so the common case is a single
        // draw. When that's true we feature the lottery name in the header and
        // drop the redundant "Sorteos" count. Multiple draws is a browse/preview
        // convenience that still renders gracefully.
        var singleDraw = model.Draws.Count == 1;

        sb.Append($@"<!DOCTYPE html>
<html lang=""es""><head><meta charset=""utf-8""><meta name=""viewport"" content=""width=device-width, initial-scale=1.0""></head>
<body style=""margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:{Ink};"">
<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f1f5f9;padding:16px 0;""><tr><td align=""center"">
<table role=""presentation"" width=""640"" cellpadding=""0"" cellspacing=""0"" style=""width:640px;max-width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">");

        // 1. Header band — single draw features the lottery logo + name.
        var headline = singleDraw ? Esc(model.Draws[0].DrawName) : "Monitoreo de Jugadas";
        var eyebrow = singleDraw ? "Monitoreo de Jugadas" : "Reporte automático";
        var headerText = $@"
    <div style=""font-size:13px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;"">{eyebrow}</div>
    <div style=""font-size:24px;font-weight:700;color:#ffffff;margin-top:4px;"">{headline}</div>
    <div style=""font-size:14px;color:rgba(255,255,255,0.9);margin-top:8px;"">📅 {Esc(dateStr)}&nbsp;&nbsp;•&nbsp;&nbsp;🗂 {Esc(zones)}</div>";

        sb.Append($@"
<tr><td style=""background:linear-gradient(135deg,{Brand} 0%,{BrandDark} 100%);background-color:{Brand};padding:24px 28px;"">");
        if (singleDraw)
        {
            var d0 = model.Draws[0];
            sb.Append($@"
  <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%""><tr>
    <td width=""60"" valign=""top"" style=""padding-right:14px;"">{LogoBadge(d0.LogoUrl, d0.Color, d0.Abbreviation, 52)}</td>
    <td valign=""middle"">{headerText}</td>
  </tr></table>");
        }
        else
        {
            sb.Append(headerText);
        }
        sb.Append(@"
</td></tr>");

        // 2. KPI tiles — third tile adapts: distinct numbers (single draw) vs
        // number of draws (multi-draw browse view).
        var thirdTile = singleDraw
            ? KpiTile("Números", model.DistinctNumbers.ToString("N0", Money), "#eff6ff", "#1d4ed8")
            : KpiTile("Sorteos", model.Draws.Count.ToString("N0", Money), "#eff6ff", "#1d4ed8");
        sb.Append($@"
<tr><td style=""padding:20px 28px 4px 28px;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0""><tr>
    {KpiTile("Total jugado", Fmt(model.GrandTotal), "#ecfdf5", "#047857")}
    {KpiTile("Jugadas", model.TotalPlays.ToString("N0", Money), SoftBg, BrandDark)}
    {thirdTile}
  </tr></table>
</td></tr>");

        // 2b. "Ver en {tenant}" call-to-action — opens the play monitoring view
        // on this tenant's own frontend.
        var datePart = model.Date.ToString("yyyy-MM-dd", Money);
        var linkUrl = singleDraw
            ? $"{appBaseUrl}/tickets/plays?drawId={model.Draws[0].DrawId}&date={datePart}"
            : $"{appBaseUrl}/tickets/plays?date={datePart}";
        sb.Append(CtaButton(linkUrl, $"Ver en {Esc(brand)}"));

        // 3. Per-draw cards
        if (model.Draws.Count == 0)
        {
            sb.Append($@"
<tr><td style=""padding:32px 28px;text-align:center;color:{Muted};font-size:15px;"">
  No hay jugadas registradas para este sorteo.
</td></tr>");
        }
        else
        {
            foreach (var draw in model.Draws)
            {
                // In single-draw mode the band already shows the lottery name,
                // so suppress the per-card title to avoid repeating it.
                sb.Append(BuildDrawCard(draw, model.GrandTotal, showHeader: !singleDraw));
            }
        }

        // Footer
        sb.Append($@"
<tr><td style=""padding:18px 28px;border-top:1px solid {Line};color:{Muted};font-size:12px;text-align:center;"">
  Generado automáticamente por {Esc(brand)} el {Esc(DateTime.Now.ToString("dd/MM/yyyy hh:mm tt", Money))}.<br>
  Este es un correo de solo lectura, no responda a este mensaje.
</td></tr>");

        sb.Append(@"
</table></td></tr></table></body></html>");

        return sb.ToString();
    }

    // ---- Section helpers ---------------------------------------------------

    /// <summary>Circular lottery badge: the hosted icon when available, else a
    /// colored circle with the abbreviation (renders even if images are blocked).</summary>
    private static string LogoBadge(string? logoUrl, string? color, string? abbr, int size)
    {
        var radius = size / 2;
        if (!string.IsNullOrWhiteSpace(logoUrl))
        {
            return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#ffffff;border-radius:{radius}px;"">
  <tr><td style=""width:{size}px;height:{size}px;text-align:center;vertical-align:middle;padding:0;"">
    <img src=""{Esc(logoUrl)}"" width=""{size}"" height=""{size}"" alt="""" style=""display:block;width:{size}px;height:{size}px;border-radius:{radius}px;object-fit:cover;"" />
  </td></tr></table>";
        }
        var bg = string.IsNullOrWhiteSpace(color) ? "rgba(255,255,255,0.25)" : color!;
        var text = (abbr ?? "").Trim().ToUpperInvariant();
        return $@"<table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""background-color:{bg};border-radius:{radius}px;"">
  <tr><td style=""width:{size}px;height:{size}px;text-align:center;vertical-align:middle;font-size:{size / 3}px;font-weight:700;color:#ffffff;"">{Esc(text)}</td></tr></table>";
    }

    /// <summary>Bulletproof email button (table cell + padded anchor).</summary>
    private static string CtaButton(string url, string label) => $@"
<tr><td style=""padding:16px 28px 0 28px;"" align=""center"">
  <table role=""presentation"" cellpadding=""0"" cellspacing=""0""><tr>
    <td align=""center"" style=""border-radius:10px;background-color:{Brand};"">
      <a href=""{Esc(url)}"" target=""_blank"" style=""display:inline-block;padding:12px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;"">🔍 {Esc(label)}</a>
    </td>
  </tr></table>
</td></tr>";

    private static string KpiTile(string label, string value, string bg, string fg) => $@"
    <td width=""33.33%"" style=""padding:0 6px;"" valign=""top"">
      <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:{bg};border-radius:10px;"">
        <tr><td style=""padding:14px 12px;text-align:center;"">
          <div style=""font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:{Muted};font-weight:600;"">{Esc(label)}</div>
          <div style=""font-size:20px;font-weight:700;color:{fg};margin-top:4px;"">{Esc(value)}</div>
        </td></tr>
      </table>
    </td>";

    private static string BuildDrawCard(ReportDraw draw, decimal grandTotal, bool showHeader = true)
    {
        var sb = new StringBuilder(2048);

        sb.Append($@"
<tr><td style=""padding:22px 28px 0 28px;"">");

        // Draw header with its grand total (suppressed in single-draw mode,
        // where the header band already names the lottery).
        if (showHeader)
        {
            sb.Append($@"
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
    <tr>
      <td width=""32"" valign=""middle"" style=""padding-right:10px;"">{LogoBadge(draw.LogoUrl, draw.Color, draw.Abbreviation, 30)}</td>
      <td valign=""middle"" style=""font-size:17px;font-weight:700;color:{Ink};"">{Esc(draw.DrawName)}</td>
      <td align=""right"" valign=""middle"" style=""font-size:15px;font-weight:700;color:{BrandDark};"">{Fmt(draw.Total)}</td>
    </tr>
  </table>");
        }

        // Bar chart: bet-type totals within this draw (quick visual scan).
        var maxType = draw.BetTypes.Count > 0 ? draw.BetTypes.Max(b => b.Total) : 0m;
        if (maxType > 0)
        {
            sb.Append($@"<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-top:{(showHeader ? 12 : 4)}px;"">");
            foreach (var bt in draw.BetTypes.OrderByDescending(b => b.Total))
            {
                var pct = maxType > 0 ? (int)Math.Round((double)(bt.Total / maxType) * 100) : 0;
                if (pct < 2) pct = 2;
                sb.Append($@"
    <tr>
      <td width=""38%"" style=""font-size:12px;color:{Muted};padding:3px 8px 3px 0;text-align:right;white-space:nowrap;"">{Esc(bt.Name)}</td>
      <td width=""44%"" style=""padding:3px 0;"">
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0""><tr>
          <td style=""background-color:{Brand};height:14px;width:{pct}%;border-radius:7px;font-size:0;line-height:0;"">&nbsp;</td>
          <td>&nbsp;</td>
        </tr></table>
      </td>
      <td width=""18%"" style=""font-size:12px;font-weight:600;color:{Ink};padding:3px 0 3px 8px;text-align:right;white-space:nowrap;"">{Fmt(bt.Total)}</td>
    </tr>");
            }
            sb.Append(@"</table>");
        }

        sb.Append(@"</td></tr>");

        // Detailed (number, amount) grid per bet type.
        foreach (var bt in draw.BetTypes)
        {
            sb.Append(BuildBetTypeTable(draw.DrawName, bt));
        }

        return sb.ToString();
    }

    private static string BuildBetTypeTable(string drawName, ReportBetType bt)
    {
        var sb = new StringBuilder(2048);

        sb.Append($@"
<tr><td style=""padding:14px 28px 0 28px;"">
  <div style=""font-size:13px;font-weight:600;color:{BrandDark};background-color:{SoftBg};padding:6px 10px;border-radius:6px;"">{Esc(bt.Name)} — {Esc(drawName)}</div>
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin-top:6px;border-collapse:collapse;font-size:13px;"">");

        // Render plays in 3 (number, amount) pairs per row, like the PDF.
        var plays = bt.Plays;
        const int cols = 3;
        for (var i = 0; i < plays.Count; i += cols)
        {
            sb.Append("<tr>");
            for (var c = 0; c < cols; c++)
            {
                var idx = i + c;
                if (idx < plays.Count)
                {
                    var p = plays[idx];
                    sb.Append($@"
      <td width=""18%"" style=""padding:5px 6px;border-bottom:1px solid {Line};color:{Ink};font-weight:600;"">{Esc(FormatBetNumber(bt.Code, p.BetNumber))}</td>
      <td width=""15%"" style=""padding:5px 6px;border-bottom:1px solid {Line};color:{Muted};text-align:right;"">{Fmt(p.Amount)}</td>");
                }
                else
                {
                    sb.Append($@"<td width=""18%"" style=""border-bottom:1px solid {Line};""></td><td width=""15%"" style=""border-bottom:1px solid {Line};""></td>");
                }
            }
            sb.Append("</tr>");
        }

        // Per-type total row.
        sb.Append($@"
    <tr>
      <td colspan=""5"" style=""padding:7px 6px;text-align:right;font-weight:700;color:{Muted};"">TOTAL</td>
      <td style=""padding:7px 6px;text-align:right;font-weight:700;color:{BrandDark};background-color:{SoftBg};"">{Fmt(bt.Total)}</td>
    </tr>
  </table>
</td></tr>");

        return sb.ToString();
    }
}
