import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth0ProviderWithConfig from './auth/Auth0ProviderWithConfig';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithConfig>
                <Routes>
                    <Route path="/*" element={<App />} />
                </Routes>
            </Auth0ProviderWithConfig>
        </BrowserRouter>
    </StrictMode>,
);
