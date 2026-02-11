using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class ContactDto
{
    public int ContactId { get; set; }
    public int BettingPoolId { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? TelegramChatId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateContactDto
{
    [Required(ErrorMessage = "El ID de la banca es requerido")]
    public int BettingPoolId { get; set; }

    [Required(ErrorMessage = "El nombre del contacto es requerido")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string ContactName { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Phone { get; set; }

    [MaxLength(50, ErrorMessage = "El Telegram Chat ID no puede exceder 50 caracteres")]
    public string? TelegramChatId { get; set; }
}

public class UpdateContactDto
{
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
    public string? ContactName { get; set; }

    [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Phone { get; set; }

    [MaxLength(50, ErrorMessage = "El Telegram Chat ID no puede exceder 50 caracteres")]
    public string? TelegramChatId { get; set; }
}
