using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Entity for storing automatic limit configuration
/// </summary>
[Table("automatic_limit_configs")]
public class AutomaticLimitConfig
{
    [Key]
    [Column("config_id")]
    public int ConfigId { get; set; }

    /// <summary>
    /// Type of configuration: "general" for general number controls, "line" for line controls
    /// </summary>
    [Column("config_type")]
    [Required]
    [MaxLength(50)]
    public string ConfigType { get; set; } = string.Empty;

    /// <summary>
    /// Enable Directo limits
    /// </summary>
    [Column("enable_directo")]
    public bool EnableDirecto { get; set; }

    /// <summary>
    /// Amount for Directo limits
    /// </summary>
    [Column("monto_directo")]
    public decimal MontoDirecto { get; set; }

    /// <summary>
    /// Enable Pale limits
    /// </summary>
    [Column("enable_pale")]
    public bool EnablePale { get; set; }

    /// <summary>
    /// Amount for Pale limits
    /// </summary>
    [Column("monto_pale")]
    public decimal MontoPale { get; set; }

    /// <summary>
    /// Enable Super Pale limits
    /// </summary>
    [Column("enable_super_pale")]
    public bool EnableSuperPale { get; set; }

    /// <summary>
    /// Amount for Super Pale limits
    /// </summary>
    [Column("monto_super_pale")]
    public decimal MontoSuperPale { get; set; }

    /// <summary>
    /// Created timestamp
    /// </summary>
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Updated timestamp
    /// </summary>
    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Entity for storing random block configuration
/// </summary>
[Table("random_block_configs")]
public class RandomBlockConfig
{
    [Key]
    [Column("config_id")]
    public int ConfigId { get; set; }

    /// <summary>
    /// Draw IDs for random block (stored as comma-separated string)
    /// </summary>
    [Column("draw_ids")]
    [MaxLength(500)]
    public string? DrawIdsJson { get; set; }

    /// <summary>
    /// Optional betting pool ID for random block
    /// </summary>
    [Column("betting_pool_id")]
    public int? BettingPoolId { get; set; }

    /// <summary>
    /// Number of pales to block randomly
    /// </summary>
    [Column("pales_to_block")]
    public int PalesToBlock { get; set; }

    /// <summary>
    /// Created timestamp
    /// </summary>
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Updated timestamp
    /// </summary>
    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    // Helper methods for DrawIds
    [NotMapped]
    public List<int> DrawIds
    {
        get
        {
            if (string.IsNullOrEmpty(DrawIdsJson))
                return new List<int>();

            return DrawIdsJson.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out var id) ? id : 0)
                .Where(id => id > 0)
                .ToList();
        }
        set
        {
            DrawIdsJson = value != null && value.Count > 0
                ? string.Join(",", value)
                : null;
        }
    }
}
