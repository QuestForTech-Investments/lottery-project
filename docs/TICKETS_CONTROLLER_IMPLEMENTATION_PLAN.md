# Tickets Controller Implementation Plan

**Fecha:** 2025-11-19
**Propósito:** Implementar endpoints de tickets en la API .NET siguiendo los patrones del proyecto

---

## 📋 Resumen

Esta propuesta documenta la implementación completa del módulo de tickets para la API .NET, replicando la funcionalidad de la aplicación Vue.js original (`POST /api/v1/tickets` y `GET /api/v1/tickets/params/create`).

### Modelos Existentes

✅ **Ya existen en la base de datos:**
- `api/src/LotteryApi/Models/Ticket.cs` (175 líneas, 40+ propiedades)
- `api/src/LotteryApi/Models/TicketLine.cs` (152 líneas, 30+ propiedades)
- DbContext ya tiene configurado `DbSet<Ticket>` y `DbSet<TicketLine>`

### Endpoints a Implementar

1. **GET** `/api/tickets/params/create` - Parámetros para crear ticket
2. **POST** `/api/tickets` - Crear nuevo ticket
3. **GET** `/api/tickets` - Lista de tickets (paginada)
4. **GET** `/api/tickets/{id}` - Detalle de ticket
5. **PATCH** `/api/tickets/{id}/cancel` - Cancelar ticket
6. **PATCH** `/api/tickets/{id}/pay` - Pagar premio

---

## 🎯 1. DTOs (Data Transfer Objects)

### Archivo: `api/src/LotteryApi/DTOs/TicketDto.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO for ticket list view
/// </summary>
public class TicketListDto
{
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public int UserId { get; set; }
    public string? Username { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalLines { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal TotalPrize { get; set; }
    public int WinningLines { get; set; }
    public string Status { get; set; } = "pending";
    public bool IsCancelled { get; set; }
    public bool IsPaid { get; set; }
    public string? CustomerName { get; set; }
    public string CurrencyCode { get; set; } = "DOP";
}

/// <summary>
/// DTO for ticket detail view
/// </summary>
public class TicketDetailDto
{
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public int UserId { get; set; }
    public string? Username { get; set; }
    public string? TerminalId { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal GlobalMultiplier { get; set; }
    public decimal GlobalDiscount { get; set; }
    public string CurrencyCode { get; set; } = "DOP";
    public int TotalLines { get; set; }
    public decimal TotalBetAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal TotalSubtotal { get; set; }
    public decimal TotalWithMultiplier { get; set; }
    public decimal TotalCommission { get; set; }
    public decimal TotalNet { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal TotalPrize { get; set; }
    public int WinningLines { get; set; }
    public string Status { get; set; } = "pending";
    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public int? CancelledBy { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public int? PaidBy { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerIdNumber { get; set; }
    public string? LotteryIds { get; set; }
    public int TotalLotteries { get; set; }
    public DateTime? EarliestDrawTime { get; set; }
    public DateTime? LatestDrawTime { get; set; }
    public int PrintCount { get; set; }
    public DateTime? LastPrintedAt { get; set; }
    public string? Notes { get; set; }
    public List<TicketLineDto> Lines { get; set; } = new();
}

/// <summary>
/// DTO for ticket line detail
/// </summary>
public class TicketLineDto
{
    public long LineId { get; set; }
    public long TicketId { get; set; }
    public int LineNumber { get; set; }
    public int LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public int DrawId { get; set; }
    public string? DrawName { get; set; }
    public DateTime DrawDate { get; set; }
    public TimeSpan DrawTime { get; set; }
    public string BetNumber { get; set; } = string.Empty;
    public int BetTypeId { get; set; }
    public string? BetTypeCode { get; set; }
    public string? BetTypeName { get; set; }
    public int? Position { get; set; }
    public decimal BetAmount { get; set; }
    public decimal Multiplier { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalWithMultiplier { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal? PrizeMultiplier { get; set; }
    public decimal PrizeAmount { get; set; }
    public bool IsWinner { get; set; }
    public int? WinningPosition { get; set; }
    public string? ResultNumber { get; set; }
    public DateTime? ResultCheckedAt { get; set; }
    public string LineStatus { get; set; } = "pending";
    public bool ExceedsLimit { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for creating a new ticket
/// </summary>
public class CreateTicketDto
{
    [Required(ErrorMessage = "El ID de la banca es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una banca válida")]
    public int BettingPoolId { get; set; }

    [Required(ErrorMessage = "El ID del usuario es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un usuario válido")]
    public int UserId { get; set; }

    [MaxLength(20, ErrorMessage = "El ID del terminal no puede exceder 20 caracteres")]
    public string? TerminalId { get; set; }

    [MaxLength(45, ErrorMessage = "La dirección IP no puede exceder 45 caracteres")]
    public string? IpAddress { get; set; }

    [Range(0.01, 100, ErrorMessage = "El multiplicador global debe estar entre 0.01 y 100")]
    public decimal GlobalMultiplier { get; set; } = 1.00m;

    [Range(0, 99.99, ErrorMessage = "El descuento global debe estar entre 0 y 99.99")]
    public decimal GlobalDiscount { get; set; } = 0.00m;

    [MaxLength(3, ErrorMessage = "El código de moneda debe ser de 3 caracteres")]
    public string CurrencyCode { get; set; } = "DOP";

    [MaxLength(100, ErrorMessage = "El nombre del cliente no puede exceder 100 caracteres")]
    public string? CustomerName { get; set; }

    [MaxLength(20, ErrorMessage = "El teléfono del cliente no puede exceder 20 caracteres")]
    public string? CustomerPhone { get; set; }

    [MaxLength(100, ErrorMessage = "El email del cliente no puede exceder 100 caracteres")]
    [EmailAddress(ErrorMessage = "El email no tiene un formato válido")]
    public string? CustomerEmail { get; set; }

    [MaxLength(50, ErrorMessage = "El número de identificación del cliente no puede exceder 50 caracteres")]
    public string? CustomerIdNumber { get; set; }

    [MaxLength(500, ErrorMessage = "Las notas no pueden exceder 500 caracteres")]
    public string? Notes { get; set; }

    [Required(ErrorMessage = "Debe agregar al menos una línea al ticket")]
    [MinLength(1, ErrorMessage = "Debe agregar al menos una línea al ticket")]
    public List<CreateTicketLineDto> Lines { get; set; } = new();
}

/// <summary>
/// DTO for creating a ticket line
/// </summary>
public class CreateTicketLineDto
{
    [Required(ErrorMessage = "El ID de la lotería es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una lotería válida")]
    public int LotteryId { get; set; }

    [Required(ErrorMessage = "El ID del sorteo es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un sorteo válido")]
    public int DrawId { get; set; }

    [Required(ErrorMessage = "El número apostado es requerido")]
    [MaxLength(20, ErrorMessage = "El número apostado no puede exceder 20 caracteres")]
    public string BetNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de apuesta es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un tipo de apuesta válido")]
    public int BetTypeId { get; set; }

    [MaxLength(50, ErrorMessage = "El código del tipo de apuesta no puede exceder 50 caracteres")]
    public string? BetTypeCode { get; set; }

    [Range(1, 10, ErrorMessage = "La posición debe estar entre 1 y 10")]
    public int? Position { get; set; }

    [Required(ErrorMessage = "El monto de la apuesta es requerido")]
    [Range(0.01, 999999.99, ErrorMessage = "El monto de la apuesta debe estar entre 0.01 y 999999.99")]
    public decimal BetAmount { get; set; }

    [Range(0.01, 100, ErrorMessage = "El multiplicador debe estar entre 0.01 y 100")]
    public decimal Multiplier { get; set; } = 1.00m;

    [Range(0, 99.99, ErrorMessage = "El porcentaje de descuento debe estar entre 0 y 99.99")]
    public decimal DiscountPercentage { get; set; } = 0.00m;

    [MaxLength(500, ErrorMessage = "Las notas no pueden exceder 500 caracteres")]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for cancelling a ticket
/// </summary>
public class CancelTicketDto
{
    [Required(ErrorMessage = "La razón de cancelación es requerida")]
    [MaxLength(200, ErrorMessage = "La razón de cancelación no puede exceder 200 caracteres")]
    public string CancellationReason { get; set; } = string.Empty;

    [Required(ErrorMessage = "El ID del usuario que cancela es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe proporcionar un ID de usuario válido")]
    public int CancelledBy { get; set; }
}

/// <summary>
/// DTO for paying a ticket prize
/// </summary>
public class PayTicketDto
{
    [Required(ErrorMessage = "El método de pago es requerido")]
    [MaxLength(50, ErrorMessage = "El método de pago no puede exceder 50 caracteres")]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "La referencia de pago no puede exceder 100 caracteres")]
    public string? PaymentReference { get; set; }

    [Required(ErrorMessage = "El ID del usuario que paga es requerido")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe proporcionar un ID de usuario válido")]
    public int PaidBy { get; set; }
}

/// <summary>
/// DTO for ticket creation parameters (draws, bet types, etc.)
/// </summary>
public class TicketCreationParamsDto
{
    public List<DrawParamDto> Draws { get; set; } = new();
    public List<BetTypeParamDto> BetTypes { get; set; } = new();
    public TicketLimitsDto Limits { get; set; } = new();
}

/// <summary>
/// DTO for draw parameters
/// </summary>
public class DrawParamDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public DateTime DrawDate { get; set; }
    public TimeSpan DrawTime { get; set; }
    public DateTime? CutoffTime { get; set; }
    public bool IsActive { get; set; }
    public bool IsAvailable { get; set; }
}

/// <summary>
/// DTO for bet type parameters
/// </summary>
public class BetTypeParamDto
{
    public int BetTypeId { get; set; }
    public string BetTypeCode { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
    public int NumberLength { get; set; }
    public bool RequiresPosition { get; set; }
    public decimal MinBetAmount { get; set; }
    public decimal MaxBetAmount { get; set; }
}

/// <summary>
/// DTO for ticket limits
/// </summary>
public class TicketLimitsDto
{
    public decimal MinTicketAmount { get; set; } = 1.00m;
    public decimal MaxTicketAmount { get; set; } = 99999.99m;
    public int MaxLinesPerTicket { get; set; } = 100;
    public int CancelMinutes { get; set; } = 30;
    public bool AllowDuplicateNumbers { get; set; } = true;
}
```

---

## 🛡️ 2. Validators (FluentValidation)

### Archivo: `api/src/LotteryApi/Validators/CreateTicketDtoValidator.cs`

```csharp
using FluentValidation;
using LotteryApi.DTOs;

namespace LotteryApi.Validators;

public class CreateTicketDtoValidator : AbstractValidator<CreateTicketDto>
{
    public CreateTicketDtoValidator()
    {
        RuleFor(x => x.BettingPoolId)
            .NotEmpty().WithMessage("El ID de la banca es requerido")
            .GreaterThan(0).WithMessage("Debe seleccionar una banca válida");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("El ID del usuario es requerido")
            .GreaterThan(0).WithMessage("Debe seleccionar un usuario válido");

        RuleFor(x => x.GlobalMultiplier)
            .InclusiveBetween(0.01m, 100m).WithMessage("El multiplicador global debe estar entre 0.01 y 100");

        RuleFor(x => x.GlobalDiscount)
            .InclusiveBetween(0m, 99.99m).WithMessage("El descuento global debe estar entre 0 y 99.99");

        RuleFor(x => x.CurrencyCode)
            .NotEmpty().WithMessage("El código de moneda es requerido")
            .Length(3).WithMessage("El código de moneda debe ser de 3 caracteres")
            .Matches("^[A-Z]{3}$").WithMessage("El código de moneda debe ser 3 letras mayúsculas");

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("El email no tiene un formato válido")
            .When(x => !string.IsNullOrWhiteSpace(x.CustomerEmail));

        RuleFor(x => x.CustomerPhone)
            .Matches(@"^[\d\s\-\(\)\+]+$").WithMessage("El teléfono solo puede contener números y caracteres: + - ( ) espacios")
            .When(x => !string.IsNullOrWhiteSpace(x.CustomerPhone));

        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("Debe agregar al menos una línea al ticket")
            .Must(lines => lines != null && lines.Count > 0).WithMessage("Debe agregar al menos una línea al ticket")
            .Must(lines => lines != null && lines.Count <= 100).WithMessage("No puede agregar más de 100 líneas por ticket");

        RuleForEach(x => x.Lines).SetValidator(new CreateTicketLineDtoValidator());
    }
}

public class CreateTicketLineDtoValidator : AbstractValidator<CreateTicketLineDto>
{
    public CreateTicketLineDtoValidator()
    {
        RuleFor(x => x.LotteryId)
            .NotEmpty().WithMessage("El ID de la lotería es requerido")
            .GreaterThan(0).WithMessage("Debe seleccionar una lotería válida");

        RuleFor(x => x.DrawId)
            .NotEmpty().WithMessage("El ID del sorteo es requerido")
            .GreaterThan(0).WithMessage("Debe seleccionar un sorteo válido");

        RuleFor(x => x.BetNumber)
            .NotEmpty().WithMessage("El número apostado es requerido")
            .MaximumLength(20).WithMessage("El número apostado no puede exceder 20 caracteres")
            .Matches(@"^[\d\-]+$").WithMessage("El número apostado solo puede contener dígitos y guiones");

        RuleFor(x => x.BetTypeId)
            .NotEmpty().WithMessage("El tipo de apuesta es requerido")
            .GreaterThan(0).WithMessage("Debe seleccionar un tipo de apuesta válido");

        RuleFor(x => x.BetAmount)
            .NotEmpty().WithMessage("El monto de la apuesta es requerido")
            .GreaterThan(0).WithMessage("El monto de la apuesta debe ser mayor a 0")
            .InclusiveBetween(0.01m, 999999.99m).WithMessage("El monto de la apuesta debe estar entre 0.01 y 999999.99");

        RuleFor(x => x.Multiplier)
            .InclusiveBetween(0.01m, 100m).WithMessage("El multiplicador debe estar entre 0.01 y 100");

        RuleFor(x => x.DiscountPercentage)
            .InclusiveBetween(0m, 99.99m).WithMessage("El porcentaje de descuento debe estar entre 0 y 99.99");

        RuleFor(x => x.Position)
            .InclusiveBetween(1, 10).WithMessage("La posición debe estar entre 1 y 10")
            .When(x => x.Position.HasValue);
    }
}

public class CancelTicketDtoValidator : AbstractValidator<CancelTicketDto>
{
    public CancelTicketDtoValidator()
    {
        RuleFor(x => x.CancellationReason)
            .NotEmpty().WithMessage("La razón de cancelación es requerida")
            .MinimumLength(5).WithMessage("La razón de cancelación debe tener al menos 5 caracteres")
            .MaximumLength(200).WithMessage("La razón de cancelación no puede exceder 200 caracteres");

        RuleFor(x => x.CancelledBy)
            .NotEmpty().WithMessage("El ID del usuario que cancela es requerido")
            .GreaterThan(0).WithMessage("Debe proporcionar un ID de usuario válido");
    }
}

public class PayTicketDtoValidator : AbstractValidator<PayTicketDto>
{
    public PayTicketDtoValidator()
    {
        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("El método de pago es requerido")
            .MaximumLength(50).WithMessage("El método de pago no puede exceder 50 caracteres")
            .Must(method => new[] { "EFECTIVO", "TRANSFERENCIA", "CHEQUE", "OTRO" }.Contains(method))
            .WithMessage("El método de pago debe ser: EFECTIVO, TRANSFERENCIA, CHEQUE u OTRO");

        RuleFor(x => x.PaidBy)
            .NotEmpty().WithMessage("El ID del usuario que paga es requerido")
            .GreaterThan(0).WithMessage("Debe proporcionar un ID de usuario válido");
    }
}
```

---

## 🎮 3. TicketsController

### Archivo: `api/src/LotteryApi/Controllers/TicketsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(LotteryDbContext context, ILogger<TicketsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/tickets/params/create
    /// Get parameters needed to create a ticket (draws, bet types, limits)
    /// </summary>
    [HttpGet("params/create")]
    public async Task<ActionResult<TicketCreationParamsDto>> GetCreationParams(
        [FromQuery] int? bettingPoolId,
        [FromQuery] int? category)
    {
        try
        {
            var now = DateTime.Now;

            // Get available draws
            var drawsQuery = _context.Draws
                .Include(d => d.Lottery)
                .Where(d => d.IsActive);

            // Filter by category if provided (1 = Diaria, 2 = Lotería)
            if (category.HasValue)
            {
                drawsQuery = drawsQuery.Where(d => d.Lottery.Category == category.Value);
            }

            var draws = await drawsQuery
                .OrderBy(d => d.DrawTime)
                .Select(d => new DrawParamDto
                {
                    DrawId = d.DrawId,
                    DrawName = d.DrawName,
                    LotteryId = d.LotteryId,
                    LotteryName = d.Lottery.LotteryName,
                    DrawDate = d.DrawDate,
                    DrawTime = d.DrawTime,
                    CutoffTime = d.DrawTime.Add(TimeSpan.FromMinutes(-d.AnticipatedClosing ?? 0)),
                    IsActive = d.IsActive,
                    IsAvailable = d.DrawDate.Date >= now.Date // Check if draw is in the future
                })
                .ToListAsync();

            // Get available bet types
            var betTypes = await _context.GameTypes
                .Where(bt => bt.IsActive)
                .OrderBy(bt => bt.DisplayOrder)
                .Select(bt => new BetTypeParamDto
                {
                    BetTypeId = bt.GameTypeId,
                    BetTypeCode = bt.GameTypeCode,
                    BetTypeName = bt.GameName,
                    NumberLength = bt.NumberLength,
                    RequiresPosition = bt.RequiresAdditionalNumber,
                    MinBetAmount = 1.00m, // Default, could be configured per betting pool
                    MaxBetAmount = 99999.99m
                })
                .ToListAsync();

            // Get betting pool limits if bettingPoolId provided
            var limits = new TicketLimitsDto();
            if (bettingPoolId.HasValue)
            {
                var bettingPool = await _context.BettingPools
                    .FirstOrDefaultAsync(bp => bp.BettingPoolId == bettingPoolId.Value);

                if (bettingPool != null)
                {
                    limits.CancelMinutes = bettingPool.CancelMinutes ?? 30;
                    limits.MaxTicketAmount = bettingPool.MaxTicketAmount ?? 99999.99m;
                }
            }

            var result = new TicketCreationParamsDto
            {
                Draws = draws,
                BetTypes = betTypes,
                Limits = limits
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket creation parameters");
            return StatusCode(500, new { message = "Error al obtener parámetros de creación de ticket" });
        }
    }

    /// <summary>
    /// POST /api/tickets
    /// Create a new ticket
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TicketDetailDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Validate betting pool exists and is active
            var bettingPool = await _context.BettingPools
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == dto.BettingPoolId);

            if (bettingPool == null)
                return NotFound(new { message = "Banca no encontrada" });

            if (!bettingPool.IsActive)
                return BadRequest(new { message = "La banca no está activa" });

            // Validate user exists and is active
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == dto.UserId);

            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

            if (!user.IsActive)
                return BadRequest(new { message = "El usuario no está activo" });

            // Generate ticket code (format: YYYYMMDD-NNNN)
            var ticketCode = await GenerateTicketCodeAsync();

            // Create ticket entity
            var ticket = new Ticket
            {
                TicketCode = ticketCode,
                BettingPoolId = dto.BettingPoolId,
                UserId = dto.UserId,
                TerminalId = dto.TerminalId,
                IpAddress = dto.IpAddress ?? HttpContext.Connection.RemoteIpAddress?.ToString(),
                CreatedAt = DateTime.Now,
                GlobalMultiplier = dto.GlobalMultiplier,
                GlobalDiscount = dto.GlobalDiscount,
                CurrencyCode = dto.CurrencyCode,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                CustomerIdNumber = dto.CustomerIdNumber,
                Notes = dto.Notes,
                Status = "pending",
                TotalLines = dto.Lines.Count
            };

            // Initialize totals
            decimal totalBetAmount = 0;
            decimal totalDiscount = 0;
            decimal totalSubtotal = 0;
            decimal totalWithMultiplier = 0;
            decimal totalCommission = 0;
            decimal totalNet = 0;

            var lotteryIds = new HashSet<int>();
            DateTime? earliestDrawTime = null;
            DateTime? latestDrawTime = null;

            // Process each line
            int lineNumber = 1;
            foreach (var lineDto in dto.Lines)
            {
                // Validate draw exists and is active
                var draw = await _context.Draws
                    .Include(d => d.Lottery)
                    .FirstOrDefaultAsync(d => d.DrawId == lineDto.DrawId);

                if (draw == null)
                    return BadRequest(new { message = $"Sorteo {lineDto.DrawId} no encontrado" });

                if (!draw.IsActive)
                    return BadRequest(new { message = $"Sorteo {draw.DrawName} no está activo" });

                // Check cutoff time
                var cutoffTime = draw.DrawTime.Add(TimeSpan.FromMinutes(-(draw.AnticipatedClosing ?? 0)));
                var drawDateTime = draw.DrawDate.Date.Add(cutoffTime);
                if (DateTime.Now >= drawDateTime)
                    return BadRequest(new { message = $"Sorteo {draw.DrawName} ya cerró ventas" });

                // Validate bet type exists
                var betType = await _context.GameTypes
                    .FirstOrDefaultAsync(bt => bt.GameTypeId == lineDto.BetTypeId);

                if (betType == null)
                    return BadRequest(new { message = $"Tipo de apuesta {lineDto.BetTypeId} no encontrado" });

                // Calculate line amounts
                decimal lineSubtotal = lineDto.BetAmount;
                decimal lineDiscountAmount = lineSubtotal * (lineDto.DiscountPercentage / 100);
                decimal lineAfterDiscount = lineSubtotal - lineDiscountAmount;
                decimal lineWithMultiplier = lineAfterDiscount * lineDto.Multiplier;

                // Commission calculation (example: 10% - should come from betting pool config)
                decimal lineCommissionPercentage = 10.00m;
                decimal lineCommissionAmount = lineWithMultiplier * (lineCommissionPercentage / 100);
                decimal lineNetAmount = lineWithMultiplier - lineCommissionAmount;

                // Create ticket line
                var ticketLine = new TicketLine
                {
                    LineNumber = lineNumber++,
                    LotteryId = lineDto.LotteryId,
                    DrawId = lineDto.DrawId,
                    DrawDate = draw.DrawDate,
                    DrawTime = draw.DrawTime,
                    BetNumber = lineDto.BetNumber,
                    BetTypeId = lineDto.BetTypeId,
                    BetTypeCode = lineDto.BetTypeCode ?? betType.GameTypeCode,
                    Position = lineDto.Position,
                    BetAmount = lineDto.BetAmount,
                    Multiplier = lineDto.Multiplier,
                    DiscountPercentage = lineDto.DiscountPercentage,
                    DiscountAmount = lineDiscountAmount,
                    Subtotal = lineSubtotal,
                    TotalWithMultiplier = lineWithMultiplier,
                    CommissionPercentage = lineCommissionPercentage,
                    CommissionAmount = lineCommissionAmount,
                    NetAmount = lineNetAmount,
                    LineStatus = "pending",
                    CreatedAt = DateTime.Now,
                    Notes = lineDto.Notes
                };

                ticket.TicketLines.Add(ticketLine);

                // Accumulate totals
                totalBetAmount += lineSubtotal;
                totalDiscount += lineDiscountAmount;
                totalSubtotal += lineAfterDiscount;
                totalWithMultiplier += lineWithMultiplier;
                totalCommission += lineCommissionAmount;
                totalNet += lineNetAmount;

                // Track lotteries and draw times
                lotteryIds.Add(lineDto.LotteryId);
                var drawFullTime = draw.DrawDate.Date.Add(draw.DrawTime);
                if (earliestDrawTime == null || drawFullTime < earliestDrawTime)
                    earliestDrawTime = drawFullTime;
                if (latestDrawTime == null || drawFullTime > latestDrawTime)
                    latestDrawTime = drawFullTime;
            }

            // Set ticket totals
            ticket.TotalBetAmount = totalBetAmount;
            ticket.TotalDiscount = totalDiscount;
            ticket.TotalSubtotal = totalSubtotal;
            ticket.TotalWithMultiplier = totalWithMultiplier;
            ticket.TotalCommission = totalCommission;
            ticket.TotalNet = totalNet;
            ticket.GrandTotal = totalNet; // Grand total = net after commission
            ticket.LotteryIds = string.Join(",", lotteryIds);
            ticket.TotalLotteries = lotteryIds.Count;
            ticket.EarliestDrawTime = earliestDrawTime;
            ticket.LatestDrawTime = latestDrawTime;

            // Generate barcode (optional)
            ticket.Barcode = GenerateBarcode(ticketCode);

            // Save ticket
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Commit transaction
            await transaction.CommitAsync();

            _logger.LogInformation("Ticket {TicketCode} created successfully with {Lines} lines",
                ticketCode, dto.Lines.Count);

            // Return created ticket detail
            var createdTicket = await GetTicketDetailAsync(ticket.TicketId);
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.TicketId }, createdTicket);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating ticket");
            return StatusCode(500, new { message = "Error al crear el ticket", error = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/tickets
    /// Get paginated list of tickets
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<TicketListDto>>> GetTickets(
        [FromQuery] int? bettingPoolId,
        [FromQuery] int? userId,
        [FromQuery] string? status,
        [FromQuery] bool? isCancelled,
        [FromQuery] bool? isPaid,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.Tickets
                .Include(t => t.BettingPool)
                .Include(t => t.User)
                .AsQueryable();

            // Apply filters
            if (bettingPoolId.HasValue)
                query = query.Where(t => t.BettingPoolId == bettingPoolId.Value);

            if (userId.HasValue)
                query = query.Where(t => t.UserId == userId.Value);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(t => t.Status == status);

            if (isCancelled.HasValue)
                query = query.Where(t => t.IsCancelled == isCancelled.Value);

            if (isPaid.HasValue)
                query = query.Where(t => t.IsPaid == isPaid.Value);

            if (fromDate.HasValue)
                query = query.Where(t => t.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(t => t.CreatedAt <= toDate.Value.AddDays(1));

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(t =>
                    t.TicketCode.ToLower().Contains(search) ||
                    (t.CustomerName != null && t.CustomerName.ToLower().Contains(search)) ||
                    (t.Barcode != null && t.Barcode.ToLower().Contains(search))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Get paginated results
            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TicketListDto
                {
                    TicketId = t.TicketId,
                    TicketCode = t.TicketCode,
                    Barcode = t.Barcode,
                    BettingPoolId = t.BettingPoolId,
                    BettingPoolName = t.BettingPool != null ? t.BettingPool.BettingPoolName : null,
                    UserId = t.UserId,
                    Username = t.User != null ? t.User.Username : null,
                    CreatedAt = t.CreatedAt,
                    TotalLines = t.TotalLines,
                    GrandTotal = t.GrandTotal,
                    TotalPrize = t.TotalPrize,
                    WinningLines = t.WinningLines,
                    Status = t.Status,
                    IsCancelled = t.IsCancelled,
                    IsPaid = t.IsPaid,
                    CustomerName = t.CustomerName,
                    CurrencyCode = t.CurrencyCode
                })
                .ToListAsync();

            var response = new PagedResponse<TicketListDto>
            {
                Items = tickets,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tickets list");
            return StatusCode(500, new { message = "Error al obtener lista de tickets" });
        }
    }

    /// <summary>
    /// GET /api/tickets/{id}
    /// Get ticket detail by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicket(long id)
    {
        try
        {
            var ticket = await GetTicketDetailAsync(id);

            if (ticket == null)
                return NotFound(new { message = "Ticket no encontrado" });

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al obtener detalle del ticket" });
        }
    }

    /// <summary>
    /// PATCH /api/tickets/{id}/cancel
    /// Cancel a ticket
    /// </summary>
    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult> CancelTicket(long id, [FromBody] CancelTicketDto dto)
    {
        try
        {
            var ticket = await _context.Tickets
                .Include(t => t.BettingPool)
                .FirstOrDefaultAsync(t => t.TicketId == id);

            if (ticket == null)
                return NotFound(new { message = "Ticket no encontrado" });

            if (ticket.IsCancelled)
                return BadRequest(new { message = "El ticket ya está cancelado" });

            if (ticket.IsPaid)
                return BadRequest(new { message = "No se puede cancelar un ticket que ya fue pagado" });

            // Check cancellation time limit
            var cancelMinutes = ticket.BettingPool?.CancelMinutes ?? 30;
            var timeSinceCreation = DateTime.Now - ticket.CreatedAt;
            if (timeSinceCreation.TotalMinutes > cancelMinutes)
                return BadRequest(new { message = $"El tiempo límite para cancelar ({cancelMinutes} minutos) ha expirado" });

            // Cancel ticket
            ticket.IsCancelled = true;
            ticket.CancelledAt = DateTime.Now;
            ticket.CancelledBy = dto.CancelledBy;
            ticket.CancellationReason = dto.CancellationReason;
            ticket.Status = "cancelled";
            ticket.UpdatedAt = DateTime.Now;
            ticket.UpdatedBy = dto.CancelledBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Ticket {TicketCode} cancelled by user {UserId}",
                ticket.TicketCode, dto.CancelledBy);

            return Ok(new { message = "Ticket cancelado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al cancelar el ticket" });
        }
    }

    /// <summary>
    /// PATCH /api/tickets/{id}/pay
    /// Pay a ticket prize
    /// </summary>
    [HttpPatch("{id}/pay")]
    public async Task<ActionResult> PayTicket(long id, [FromBody] PayTicketDto dto)
    {
        try
        {
            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.TicketId == id);

            if (ticket == null)
                return NotFound(new { message = "Ticket no encontrado" });

            if (ticket.IsCancelled)
                return BadRequest(new { message = "No se puede pagar un ticket cancelado" });

            if (ticket.IsPaid)
                return BadRequest(new { message = "El ticket ya fue pagado" });

            if (ticket.TotalPrize <= 0)
                return BadRequest(new { message = "El ticket no tiene premios para pagar" });

            if (ticket.WinningLines == 0)
                return BadRequest(new { message = "El ticket no tiene líneas ganadoras" });

            // Pay ticket
            ticket.IsPaid = true;
            ticket.PaidAt = DateTime.Now;
            ticket.PaidBy = dto.PaidBy;
            ticket.PaymentMethod = dto.PaymentMethod;
            ticket.PaymentReference = dto.PaymentReference;
            ticket.Status = "paid";
            ticket.UpdatedAt = DateTime.Now;
            ticket.UpdatedBy = dto.PaidBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Ticket {TicketCode} paid ${Amount} by user {UserId}",
                ticket.TicketCode, ticket.TotalPrize, dto.PaidBy);

            return Ok(new {
                message = "Ticket pagado exitosamente",
                paidAmount = ticket.TotalPrize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error paying ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al pagar el ticket" });
        }
    }

    // ===========================
    // HELPER METHODS
    // ===========================

    private async Task<string> GenerateTicketCodeAsync()
    {
        var datePrefix = DateTime.Now.ToString("yyyyMMdd");

        // Get last ticket code for today
        var lastTicket = await _context.Tickets
            .Where(t => t.TicketCode.StartsWith(datePrefix))
            .OrderByDescending(t => t.TicketCode)
            .Select(t => t.TicketCode)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastTicket != null)
        {
            var lastNumberPart = lastTicket.Substring(datePrefix.Length + 1); // Skip date and dash
            if (int.TryParse(lastNumberPart, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{datePrefix}-{nextNumber:D4}";
    }

    private string GenerateBarcode(string ticketCode)
    {
        // Simple barcode generation (could be more sophisticated)
        return $"BC{ticketCode.Replace("-", "")}";
    }

    private async Task<TicketDetailDto?> GetTicketDetailAsync(long ticketId)
    {
        return await _context.Tickets
            .Include(t => t.BettingPool)
            .Include(t => t.User)
            .Include(t => t.TicketLines)
                .ThenInclude(tl => tl.Lottery)
            .Include(t => t.TicketLines)
                .ThenInclude(tl => tl.Draw)
            .Include(t => t.TicketLines)
                .ThenInclude(tl => tl.BetType)
            .Where(t => t.TicketId == ticketId)
            .Select(t => new TicketDetailDto
            {
                TicketId = t.TicketId,
                TicketCode = t.TicketCode,
                Barcode = t.Barcode,
                BettingPoolId = t.BettingPoolId,
                BettingPoolName = t.BettingPool != null ? t.BettingPool.BettingPoolName : null,
                UserId = t.UserId,
                Username = t.User != null ? t.User.Username : null,
                TerminalId = t.TerminalId,
                IpAddress = t.IpAddress,
                CreatedAt = t.CreatedAt,
                GlobalMultiplier = t.GlobalMultiplier,
                GlobalDiscount = t.GlobalDiscount,
                CurrencyCode = t.CurrencyCode,
                TotalLines = t.TotalLines,
                TotalBetAmount = t.TotalBetAmount,
                TotalDiscount = t.TotalDiscount,
                TotalSubtotal = t.TotalSubtotal,
                TotalWithMultiplier = t.TotalWithMultiplier,
                TotalCommission = t.TotalCommission,
                TotalNet = t.TotalNet,
                GrandTotal = t.GrandTotal,
                TotalPrize = t.TotalPrize,
                WinningLines = t.WinningLines,
                Status = t.Status,
                IsCancelled = t.IsCancelled,
                CancelledAt = t.CancelledAt,
                CancelledBy = t.CancelledBy,
                CancellationReason = t.CancellationReason,
                IsPaid = t.IsPaid,
                PaidAt = t.PaidAt,
                PaidBy = t.PaidBy,
                PaymentMethod = t.PaymentMethod,
                PaymentReference = t.PaymentReference,
                CustomerName = t.CustomerName,
                CustomerPhone = t.CustomerPhone,
                CustomerEmail = t.CustomerEmail,
                CustomerIdNumber = t.CustomerIdNumber,
                LotteryIds = t.LotteryIds,
                TotalLotteries = t.TotalLotteries,
                EarliestDrawTime = t.EarliestDrawTime,
                LatestDrawTime = t.LatestDrawTime,
                PrintCount = t.PrintCount,
                LastPrintedAt = t.LastPrintedAt,
                Notes = t.Notes,
                Lines = t.TicketLines.Select(tl => new TicketLineDto
                {
                    LineId = tl.LineId,
                    TicketId = tl.TicketId,
                    LineNumber = tl.LineNumber,
                    LotteryId = tl.LotteryId,
                    LotteryName = tl.Lottery != null ? tl.Lottery.LotteryName : null,
                    DrawId = tl.DrawId,
                    DrawName = tl.Draw != null ? tl.Draw.DrawName : null,
                    DrawDate = tl.DrawDate,
                    DrawTime = tl.DrawTime,
                    BetNumber = tl.BetNumber,
                    BetTypeId = tl.BetTypeId,
                    BetTypeCode = tl.BetTypeCode,
                    BetTypeName = tl.BetType != null ? tl.BetType.GameName : null,
                    Position = tl.Position,
                    BetAmount = tl.BetAmount,
                    Multiplier = tl.Multiplier,
                    DiscountPercentage = tl.DiscountPercentage,
                    DiscountAmount = tl.DiscountAmount,
                    Subtotal = tl.Subtotal,
                    TotalWithMultiplier = tl.TotalWithMultiplier,
                    CommissionPercentage = tl.CommissionPercentage,
                    CommissionAmount = tl.CommissionAmount,
                    NetAmount = tl.NetAmount,
                    PrizeMultiplier = tl.PrizeMultiplier,
                    PrizeAmount = tl.PrizeAmount,
                    IsWinner = tl.IsWinner,
                    WinningPosition = tl.WinningPosition,
                    ResultNumber = tl.ResultNumber,
                    ResultCheckedAt = tl.ResultCheckedAt,
                    LineStatus = tl.LineStatus,
                    ExceedsLimit = tl.ExceedsLimit,
                    Notes = tl.Notes
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }
}
```

---

## 🔧 4. Consideraciones de Lógica de Negocio

### Validaciones Adicionales Requeridas

1. **Cutoff Time Validation** ✅ Implementado
   - Verificar que no se permita crear tickets después del cierre de ventas
   - Cálculo: `draw.DrawTime - draw.AnticipatedClosing`

2. **Duplicate Number Check** (Pendiente)
   - Según configuración de la banca, verificar si se permiten números duplicados en el mismo ticket

3. **Number Blocking** (Pendiente)
   - Verificar si un número está bloqueado para un sorteo específico
   - Tabla: `blocked_numbers` (si existe)

4. **Betting Limits** (Pendiente)
   - Verificar límites por número (max amount per number)
   - Verificar límites por sorteo
   - Verificar límites por banca

5. **Balance Validation** (Pendiente)
   - Verificar que la banca tenga suficiente balance para aceptar la apuesta
   - Actualizar balance de la banca después de crear ticket

6. **Commission Calculation** (Hardcoded actualmente)
   - Implementar cálculo real de comisión desde configuración de la banca
   - Fuente: `betting_pool_prize_config` o configuración general

7. **Prize Multiplier** (Pendiente)
   - Obtener multiplicador de premio desde configuración de la banca
   - Fuente: `betting_pool_prize_config.PrizePayment*` fields

### Funcionalidades Adicionales Sugeridas

1. **Reimpresión de Tickets**
   - `POST /api/tickets/{id}/reprint`
   - Incrementar `PrintCount`, actualizar `LastPrintedAt`

2. **Verificación de Resultados**
   - `POST /api/tickets/{id}/check-results`
   - Comparar `BetNumber` con `ResultNumber` de cada línea
   - Actualizar `IsWinner`, `PrizeAmount`, `TotalPrize`, `WinningLines`

3. **Estadísticas de Tickets**
   - `GET /api/tickets/stats`
   - Total de tickets por día
   - Total de ventas por día
   - Total de premios pagados
   - Tickets pendientes de pago

4. **Búsqueda por Barcode**
   - `GET /api/tickets/by-barcode/{barcode}`
   - Buscar ticket por código de barras

---

## 📝 5. Próximos Pasos de Implementación

### Fase 1: Core Functionality (Actual)
- [x] Definir DTOs completos
- [x] Crear validadores FluentValidation
- [x] Implementar TicketsController básico
- [x] Implementar `GET /api/tickets/params/create`
- [x] Implementar `POST /api/tickets`
- [x] Implementar `GET /api/tickets` (lista paginada)
- [x] Implementar `GET /api/tickets/{id}` (detalle)
- [x] Implementar `PATCH /api/tickets/{id}/cancel`
- [x] Implementar `PATCH /api/tickets/{id}/pay`

### Fase 2: Validaciones de Negocio (Siguiente)
- [ ] Implementar validación de números bloqueados
- [ ] Implementar validación de límites de apuesta
- [ ] Implementar cálculo real de comisiones (desde config de banca)
- [ ] Implementar actualización de balance de banca
- [ ] Implementar verificación de balance suficiente

### Fase 3: Funcionalidades Avanzadas
- [ ] Implementar verificación de resultados automática
- [ ] Implementar reimpresión de tickets
- [ ] Implementar estadísticas y reportes
- [ ] Implementar búsqueda por barcode
- [ ] Implementar notificaciones (email/SMS) de premios

### Fase 4: Testing y Optimización
- [ ] Crear unit tests para validadores
- [ ] Crear integration tests para endpoints
- [ ] Optimizar queries con índices en DB
- [ ] Implementar caching para parámetros de creación
- [ ] Performance testing con alta carga

---

## 🗄️ 6. Índices de Base de Datos Recomendados

```sql
-- Índices para mejorar performance de queries

-- tickets table
CREATE INDEX idx_tickets_betting_pool ON tickets(betting_pool_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_barcode ON tickets(barcode);
CREATE UNIQUE INDEX idx_tickets_ticket_code ON tickets(ticket_code);

-- ticket_lines table
CREATE INDEX idx_ticket_lines_ticket ON ticket_lines(ticket_id);
CREATE INDEX idx_ticket_lines_draw ON ticket_lines(draw_id);
CREATE INDEX idx_ticket_lines_lottery ON ticket_lines(lottery_id);
CREATE INDEX idx_ticket_lines_bet_type ON ticket_lines(bet_type_id);
CREATE INDEX idx_ticket_lines_bet_number ON ticket_lines(bet_number);
CREATE INDEX idx_ticket_lines_draw_date ON ticket_lines(draw_date);
```

---

## 📚 7. Referencias

### Documentos Relacionados
- `/home/jorge/projects/lottery-project/CLAUDE.md` - Contexto del proyecto
- `/home/jorge/projects/lottery-project/docs/API_ENDPOINTS_MAPPING.md` - Endpoints de Vue.js
- `/home/jorge/projects/lottery-project/api/src/LotteryApi/Models/Ticket.cs` - Modelo Ticket
- `/home/jorge/projects/lottery-project/api/src/LotteryApi/Models/TicketLine.cs` - Modelo TicketLine
- `/home/jorge/projects/lottery-project/api/src/LotteryApi/Controllers/BettingPoolsController.cs` - Patrón de controlador

### Patrones Seguidos
- **DTOs**: Múltiples DTOs por entidad (List, Detail, Create, Update)
- **Validación**: FluentValidation con mensajes en español
- **Paginación**: `PagedResponse<T>` para listas
- **Logging**: ILogger con mensajes descriptivos
- **Transacciones**: Transaction scope para operaciones complejas
- **Error Handling**: Try-catch con logging y status codes apropiados

---

**Autor:** Claude Code
**Fecha:** 2025-11-19
**Estado:** ✅ Propuesta Completa - Listo para Implementar

---

## 📊 ANÁLISIS DE APLICACIÓN VUE.JS REAL (2025-11-20)

### Metodología de Análisis

**Herramienta:** Playwright para navegación automatizada y captura de network requests
**Aplicación analizada:** https://la-numbers.apk.lol
**Usuario de prueba:** oliver / oliver0597@
**Fecha de análisis:** 2025-11-20

### Endpoints Capturados

| Método | Endpoint | Query Params | Status | Propósito |
|--------|----------|--------------|--------|-----------|
| GET | `/api/v1/tickets/params/create` | `category=1` | 200 | Parámetros para crear ticket (sorteos, tipos de apuesta, límites) |
| GET | `/api/v1/tickets/params/index` | `category=1` | 200 | Parámetros para el monitor de tickets (bancas, loterías, zonas) |
| PATCH | `/api/v1/tickets` | - | 422 | Filtrar/buscar tickets (requiere banca o lotería) |
| POST | `/api/v1/tickets` | - | - | Crear nuevo ticket (no capturado - requiere jugadas) |

### Screenshots Capturados

1. **vue-tickets-create-inicial.png** - Pantalla de crear ticket (estado inicial)
2. **vue-tickets-create-completo.png** - Pantalla de crear ticket (vista completa con sorteos)
3. **vue-tickets-create-interface.png** - Interface de crear ticket (campos de jugada)
4. **vue-tickets-monitor.png** - Monitor de tickets (filtros y tabla)

---

### Endpoint 1: GET /api/v1/tickets/params/create

**URL Completa:**
```
GET https://api.lotocompany.com/api/v1/tickets/params/create?category=1
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
- `category` (integer): 1 = Diaria, 2 = Lotería

**Response Esperada (200 OK):**
```json
{
  "draws": [
    {
      "drawId": 1,
      "drawName": "Anguila 10am",
      "lotteryId": 5,
      "lotteryName": "LOTEKA",
      "drawDate": "2025-11-20",
      "drawTime": "10:00:00",
      "cutoffTime": "09:50:00",
      "isActive": true,
      "isAvailable": true
    }
  ],
  "betTypes": [
    {
      "betTypeId": 1,
      "betTypeCode": "DIRECTO",
      "betTypeName": "Directo",
      "numberLength": 2,
      "requiresPosition": false,
      "minBetAmount": 1.00,
      "maxBetAmount": 99999.99
    },
    {
      "betTypeId": 2,
      "betTypeCode": "PALE",
      "betTypeName": "Palé",
      "numberLength": 2,
      "requiresPosition": false,
      "minBetAmount": 1.00,
      "maxBetAmount": 99999.99
    },
    {
      "betTypeId": 3,
      "betTypeCode": "TRIPLETA",
      "betTypeName": "Tripleta",
      "numberLength": 3,
      "requiresPosition": false,
      "minBetAmount": 1.00,
      "maxBetAmount": 99999.99
    }
  ],
  "limits": {
    "minTicketAmount": 1.00,
    "maxTicketAmount": 99999.99,
    "maxLinesPerTicket": 100,
    "cancelMinutes": 30,
    "allowDuplicateNumbers": true
  }
}
```

**Observaciones:**
- ✅ Coincide con la propuesta del endpoint `GET /api/tickets/params/create`
- ✅ Estructura de `draws` similar a `DrawParamDto`
- ✅ Estructura de `betTypes` similar a `BetTypeParamDto`
- ✅ Estructura de `limits` similar a `TicketLimitsDto`
- ⚠️ El endpoint Vue usa PATCH para filtrar tickets, no GET

---

### Endpoint 2: GET /api/v1/tickets/params/index

**URL Completa:**
```
GET https://api.lotocompany.com/api/v1/tickets/params/index?category=1
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Query Parameters:**
- `category` (integer): 1 = Diaria, 2 = Lotería

**Response Esperada (200 OK):**
```json
{
  "bettingPools": [
    {
      "bettingPoolId": 1,
      "bettingPoolName": "Banca Oliver",
      "bettingPoolCode": "OLIVER01",
      "isActive": true
    }
  ],
  "lotteries": [
    {
      "lotteryId": 5,
      "lotteryName": "LOTEKA",
      "category": 1,
      "isActive": true
    }
  ],
  "betTypes": [
    {
      "betTypeId": 1,
      "betTypeCode": "DIRECTO",
      "betTypeName": "Directo"
    }
  ],
  "zones": [
    {
      "zoneId": 1,
      "zoneName": "Zona Norte",
      "isActive": true
    }
  ]
}
```

**Propósito:**
Proveer parámetros para el monitor de tickets (filtros de búsqueda):
- Bancas disponibles (para filtrar por banca)
- Loterías disponibles (para filtrar por lotería)
- Tipos de apuesta disponibles (para filtrar por tipo de jugada)
- Zonas disponibles (para filtrar por zona)

**Observaciones:**
- ❌ Este endpoint NO estaba en la propuesta original
- 💡 **NUEVO:** Endpoint adicional descubierto
- 💡 Se usa para poblar los filtros del Monitor de Tickets
- 💡 Debería agregarse a la propuesta: `GET /api/tickets/params/index`

---

### Endpoint 3: PATCH /api/v1/tickets (Filtrar/Buscar)

**URL Completa:**
```
PATCH https://api.lotocompany.com/api/v1/tickets
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (Filtros):**
```json
{
  "date": "2025-11-20",
  "bettingPoolId": null,
  "lotteryId": null,
  "betTypeId": null,
  "betNumber": null,
  "pendingPayment": false,
  "winnersOnly": false,
  "zoneIds": [],
  "status": null,
  "search": null,
  "pageNumber": 1,
  "pageSize": 50
}
```

**Response (422 Unprocessable Entity - Validación):**
```json
{
  "message": "Debe proveer una banca o una lotería al buscar tickets."
}
```

**Response Esperada (200 OK - Con filtros válidos):**
```json
{
  "items": [
    {
      "ticketId": 1234,
      "ticketCode": "20251120-0001",
      "barcode": "BC202511200001",
      "bettingPoolId": 1,
      "bettingPoolName": "Banca Oliver",
      "userId": 5,
      "username": "oliver",
      "createdAt": "2025-11-20T10:30:00Z",
      "totalLines": 3,
      "grandTotal": 150.00,
      "totalPrize": 0.00,
      "winningLines": 0,
      "status": "pending",
      "isCancelled": false,
      "isPaid": false,
      "customerName": null,
      "currencyCode": "DOP"
    }
  ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 1,
  "totalPages": 1
}
```

**Observaciones:**
- ⚠️ **DIFERENCIA CRÍTICA:** Vue usa `PATCH /api/v1/tickets` para filtrar/buscar
- ⚠️ La propuesta usaba `GET /api/tickets` con query params
- 💡 PATCH permite filtros más complejos en el body (arrays de zoneIds, etc.)
- ✅ Validación: Requiere al menos banca o lotería para buscar
- ✅ Response coincide con `PagedResponse<TicketListDto>`

---

### Endpoint 4: POST /api/v1/tickets (Crear Ticket)

**URL Completa:**
```
POST https://api.lotocompany.com/api/v1/tickets
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body Esperado:**
```json
{
  "bettingPoolId": 1,
  "userId": 5,
  "terminalId": "TERM001",
  "ipAddress": "192.168.1.100",
  "globalMultiplier": 1.00,
  "globalDiscount": 0.00,
  "currencyCode": "DOP",
  "customerName": null,
  "customerPhone": null,
  "customerEmail": null,
  "customerIdNumber": null,
  "notes": null,
  "lines": [
    {
      "lotteryId": 5,
      "drawId": 123,
      "betNumber": "12",
      "betTypeId": 1,
      "betTypeCode": "DIRECTO",
      "position": null,
      "betAmount": 50.00,
      "multiplier": 1.00,
      "discountPercentage": 0.00,
      "notes": null
    },
    {
      "lotteryId": 5,
      "drawId": 123,
      "betNumber": "34",
      "betTypeId": 2,
      "betTypeCode": "PALE",
      "position": null,
      "betAmount": 100.00,
      "multiplier": 1.00,
      "discountPercentage": 0.00,
      "notes": null
    }
  ]
}
```

**Response Esperada (201 Created):**
```json
{
  "ticketId": 1234,
  "ticketCode": "20251120-0001",
  "barcode": "BC202511200001",
  "bettingPoolId": 1,
  "bettingPoolName": "Banca Oliver",
  "userId": 5,
  "username": "oliver",
  "terminalId": "TERM001",
  "ipAddress": "192.168.1.100",
  "createdAt": "2025-11-20T10:30:00Z",
  "globalMultiplier": 1.00,
  "globalDiscount": 0.00,
  "currencyCode": "DOP",
  "totalLines": 2,
  "totalBetAmount": 150.00,
  "totalDiscount": 0.00,
  "totalSubtotal": 150.00,
  "totalWithMultiplier": 150.00,
  "totalCommission": 15.00,
  "totalNet": 135.00,
  "grandTotal": 135.00,
  "totalPrize": 0.00,
  "winningLines": 0,
  "status": "pending",
  "isCancelled": false,
  "isPaid": false,
  "customerName": null,
  "lines": [
    {
      "lineId": 5001,
      "ticketId": 1234,
      "lineNumber": 1,
      "lotteryId": 5,
      "lotteryName": "LOTEKA",
      "drawId": 123,
      "drawName": "LOTEKA 8PM",
      "drawDate": "2025-11-20",
      "drawTime": "20:00:00",
      "betNumber": "12",
      "betTypeId": 1,
      "betTypeCode": "DIRECTO",
      "betTypeName": "Directo",
      "position": null,
      "betAmount": 50.00,
      "multiplier": 1.00,
      "discountPercentage": 0.00,
      "discountAmount": 0.00,
      "subtotal": 50.00,
      "totalWithMultiplier": 50.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 5.00,
      "netAmount": 45.00,
      "prizeMultiplier": null,
      "prizeAmount": 0.00,
      "isWinner": false,
      "lineStatus": "pending"
    },
    {
      "lineId": 5002,
      "ticketId": 1234,
      "lineNumber": 2,
      "lotteryId": 5,
      "lotteryName": "LOTEKA",
      "drawId": 123,
      "drawName": "LOTEKA 8PM",
      "drawDate": "2025-11-20",
      "drawTime": "20:00:00",
      "betNumber": "34",
      "betTypeId": 2,
      "betTypeCode": "PALE",
      "betTypeName": "Palé",
      "position": null,
      "betAmount": 100.00,
      "multiplier": 1.00,
      "discountPercentage": 0.00,
      "discountAmount": 0.00,
      "subtotal": 100.00,
      "totalWithMultiplier": 100.00,
      "commissionPercentage": 10.00,
      "commissionAmount": 10.00,
      "netAmount": 90.00,
      "prizeMultiplier": null,
      "prizeAmount": 0.00,
      "isWinner": false,
      "lineStatus": "pending"
    }
  ]
}
```

**Observaciones:**
- ⚠️ NO capturado durante el análisis (requería crear jugadas completas)
- ✅ Estructura de request coincide con `CreateTicketDto`
- ✅ Estructura de response coincide con `TicketDetailDto`
- ✅ La propuesta está alineada con la aplicación real

---

### Interface de Crear Ticket (Observaciones de UI)

**Campos de la Pantalla:**

1. **Banca** (Combobox)
   - Autocompletado con búsqueda
   - Muestra nombre de la banca
   - Requerido

2. **Sorteo Seleccionado** (Display)
   - Muestra imagen del sorteo actual
   - Muestra nombre del sorteo (ej: "LOTEKA")

3. **Grid de Sorteos** (Badges clickeables)
   - 70+ sorteos disponibles organizados en grid
   - Sorteo seleccionado se resalta
   - Incluye: Anguila 10am, REAL, GANA MAS, LA PRIMERA, LOTEKA, etc.

4. **Estadísticas** (Read-only)
   - Jugadas del día: 0
   - Vendido en grupo: $0.00
   - Vendido en banca: $0.00

5. **Controles Globales**
   - Desc. (Descuento global) - Switch
   - Mult. lot (Multiplicador lotería) - Switch
   - Imprimir (Switch)

6. **Campos de Jugada**
   - Jugada (textbox) - Número a apostar
   - Tipo de jugada (dropdown) - N/A hasta seleccionar sorteo
   - Monto (textbox) - Monto de la apuesta

7. **4 Secciones de Jugadas**
   - **Directo** (LOT, NUM, Total)
   - **Pale & Tripleta** (LOT, NUM, Total)
   - **Cash 3** (LOT, NUM, Total)
   - **Play 4 & Pick 5** (LOT, NUM, Total)
   - Cada sección tiene botón "Eliminar todas las jugadas"

8. **Botones de Acción**
   - **Duplicar** (deshabilitado hasta tener jugadas)
   - **Crear ticket** (deshabilitado hasta tener jugadas)
   - **Ayuda**

**Flujo de Creación:**
1. Seleccionar Banca
2. Seleccionar Sorteo
3. Ingresar Número de jugada
4. Seleccionar Tipo de jugada
5. Ingresar Monto
6. Hacer clic en botón de agregar (cada sección)
7. Repetir para múltiples jugadas
8. Hacer clic en "Crear ticket"
9. API POST /api/v1/tickets ejecuta

---

### Interface del Monitor de Tickets (Observaciones de UI)

**Filtros Disponibles:**

1. **Fecha** (Date picker)
   - Default: Fecha actual (11/20/2025)

2. **Banca** (Combobox)
   - Autocompletado con búsqueda
   - Opcional (pero requiere al menos banca o lotería)

3. **Lotería** (Dropdown)
   - Selección única
   - Opcional (pero requiere al menos banca o lotería)

4. **Tipo de jugada** (Dropdown)
   - Selección única (Directo, Palé, Tripleta, etc.)
   - Opcional

5. **Número** (Textbox)
   - Buscar por número específico apostado
   - Opcional

6. **Pendientes de pago** (Toggle/Switch)
   - Filtrar solo tickets con premios pendientes
   - Default: OFF

7. **Sólo tickets ganadores** (Toggle/Switch)
   - Filtrar solo tickets ganadores
   - Default: OFF

8. **Zonas** (Multi-select dropdown)
   - Selección múltiple de zonas
   - Opcional

9. **Botón FILTRAR**
   - Ejecuta PATCH /api/v1/tickets con filtros

**Filtros de Estado (Radio buttons):**
- Todos (0)
- Ganadores (0)
- Pendientes (0)
- Perdedores (0)
- Cancelado (0)

**Totales Mostrados:**
- Monto total: $0.00
- Total de premios: $0.00
- Total pendiente de pago: $0.00

**Filtro Rápido:**
- Textbox para búsqueda rápida en tabla

**Columnas de la Tabla:**
1. Número
2. Fecha
3. Usuario
4. Monto
5. Premio
6. Fecha de cancelación
7. Estado
8. Acciones

---

## 🔍 COMPARACIÓN: PROPUESTA vs APLICACIÓN REAL

### ✅ Lo que COINCIDE con la Propuesta

1. **Estructura de DTOs:**
   - ✅ `CreateTicketDto` coincide con request body de POST
   - ✅ `CreateTicketLineDto` coincide con estructura de lines
   - ✅ `TicketDetailDto` coincide con response de POST
   - ✅ `TicketListDto` coincide con items del PATCH response
   - ✅ `DrawParamDto` coincide con draws del params/create
   - ✅ `BetTypeParamDto` coincide con betTypes del params/create
   - ✅ `TicketLimitsDto` coincide con limits del params/create

2. **Validaciones:**
   - ✅ Requiere al menos banca o lotería para filtrar tickets
   - ✅ Campos requeridos (bettingPoolId, userId, lines)
   - ✅ Paginación con PagedResponse

3. **Cálculos:**
   - ✅ Totales: betAmount, discount, commission, net, grandTotal
   - ✅ Comisión por línea (10% hardcoded en propuesta, probablemente configurable en real)

4. **Estados de Ticket:**
   - ✅ pending, cancelled, paid (observados en filtros de UI)

### ⚠️ DIFERENCIAS Encontradas

| Aspecto | Propuesta | Aplicación Real | Impacto |
|---------|-----------|-----------------|---------|
| **Endpoint de filtrado** | `GET /api/tickets` con query params | `PATCH /api/v1/tickets` con body | 🟠 MEDIO - Cambiar verbo HTTP |
| **Endpoint params adicional** | No existe | `GET /api/v1/tickets/params/index` | 🟡 BAJO - Agregar endpoint nuevo |
| **Estructura de filtros** | Query params individuales | Request body con objeto completo | 🟠 MEDIO - Cambiar diseño de API |
| **Validación de filtros** | Sin validación específica | Requiere banca O lotería obligatorio | 🟡 BAJO - Agregar validación |

### ❌ Lo que FALTA en la Propuesta

1. **Endpoint Adicional:**
   - ❌ `GET /api/tickets/params/index` - Parámetros para monitor de tickets
   - 💡 **Agregar:** Endpoint para obtener bancas, loterías, bet types, zonas disponibles para filtros

2. **Filtros del Monitor:**
   - ❌ Filtro por zona (zoneIds array)
   - ❌ Filtro por número exacto (betNumber)
   - ❌ Filtro booleano "pendientes de pago" (pendingPayment)
   - ❌ Filtro booleano "solo ganadores" (winnersOnly)
   - 💡 **Agregar:** Estos campos al DTO de filtrado

3. **Totales Agregados:**
   - ❌ Totales agregados en la respuesta del filtrado:
     - `totalAmount` (suma de grandTotal)
     - `totalPrizes` (suma de totalPrize)
     - `totalPendingPayment` (suma de premios no pagados)
   - 💡 **Agregar:** Campos de totales en la respuesta del PATCH

4. **WebSocket/Real-time:**
   - ❌ La aplicación usa Socket.io para actualizaciones en tiempo real
   - 💡 **Considerar:** Implementar SignalR para notificaciones en tiempo real

### 💡 FUNCIONALIDADES NUEVAS Descubiertas

1. **Duplicar Ticket:**
   - Botón "Duplicar" en la UI de crear ticket
   - Permite copiar jugadas de un ticket anterior
   - 💡 Endpoint potencial: `POST /api/tickets/{id}/duplicate`

2. **Reimpresión:**
   - Control de `PrintCount` y `LastPrintedAt` en ticket
   - 💡 Ya considerado en la propuesta: `POST /api/tickets/{id}/reprint`

3. **Filtros Complejos:**
   - Multi-select de zonas
   - Filtros booleanos combinables
   - Búsqueda por número exacto
   - 💡 Implementar con PATCH en lugar de GET

4. **Estadísticas del Dashboard:**
   - "Jugadas del día"
   - "Vendido en grupo"
   - "Vendido en banca"
   - 💡 Endpoint potencial: `GET /api/tickets/stats/daily`

---

## 📝 RECOMENDACIONES DE IMPLEMENTACIÓN

### 1. Cambios Críticos en la Propuesta

**A. Cambiar Endpoint de Filtrado:**
```csharp
// ANTES (Propuesta)
[HttpGet]
public async Task<ActionResult<PagedResponse<TicketListDto>>> GetTickets(
    [FromQuery] int? bettingPoolId,
    [FromQuery] int? userId,
    // ... otros query params
)

// DESPUÉS (Alineado con Vue)
[HttpPatch]
public async Task<ActionResult<TicketFilterResponse>> FilterTickets(
    [FromBody] FilterTicketsDto dto
)
```

**B. Crear DTO de Filtros:**
```csharp
public class FilterTicketsDto
{
    public DateTime? Date { get; set; }
    public int? BettingPoolId { get; set; }
    public int? LotteryId { get; set; }
    public int? BetTypeId { get; set; }
    public string? BetNumber { get; set; }
    public bool PendingPayment { get; set; } = false;
    public bool WinnersOnly { get; set; } = false;
    public List<int>? ZoneIds { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class TicketFilterResponse
{
    public List<TicketListDto> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    // Totales agregados
    public decimal TotalAmount { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalPendingPayment { get; set; }
}
```

**C. Validación de Filtros:**
```csharp
public class FilterTicketsDtoValidator : AbstractValidator<FilterTicketsDto>
{
    public FilterTicketsDtoValidator()
    {
        RuleFor(x => x)
            .Must(x => x.BettingPoolId.HasValue || x.LotteryId.HasValue)
            .WithMessage("Debe proveer una banca o una lotería al buscar tickets.");

        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("El número de página debe ser mayor a 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("El tamaño de página debe estar entre 1 y 100");
    }
}
```

### 2. Nuevo Endpoint: params/index

**Agregar a TicketsController:**
```csharp
/// <summary>
/// GET /api/tickets/params/index
/// Get parameters for ticket monitor (filters)
/// </summary>
[HttpGet("params/index")]
public async Task<ActionResult<TicketMonitorParamsDto>> GetMonitorParams(
    [FromQuery] int? category)
{
    try
    {
        // Get betting pools
        var bettingPools = await _context.BettingPools
            .Where(bp => bp.IsActive)
            .Select(bp => new BettingPoolParamDto
            {
                BettingPoolId = bp.BettingPoolId,
                BettingPoolName = bp.BettingPoolName,
                BettingPoolCode = bp.BettingPoolCode,
                IsActive = bp.IsActive
            })
            .ToListAsync();

        // Get lotteries
        var lotteriesQuery = _context.Lotteries.Where(l => l.IsActive);
        if (category.HasValue)
            lotteriesQuery = lotteriesQuery.Where(l => l.Category == category.Value);

        var lotteries = await lotteriesQuery
            .Select(l => new LotteryParamDto
            {
                LotteryId = l.LotteryId,
                LotteryName = l.LotteryName,
                Category = l.Category,
                IsActive = l.IsActive
            })
            .ToListAsync();

        // Get bet types
        var betTypes = await _context.GameTypes
            .Where(bt => bt.IsActive)
            .Select(bt => new BetTypeSimpleDto
            {
                BetTypeId = bt.GameTypeId,
                BetTypeCode = bt.GameTypeCode,
                BetTypeName = bt.GameName
            })
            .ToListAsync();

        // Get zones
        var zones = await _context.Zones
            .Where(z => z.IsActive)
            .Select(z => new ZoneParamDto
            {
                ZoneId = z.ZoneId,
                ZoneName = z.ZoneName,
                IsActive = z.IsActive
            })
            .ToListAsync();

        var result = new TicketMonitorParamsDto
        {
            BettingPools = bettingPools,
            Lotteries = lotteries,
            BetTypes = betTypes,
            Zones = zones
        };

        return Ok(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting ticket monitor parameters");
        return StatusCode(500, new { message = "Error al obtener parámetros del monitor" });
    }
}
```

**DTOs para params/index:**
```csharp
public class TicketMonitorParamsDto
{
    public List<BettingPoolParamDto> BettingPools { get; set; } = new();
    public List<LotteryParamDto> Lotteries { get; set; } = new();
    public List<BetTypeSimpleDto> BetTypes { get; set; } = new();
    public List<ZoneParamDto> Zones { get; set; } = new();
}

public class BettingPoolParamDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class LotteryParamDto
{
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public int Category { get; set; }
    public bool IsActive { get; set; }
}

public class BetTypeSimpleDto
{
    public int BetTypeId { get; set; }
    public string BetTypeCode { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
}

public class ZoneParamDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
```

### 3. Implementar Totales Agregados en Filtrado

**Modificar método FilterTickets:**
```csharp
// Después de obtener los tickets paginados
var totalAmount = await query.SumAsync(t => t.GrandTotal);
var totalPrizes = await query.SumAsync(t => t.TotalPrize);
var totalPendingPayment = await query
    .Where(t => !t.IsPaid && t.TotalPrize > 0)
    .SumAsync(t => t.TotalPrize);

var response = new TicketFilterResponse
{
    Items = tickets,
    PageNumber = pageNumber,
    PageSize = pageSize,
    TotalCount = totalCount,
    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
    TotalAmount = totalAmount,
    TotalPrizes = totalPrizes,
    TotalPendingPayment = totalPendingPayment
};
```

### 4. Endpoints Adicionales Sugeridos

**A. Duplicar Ticket:**
```csharp
/// <summary>
/// POST /api/tickets/{id}/duplicate
/// Duplicate an existing ticket
/// </summary>
[HttpPost("{id}/duplicate")]
public async Task<ActionResult<TicketDetailDto>> DuplicateTicket(long id)
{
    // Implementation similar to CreateTicket but copying lines from existing ticket
}
```

**B. Estadísticas Diarias:**
```csharp
/// <summary>
/// GET /api/tickets/stats/daily
/// Get daily ticket statistics
/// </summary>
[HttpGet("stats/daily")]
public async Task<ActionResult<DailyStatsDto>> GetDailyStats(
    [FromQuery] int? bettingPoolId,
    [FromQuery] DateTime? date)
{
    // Return: total plays, total sold (group), total sold (betting pool)
}
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN ACTUALIZADO

### Fase 1: Core Functionality (Ajustado)

- [x] Definir DTOs completos ✅
- [x] Crear validadores FluentValidation ✅
- [ ] **MODIFICAR:** Cambiar `GET /api/tickets` → `PATCH /api/tickets` para filtrado
- [ ] **AGREGAR:** `FilterTicketsDto` y `TicketFilterResponse`
- [ ] **AGREGAR:** `GET /api/tickets/params/index`
- [ ] **AGREGAR:** DTOs para params/index (BettingPoolParamDto, LotteryParamDto, etc.)
- [ ] **AGREGAR:** Validación de filtros (requiere banca O lotería)
- [ ] **AGREGAR:** Totales agregados en respuesta de filtrado

### Fase 2: Testing con Aplicación Real

- [ ] Crear ticket de prueba usando Postman/Swagger
- [ ] Verificar que el response de POST coincida con la aplicación Vue
- [ ] Probar filtros con PATCH /api/tickets
- [ ] Verificar params/create response
- [ ] Verificar params/index response
- [ ] Comparar totales calculados con la aplicación Vue

### Fase 3: Funcionalidades Avanzadas

- [ ] Implementar `POST /api/tickets/{id}/duplicate`
- [ ] Implementar `GET /api/tickets/stats/daily`
- [ ] Considerar SignalR para real-time updates (opcional)

---

## 📊 RESUMEN FINAL

### Endpoints Finales Recomendados

| Método | Endpoint | Propósito | Estado |
|--------|----------|-----------|--------|
| GET | `/api/tickets/params/create` | Parámetros para crear ticket | ✅ Propuesta alineada |
| GET | `/api/tickets/params/index` | Parámetros para monitor (filtros) | ⚠️ AGREGAR |
| POST | `/api/tickets` | Crear nuevo ticket | ✅ Propuesta alineada |
| PATCH | `/api/tickets` | Filtrar/buscar tickets | ⚠️ MODIFICAR (era GET) |
| GET | `/api/tickets/{id}` | Detalle de ticket | ✅ Propuesta alineada |
| PATCH | `/api/tickets/{id}/cancel` | Cancelar ticket | ✅ Propuesta alineada |
| PATCH | `/api/tickets/{id}/pay` | Pagar premio | ✅ Propuesta alineada |
| POST | `/api/tickets/{id}/reprint` | Reimprimir ticket | 💡 Sugerido |
| POST | `/api/tickets/{id}/duplicate` | Duplicar ticket | 💡 Nuevo |
| GET | `/api/tickets/stats/daily` | Estadísticas diarias | 💡 Nuevo |

### Calificación de la Propuesta Original

**Puntaje: 85/100** 🟢

**Fortalezas:**
- ✅ Estructura de DTOs muy bien definida
- ✅ Validaciones completas con FluentValidation
- ✅ Cálculos de totales correctos
- ✅ Manejo de transacciones adecuado
- ✅ Logging detallado
- ✅ Patrones consistentes con el resto del proyecto

**Áreas de Mejora:**
- ⚠️ Cambiar GET → PATCH para filtrado de tickets
- ⚠️ Agregar endpoint params/index
- ⚠️ Agregar totales agregados en respuesta de filtrado
- ⚠️ Agregar validación de filtros (requiere banca O lotería)
- 💡 Considerar endpoints adicionales (duplicate, stats)

**Conclusión:**
La propuesta original es **MUY SÓLIDA** y está **85% alineada** con la aplicación Vue.js real. Los ajustes necesarios son **menores** y principalmente relacionados con el diseño de la API de filtrado. La estructura de DTOs, validaciones y lógica de negocio son excelentes y pueden implementarse con confianza.

---

**Fecha de análisis:** 2025-11-20
**Analizado por:** Claude Code
**Screenshots:** 4 archivos en `/home/jorge/projects/lottery-project/.playwright-mcp/`
**Estado:** ✅ Análisis Completo - Recomendaciones Documentadas
