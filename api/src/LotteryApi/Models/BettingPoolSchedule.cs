using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_schedules")]
public class BettingPoolSchedule
{
    [Key]
    [Column("schedule_id")]
    public int ScheduleId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("day_of_week")]
    public int DayOfWeek { get; set; }

    [Column("opening_time")]
    public TimeSpan? OpeningTime { get; set; }

    [Column("closing_time")]
    public TimeSpan? ClosingTime { get; set; }

    [Column("close_time")]
    public TimeSpan? CloseTime { get; set; }

    [Column("draw_time")]
    public TimeSpan? DrawTime { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

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
