using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api")]
public class GameTypesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<GameTypesController> _logger;

    public GameTypesController(
        LotteryDbContext context,
        ILogger<GameTypesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all game types
    /// </summary>
    [HttpGet("game-types")]
    public async Task<ActionResult<List<GameTypeDto>>> GetAllGameTypes()
    {
        try
        {
            var gameTypes = await _context.GameTypes
                .Where(gt => gt.IsActive)
                .OrderBy(gt => gt.DisplayOrder ?? int.MaxValue)
                .ThenBy(gt => gt.GameName)
                .Select(gt => new GameTypeDto
                {
                    GameTypeId = gt.GameTypeId,
                    GameTypeCode = gt.GameTypeCode,
                    GameName = gt.GameName,
                    PrizeMultiplier = gt.PrizeMultiplier,
                    NumberLength = gt.NumberLength,
                    RequiresAdditionalNumber = gt.RequiresAdditionalNumber,
                    DisplayOrder = gt.DisplayOrder
                })
                .ToListAsync();

            return Ok(gameTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipos de apuestas");
            return StatusCode(500, new { message = $"Error al obtener tipos de apuestas: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get game types compatible with a specific lottery
    /// </summary>
    [HttpGet("lotteries/{lotteryId}/game-types")]
    public async Task<ActionResult<List<GameTypeDto>>> GetGameTypesByLottery(int lotteryId)
    {
        try
        {
            var lotteryExists = await _context.Lotteries
                .AnyAsync(l => l.LotteryId == lotteryId);

            if (!lotteryExists)
            {
                return NotFound(new { message = "Lotería no encontrada" });
            }

            var gameTypes = await _context.LotteryGameCompatibilities
                .Where(lgc => lgc.LotteryId == lotteryId && lgc.IsActive)
                .Include(lgc => lgc.GameType)
                .Where(lgc => lgc.GameType != null && lgc.GameType.IsActive)
                .OrderBy(lgc => lgc.GameType!.DisplayOrder ?? int.MaxValue)
                .ThenBy(lgc => lgc.GameType!.GameName)
                .Select(lgc => new GameTypeDto
                {
                    GameTypeId = lgc.GameType!.GameTypeId,
                    GameTypeCode = lgc.GameType.GameTypeCode,
                    GameName = lgc.GameType.GameName,
                    PrizeMultiplier = lgc.GameType.PrizeMultiplier,
                    NumberLength = lgc.GameType.NumberLength,
                    RequiresAdditionalNumber = lgc.GameType.RequiresAdditionalNumber,
                    DisplayOrder = lgc.GameType.DisplayOrder
                })
                .ToListAsync();

            return Ok(gameTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipos de apuestas para la lotería {LotteryId}", lotteryId);
            return StatusCode(500, new { message = $"Error al obtener tipos de apuestas: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get a specific game type by ID
    /// </summary>
    [HttpGet("game-types/{gameTypeId}")]
    public async Task<ActionResult<GameTypeDto>> GetGameType(int gameTypeId)
    {
        try
        {
            var gameType = await _context.GameTypes
                .Where(gt => gt.GameTypeId == gameTypeId)
                .Select(gt => new GameTypeDto
                {
                    GameTypeId = gt.GameTypeId,
                    GameTypeCode = gt.GameTypeCode,
                    GameName = gt.GameName,
                    PrizeMultiplier = gt.PrizeMultiplier,
                    NumberLength = gt.NumberLength,
                    RequiresAdditionalNumber = gt.RequiresAdditionalNumber,
                    DisplayOrder = gt.DisplayOrder
                })
                .FirstOrDefaultAsync();

            if (gameType == null)
            {
                return NotFound(new { message = "Tipo de apuesta no encontrado" });
            }

            return Ok(gameType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipo de apuesta {GameTypeId}", gameTypeId);
            return StatusCode(500, new { message = $"Error al obtener tipo de apuesta: {ex.Message}" });
        }
    }
}
