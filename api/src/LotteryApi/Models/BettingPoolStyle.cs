using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_styles")]
public class BettingPoolStyle
{
    [Key]
    [Column("style_id")]
    public int StyleId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [MaxLength(50)]
    [Column("sales_point_style")]
    public string SalesPointStyle { get; set; } = "Estilo 1";

    [MaxLength(50)]
    [Column("print_style")]
    public string PrintStyle { get; set; } = "Original";

    [Column("ticket_colors")]
    public string? TicketColors { get; set; }

    [MaxLength(255)]
    [Column("custom_logo")]
    public string? CustomLogo { get; set; }

    [Column("font_settings")]
    public string? FontSettings { get; set; }

    [Column("layout_config")]
    public string? LayoutConfig { get; set; }

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
