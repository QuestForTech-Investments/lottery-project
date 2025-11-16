using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("results")]
public class Result
{
    [Key]
    [Column("result_id")]
    public int ResultId { get; set; }

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("winning_number")]
    public string WinningNumber { get; set; } = string.Empty;

    [MaxLength(10)]
    [Column("additional_number")]
    public string? AdditionalNumber { get; set; }

    [Column("position")]
    public int? Position { get; set; }

    [Required]
    [Column("result_date")]
    public DateTime ResultDate { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("approved_by")]
    public int? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    // Navigation properties
    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    public virtual ICollection<Prize> Prizes { get; set; } = new List<Prize>();
}
