namespace LotteryApi.DTOs;

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public int? BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool MustChangePassword { get; set; }
    public bool MustSetPin { get; set; }
    /// <summary>BCP-47 tag — frontend uses to set i18n.language on login. Null = es default.</summary>
    public string? PreferredLanguage { get; set; }
    /// <summary>Idle auto-logout minutes for this user. Null → use the frontend
    /// default (15 min). 0 → disable auto-logout. &gt;0 → log out after N idle minutes.</summary>
    public int? AutoLogoutMinutes { get; set; }
}

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Phone { get; set; }
}
