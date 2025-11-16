using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using Dapper;
using LotteryApi.DTOs;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PremioConfigController : ControllerBase
{
    private readonly string _connectionString;

    public PremioConfigController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("Connection string not found");
    }

    /// <summary>
    /// GET /api/premio-config/effective-multipliers
    /// Returns all 62 fields with effective multipliers applying precedence
    /// </summary>
    [HttpGet("effective-multipliers")]
    public async Task<ActionResult<PremioConfigResponseDto>> GetEffectiveMultipliers(
        [FromQuery] int bancaId,
        [FromQuery] int? sorteoId = null)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);

            // Call stored procedure sp_GetEffectiveMultipliers
            var fields = await connection.QueryAsync<PremioFieldDto>(
                "sp_GetEffectiveMultipliers",
                new { BancaId = bancaId, SorteoId = sorteoId },
                commandType: System.Data.CommandType.StoredProcedure
            );

            var response = new PremioConfigResponseDto
            {
                BancaId = bancaId,
                SorteoId = sorteoId,
                IsGeneralConfig = sorteoId == null,
                Fields = fields.ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching premio config", error = ex.Message });
        }
    }

    /// <summary>
    /// PUT /api/premio-config/update
    /// Updates prize configuration (general or sorteo-specific)
    /// </summary>
    [HttpPut("update")]
    public async Task<ActionResult> UpdatePremioConfig([FromBody] UpdatePremioConfigRequest request)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);

            foreach (var field in request.Fields)
            {
                if (request.SorteoId == null)
                {
                    // Update banca general config
                    await connection.ExecuteAsync(@"
                        UPDATE betting_pool_general_config
                        SET multiplier_amount = @NewValue,
                            updated_at = GETDATE()
                        WHERE betting_pool_id = @BancaId
                          AND prize_field_id = @CampoPremioId",
                        new
                        {
                            BancaId = request.BancaId,
                            CampoPremioId = field.CampoPremioId,
                            NewValue = field.NewValue
                        });
                }
                else
                {
                    // Create or update sorteo override
                    await connection.ExecuteAsync(@"
                        MERGE betting_pool_draw_config AS target
                        USING (SELECT @BancaId AS betting_pool_id, @SorteoId AS draw_id, @CampoPremioId AS prize_field_id) AS source
                        ON target.betting_pool_id = source.betting_pool_id
                           AND target.draw_id = source.draw_id
                           AND target.prize_field_id = source.prize_field_id
                        WHEN MATCHED THEN
                            UPDATE SET multiplier_amount = @NewValue, updated_at = GETDATE()
                        WHEN NOT MATCHED THEN
                            INSERT (betting_pool_id, draw_id, prize_field_id, multiplier_amount, is_active, created_at, updated_at)
                            VALUES (@BancaId, @SorteoId, @CampoPremioId, @NewValue, 1, GETDATE(), GETDATE());",
                        new
                        {
                            BancaId = request.BancaId,
                            SorteoId = request.SorteoId,
                            CampoPremioId = field.CampoPremioId,
                            NewValue = field.NewValue
                        });
                }
            }

            return Ok(new { message = "Premio configuration updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating premio config", error = ex.Message });
        }
    }

    /// <summary>
    /// DELETE /api/premio-config/sorteo-override/{sorteoId}/{campoPremioId}
    /// Deletes a sorteo override (falls back to banca general)
    /// </summary>
    [HttpDelete("sorteo-override/{sorteoId}/{campoPremioId}")]
    public async Task<ActionResult> DeleteSorteoOverride(
        [FromRoute] int sorteoId,
        [FromRoute] int campoPremioId,
        [FromQuery] int bancaId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);

            var rowsAffected = await connection.ExecuteAsync(@"
                DELETE FROM betting_pool_draw_config
                WHERE betting_pool_id = @BancaId
                  AND draw_id = @SorteoId
                  AND prize_field_id = @CampoPremioId",
                new { BancaId = bancaId, SorteoId = sorteoId, CampoPremioId = campoPremioId });

            if (rowsAffected == 0)
                return NotFound(new { message = "Sorteo override not found" });

            return Ok(new { message = "Sorteo override deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting sorteo override", error = ex.Message });
        }
    }
}
