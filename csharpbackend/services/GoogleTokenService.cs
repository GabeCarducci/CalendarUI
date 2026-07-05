using Auth0.ManagementApi;
using Auth0.ManagementApi.Models;

public class GoogleTokenService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public GoogleTokenService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<string?> GetGoogleTokenAsync(string auth0UserId)
    {
        // Get a management API token first
        var tokenResponse = await _httpClient.PostAsync(
            $"https://{_config["Auth0:Domain"]}/oauth/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = _config["Auth0:MgmtClientId"]!,
                ["client_secret"] = _config["Auth0:MgmtClientSecret"]!,
                ["audience"] = $"https://{_config["Auth0:Domain"]}/api/v2/"
            })
        );

        var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
        var mgmtToken = tokenJson.GetProperty("access_token").GetString();

        // Use it to fetch the user
        var mgmt = new ManagementApiClient(mgmtToken, _config["Auth0:Domain"]);
        var user = await mgmt.Users.GetAsync(auth0UserId);

        return user.Identities
            .FirstOrDefault(i => i.Provider == "google-oauth2")
            ?.AccessToken;
    }
}