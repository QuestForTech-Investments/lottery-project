using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<ContactsController> _logger;

    public ContactsController(LotteryDbContext context, ILogger<ContactsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get contacts with pagination and filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<ContactDto>>> GetContacts(
        [FromQuery] int? bettingPoolId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Contacts.AsQueryable();

            if (bettingPoolId.HasValue)
            {
                query = query.Where(c => c.BettingPoolId == bettingPoolId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c =>
                    c.ContactName.Contains(search) ||
                    (c.Phone != null && c.Phone.Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var contacts = await query
                .OrderBy(c => c.ContactName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ContactDto
                {
                    ContactId = c.ContactId,
                    BettingPoolId = c.BettingPoolId,
                    ContactName = c.ContactName,
                    Phone = c.Phone,
                    TelegramChatId = c.TelegramChatId,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResponse<ContactDto>
            {
                Items = contacts,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener contactos");
            return StatusCode(500, new { message = "Error al obtener los contactos" });
        }
    }

    /// <summary>
    /// Create a new contact
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContactDto>> CreateContact([FromBody] CreateContactDto createDto)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == createDto.BettingPoolId);

            if (!bettingPoolExists)
            {
                return BadRequest(new { message = $"La banca con ID {createDto.BettingPoolId} no existe" });
            }

            var contact = new Contact
            {
                BettingPoolId = createDto.BettingPoolId,
                ContactName = createDto.ContactName,
                Phone = createDto.Phone,
                TelegramChatId = createDto.TelegramChatId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            var contactDto = new ContactDto
            {
                ContactId = contact.ContactId,
                BettingPoolId = contact.BettingPoolId,
                ContactName = contact.ContactName,
                Phone = contact.Phone,
                TelegramChatId = contact.TelegramChatId,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt
            };

            return CreatedAtAction(nameof(GetContacts), new { bettingPoolId = contact.BettingPoolId }, contactDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear contacto");
            return StatusCode(500, new { message = "Error al crear el contacto" });
        }
    }

    /// <summary>
    /// Update a contact
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ContactDto>> UpdateContact(int id, [FromBody] UpdateContactDto updateDto)
    {
        try
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound(new { message = $"Contacto con ID {id} no encontrado" });
            }

            if (!string.IsNullOrWhiteSpace(updateDto.ContactName))
            {
                contact.ContactName = updateDto.ContactName;
            }

            if (updateDto.Phone != null)
            {
                contact.Phone = updateDto.Phone;
            }

            if (updateDto.TelegramChatId != null)
            {
                contact.TelegramChatId = updateDto.TelegramChatId;
            }

            contact.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var contactDto = new ContactDto
            {
                ContactId = contact.ContactId,
                BettingPoolId = contact.BettingPoolId,
                ContactName = contact.ContactName,
                Phone = contact.Phone,
                TelegramChatId = contact.TelegramChatId,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt
            };

            return Ok(contactDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar contacto {ContactId}", id);
            return StatusCode(500, new { message = "Error al actualizar el contacto" });
        }
    }

    /// <summary>
    /// Delete all contacts for a betting pool
    /// </summary>
    [HttpDelete("by-betting-pool/{bettingPoolId}")]
    public async Task<ActionResult> DeleteContactsByBettingPool(int bettingPoolId)
    {
        try
        {
            var contacts = await _context.Contacts
                .Where(c => c.BettingPoolId == bettingPoolId)
                .ToListAsync();

            if (contacts.Count == 0)
            {
                return Ok(new { message = "No hay contactos para eliminar", deletedCount = 0 });
            }

            _context.Contacts.RemoveRange(contacts);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{contacts.Count} contacto(s) eliminado(s)", deletedCount = contacts.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar contactos de la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error al eliminar los contactos" });
        }
    }

    /// <summary>
    /// Delete a contact
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteContact(int id)
    {
        try
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound(new { message = $"Contacto con ID {id} no encontrado" });
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar contacto {ContactId}", id);
            return StatusCode(500, new { message = "Error al eliminar el contacto" });
        }
    }
}
