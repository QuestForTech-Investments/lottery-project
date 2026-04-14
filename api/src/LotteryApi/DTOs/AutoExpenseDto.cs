namespace LotteryApi.DTOs;

public class AutoExpenseDto
{
    public int? ExpenseId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public int? DayOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SaveAutoExpensesRequest
{
    public List<AutoExpenseDto> Expenses { get; set; } = new();
}
