using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendarAPI.Services;

[ApiController]
[Route("api/calendar")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IClaimsService _claimsService;
    private string UserId { get; set; }
    public CalendarController(AppDbContext db, IClaimsService claimsService)
    {
        _db = db;
        _claimsService = claimsService;
        UserId = _claimsService.GetUserId();
    }

    // GET /api/calendar/events
    [HttpGet("events")]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _db.Events
            //.Where(e => UserId != null && e.UserId == UserId)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
        return Ok(events);
    }

    // POST /api/calendar/event
    [HttpPost("event")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        var ev = new Event
        {
            UserId = UserId,
            Title = dto.Title,
            StartTime = dto.Start,
            EndTime = dto.End,
            Description = dto.Description
        };
        _db.Events.Add(ev);
        await _db.SaveChangesAsync();
        return Ok(ev);
    }

    // DELETE /api/calendar/event/{id}
    [HttpDelete("event/{id}")]
    public async Task<IActionResult> DeleteEvent(string id)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == UserId);
        if (ev == null) return NotFound();
        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
        return Ok(new { success = true });
    }

    // PATCH /api/calendar/event/{id}
    [HttpPatch("event/{id}")]
    public async Task<IActionResult> UpdateEvent(string id, [FromBody] UpdateEventDto dto)
    {
        var ev = await _db.Events
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == UserId);
        if (ev == null) return NotFound();
        ev.Title = dto.Title;
        ev.StartTime = dto.Start;
        ev.EndTime = dto.End;
        ev.Description = dto.Description;
        await _db.SaveChangesAsync();
        return Ok(ev);
    }

    // DEBUG: Check auth status and all claims
    [HttpGet("debug/auth")]
    [Authorize]
    public IActionResult DebugAuth()
    {
        var allClaims = _claimsService.GetAllClaims();
        var userId = _claimsService.GetUserId();
        var userEmail = _claimsService.GetUserEmail();
        var userName = _claimsService.GetUserName();

        return Ok(new
        {
            isAuthenticated = User.Identity?.IsAuthenticated,
            identityName = User.Identity?.Name,
            authType = User.Identity?.AuthenticationType,
            userId = userId,
            userEmail = userEmail,
            userName = userName,
            totalClaims = allClaims.Count,
            claims = allClaims.Select(c => new { type = c.Type, value = c.Value, valueType = c.ValueType }).ToList()
        });
    }
}
