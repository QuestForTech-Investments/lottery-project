namespace LotteryApi.DTOs;

/// <summary>
/// DTO for user information
/// </summary>
public class UserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    public decimal CommissionRate { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new user with permissions
/// </summary>
public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
    public List<int>? ZoneIds { get; set; }  // Changed from ZoneId to ZoneIds (array)
    public int? BranchId { get; set; }
    public decimal CommissionRate { get; set; } = 0.00m;
    public bool IsActive { get; set; } = true;
    public List<int>? PermissionIds { get; set; }
}

/// <summary>
/// DTO for updating user information
/// </summary>
public class UpdateUserDto
{
    public string? Username { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for updating user permissions
/// </summary>
public class UpdateUserPermissionsDto
{
    public List<int> PermissionIds { get; set; } = new();
}

/// <summary>
/// DTO for updating user completely (permissions, zones, branch, role)
/// </summary>
public class UpdateUserCompleteDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
    public List<int>? ZoneIds { get; set; }  // Changed from ZoneId to ZoneIds (array)
    public int? BranchId { get; set; }
    /// <summary>
    /// When true, removes any existing betting-pool assignment for this user.
    /// Lets the frontend "Asignar Banca" toggle un-assign a banca cleanly.
    /// </summary>
    public bool? ClearBranch { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool? IsActive { get; set; }
    public List<int>? PermissionIds { get; set; }
}

/// <summary>
/// DTO for user with detailed information including permissions
/// </summary>
public class UserDetailDto : UserDto
{
    public List<PermissionDto> Permissions { get; set; } = new();
    public List<int> ZoneIds { get; set; } = new();
    public List<int> BettingPoolIds { get; set; } = new();

    /// <summary>
    /// Plaintext temporary password — only populated on user creation. Shown once to the admin.
    /// </summary>
    public string? TemporaryPassword { get; set; }
}

/// <summary>
/// DTO for changing user password
/// </summary>
public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// DTO for admin reset password (no current password required)
/// </summary>
public class AdminResetPasswordDto
{
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Returned after creating a user or generating a temp password.
/// The plaintext is only ever returned once; it must be communicated to the user.
/// </summary>
public class TemporaryCredentialDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
    public bool IsAdminPassword { get; set; }
}

/// <summary>
/// DTO for setting / changing the 4-digit admin PIN.
/// </summary>
public class SetPinDto
{
    public string Pin { get; set; } = string.Empty;
}

/// <summary>
/// DTO for verifying an admin PIN before a sensitive action.
/// </summary>
public class VerifyPinDto
{
    public string Pin { get; set; } = string.Empty;
}

/// <summary>
/// DTO for POS user with betting pool information
/// </summary>
public class PosUserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime? CreatedAt { get; set; }

    // Betting Pool info
    public int? BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public string? BettingPoolCode { get; set; }
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
}
