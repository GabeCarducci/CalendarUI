public enum CalendarRole { Owner, Editor, Viewer }

public class CalendarMember
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CalendarId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string? Email { get; set; }
    public CalendarRole Role { get; set; } = CalendarRole.Editor;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}