using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Services;

[ApiController]
[Route("api/calendar")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly GoogleTokenService _googleTokenService;

    public CalendarController(AppDbContext db, GoogleTokenService googleTokenService)
    {
        _db = db;
        _googleTokenService = googleTokenService;
    }

    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    // GET /api/calendar/events
    [HttpGet("events")]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _db.Events
            .Where(e => e.UserId == UserId)
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

    // POST /api/calendar/import-google
    [HttpPost("import-google")]
    public async Task<IActionResult> ImportGoogle()
    {
        var googleToken = await _googleTokenService.GetGoogleTokenAsync(UserId);

        var credential = GoogleCredential.FromAccessToken(googleToken);
        var calendarService = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential
        });

        var request = calendarService.Events.List("primary");
        request.TimeMinDateTimeOffset = DateTimeOffset.UtcNow;
        request.MaxResults = 50;
        request.SingleEvents = true;
        request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;

        var response = await request.ExecuteAsync();
        int imported = 0;

        foreach (var e in response.Items)
        {
            var exists = await _db.Events.AnyAsync(ev => ev.GoogleId == e.Id);
            if (exists) continue;

            _db.Events.Add(new Event
            {
                UserId = UserId,
                Title = e.Summary ?? "Untitled",
                StartTime = e.Start.DateTimeDateTimeOffset?.UtcDateTime
                            ?? DateTime.Parse(e.Start.Date),
                EndTime = e.End.DateTimeDateTimeOffset?.UtcDateTime
                          ?? DateTime.Parse(e.End.Date),
                GoogleId = e.Id
            });
            imported++;
        }

        await _db.SaveChangesAsync();
        return Ok(new { imported });
    }
}