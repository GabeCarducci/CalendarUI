import React, { useEffect, useState } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

type AuthConfig = {
  domain: string;
  clientId: string;
  audience?: string;
  scope?: string;
};

type Props = {
  children: React.ReactNode;
};

/**
 * Loads Auth0 configuration from `/auth_config.json` and
 * wraps the application with `Auth0Provider`.
 *
 * Expects a JSON file with at least:
 * {
 *   "domain": "YOUR_DOMAIN",
 *   "clientId": "YOUR_CLIENT_ID",
 *   "audience": "OPTIONAL_AUDIENCE"
 * }
 */
export default function Auth0ProviderWithConfig({ children }: Props) {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const resp = await fetch("/auth_config.json");
        if (!resp.ok) {
          throw new Error(`Failed to load auth_config.json: ${resp.status}`);
        }
        const json = await resp.json();
        if (mounted) setConfig(json as AuthConfig);
      } catch (err) {
        // If the config can't be loaded, fail fast in console and keep component unmounted.
        // Consumers can handle missing authentication when this provider isn't rendered.
        // eslint-disable-next-line no-console
        console.error("Auth0 config load error:", err);
      }
    }

    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  if (!config) {
    // While loading config, don't render children (prevents Auth0 from initializing with bad config).
    return null;
  }

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    const target = appState && appState.returnTo ? appState.returnTo : window.location.pathname;
    // Use react-router navigation to restore app state after login
    navigate(target);
  };

  const { domain, clientId, audience, scope } = config;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}