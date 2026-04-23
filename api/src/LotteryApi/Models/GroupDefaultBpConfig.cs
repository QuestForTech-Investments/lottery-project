using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("group_default_bp_config")]
public class GroupDefaultBpConfig
{
    [Key]
    [MaxLength(50)]
    [Column("config_key")]
    public string ConfigKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [Column("config_value")]
    public string ConfigValue { get; set; } = string.Empty;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }
}
