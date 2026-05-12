using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
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

    public async Task<LoginResult> LoginAsync(LoginDto loginDto, LoginSessionContext? sessionContext = null)
    {
        var ip = sessionContext?.IpAddress;

        // IP block: refuse before even looking up the user.
        if (!string.IsNullOrEmpty(ip))
        {
            var ipBlocked = await _context.BlockedIps.AsNoTracking()
                .AnyAsync(b => b.IpAddress == ip);
            if (ipBlocked)
            {
                return new LoginResult { Reason = "ip_blocked" };
            }
        }

        var user = await _userRepository.GetByUsernameAsync(loginDto.Username);

        // Locked user: refuse even if the password is correct — admin must unblock.
        if (user != null && user.IsPasswordLocked)
        {
            return new LoginResult { Reason = "locked" };
        }

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            await RecordFailedAttemptAsync(user?.UserId, loginDto.Username, "password", ip);
            await ApplyLockoutIfThresholdReachedAsync(user, "password", ip);
            return new LoginResult { Reason = "invalid" };
        }

        // Success — clear any pending failed-attempts counter for this user.
        await ClearFailedAttemptsAsync(user.UserId, "password");

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

        var token = GenerateJwtToken(
            user.UserId,
            user.Username,
            user.Role?.RoleName,
            userBettingPool?.BettingPoolId,
            user.MustChangePassword,
            user.MustSetPin);

        return new LoginResult
        {
            Data = new LoginResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role?.RoleName,
                BettingPoolId = userBettingPool?.BettingPoolId,
                BettingPoolName = userBettingPool?.BettingPool?.BettingPoolName,
                ExpiresAt = DateTime.UtcNow.AddHours(12),
                MustChangePassword = user.MustChangePassword,
                MustSetPin = user.MustSetPin
            }
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

    public string GenerateJwtToken(
        int userId,
        string username,
        string? role,
        int? bettingPoolId = null,
        bool mustChangePassword = false,
        bool mustSetPin = false)
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
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("mustChangePassword", mustChangePassword ? "true" : "false"),
            new Claim("mustSetPin", mustSetPin ? "true" : "false")
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

    // ─────────────────────────────────────────────────────────────
    // Lockout helpers
    // ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Record a failed login/pin attempt. Always logged for audit.
    /// </summary>
    private async Task RecordFailedAttemptAsync(int? userId, string? username, string attemptType, string? ip)
    {
        try
        {
            _context.AuthFailedAttempts.Add(new AuthFailedAttempt
            {
                UserId = userId,
                Username = username,
                AttemptType = attemptType,
                IpAddress = ip,
                AttemptedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to record auth attempt for {Username} ({Type})", username, attemptType);
        }
    }

    /// <summary>
    /// Check counters and lock the user (and/or IP) if thresholds were reached.
    /// </summary>
    private async Task ApplyLockoutIfThresholdReachedAsync(User? user, string attemptType, string? ip)
    {
        var pwdThreshold = _configuration.GetValue<int?>("Lockout:PasswordFailThreshold") ?? 5;
        var pinThreshold = _configuration.GetValue<int?>("Lockout:PinFailThreshold") ?? 3;
        var ipThreshold = _configuration.GetValue<int?>("Lockout:IpFailThreshold") ?? 15;
        var ipWindowMin = _configuration.GetValue<int?>("Lockout:IpWindowMinutes") ?? 10;

        if (user != null)
        {
            // Count this user's consecutive failures since their last successful login.
            var since = user.LastLoginAt ?? DateTime.UtcNow.AddYears(-1);
            var count = await _context.AuthFailedAttempts.AsNoTracking()
                .CountAsync(a => a.UserId == user.UserId
                    && a.AttemptType == attemptType
                    && a.AttemptedAt > since);

            var threshold = attemptType == "pin" ? pinThreshold : pwdThreshold;
            if (count >= threshold)
            {
                if (attemptType == "pin" && !user.IsPinLocked)
                {
                    user.IsPinLocked = true;
                    user.PinLockedAt = DateTime.UtcNow;
                    user.PinLockedIp = ip;
                    await _userRepository.UpdateAsync(user);
                    await _context.SaveChangesAsync();
                    _logger.LogWarning("User {UserId} ({Username}) locked (PIN) after {Count} failed attempts from {Ip}",
                        user.UserId, user.Username, count, ip);
                }
                else if (attemptType == "password" && !user.IsPasswordLocked)
                {
                    user.IsPasswordLocked = true;
                    user.PasswordLockedAt = DateTime.UtcNow;
                    user.PasswordLockedIp = ip;
                    await _userRepository.UpdateAsync(user);
                    await _context.SaveChangesAsync();
                    _logger.LogWarning("User {UserId} ({Username}) locked (password) after {Count} failed attempts from {Ip}",
                        user.UserId, user.Username, count, ip);
                }
            }
        }

        // IP-level block: counts any failed attempt from this IP in the window.
        if (!string.IsNullOrEmpty(ip))
        {
            var windowStart = DateTime.UtcNow.AddMinutes(-ipWindowMin);
            var ipCount = await _context.AuthFailedAttempts.AsNoTracking()
                .CountAsync(a => a.IpAddress == ip && a.AttemptedAt > windowStart);

            if (ipCount >= ipThreshold)
            {
                var existing = await _context.BlockedIps.FirstOrDefaultAsync(b => b.IpAddress == ip);
                if (existing == null)
                {
                    _context.BlockedIps.Add(new BlockedIp
                    {
                        IpAddress = ip,
                        BlockedAt = DateTime.UtcNow,
                        LastUsername = user?.Username,
                        Reason = $"{ipCount} failed attempts in {ipWindowMin} min"
                    });
                    await _context.SaveChangesAsync();
                    _logger.LogWarning("IP {Ip} blocked after {Count} failed attempts in {Min} min",
                        ip, ipCount, ipWindowMin);
                }
            }
        }
    }

    /// <summary>
    /// Wipe the running failed-attempt counter for a user (called on success).
    /// </summary>
    private async Task ClearFailedAttemptsAsync(int userId, string attemptType)
    {
        try
        {
            // Cheap "soft reset": just stamp a marker by leaving the rows but updating LastLoginAt.
            // The counter in ApplyLockoutIfThresholdReachedAsync counts attempts *after* LastLoginAt,
            // so a successful login naturally resets the count without a delete.
            await Task.CompletedTask;
            _ = userId; _ = attemptType;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed clearing attempts for user {UserId}", userId);
        }
    }
}
