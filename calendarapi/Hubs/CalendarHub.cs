using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace CalendarAPI.Hubs;

[Authorize]
public class CalendarHub : Hub
{
    public async Task JoinCalendar(string calendarId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(calendarId));

    public async Task LeaveCalendar(string calendarId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(calendarId));

    public static string GroupName(string calendarId) => $"calendar-{calendarId}";
}