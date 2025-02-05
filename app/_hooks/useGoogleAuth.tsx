import { useCallback, useEffect, useState } from 'react';
import { GOOGLE_API_CONFIG, GoogleAuthState } from '@/app/_types/google-api';

// Define a type for your stored auth info
type StoredAuthData = {
  isSignedIn: boolean;
  user: {
    name: string;
    email: string;
  } | null;
  accessToken: string;
  idToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
};

type TokenClient = {
  requestAccessToken: (params?: { prompt?: string }) => void;
};

const STORAGE_KEY = 'google_auth_data';

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isSignedIn: false,
    user: null,
    gapiInited: false,
    gisInited: false
  });
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);

  // Initialize GAPI client
  const initializeGapiClient = useCallback(async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_CONFIG.API_KEY,
        discoveryDocs: [GOOGLE_API_CONFIG.DISCOVERY_DOC]
      });
      setAuthState((prev) => ({ ...prev, gapiInited: true }));
    } catch (err) {
      setError('Failed to initialize GAPI client');
      console.error('GAPI init error:', err);
    }
  }, []);

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        const authData: StoredAuthData = JSON.parse(savedAuth);
        // Check if the token is still valid
        if (Date.now() < authData.expiresAt) {
          setAuthState((prev) => ({
            ...prev,
            isSignedIn: authData.isSignedIn,
            user: authData.user
          }));
          // Restore tokens
          localStorage.setItem('google_access_token', authData.accessToken);
          localStorage.setItem('google_id_token', authData.idToken);
        } else {
          // Clear expired tokens
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('google_id_token');
        }
      }
    } catch (err) {
      console.error('Error loading auth state:', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Load the GAPI client
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client', initializeGapiClient);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [initializeGapiClient]);

  // Initialize Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_API_CONFIG.CLIENT_ID,
        scope: GOOGLE_API_CONFIG.SCOPES,
        callback: (response) => {
          if (response.error) {
            setError('Failed to obtain access token');
            console.error('Access token error:', response);
            return;
          }
          if (response.access_token) {
            const accessToken = response.access_token;
            localStorage.setItem('google_access_token', accessToken);
            setAuthState((prev) => ({ ...prev, isSignedIn: true }));

            // Decode the JWT token to get user info
            const token = localStorage.getItem('google_id_token');
            if (token) {
              const decodedToken = JSON.parse(atob(token.split('.')[1]));
              const user = {
                name: decodedToken.name,
                email: decodedToken.email
              };
              setAuthState((prev) => ({
                ...prev,
                user
              }));

              // Save auth data with expiration
              const authData: StoredAuthData = {
                isSignedIn: true,
                user,
                accessToken,
                idToken: token,
                // Set expiresAt to 1 hour from now (or use the value provided by Google)
                expiresAt: Date.now() + 3600 * 1000
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
            }
          }
        }
      });
      setTokenClient(client);
      setAuthState((prev) => ({ ...prev, gisInited: true }));
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSignIn = useCallback(() => {
    if (!tokenClient) return;

    if (window.gapi.client.getToken() === null) {
      // First time sign in
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Subsequent sign ins
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }, [tokenClient]);

  const handleSignOut = useCallback(() => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
    setAuthState({
      isSignedIn: false,
      user: null,
      gapiInited: true,
      gisInited: true
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('google_id_token');
    localStorage.removeItem('google_access_token');
  }, []);

  return {
    authState,
    error,
    handleSignIn,
    handleSignOut
  };
}
