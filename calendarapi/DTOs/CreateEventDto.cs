public class CreateEventDto
{
    public string CalendarId { get; set; } = "";
    public string Title { get; set; } = "";
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string? Description { get; set; }
}