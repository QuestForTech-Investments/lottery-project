namespace LotteryApi.DTOs;

public class DrawDto
{
    public int DrawId { get; set; }
    public int LotteryId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public TimeSpan DrawTime { get; set; }
    public string? Description { get; set; }
    public string? Abbreviation { get; set; }
    public string? DisplayColor { get; set; }
    public string? ImageUrl { get; set; }  // Keep for backward compatibility, maps to LotteryImageUrl
    public string? LotteryImageUrl { get; set; }  // Image URL from lottery
    public bool IsActive { get; set; }
    public string? LotteryName { get; set; }
    public string? LotteryColour { get; set; }
    public string? CountryName { get; set; }
}

public class CreateDrawDto
{
    public int LotteryId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public TimeSpan DrawTime { get; set; }
    public string? Description { get; set; }
    public string? Abbreviation { get; set; }
    public string? DisplayColor { get; set; }
}

public class UpdateDrawDto
{
    public string DrawName { get; set; } = string.Empty;
    public TimeSpan DrawTime { get; set; }
    public string? Description { get; set; }
    public string? Abbreviation { get; set; }
    public string? DisplayColor { get; set; }
    public bool IsActive { get; set; }
}
