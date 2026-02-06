using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Represents a selected hot number (numero caliente) in the system.
/// Hot numbers are numbers 0-99 that are marked for special limit handling.
/// </summary>
[Table("hot_number_selections")]
public class HotNumber
{
    [Key]
    [Column("selection_id")]
    public int HotNumberId { get; set; }

    /// <summary>
    /// The number value (0-99)
    /// </summary>
    [Column("number")]
    [Range(0, 99, ErrorMessage = "Number must be between 0 and 99")]
    public int Number { get; set; }

    /// <summary>
    /// Whether this hot number is currently active
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
}
