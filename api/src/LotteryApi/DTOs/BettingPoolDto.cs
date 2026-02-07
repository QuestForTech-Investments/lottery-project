using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO for listing betting pools
/// </summary>
public class BettingPoolListDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolCode { get; set; } = string.Empty;
    public string BettingPoolName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public int? BankId { get; set; }
    public string? BankName { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Reference { get; set; }
    public List<string> Users { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// DTO for betting pool details
/// </summary>
public class BettingPoolDetailDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolCode { get; set; } = string.Empty;
    public string BettingPoolName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public int? BankId { get; set; }
    public string? BankName { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Reference { get; set; }
    public string? Comment { get; set; }
    public string? Username { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new betting pool
/// </summary>
public class CreateBettingPoolDto
{
    [Required(ErrorMessage = "El nombre de la banca es requerido")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "El nombre debe tener entre 1 y 100 caracteres")]
    public string BettingPoolName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El código de la banca es requerido")]
    [StringLength(20, MinimumLength = 1, ErrorMessage = "El código debe tener entre 1 y 20 caracteres")]
    public string BettingPoolCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "La zona es requerida")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una zona válida")]
    public int ZoneId { get; set; }

    public int? BankId { get; set; }

    [StringLength(255, ErrorMessage = "La dirección no puede exceder 255 caracteres")]
    public string? Address { get; set; }

    [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Phone { get; set; }

    [StringLength(255, ErrorMessage = "La ubicación no puede exceder 255 caracteres")]
    public string? Location { get; set; }

    [StringLength(255, ErrorMessage = "La referencia no puede exceder 255 caracteres")]
    public string? Reference { get; set; }

    public string? Comment { get; set; }

    [StringLength(100, ErrorMessage = "El nombre de usuario no puede exceder 100 caracteres")]
    public string? Username { get; set; }

    [StringLength(255, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 255 caracteres")]
    public string? Password { get; set; }

    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for updating an existing betting pool
/// </summary>
public class UpdateBettingPoolDto
{
    [StringLength(100, MinimumLength = 1, ErrorMessage = "El nombre debe tener entre 1 y 100 caracteres")]
    public string? BettingPoolName { get; set; }

    public int? ZoneId { get; set; }

    public int? BankId { get; set; }

    [StringLength(255, ErrorMessage = "La dirección no puede exceder 255 caracteres")]
    public string? Address { get; set; }

    [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Phone { get; set; }

    [StringLength(255, ErrorMessage = "La ubicación no puede exceder 255 caracteres")]
    public string? Location { get; set; }

    [StringLength(255, ErrorMessage = "La referencia no puede exceder 255 caracteres")]
    public string? Reference { get; set; }

    public string? Comment { get; set; }

    [StringLength(100, ErrorMessage = "El nombre de usuario no puede exceder 100 caracteres")]
    public string? Username { get; set; }

    [StringLength(255, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 255 caracteres")]
    public string? Password { get; set; }

    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for next available betting pool code response
/// </summary>
public class NextBettingPoolCodeDto
{
    public string NextCode { get; set; } = string.Empty;
    public string Suggestion { get; set; } = string.Empty;
}

/// <summary>
/// DTO for betting pool users
/// </summary>
public class BettingPoolUserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for betting pool configuration
/// </summary>
public class BettingPoolConfigDto
{
    public string FallType { get; set; } = "OFF";
    public decimal? DeactivationBalance { get; set; }
    public decimal? DailySaleLimit { get; set; }
    public decimal? DailyBalanceLimit { get; set; }
    public decimal? TemporaryAdditionalBalance { get; set; }
    public bool EnableTemporaryBalance { get; set; } = false;
    public decimal CreditLimit { get; set; } = 0.00m;
    public bool IsActive { get; set; } = true;
    public bool ControlWinningTickets { get; set; } = false;
    public bool AllowJackpot { get; set; } = true;
    public bool EnableRecharges { get; set; } = true;
    public bool AllowPasswordChange { get; set; } = true;
    public int CancelMinutes { get; set; } = 30;
    public int? DailyCancelTickets { get; set; }
    public decimal? MaxCancelAmount { get; set; }
    public decimal? MaxTicketAmount { get; set; }
    public decimal? MaxDailyRecharge { get; set; }
    public string PaymentMode { get; set; } = "BANCA";
    public bool AllowFutureSales { get; set; } = true;
    public int MaxFutureDays { get; set; } = 7;
}

/// <summary>
/// DTO for betting pool discount configuration
/// </summary>
public class BettingPoolDiscountConfigDto
{
    public string DiscountProvider { get; set; } = "GRUPO";
    public string DiscountMode { get; set; } = "OFF";
}

/// <summary>
/// DTO for betting pool print configuration
/// </summary>
public class BettingPoolPrintConfigDto
{
    public string PrintMode { get; set; } = "DRIVER";
    public bool PrintEnabled { get; set; } = true;
    public bool PrintTicketCopy { get; set; } = true;
    public bool PrintRechargeReceipt { get; set; } = true;
    public bool SmsOnly { get; set; } = false;
}

/// <summary>
/// DTO for creating betting pool with full configuration
/// </summary>
public class CreateBettingPoolWithConfigDto : CreateBettingPoolDto
{
    public BettingPoolConfigDto? Config { get; set; }
    public BettingPoolDiscountConfigDto? DiscountConfig { get; set; }
    public BettingPoolPrintConfigDto? PrintConfig { get; set; }
}

/// <summary>
/// DTO for betting pool detail with configuration
/// </summary>
public class BettingPoolDetailWithConfigDto : BettingPoolDetailDto
{
    public BettingPoolConfigDto? Config { get; set; }
    public BettingPoolDiscountConfigDto? DiscountConfig { get; set; }
    public BettingPoolPrintConfigDto? PrintConfig { get; set; }
    public BettingPoolFooterDto? Footer { get; set; }
}

/// <summary>
/// DTO for updating only configuration of an existing betting pool
/// </summary>
public class UpdateBettingPoolConfigDto
{
    public BettingPoolConfigDto? Config { get; set; }
    public BettingPoolDiscountConfigDto? DiscountConfig { get; set; }
    public BettingPoolPrintConfigDto? PrintConfig { get; set; }
    public UpdateBettingPoolFooterDto? Footer { get; set; }
}

/// <summary>
/// DTO for betting pool prizes and commissions
/// </summary>
public class BettingPoolPrizesCommissionDto
{
    public int? PrizeCommissionId { get; set; }
    public int BettingPoolId { get; set; }
    public int? LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public string GameType { get; set; } = string.Empty;
    public decimal? PrizePayment1 { get; set; }
    public decimal? PrizePayment2 { get; set; }
    public decimal? PrizePayment3 { get; set; }
    public decimal? PrizePayment4 { get; set; }
    public decimal? CommissionDiscount1 { get; set; }
    public decimal? CommissionDiscount2 { get; set; }
    public decimal? CommissionDiscount3 { get; set; }
    public decimal? CommissionDiscount4 { get; set; }
    public decimal? Commission2Discount1 { get; set; }
    public decimal? Commission2Discount2 { get; set; }
    public decimal? Commission2Discount3 { get; set; }
    public decimal? Commission2Discount4 { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for creating a new betting pool prizes commission
/// </summary>
public class CreateBettingPoolPrizesCommissionDto
{
    public int? LotteryId { get; set; }

    [Required(ErrorMessage = "El tipo de juego es requerido")]
    [StringLength(50, ErrorMessage = "El tipo de juego no puede exceder 50 caracteres")]
    public string GameType { get; set; } = string.Empty;

    public decimal? PrizePayment1 { get; set; }
    public decimal? PrizePayment2 { get; set; }
    public decimal? PrizePayment3 { get; set; }
    public decimal? PrizePayment4 { get; set; }
    public decimal? CommissionDiscount1 { get; set; }
    public decimal? CommissionDiscount2 { get; set; }
    public decimal? CommissionDiscount3 { get; set; }
    public decimal? CommissionDiscount4 { get; set; }
    public decimal? Commission2Discount1 { get; set; }
    public decimal? Commission2Discount2 { get; set; }
    public decimal? Commission2Discount3 { get; set; }
    public decimal? Commission2Discount4 { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for updating betting pool prizes commission
/// </summary>
public class UpdateBettingPoolPrizesCommissionDto
{
    public int? LotteryId { get; set; }
    public string? GameType { get; set; }
    public decimal? PrizePayment1 { get; set; }
    public decimal? PrizePayment2 { get; set; }
    public decimal? PrizePayment3 { get; set; }
    public decimal? PrizePayment4 { get; set; }
    public decimal? CommissionDiscount1 { get; set; }
    public decimal? CommissionDiscount2 { get; set; }
    public decimal? CommissionDiscount3 { get; set; }
    public decimal? CommissionDiscount4 { get; set; }
    public decimal? Commission2Discount1 { get; set; }
    public decimal? Commission2Discount2 { get; set; }
    public decimal? Commission2Discount3 { get; set; }
    public decimal? Commission2Discount4 { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for game type
/// </summary>
public class GameTypeDto
{
    public int GameTypeId { get; set; }
    public string GameTypeCode { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public decimal PrizeMultiplier { get; set; }
    public int NumberLength { get; set; }
    public bool RequiresAdditionalNumber { get; set; }
    public int? DisplayOrder { get; set; }
}

/// <summary>
/// DTO for betting pool sortition with lottery and game types information
/// Compatible with frontend v1 and v2
/// </summary>
public class BettingPoolSortitionDto
{
    public int? SortitionId { get; set; }
    public int BettingPoolId { get; set; }
    public int? LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public string SortitionType { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public int? AnticipatedClosing { get; set; }
    public List<int> EnabledGameTypeIds { get; set; } = new();
    public List<GameTypeDto> AvailableGameTypes { get; set; } = new();

    // ⚠️ DEPRECATED: For v1 compatibility only. v2 uses parsed fields above.
    // This field should NOT be used by frontend v2 as all data is already parsed into individual fields.
    public string? SpecificConfig { get; set; }
}

/// <summary>
/// DTO for creating a new betting pool sortition with lottery and game types
/// </summary>
public class CreateBettingPoolSortitionDto
{
    [Required(ErrorMessage = "El ID de lotería es requerido")]
    public int LotteryId { get; set; }

    public bool IsEnabled { get; set; } = true;

    [Range(0, 120, ErrorMessage = "El cierre anticipado debe estar entre 0 y 120 minutos")]
    public int? AnticipatedClosing { get; set; }

    public List<int> EnabledGameTypeIds { get; set; } = new();
}

/// <summary>
/// DTO for updating betting pool sortition
/// </summary>
public class UpdateBettingPoolSortitionDto
{
    public int? LotteryId { get; set; }
    public bool? IsEnabled { get; set; }
    public int? AnticipatedClosing { get; set; }
    public List<int>? EnabledGameTypeIds { get; set; }
}

/// <summary>
/// DTO for flat prizes configuration (frontend v2 compatibility)
/// Maps flat frontend structure to relational backend
/// </summary>
public class FlatPrizesConfigDto
{
    // Pick 3
    public decimal? Pick3FirstPayment { get; set; }
    public decimal? Pick3SecondPayment { get; set; }
    public decimal? Pick3ThirdPayment { get; set; }
    public decimal? Pick3Doubles { get; set; }

    // Pick 3 Super
    public decimal? Pick3SuperAllSequence { get; set; }
    public decimal? Pick3SuperFirstPayment { get; set; }
    public decimal? Pick3SuperSecondPayment { get; set; }
    public decimal? Pick3SuperThirdPayment { get; set; }

    // Pick 3 NY
    public decimal? Pick3NY_3Way2Identical { get; set; }
    public decimal? Pick3NY_6Way3Unique { get; set; }

    // Pick 4
    public decimal? Pick4FirstPayment { get; set; }
    public decimal? Pick4SecondPayment { get; set; }
    public decimal? Pick4_4Way3Identical { get; set; }
    public decimal? Pick4_6Way2Identical { get; set; }
    public decimal? Pick4_12Way2Identical { get; set; }
    public decimal? Pick4_24Way4Unique { get; set; }

    // Pick 4 Super
    public decimal? Pick4SuperAllSequence { get; set; }
    public decimal? Pick4SuperDoubles { get; set; }

    // Pick 4 NY
    public decimal? Pick4NY_AllSequence { get; set; }
    public decimal? Pick4NY_Doubles { get; set; }

    // Pick 5
    public decimal? Pick5FirstPayment { get; set; }
    public decimal? Pick5BronxFirstPayment { get; set; }
    public decimal? Pick5BrooklynFirstPayment { get; set; }
    public decimal? Pick5MegaFirstPayment { get; set; }
    public decimal? Pick5NYFirstPayment { get; set; }
    public decimal? Pick5QueensFirstPayment { get; set; }

    // Pick 5 Super
    public decimal? Pick5SuperAllSequence { get; set; }
    public decimal? Pick5SuperDoubles { get; set; }
    public decimal? Pick5Super_5Way4Identical { get; set; }
    public decimal? Pick5Super_10Way3Identical { get; set; }
    public decimal? Pick5Super_20Way3Identical { get; set; }
    public decimal? Pick5Super_30Way2Identical { get; set; }
    public decimal? Pick5Super_60Way2Identical { get; set; }
    public decimal? Pick5Super_120Way5Unique { get; set; }

    // Pick 6
    public decimal? Pick6AllSequence { get; set; }
    public decimal? Pick6Triples { get; set; }
    public decimal? Pick6NY_3Way2Identical { get; set; }
    public decimal? Pick6NY_6Way3Unique { get; set; }

    // Pick 6 California
    public decimal? Pick6CaliforniaAllSequence { get; set; }
    public decimal? Pick6CaliforniaTriples { get; set; }
    public decimal? Pick6Cali_3Way2Identical { get; set; }
    public decimal? Pick6Cali_6Way3Unique { get; set; }

    // Pick 6 Miami
    public decimal? Pick6MiamiFirstPayment { get; set; }
    public decimal? Pick6MiamiDoubles { get; set; }

    // Lotto Classic
    public decimal? LottoClassicFirstPayment { get; set; }
    public decimal? LottoClassicDoubles { get; set; }

    // Lotto Plus
    public decimal? LottoPlusFirstPayment { get; set; }
    public decimal? LottoPlusDoubles { get; set; }

    // Mega Millions
    public decimal? MegaMillionsFirstPayment { get; set; }
    public decimal? MegaMillionsDoubles { get; set; }

    // Powerball
    public decimal? PowerballLastNumberFirstRound { get; set; }
    public decimal? PowerballLastNumberSecondRound { get; set; }
    public decimal? PowerballLastNumberThirdRound { get; set; }
    public decimal? PowerballLast2NumbersSecondRound { get; set; }
    public decimal? PowerballLast2NumbersThirdRound { get; set; }
    public decimal? Powerball2NumbersFirstRound { get; set; }
    public decimal? Powerball3NumbersFirstRound { get; set; }
    public decimal? Powerball3NumbersSecondRound { get; set; }
    public decimal? Powerball3NumbersThirdRound { get; set; }
    public decimal? Powerball4NumbersFirstRound { get; set; }
    public decimal? Powerball4NumbersSecondRound { get; set; }
    public decimal? Powerball4NumbersThirdRound { get; set; }
}

// =============================================================================
// Footer DTOs
// =============================================================================

/// <summary>
/// DTO for Betting Pool Footer information
/// </summary>
public class BettingPoolFooterDto
{
    public bool AutoFooter { get; set; } = false;
    public string? FooterLine1 { get; set; }
    public string? FooterLine2 { get; set; }
    public string? FooterLine3 { get; set; }
    public string? FooterLine4 { get; set; }
}

/// <summary>
/// DTO for updating Betting Pool Footer
/// </summary>
public class UpdateBettingPoolFooterDto
{
    public bool AutoFooter { get; set; } = false;
    public string? FooterLine1 { get; set; }
    public string? FooterLine2 { get; set; }
    public string? FooterLine3 { get; set; }
    public string? FooterLine4 { get; set; }
}

// =============================================================================
// Mass Update DTOs
// =============================================================================

/// <summary>
/// DTO for mass updating multiple betting pools
/// </summary>
public class MassUpdateBettingPoolsDto
{
    /// <summary>
    /// List of betting pool IDs to update
    /// </summary>
    [Required(ErrorMessage = "Debe seleccionar al menos una banca")]
    [MinLength(1, ErrorMessage = "Debe seleccionar al menos una banca")]
    public List<int> BettingPoolIds { get; set; } = new();

    /// <summary>
    /// New zone ID to assign (null = no change)
    /// </summary>
    public int? ZoneId { get; set; }

    /// <summary>
    /// Active status: "on" = activate, "off" = deactivate, "no_change" = keep current
    /// </summary>
    public string? IsActive { get; set; } = "no_change";

    /// <summary>
    /// List of draw/sortition IDs to enable for selected betting pools
    /// </summary>
    public List<int>? DrawIds { get; set; }
}

/// <summary>
/// Response for mass update operation
/// </summary>
public class MassUpdateResponseDto
{
    public bool Success { get; set; }
    public int UpdatedCount { get; set; }
    public List<int> UpdatedPoolIds { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }
}

// =============================================================================
// Betting Pool User Management DTOs
// =============================================================================

/// <summary>
/// DTO for creating a new POS user and assigning to a betting pool
/// </summary>
public class CreateBettingPoolUserDto
{
    [Required(ErrorMessage = "El nombre de usuario es requerido")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre de usuario debe tener entre 3 y 100 caracteres")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    [StringLength(255, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 255 caracteres")]
    public string Password { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "El nombre completo no puede exceder 255 caracteres")]
    public string? FullName { get; set; }

    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string? Email { get; set; }

    [StringLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres")]
    public string? Phone { get; set; }
}

/// <summary>
/// Response for user assignment operation
/// </summary>
public class BettingPoolUserAssignmentResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public BettingPoolUserDto? User { get; set; }
}
