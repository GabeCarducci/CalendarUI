public class CalendarInvite
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CalendarId { get; set; } = "";
    public string Code { get; set; } = Guid.NewGuid().ToString("N")[..10];
    public string? InviteeEmail { get; set; }   // null => open link, anyone with the code can join
    public CalendarRole Role { get; set; } = CalendarRole.Editor;
    public string CreatedByUserId { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public bool Redeemed { get; set; } = false;
}