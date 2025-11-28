using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class SalesReportFilterDto
{
    [Required(ErrorMessage = "La fecha de inicio es requerida")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "La fecha de fin es requerida")]
    public DateTime EndDate { get; set; }

    public List<int>? DrawIds { get; set; }

    public List<int>? ZoneIds { get; set; }
}
