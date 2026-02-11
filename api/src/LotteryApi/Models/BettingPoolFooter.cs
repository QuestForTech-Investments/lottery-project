using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_footers")]
public class BettingPoolFooter
{
    [Key]
    [Column("footer_id")]
    public int FooterId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("auto_footer")]
    public bool AutoFooter { get; set; } = false;

    [MaxLength(30)]
    [Column("footer_line_1")]
    public string? FooterLine1 { get; set; }

    [MaxLength(30)]
    [Column("footer_line_2")]
    public string? FooterLine2 { get; set; }

    [MaxLength(30)]
    [Column("footer_line_3")]
    public string? FooterLine3 { get; set; }

    [MaxLength(30)]
    [Column("footer_line_4")]
    public string? FooterLine4 { get; set; }

    [MaxLength(30)]
    [Column("footer_line_5")]
    public string? FooterLine5 { get; set; }

    [MaxLength(30)]
    [Column("footer_line_6")]
    public string? FooterLine6 { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
