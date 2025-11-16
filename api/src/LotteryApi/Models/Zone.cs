using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("zones")]
public class Zone
{
    [Key]
    [Column("zone_id")]
    public int ZoneId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("zone_name")]
    public string ZoneName { get; set; } = string.Empty;

    [Column("country_id")]
    public int? CountryId { get; set; }

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

    // Navigation properties
    [ForeignKey("CountryId")]
    public virtual Country? Country { get; set; }

    public virtual ICollection<BettingPool> BettingPools { get; set; } = new List<BettingPool>();
    public virtual ICollection<UserZone> UserZones { get; set; } = new List<UserZone>();
}
