using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("accountable_entities")]
public class AccountableEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("entity_id")]
    public int EntityId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("entity_name")]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("entity_code")]
    public string EntityCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("entity_type")]
    public string EntityType { get; set; } = "Banco";

    [Column("zone_id")]
    public int? ZoneId { get; set; }

    [Column("current_balance", TypeName = "decimal(12,2)")]
    public decimal CurrentBalance { get; set; } = 0.00m;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }
}
