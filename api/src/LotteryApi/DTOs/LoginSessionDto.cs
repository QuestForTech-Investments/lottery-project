namespace LotteryApi.DTOs;

/// <summary>
/// DTO for login session list response
/// </summary>
public class LoginSessionDto
{
    public int SessionId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int? BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public string? BettingPoolCode { get; set; }
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public byte DeviceType { get; set; }
    public string DeviceTypeName { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public DateTime LoginAt { get; set; }
    public DateTime? LogoutAt { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for grouped login sessions by banca (matching Vue original format)
/// </summary>
public class BancaLoginSummaryDto
{
    public int Id { get; set; }
    public string Banca { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
    public int? BettingPoolId { get; set; }
    public int? ZoneId { get; set; }

    // Web sessions
    public string? PrimeraWeb { get; set; }
    public string? UltimaWeb { get; set; }

    // Mobile browser sessions
    public string? PrimeraCelular { get; set; }
    public string? UltimaCelular { get; set; }

    // App sessions
    public string? PrimeraApp { get; set; }
    public string? UltimaApp { get; set; }
}

/// <summary>
/// DTO for IP collision detection
/// </summary>
public class IpCollisionDto
{
    public string IpAddress { get; set; } = string.Empty;
    public List<BancaLoginSummaryDto> Sessions { get; set; } = new();
    public int SessionCount { get; set; }
}

/// <summary>
/// DTO for login session query parameters
/// </summary>
public class LoginSessionQueryDto
{
    public DateTime? Date { get; set; }
    public List<int>? ZoneIds { get; set; }
    public int? BettingPoolId { get; set; }
    public string? SearchText { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 100;
}

/// <summary>
/// Response DTO for login sessions with pagination
/// </summary>
public class LoginSessionsResponseDto
{
    public List<BancaLoginSummaryDto> Bancas { get; set; } = new();
    public List<IpCollisionDto> Colisiones { get; set; } = new();
    public int TotalRecords { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

/// <summary>
/// DTO for creating a login session (internal use)
/// </summary>
public class CreateLoginSessionDto
{
    public int UserId { get; set; }
    public int? BettingPoolId { get; set; }
    public int? ZoneId { get; set; }
    public byte DeviceType { get; set; } = 1;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
