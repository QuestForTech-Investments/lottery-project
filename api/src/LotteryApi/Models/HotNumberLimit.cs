using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Represents a limit configuration for hot numbers.
/// Defines the maximum bet amounts for different game types when hot numbers are involved.
/// </summary>
[Table("hot_number_limits")]
public class HotNumberLimit
{
    [Key]
    [Column("hot_number_limit_id")]
    public int HotNumberLimitId { get; set; }

    /// <summary>
    /// Comma-separated list of draw IDs this limit applies to.
    /// Stored as a string for flexibility, parsed when needed.
    /// </summary>
    [MaxLength(500)]
    [Column("draw_ids")]
    public string? DrawIds { get; set; }

    /// <summary>
    /// Maximum bet amount for Directo when hot number is involved
    /// </summary>
    [Column("directo", TypeName = "decimal(18,2)")]
    public decimal Directo { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 1 number is hot
    /// </summary>
    [Column("pale_1_caliente", TypeName = "decimal(18,2)")]
    public decimal Pale1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 2 numbers are hot
    /// </summary>
    [Column("pale_2_caliente", TypeName = "decimal(18,2)")]
    public decimal Pale2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 1 number is hot
    /// </summary>
    [Column("tripleta_1_caliente", TypeName = "decimal(18,2)")]
    public decimal Tripleta1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 2 numbers are hot
    /// </summary>
    [Column("tripleta_2_caliente", TypeName = "decimal(18,2)")]
    public decimal Tripleta2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 3 numbers are hot
    /// </summary>
    [Column("tripleta_3_caliente", TypeName = "decimal(18,2)")]
    public decimal Tripleta3Caliente { get; set; }

    /// <summary>
    /// Whether this limit is currently active
    /// </summary>
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Helper methods for DrawIds conversion
    [NotMapped]
    public List<int> DrawIdList
    {
        get
        {
            if (string.IsNullOrEmpty(DrawIds))
                return new List<int>();

            return DrawIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out int id) ? id : 0)
                .Where(id => id > 0)
                .ToList();
        }
        set
        {
            DrawIds = value != null && value.Count > 0
                ? string.Join(",", value)
                : null;
        }
    }
}
