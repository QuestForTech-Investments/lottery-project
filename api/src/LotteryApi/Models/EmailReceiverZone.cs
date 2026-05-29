using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Junction table linking an email receiver to the zones whose betting
/// pools should be included in the automated report.
/// </summary>
[Table("email_receiver_zones")]
public class EmailReceiverZone
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("email_receiver_zone_id")]
    public int EmailReceiverZoneId { get; set; }

    [Column("email_receiver_id")]
    public int EmailReceiverId { get; set; }

    [Column("zone_id")]
    public int ZoneId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("EmailReceiverId")]
    public virtual EmailReceiver? EmailReceiver { get; set; }

    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }
}
