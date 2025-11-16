using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// Zone DTO for list/detail responses
/// </summary>
public class ZoneDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public string? CountryName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public int UserCount { get; set; }
    public int BettingPoolCount { get; set; }
}

/// <summary>
/// DTO for creating a new zone
/// </summary>
public class CreateZoneDto
{
    [Required(ErrorMessage = "Zone name is required")]
    [StringLength(100, ErrorMessage = "Zone name cannot exceed 100 characters")]
    public string ZoneName { get; set; } = string.Empty;

    public int? CountryId { get; set; }

    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for updating a zone
/// </summary>
public class UpdateZoneDto
{
    [StringLength(100, ErrorMessage = "Zone name cannot exceed 100 characters")]
    public string? ZoneName { get; set; }

    public int? CountryId { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for assigning users to a zone (N:M relationship)
/// </summary>
public class AssignUsersToZoneDto
{
    [Required(ErrorMessage = "User IDs are required")]
    [MinLength(1, ErrorMessage = "At least one user ID is required")]
    public List<int> UserIds { get; set; } = new();
}

/// <summary>
/// DTO for zone with users (N:M relationship)
/// </summary>
public class ZoneWithUsersDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int? CountryId { get; set; }
    public string? CountryName { get; set; }
    public bool IsActive { get; set; }

    public List<UserBasicDto> Users { get; set; } = new();
}

/// <summary>
/// Basic user info for zone assignments
/// </summary>
public class UserBasicDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
}
