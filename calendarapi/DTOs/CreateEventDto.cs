public class CreateEventDto
{
    public string Title { get; set; } = "";
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string? Description { get; set; }
}