# Claims Collection System

## Overview
This system provides centralized claims collection and injection from Auth0 bearer tokens throughout your ASP.NET Core application.

## Components

### 1. ClaimsCollectionMiddleware (`Middleware/ClaimsCollectionMiddleware.cs`)
- **Purpose**: Intercepts all requests and collects claims from authenticated users
- **Functionality**:
  - Logs all claims to console and logger with formatted output
  - Stores claims info in `HttpContext.Items` for use in request pipeline
  - Handles both authenticated and unauthenticated requests gracefully
  - Provides detailed debugging information including:
	- Total number of claims
	- Individual claim types and values
	- Authentication status
	- Authorization header presence

**Registration in Program.cs**:
```csharp
app.UseClaimsCollection();  // Must come after UseAuthorization()
```

### 2. ClaimsService (`Services/ClaimsService.cs`)
- **Purpose**: Provides easy access to claim values throughout the application
- **Key Methods**:
  - `GetUserId()` - Returns the 'sub' claim (Auth0 user ID)
  - `GetUserEmail()` - Returns the 'email' claim
  - `GetUserName()` - Returns 'name' or 'nickname' claim
  - `GetAllClaims()` - Returns all claims as `IReadOnlyList<ClaimInfo>`
  - `GetClaimValue<T>(string claimType)` - Generic method to get any claim by type

**Dependency Injection**:
```csharp
builder.Services.AddScoped<IClaimsService, ClaimsService>();
builder.Services.AddHttpContextAccessor();
```

### 3. Usage in Controllers

#### Example: CalendarController
```csharp
public class CalendarController : ControllerBase
{
	private readonly IClaimsService _claimsService;

	public CalendarController(AppDbContext db, IClaimsService claimsService)
	{
		_db = db;
		_claimsService = claimsService;
	}

	private string UserId => _claimsService.GetUserId() 
		?? throw new UnauthorizedAccessException("User ID not found");

	[HttpGet("events")]
	public async Task<IActionResult> GetEvents()
	{
		// UserId is now safely retrieved from claims
		var events = await _db.Events
			.Where(e => e.UserId == UserId)
			.ToListAsync();
		return Ok(events);
	}
}
```

## Debug Endpoint

### Endpoint: `GET /api/calendar/debug/auth`

**Purpose**: View all claims and authentication information for the current request

**Requirements**: Must be authenticated (Bearer token required)

**Response Example**:
```json
{
  "isAuthenticated": true,
  "identityName": "user@example.com",
  "authType": "Bearer",
  "userId": "google-oauth2|1234567890",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "totalClaims": 12,
  "claims": [
	{
	  "type": "sub",
	  "value": "google-oauth2|1234567890",
	  "valueType": "http://www.w3.org/2001/XMLSchema#string"
	},
	{
	  "type": "email",
	  "value": "user@example.com",
	  "valueType": "http://www.w3.org/2001/XMLSchema#string"
	}
	// ... more claims
  ]
}
```

## Debugging

### Console Output
When a request is made by an authenticated user, the middleware logs detailed information:

```
╔═══════════════════════════════════════════════════════════════╗
║                    CLAIMS COLLECTION REPORT                   ║
╚═══════════════════════════════════════════════════════════════╝
Endpoint: GET /api/calendar/events
Timestamp: 2025-01-15T10:30:45.1234567Z
Is Authenticated: True
Identity Name: user@example.com
Auth Type: Bearer
Authorization Header Present: True
Total Claims: 12

Claims Details:
─────────────────────────────────────────────────────────────

1. Type: sub
   Value: google-oauth2|1234567890
   ValueType: http://www.w3.org/2001/XMLSchema#string

2. Type: email
   Value: user@example.com
   ValueType: http://www.w3.org/2001/XMLSchema#string

... more claims ...

═════════════════════════════════════════════════════════════
```

### Troubleshooting

#### No Claims Found
- Check that Bearer token is being sent in Authorization header
- Verify the token is valid and not expired
- Check Auth0 configuration matches token issuer and audience

#### Missing Expected Claims
- Check Auth0 application settings for requested scopes
- Verify Auth0 rules and actions that might modify claims
- Check token payload using jwt.io (but never share real tokens)

#### Sub Claim Not Found
- Ensure `sub` claim is included in Auth0 token
- This is typically included by default for all Auth0 tokens
- If missing, check Auth0 rules or token transformation policies

## Files

- `calendarapi/Middleware/ClaimsCollectionMiddleware.cs` - Middleware implementation
- `calendarapi/Services/ClaimsService.cs` - Service for accessing claims
- `calendarapi/Controllers/CalendarController.cs` - Example usage in controller
- `calendarapi/Program.cs` - Registration and configuration

## Configuration

No additional configuration is needed beyond what's already in `appsettings.json`:

```json
{
  "Auth0": {
	"Domain": "your-domain.auth0.com",
	"Audience": "your-api-identifier"
  }
}
```

Ensure these values match your Auth0 application settings.
