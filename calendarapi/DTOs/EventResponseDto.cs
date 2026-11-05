namespace calendarapi.DTOs
{
    public record EventResponseDto(
    Guid Id, Guid CalendarId, string Title,
    DateTime Start, DateTime End, bool AllDay, string? Description,
    string CreatedBy, IReadOnlyList<string> AttendeeIds)
    {
        public static EventResponseDto From(Event e, IReadOnlyList<string> 
            attendeeIds) => new(
            e.EventId, e.CalendarId, e.Title,
            DateTime.SpecifyKind(e.StartTime, DateTimeKind.Utc),
            DateTime.SpecifyKind(e.EndTime, DateTimeKind.Utc),
            e.AllDay, e.Description, e.CreatedByUserId, attendeeIds);
    }
}