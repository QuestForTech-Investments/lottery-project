using LotteryApi.DTOs;

namespace LotteryApi.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto, LoginSessionContext? sessionContext = null);
    Task<LoginResponseDto?> RegisterAsync(RegisterDto registerDto);
    string GenerateJwtToken(int userId, string username, string? role);
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
