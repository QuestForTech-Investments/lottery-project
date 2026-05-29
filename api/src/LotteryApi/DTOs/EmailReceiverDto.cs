using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>Public-facing read DTO returned from the receivers API.</summary>
public class EmailReceiverDto
{
    public int EmailReceiverId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Zones this receiver is subscribed to. Always returned so the
    /// list page can render the count without an extra request.</summary>
    public List<EmailReceiverZoneDto> Zones { get; set; } = new();
}

public class EmailReceiverZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
}

public class CreateEmailReceiverDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(150, ErrorMessage = "El nombre no puede exceder 150 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es requerido")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de notificación es requerido")]
    [StringLength(50)]
    public string NotificationType { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    /// <summary>IDs of zones to subscribe to. May be empty if the receiver is
    /// being created without zones yet (admin can edit later).</summary>
    public List<int> ZoneIds { get; set; } = new();
}

public class UpdateEmailReceiverDto
{
    [StringLength(150)]
    public string? Name { get; set; }

    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; set; }

    [StringLength(50)]
    public string? NotificationType { get; set; }

    public bool? IsActive { get; set; }

    /// <summary>If provided, replaces the entire zone set for this receiver
    /// (full sync). If null, zones are left untouched.</summary>
    public List<int>? ZoneIds { get; set; }
}
