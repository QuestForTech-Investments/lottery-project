using LotteryApi.DTOs;

namespace LotteryApi.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
    Task<LoginResponseDto?> RegisterAsync(RegisterDto registerDto);
    string GenerateJwtToken(int userId, string username, string? role);
}
