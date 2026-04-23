using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("group_footer_defaults")]
public class GroupFooterDefault
{
    [Key]
    [Column("line_number")]
    public int LineNumber { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("line_text")]
    public string LineText { get; set; } = string.Empty;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }
}
