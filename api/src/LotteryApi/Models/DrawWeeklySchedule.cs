using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("draw_weekly_schedules")]
public class DrawWeeklySchedule
{
    [Key]
    [Column("schedule_id")]
    public int ScheduleId { get; set; }

    [Required]
    [Column("draw_id")]
    public int DrawId { get; set; }

    [Required]
    [Column("day_of_week")]
    public byte DayOfWeek { get; set; } // 0=Sunday, 1=Monday, ..., 6=Saturday

    [Required]
    [Column("start_time")]
    public TimeSpan StartTime { get; set; }

    [Required]
    [Column("end_time")]
    public TimeSpan EndTime { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Audit fields
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public int? DeletedBy { get; set; }

    // Navigation property
    [ForeignKey("DrawId")]
    public Draw? Draw { get; set; }
}
