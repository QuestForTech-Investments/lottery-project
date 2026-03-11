using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class LoanDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public decimal InstallmentAmount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public int? PaymentDay { get; set; }
    public DateTime StartDate { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public List<LoanPaymentDto> Payments { get; set; } = new();
}

public class LoanListDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public decimal InstallmentAmount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public int? PaymentDay { get; set; }
    public DateTime StartDate { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public int PaymentCount { get; set; }
}

public class CreateLoanDto
{
    [Required]
    public string EntityType { get; set; } = "bettingPool";

    [Required]
    public int EntityId { get; set; }

    [Required]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    public string EntityCode { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
    public decimal PrincipalAmount { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cuota debe ser mayor a 0")]
    public decimal InstallmentAmount { get; set; }

    [Required]
    public string Frequency { get; set; } = string.Empty;

    public int? PaymentDay { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Range(0, 100)]
    public decimal InterestRate { get; set; } = 0;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class LoanPaymentDto
{
    public int PaymentId { get; set; }
    public int LoanId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal AmountPaid { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedByName { get; set; }
}

public class UpdateLoanDto
{
    [Range(0.01, double.MaxValue, ErrorMessage = "La cuota debe ser mayor a 0")]
    public decimal? InstallmentAmount { get; set; }

    public string? Frequency { get; set; }

    public int? PaymentDay { get; set; }

    [Range(0, 100)]
    public decimal? InterestRate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class CreateLoanPaymentDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
    public decimal AmountPaid { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
