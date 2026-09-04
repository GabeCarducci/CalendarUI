public class Event
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CalendarId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Title { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
    public string? GoogleId { get; set; }
}