using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Repositories;

namespace LotteryApi.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly LotteryDbContext _context;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        LotteryDbContext context,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto, LoginSessionContext? sessionContext = null)
    {
        var user = await _userRepository.GetByUsernameAsync(loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Log the session if context is provided
        if (sessionContext != null)
        {
            await LogLoginSessionAsync(user, sessionContext);
        }

        // Get user's assigned betting pool (if any)
        var userBettingPool = user.UserBettingPools?.FirstOrDefault(ubp => ubp.IsActive);

        var token = GenerateJwtToken(user.UserId, user.Username, user.Role?.RoleName, userBettingPool?.BettingPoolId);

        return new LoginResponseDto
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role?.RoleName,
            BettingPoolId = userBettingPool?.BettingPoolId,
            BettingPoolName = userBettingPool?.BettingPool?.BettingPoolName,
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        };
    }

    private async Task LogLoginSessionAsync(User user, LoginSessionContext context)
    {
        try
        {
            // Get the user's betting pool and zone if available
            int? bettingPoolId = null;
            int? zoneId = null;

            var userBettingPool = user.UserBettingPools?.FirstOrDefault();
            if (userBettingPool != null)
            {
                bettingPoolId = userBettingPool.BettingPoolId;
            }

            var userZone = user.UserZones?.FirstOrDefault();
            if (userZone != null)
            {
                zoneId = userZone.ZoneId;
            }

            var loginSession = new LoginSession
            {
                UserId = user.UserId,
                BettingPoolId = bettingPoolId,
                ZoneId = zoneId,
                DeviceType = context.DeviceType,
                IpAddress = context.IpAddress,
                UserAgent = context.UserAgent?.Length > 500 ? context.UserAgent.Substring(0, 500) : context.UserAgent,
                LoginAt = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.LoginSessions.Add(loginSession);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Login session logged for user {UserId} ({Username}), device: {DeviceType}, IP: {IpAddress}",
                user.UserId, user.Username, DeviceTypes.GetName(context.DeviceType), context.IpAddress);
        }
        catch (Exception ex)
        {
            // Don't fail login if session logging fails
            _logger.LogError(ex, "Failed to log login session for user {UserId}", user.UserId);
        }
    }

    public async Task<LoginResponseDto?> RegisterAsync(RegisterDto registerDto)
    {
        // Check if username already exists
        var existingUser = await _userRepository.GetByUsernameAsync(registerDto.Username);
        if (existingUser != null)
        {
            return null;
        }

        var newUser = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            Email = registerDto.Email,
            FullName = registerDto.FullName,
            Phone = registerDto.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(newUser);

        var token = GenerateJwtToken(newUser.UserId, newUser.Username, null);

        return new LoginResponseDto
        {
            Token = token,
            Username = newUser.Username,
            Email = newUser.Email,
            FullName = newUser.FullName,
            ExpiresAt = DateTime.UtcNow.AddHours(12)
        };
    }

    public string GenerateJwtToken(int userId, string username, string? role, int? bettingPoolId = null)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "LotteryApi";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "LotteryApi";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim("userId", userId.ToString()),
            new Claim("username", username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrEmpty(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (bettingPoolId.HasValue)
        {
            claims.Add(new Claim("bettingPoolId", bettingPoolId.Value.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
