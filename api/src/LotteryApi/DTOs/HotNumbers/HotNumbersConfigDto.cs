namespace LotteryApi.DTOs.HotNumbers;

/// <summary>
/// DTO for hot numbers configuration (selected numbers)
/// </summary>
public class HotNumbersConfigDto
{
    /// <summary>
    /// List of selected hot numbers (0-99)
    /// </summary>
    public List<int> SelectedNumbers { get; set; } = new();
}

/// <summary>
/// DTO for updating hot numbers selection
/// </summary>
public class UpdateHotNumbersDto
{
    /// <summary>
    /// List of numbers to mark as hot (0-99)
    /// </summary>
    public List<int> SelectedNumbers { get; set; } = new();
}
