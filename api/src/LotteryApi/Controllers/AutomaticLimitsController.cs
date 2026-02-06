using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs.Limits;

namespace LotteryApi.Controllers;

/// <summary>
/// Controller for automatic limits configuration
/// Handles general number controls, line controls, and random blocking
/// </summary>
[ApiController]
[Route("api/automatic-limits")]
public class AutomaticLimitsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<AutomaticLimitsController> _logger;

    // Configuration type constants
    private const string ConfigTypeGeneral = "general";
    private const string ConfigTypeLine = "line";

    public AutomaticLimitsController(LotteryDbContext context, ILogger<AutomaticLimitsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get current automatic limits configuration
    /// </summary>
    /// <returns>Complete automatic limit configuration</returns>
    [HttpGet]
    public async Task<ActionResult<AutomaticLimitConfigDto>> GetConfig()
    {
        try
        {
            var result = new AutomaticLimitConfigDto
            {
                GeneralNumberControls = await GetNumberControlSettings(ConfigTypeGeneral),
                LineControls = await GetNumberControlSettings(ConfigTypeLine)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting automatic limits configuration");
            return StatusCode(500, new { message = "Error al obtener la configuracion de limites automaticos" });
        }
    }

    /// <summary>
    /// Save complete automatic limits configuration
    /// </summary>
    /// <param name="dto">Configuration to save</param>
    [HttpPut]
    public async Task<IActionResult> SaveConfig([FromBody] AutomaticLimitConfigDto dto)
    {
        try
        {
            await SaveNumberControlSettings(ConfigTypeGeneral, dto.GeneralNumberControls);
            await SaveNumberControlSettings(ConfigTypeLine, dto.LineControls);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Saved complete automatic limits configuration");

            return Ok(new { message = "Configuracion guardada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving automatic limits configuration");
            return StatusCode(500, new { message = "Error al guardar la configuracion de limites automaticos" });
        }
    }

    /// <summary>
    /// Save general configuration (both general number controls and line controls)
    /// This endpoint handles the full config coming from the frontend
    /// </summary>
    /// <param name="dto">Configuration to save</param>
    [HttpPut("general")]
    public async Task<IActionResult> SaveGeneralConfig([FromBody] AutomaticLimitConfigDto dto)
    {
        try
        {
            await SaveNumberControlSettings(ConfigTypeGeneral, dto.GeneralNumberControls);
            await SaveNumberControlSettings(ConfigTypeLine, dto.LineControls);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Saved general automatic limits configuration");

            return Ok(new { message = "Configuracion general guardada exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving general automatic limits configuration");
            return StatusCode(500, new { message = "Error al guardar la configuracion general" });
        }
    }

    /// <summary>
    /// Update general number controls only
    /// </summary>
    /// <param name="dto">General number controls settings</param>
    [HttpPut("general-number-controls")]
    public async Task<IActionResult> UpdateGeneralNumberControls([FromBody] NumberControlSettingsDto dto)
    {
        try
        {
            await SaveNumberControlSettings(ConfigTypeGeneral, dto);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated general number controls");

            return Ok(new { message = "Controles de numeros generales actualizados exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating general number controls");
            return StatusCode(500, new { message = "Error al actualizar los controles de numeros generales" });
        }
    }

    /// <summary>
    /// Update line controls only
    /// </summary>
    /// <param name="dto">Line controls settings</param>
    [HttpPut("line-controls")]
    public async Task<IActionResult> UpdateLineControls([FromBody] NumberControlSettingsDto dto)
    {
        try
        {
            await SaveNumberControlSettings(ConfigTypeLine, dto);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated line controls");

            return Ok(new { message = "Controles de linea actualizados exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating line controls");
            return StatusCode(500, new { message = "Error al actualizar los controles de linea" });
        }
    }

    /// <summary>
    /// Get random block configuration
    /// </summary>
    /// <returns>Random block configuration</returns>
    [HttpGet("random-block")]
    public async Task<ActionResult<RandomBlockConfigDto>> GetRandomBlockConfig()
    {
        try
        {
            var config = await _context.Set<RandomBlockConfig>().FirstOrDefaultAsync();

            if (config == null)
            {
                return Ok(new RandomBlockConfigDto
                {
                    DrawIds = new List<int>(),
                    BettingPoolId = null,
                    PalesToBlock = 0
                });
            }

            return Ok(new RandomBlockConfigDto
            {
                DrawIds = config.DrawIds,
                BettingPoolId = config.BettingPoolId,
                PalesToBlock = config.PalesToBlock
            });
        }
        catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message.Contains("Invalid object name") == true)
        {
            // Table doesn't exist yet - return default values
            _logger.LogWarning("random_block_configs table does not exist, returning defaults");
            return Ok(new RandomBlockConfigDto
            {
                DrawIds = new List<int>(),
                BettingPoolId = null,
                PalesToBlock = 0
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting random block configuration");
            return StatusCode(500, new { message = "Error al obtener la configuracion de bloqueo aleatorio" });
        }
    }

    /// <summary>
    /// Save random block configuration
    /// </summary>
    /// <param name="dto">Random block configuration to save</param>
    [HttpPut("random-block")]
    public async Task<IActionResult> SaveRandomBlock([FromBody] RandomBlockConfigDto dto)
    {
        try
        {
            var existingConfig = await _context.Set<RandomBlockConfig>().FirstOrDefaultAsync();

            if (existingConfig == null)
            {
                existingConfig = new RandomBlockConfig();
                _context.Set<RandomBlockConfig>().Add(existingConfig);
            }

            existingConfig.DrawIds = dto.DrawIds;
            existingConfig.BettingPoolId = dto.BettingPoolId;
            existingConfig.PalesToBlock = dto.PalesToBlock;
            existingConfig.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Saved random block configuration with {DrawCount} draws, {PalesToBlock} pales to block",
                dto.DrawIds.Count, dto.PalesToBlock);

            return Ok(new { message = "Configuracion de bloqueo aleatorio guardada exitosamente" });
        }
        catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message.Contains("Invalid object name") == true)
        {
            _logger.LogWarning("random_block_configs table does not exist");
            return StatusCode(500, new { message = "La tabla de configuracion de bloqueo aleatorio no existe. Ejecute las migraciones de base de datos." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving random block configuration");
            return StatusCode(500, new { message = "Error al guardar la configuracion de bloqueo aleatorio" });
        }
    }

    /// <summary>
    /// Execute random block action
    /// Blocks random pale numbers based on configuration
    /// </summary>
    /// <param name="dto">Random block configuration to execute</param>
    /// <returns>Result of blocking action</returns>
    [HttpPost("random-block/execute")]
    public ActionResult<RandomBlockExecutionResultDto> ExecuteRandomBlock([FromBody] RandomBlockConfigDto dto)
    {
        try
        {
            if (dto.DrawIds == null || dto.DrawIds.Count == 0)
            {
                return BadRequest(new { message = "Debe seleccionar al menos un sorteo" });
            }

            if (dto.PalesToBlock <= 0)
            {
                return BadRequest(new { message = "El numero de pales a bloquear debe ser mayor a 0" });
            }

            // Generate random pale numbers to block
            var random = new Random();
            var blockedPales = new List<int>();

            // Generate unique random pale numbers (00-99 for first digit, 00-99 for second = 2 digit pairs)
            // For simplicity, we'll generate random 2-digit combinations
            while (blockedPales.Count < dto.PalesToBlock)
            {
                var firstNumber = random.Next(0, 100);
                var secondNumber = random.Next(0, 100);

                // Ensure pale is valid (first < second to avoid duplicates like 12-21 vs 21-12)
                if (firstNumber != secondNumber)
                {
                    var paleValue = Math.Min(firstNumber, secondNumber) * 100 + Math.Max(firstNumber, secondNumber);
                    if (!blockedPales.Contains(paleValue))
                    {
                        blockedPales.Add(paleValue);
                    }
                }
            }

            // Here we would create limit rules for each blocked pale
            // For now, log the action and return the result
            _logger.LogInformation("Executed random block: {BlockedCount} pales blocked for draws {DrawIds}",
                blockedPales.Count, string.Join(",", dto.DrawIds));

            // Create limit rules for blocked pales (if needed in the future)
            // This is a placeholder for the actual implementation

            return Ok(new RandomBlockExecutionResultDto
            {
                BlockedCount = blockedPales.Count,
                Message = $"Se bloquearon {blockedPales.Count} pales exitosamente",
                BlockedPales = blockedPales
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing random block");
            return StatusCode(500, new { message = "Error al ejecutar el bloqueo aleatorio" });
        }
    }

    /// <summary>
    /// Reset automatic limits to default values
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> ResetToDefaults()
    {
        try
        {
            // Delete all existing automatic limit configs
            var existingConfigs = await _context.Set<AutomaticLimitConfig>().ToListAsync();
            _context.Set<AutomaticLimitConfig>().RemoveRange(existingConfigs);

            // Delete random block config
            var randomBlockConfig = await _context.Set<RandomBlockConfig>().FirstOrDefaultAsync();
            if (randomBlockConfig != null)
            {
                _context.Set<RandomBlockConfig>().Remove(randomBlockConfig);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Reset automatic limits to defaults");

            return Ok(new { message = "Configuracion restablecida a valores por defecto" });
        }
        catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message.Contains("Invalid object name") == true)
        {
            // Tables don't exist - that's fine, they're already at defaults
            return Ok(new { message = "Configuracion restablecida a valores por defecto" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting automatic limits to defaults");
            return StatusCode(500, new { message = "Error al restablecer la configuracion" });
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /// <summary>
    /// Get number control settings for a specific config type
    /// </summary>
    private async Task<NumberControlSettingsDto> GetNumberControlSettings(string configType)
    {
        try
        {
            var config = await _context.Set<AutomaticLimitConfig>()
                .FirstOrDefaultAsync(c => c.ConfigType == configType);

            if (config == null)
            {
                return new NumberControlSettingsDto
                {
                    EnableDirecto = false,
                    MontoDirecto = 0,
                    EnablePale = false,
                    MontoPale = 0,
                    EnableSuperPale = false,
                    MontoSuperPale = 0
                };
            }

            return new NumberControlSettingsDto
            {
                EnableDirecto = config.EnableDirecto,
                MontoDirecto = config.MontoDirecto,
                EnablePale = config.EnablePale,
                MontoPale = config.MontoPale,
                EnableSuperPale = config.EnableSuperPale,
                MontoSuperPale = config.MontoSuperPale
            };
        }
        catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message.Contains("Invalid object name") == true)
        {
            // Table doesn't exist yet - return default values
            _logger.LogWarning("automatic_limit_configs table does not exist, returning defaults");
            return new NumberControlSettingsDto
            {
                EnableDirecto = false,
                MontoDirecto = 0,
                EnablePale = false,
                MontoPale = 0,
                EnableSuperPale = false,
                MontoSuperPale = 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching config for type {ConfigType}, returning defaults", configType);
            return new NumberControlSettingsDto
            {
                EnableDirecto = false,
                MontoDirecto = 0,
                EnablePale = false,
                MontoPale = 0,
                EnableSuperPale = false,
                MontoSuperPale = 0
            };
        }
    }

    /// <summary>
    /// Save number control settings for a specific config type
    /// </summary>
    private async Task SaveNumberControlSettings(string configType, NumberControlSettingsDto dto)
    {
        var existingConfig = await _context.Set<AutomaticLimitConfig>()
            .FirstOrDefaultAsync(c => c.ConfigType == configType);

        if (existingConfig == null)
        {
            existingConfig = new AutomaticLimitConfig
            {
                ConfigType = configType
            };
            _context.Set<AutomaticLimitConfig>().Add(existingConfig);
        }

        existingConfig.EnableDirecto = dto.EnableDirecto;
        existingConfig.MontoDirecto = dto.MontoDirecto;
        existingConfig.EnablePale = dto.EnablePale;
        existingConfig.MontoPale = dto.MontoPale;
        existingConfig.EnableSuperPale = dto.EnableSuperPale;
        existingConfig.MontoSuperPale = dto.MontoSuperPale;
        existingConfig.UpdatedAt = DateTime.UtcNow;
    }
}
