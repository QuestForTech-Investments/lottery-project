using Microsoft.AspNetCore.Mvc;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Login with username and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        // Capture session context for logging
        var sessionContext = new LoginSessionContext
        {
            IpAddress = GetClientIpAddress(),
            UserAgent = Request.Headers["User-Agent"].ToString(),
            DeviceType = DetermineDeviceType(Request.Headers["User-Agent"].ToString())
        };

        var result = await _authService.LoginAsync(loginDto, sessionContext);

        if (result == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Get the client's IP address from the request
    /// </summary>
    private string? GetClientIpAddress()
    {
        // Check X-Forwarded-For header first (for proxied requests)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // Take the first IP in the list (original client)
            return forwardedFor.Split(',').First().Trim();
        }

        // Check X-Real-IP header
        var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fall back to RemoteIpAddress
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    /// <summary>
    /// Determine device type from User-Agent header
    /// </summary>
    private byte DetermineDeviceType(string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
        {
            return DeviceTypes.Web;
        }

        var ua = userAgent.ToLower();

        // Check for mobile app (usually has custom app identifier)
        if (ua.Contains("lotteryapp") || ua.Contains("lottery-app") || ua.Contains("okhttp"))
        {
            return DeviceTypes.App;
        }

        // Check for mobile browser
        if (ua.Contains("mobile") || ua.Contains("android") || ua.Contains("iphone") ||
            ua.Contains("ipad") || ua.Contains("ipod") || ua.Contains("windows phone"))
        {
            return DeviceTypes.MobileBrowser;
        }

        // Default to web
        return DeviceTypes.Web;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (result == null)
        {
            return BadRequest(new { message = "Username already exists" });
        }

        return CreatedAtAction(nameof(Register), result);
    }
}
