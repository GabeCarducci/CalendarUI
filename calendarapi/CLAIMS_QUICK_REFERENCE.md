# Quick Start: Using the Claims Collection System

## 1. Viewing Claims (Debugging)

Make an authenticated request to:
```
GET http://localhost:3001/api/calendar/debug/auth
Authorization: Bearer <your_auth0_token>
```

This returns all claims and authentication details.

## 2. Using Claims in Your Code

### Option A: Use ClaimsService (Recommended)
```csharp
public class MyController : ControllerBase
{
	private readonly IClaimsService _claimsService;

	public MyController(IClaimsService claimsService)
	{
		_claimsService = claimsService;
	}

	[HttpGet]
	[Authorize]
	public IActionResult MyAction()
	{
		var userId = _claimsService.GetUserId();
		var email = _claimsService.GetUserEmail();
		var name = _claimsService.GetUserName();

		// All claims
		var allClaims = _claimsService.GetAllClaims();

		// Specific claim by type
		var customClaim = _claimsService.GetClaimValue<string>("custom_claim_type");

		return Ok(new { userId, email, name });
	}
}
```

### Option B: Direct HttpContext Access
```csharp
[Authorize]
public IActionResult MyAction()
{
	var userId = User.FindFirst("sub")?.Value;
	var email = User.FindFirst("email")?.Value;
	var allClaims = User.Claims;

	return Ok();
}
```

## 3. Console Output

When you run your API and make authenticated requests, look at the Visual Studio Debug Output window. You'll see formatted claims reports like:

```
╔═══════════════════════════════════════════════════════════════╗
║                    CLAIMS COLLECTION REPORT                   ║
╚═══════════════════════════════════════════════════════════════╝
Endpoint: GET /api/calendar/events
Timestamp: 2025-01-15T10:30:45.1234567Z
Is Authenticated: True
Total Claims: 12

Claims Details:
─────────────────────────────────────────────────────────────
1. Type: sub
   Value: google-oauth2|1234567890
   ...
```

## 4. Understanding the Claims

Key Auth0 claims to look for:

| Claim Type | Example | Usage |
|-----------|---------|-------|
| `sub` | `google-oauth2\|1234567890` | Unique user identifier (always present) |
| `email` | `user@example.com` | User's email |
| `name` | `John Doe` | User's full name |
| `nickname` | `john.doe` | User's nickname |
| `picture` | `https://...` | User's profile picture |
| `aud` | `https://api.example.com` | Token audience (your API) |
| `iss` | `https://domain.auth0.com/` | Token issuer (Auth0) |
| `iat` | `1234567890` | Issued at (Unix timestamp) |
| `exp` | `1234571490` | Expires at (Unix timestamp) |

## 5. Common Issues

### Problem: "User ID claim not found"
- Make sure you're sending a valid Bearer token
- Check that the token is not expired
- Hit `/api/calendar/debug/auth` to see what claims are actually present

### Problem: No claims showing up
- Verify Authorization header format: `Authorization: Bearer <token>`
- Check browser network tab to see if token is being sent
- Ensure frontend is calling `getAccessTokenSilently()` from Auth0

### Problem: Wrong claim values
- Check Auth0 dashboard for app configuration
- Verify scopes requested include what you need
- Check for any Auth0 rules/actions modifying claims

## 6. Files to Review

- `Middleware/ClaimsCollectionMiddleware.cs` - How claims are collected
- `Services/ClaimsService.cs` - How to access claims
- `Controllers/CalendarController.cs` - Example implementation
- `CLAIMS_COLLECTION_SYSTEM.md` - Full documentation
