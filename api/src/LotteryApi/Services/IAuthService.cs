using LotteryApi.DTOs;

namespace LotteryApi.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(LoginDto loginDto, LoginSessionContext? sessionContext = null);
    Task<LoginResponseDto?> RegisterAsync(RegisterDto registerDto);
    string GenerateJwtToken(int userId, string username, string? role, int? bettingPoolId = null, bool mustChangePassword = false, bool mustSetPin = false);
}

/// <summary>
/// Result of a login attempt. Reason is set when Data is null and we want
/// the caller to differentiate "invalid credentials" from "locked"/"ip_blocked".
/// </summary>
public class LoginResult
{
    public LoginResponseDto? Data { get; set; }
    public string? Reason { get; set; }  // null = success, "invalid" | "locked" | "ip_blocked"
}

/// <summary>
/// Context for tracking login session details
/// </summary>
public class LoginSessionContext
{
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public byte DeviceType { get; set; } = 1; // Default to Web
}
