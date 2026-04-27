import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface HeaderProps {
    title?: string;
}

const HEADER_HEIGHT = 48;

/**
 * Header variant: gradient from black to grey with a 3D effect using layered shadows and an inset highlight.
 */
export default function Header({ title = 'Community Calendar' }: HeaderProps) {
    const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <a href="/" style={styles.title}>
                    <strong>{title}</strong>
                </a>
                <div>
                    {!isLoading && !isAuthenticated && (
                        <button
                            onClick={() => loginWithRedirect()}
                            aria-label="Log in"
                            style={styles.loginButton}
                            title="Log in"
                        >
                            LOGIN
                        </button>
                    )}
                    {!isLoading && isAuthenticated && (
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            aria-label="Log Out"
                            style={styles.loginButton}
                            title="Log Out"
                        >
                            LOGOUT
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: HEADER_HEIGHT,
        zIndex: 1000,
        // black -> grey gradient
        background: 'linear-gradient(180deg, #000000 0%, #4b5563 100%)',
        // layered shadow + slight inset highlight for a subtle 3D look
        boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 -2px 6px rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transform: 'translateZ(0)', // enable GPU for smoother compositing
    },
    container: {
        maxWidth: '95%',
        margin: '0 auto',
        padding: '0 20px',
        height: HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: '#f9fafb',
        textDecoration: 'none',
        fontSize: 20,
        textShadow: '0 1px 0 rgba(0,0,0,0.6)', // small shadow to lift text
    },
    loginButton: {
        background: 'linear-gradient(180deg, #3b82f6, #1e40af)',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 700,
        boxShadow: '0 4px 10px rgba(15,23,42,0.3)',
    },
};