using System.Security.Cryptography;

namespace LotteryApi.Helpers;

public static class PasswordHelper
{
    private const string ADMIN_LOWER = "abcdefghijkmnopqrstuvwxyz";   // skip 'l'
    private const string ADMIN_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";    // skip I, O
    private const string ADMIN_DIGITS = "23456789";                   // skip 0, 1
    private const string NUMERIC = "0123456789";

    /// <summary>
    /// 6-digit numeric password for POS / banca users.
    /// </summary>
    public static string GenerateNumeric6() => RandomString(NUMERIC, 6);

    /// <summary>
    /// 8-character alphanumeric (mixed case + digits) for admin users.
    /// Guarantees at least one lower, one upper, and one digit.
    /// </summary>
    public static string GenerateAdminTempPassword(int length = 8)
    {
        if (length < 6) length = 8;
        var pool = ADMIN_LOWER + ADMIN_UPPER + ADMIN_DIGITS;
        var chars = new char[length];
        chars[0] = ADMIN_LOWER[RandomInt(ADMIN_LOWER.Length)];
        chars[1] = ADMIN_UPPER[RandomInt(ADMIN_UPPER.Length)];
        chars[2] = ADMIN_DIGITS[RandomInt(ADMIN_DIGITS.Length)];
        for (var i = 3; i < length; i++)
        {
            chars[i] = pool[RandomInt(pool.Length)];
        }
        // Shuffle
        for (var i = chars.Length - 1; i > 0; i--)
        {
            var j = RandomInt(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }
        return new string(chars);
    }

    /// <summary>
    /// Validates an admin-tier password (>=7 chars, must contain letter and digit).
    /// </summary>
    public static (bool ok, string? error) ValidateAdminPassword(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 7)
            return (false, "La contraseña debe tener al menos 7 caracteres");
        if (!password.Any(char.IsLetter))
            return (false, "La contraseña debe contener al menos una letra");
        if (!password.Any(char.IsDigit))
            return (false, "La contraseña debe contener al menos un número");
        return (true, null);
    }

    /// <summary>
    /// Validates a banca-tier password (>=6 chars, free format).
    /// </summary>
    public static (bool ok, string? error) ValidateBancaPassword(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 6)
            return (false, "La contraseña debe tener al menos 6 caracteres");
        return (true, null);
    }

    /// <summary>
    /// Validates a 4-digit numeric PIN.
    /// </summary>
    public static (bool ok, string? error) ValidatePin(string pin)
    {
        if (string.IsNullOrEmpty(pin) || pin.Length != 4 || !pin.All(char.IsDigit))
            return (false, "El PIN debe ser exactamente 4 dígitos");
        return (true, null);
    }

    private static string RandomString(string pool, int length)
    {
        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            chars[i] = pool[RandomInt(pool.Length)];
        }
        return new string(chars);
    }

    private static int RandomInt(int exclusiveMax) => RandomNumberGenerator.GetInt32(exclusiveMax);
}
