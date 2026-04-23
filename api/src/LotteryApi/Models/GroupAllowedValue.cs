using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("group_allowed_values")]
public class GroupAllowedValue
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("game_type")]
    public string GameType { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("field_key")]
    public string FieldKey { get; set; } = string.Empty;

    [Column("value", TypeName = "decimal(10,2)")]
    public decimal Value { get; set; }

    [Column("display_order")]
    public int DisplayOrder { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }
}
