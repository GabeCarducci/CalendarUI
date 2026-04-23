import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function Auth0ProviderWithConfig({ children }: { children: React.ReactNode }) {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
    const navigate = useNavigate();

    const onRedirectCallback = (appState?: { returnTo?: string }) => {
        const returnTo = appState?.returnTo || window.location.href;
        navigate(returnTo, { replace: true });
    };

    if (!domain || !clientId) {
        // Fail fast in development so it's obvious env vars are missing
        throw new Error('VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID must be set in .env');
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                scope: "openid profile email https://www.googleapis.com/auth/calendar",
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
}