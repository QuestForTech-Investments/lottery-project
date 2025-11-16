using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("countries")]
public class Country
{
    [Key]
    [Column("country_id")]
    public int CountryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("country_name")]
    public string CountryName { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)]
    [Column("country_code")]
    public string CountryCode { get; set; } = string.Empty;

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
    public virtual ICollection<Lottery> Lotteries { get; set; } = new List<Lottery>();
    public virtual ICollection<Zone> Zones { get; set; } = new List<Zone>();
}
