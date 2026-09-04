using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CalendarAPI.Hubs;
using CalendarAPI.Services;

[ApiController]
[Route("api/calendar")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IClaimsService _claimsService;
    private readonly IHubContext<CalendarHub> _hub;
    private string UserId => _claimsService.GetUserId() ?? throw new UnauthorizedAccessException();

    public CalendarController(AppDbContext db, IClaimsService claimsService, IHubContext<CalendarHub> hub)
    {
        _db = db;
        _claimsService = claimsService;
        _hub = hub;
    }

    private async Task<bool> IsMemberAsync(string calendarId, bool requireEditorOrOwner = false)
    {
        var m = await _db.CalendarMembers
            .FirstOrDefaultAsync(x => x.CalendarId == calendarId && x.UserId == UserId);
        if (m == null) return false;
        if (requireEditorOrOwner && m.Role == CalendarRole.Viewer) return false;
        return true;
    }

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents([FromQuery] string calendarId)
    {
        if (string.IsNullOrEmpty(calendarId)) return BadRequest(new { error = "calendarId is required" });
        if (!await IsMemberAsync(calendarId)) return Forbid();

        var events = await _db.Events
            .Where(e => e.CalendarId == calendarId)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
        return Ok(events);
    }

    [HttpPost("event")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        if (string.IsNullOrEmpty(dto.CalendarId)) return BadRequest(new { error = "calendarId is required" });
        if (!await IsMemberAsync(dto.CalendarId, requireEditorOrOwner: true)) return Forbid();

        var ev = new Event
        {
            CalendarId = dto.CalendarId,
            UserId = UserId,
            Title = dto.Title,
            StartTime = dto.Start,
            EndTime = dto.End,
            Description = dto.Description
        };
        _db.Events.Add(ev);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(CalendarHub.GroupName(ev.CalendarId)).SendAsync("eventCreated", ev);
        return Ok(ev);
    }

    [HttpDelete("event/{id}")]
    public async Task<IActionResult> DeleteEvent(string id)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);
        if (ev == null) return NotFound();
        if (!await IsMemberAsync(ev.CalendarId, requireEditorOrOwner: true)) return Forbid();

        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(CalendarHub.GroupName(ev.CalendarId)).SendAsync("eventDeleted", ev.Id);
        return Ok(new { success = true });
    }

    [HttpPatch("event/{id}")]
    public async Task<IActionResult> UpdateEvent(string id, [FromBody] UpdateEventDto dto)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == id);
        if (ev == null) return NotFound();
        if (!await IsMemberAsync(ev.CalendarId, requireEditorOrOwner: true)) return Forbid();

        ev.Title = dto.Title;
        ev.StartTime = dto.Start;
        ev.EndTime = dto.End;
        ev.Description = dto.Description;
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(CalendarHub.GroupName(ev.CalendarId)).SendAsync("eventUpdated", ev);
        return Ok(ev);
    }

    // keep your existing GET("debug/auth") action here unchanged


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
