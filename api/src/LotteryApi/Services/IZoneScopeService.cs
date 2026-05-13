namespace LotteryApi.Services;

/// <summary>
/// Resolves the set of zones the currently authenticated admin user is allowed to act on.
///
/// Rule: an admin with NO zones assigned is treated as super-admin (no restriction).
/// Otherwise, the admin can only see/modify resources whose zone is in their assigned set.
///
/// POS users are not subject to this scope — their access is bounded by their assigned banca.
/// </summary>
public interface IZoneScopeService
{
    /// <summary>
    /// Returns the zone IDs allowed for the current user, or null if the user is
    /// unrestricted (super-admin / no zones assigned / POS / anonymous).
    ///
    /// Callers should treat null as "no filtering" and a non-null list as a hard filter.
    /// </summary>
    Task<List<int>?> GetAllowedZoneIdsAsync();

    /// <summary>
    /// Returns the betting pool IDs allowed for the current user, derived from their
    /// allowed zones. Returns null if the user is unrestricted.
    /// </summary>
    Task<List<int>?> GetAllowedBettingPoolIdsAsync();

    /// <summary>
    /// Validates that the given zone is within the current user's allowed scope.
    /// Returns true if unrestricted or zone is allowed; false otherwise.
    /// </summary>
    Task<bool> IsZoneAllowedAsync(int zoneId);

    /// <summary>
    /// Validates that the given betting pool is within the current user's allowed scope.
    /// Returns true if unrestricted or the banca's zone is allowed; false otherwise.
    /// </summary>
    Task<bool> IsBettingPoolAllowedAsync(int bettingPoolId);
}
