using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class TransactionGroupDto
{
    public int GroupId { get; set; }
    public string GroupNumber { get; set; } = string.Empty;
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public string? Notes { get; set; }
    public bool IsAutomatic { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public string? Entities { get; set; }
    public List<TransactionGroupLineDto> Lines { get; set; } = new();
}

public class TransactionGroupLineDto
{
    public int LineId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public string Entity1Type { get; set; } = string.Empty;
    public int Entity1Id { get; set; }
    public string Entity1Name { get; set; } = string.Empty;
    public string Entity1Code { get; set; } = string.Empty;
    public decimal Entity1InitialBalance { get; set; }
    public decimal Entity1FinalBalance { get; set; }
    public string? Entity2Type { get; set; }
    public int? Entity2Id { get; set; }
    public string? Entity2Name { get; set; }
    public string? Entity2Code { get; set; }
    public decimal Entity2InitialBalance { get; set; }
    public decimal Entity2FinalBalance { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? ExpenseCategory { get; set; }
    public string? Notes { get; set; }
    public bool ShowInBanca { get; set; }
}

// Flat line view for the transactions report (includes group-level info)
public class TransactionLineReportDto
{
    public int LineId { get; set; }
    public int GroupId { get; set; }
    public string GroupNumber { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public string Entity1Name { get; set; } = string.Empty;
    public string Entity1Code { get; set; } = string.Empty;
    public string? Entity2Name { get; set; }
    public string? Entity2Code { get; set; }
    public decimal Entity1InitialBalance { get; set; }
    public decimal Entity2InitialBalance { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal Entity1FinalBalance { get; set; }
    public decimal Entity2FinalBalance { get; set; }
    public string? Notes { get; set; }
}

public class CreateTransactionGroupDto
{
    public int? ZoneId { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Required(ErrorMessage = "Las líneas son requeridas")]
    [MinLength(1, ErrorMessage = "Debe incluir al menos una línea")]
    public List<CreateTransactionGroupLineDto> Lines { get; set; } = new();
}

public class CreateTransactionGroupLineDto
{
    [Required]
    public string TransactionType { get; set; } = string.Empty;

    [Required]
    public string Entity1Type { get; set; } = string.Empty;

    public int Entity1Id { get; set; }

    [Required]
    public string Entity1Name { get; set; } = string.Empty;

    [Required]
    public string Entity1Code { get; set; } = string.Empty;

    public decimal Entity1InitialBalance { get; set; }
    public decimal Entity1FinalBalance { get; set; }

    public string? Entity2Type { get; set; }
    public int? Entity2Id { get; set; }
    public string? Entity2Name { get; set; }
    public string? Entity2Code { get; set; }
    public decimal Entity2InitialBalance { get; set; }
    public decimal Entity2FinalBalance { get; set; }

    public decimal Debit { get; set; }
    public decimal Credit { get; set; }

    public string? ExpenseCategory { get; set; }
    public string? Notes { get; set; }
    public bool ShowInBanca { get; set; }
}
