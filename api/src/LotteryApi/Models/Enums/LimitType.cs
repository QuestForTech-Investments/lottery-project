namespace LotteryApi.Models.Enums;

/// <summary>
/// Defines the different types of betting limits in the lottery system.
/// Each limit type determines at which level the limit is applied and how it's calculated.
/// </summary>
public enum LimitType
{
    /// <summary>
    /// General limit applied at the group level for all numbers
    /// </summary>
    GeneralForGroup = 1,

    /// <summary>
    /// Limit applied at the group level for specific numbers
    /// </summary>
    ByNumberForGroup = 2,

    /// <summary>
    /// General limit applied at the betting pool level for all numbers
    /// </summary>
    GeneralForBettingPool = 3,

    /// <summary>
    /// Limit applied at the betting pool level for specific numbers (Linea)
    /// </summary>
    ByNumberForBettingPool = 4,

    /// <summary>
    /// Local limit that only applies within a specific betting pool
    /// </summary>
    LocalForBettingPool = 5,

    /// <summary>
    /// General limit applied at the zone level for all numbers
    /// </summary>
    GeneralForZone = 6,

    /// <summary>
    /// Limit applied at the zone level for specific numbers
    /// </summary>
    ByNumberForZone = 7,

    /// <summary>
    /// General limit for external groups
    /// </summary>
    GeneralForExternalGroup = 8,

    /// <summary>
    /// Limit applied for external groups on specific numbers
    /// </summary>
    ByNumberForExternalGroup = 9,

    /// <summary>
    /// Absolute limit that cannot be exceeded under any circumstances
    /// </summary>
    Absolute = 10
}
