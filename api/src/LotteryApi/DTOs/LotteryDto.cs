namespace LotteryApi.DTOs;

public class LotteryDto
{
    public int LotteryId { get; set; }
    public int CountryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? LotteryType { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string? Color { get; set; }
    public string? CountryName { get; set; }
    public string? ImageUrl { get; set; }
}

public class CreateLotteryDto
{
    public int CountryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? LotteryType { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
}

public class UpdateLotteryDto
{
    public string LotteryName { get; set; } = string.Empty;
    public string? LotteryType { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string? Color { get; set; }
}
