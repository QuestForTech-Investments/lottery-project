using LotteryApi.DTOs;

namespace LotteryApi.Services;

public interface ILoginSessionService
{
    /// <summary>
    /// Get login sessions with optional filters
    /// </summary>
    Task<LoginSessionsResponseDto> GetLoginSessionsAsync(LoginSessionQueryDto query);

    /// <summary>
    /// Create a new login session record
    /// </summary>
    Task<int> CreateLoginSessionAsync(CreateLoginSessionDto dto);

    /// <summary>
    /// End a login session (logout)
    /// </summary>
    Task EndLoginSessionAsync(int sessionId);

    /// <summary>
    /// End all active sessions for a user
    /// </summary>
    Task EndAllUserSessionsAsync(int userId);
}
