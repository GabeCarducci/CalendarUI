using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Event> Events { get; set; }
    public DbSet<Calendar> Calendars { get; set; }
    public DbSet<CalendarMember> CalendarMembers { get; set; }
    public DbSet<CalendarInvite> CalendarInvites { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CalendarMember>()
            .HasIndex(m => new { m.CalendarId, m.UserId }).IsUnique();

        modelBuilder.Entity<CalendarInvite>()
            .HasIndex(i => i.Code).IsUnique();
    }
}