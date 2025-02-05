'use client';

import { useCallback, useEffect, useState } from 'react';
import Section from '../../../_components/Section';
import { GOOGLE_API_CONFIG, GoogleAuthState } from '@/app/_types/google-api';

const STORAGE_KEY = 'google_auth_data';

type TokenClient = {
  requestAccessToken: (params?: { prompt?: string }) => void;
};

export default function GoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isSignedIn: false,
    user: null,
    gapiInited: false,
    gisInited: false
  });
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);

  // Load auth state from localStorage on component mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setAuthState((prev) => ({
          ...prev,
          isSignedIn: authData.isSignedIn,
          user: authData.user
        }));
      }
    } catch (err) {
      console.error('Error loading auth state:', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (authState.isSignedIn && authState.user) {
      const authData = {
        isSignedIn: authState.isSignedIn,
        user: authState.user
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    }
  }, [authState.isSignedIn, authState.user]);

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
            localStorage.setItem('google_access_token', response.access_token);
            setAuthState((prev) => ({ ...prev, isSignedIn: true }));
            // Decode the JWT token to get user info
            const token = localStorage.getItem('google_id_token');
            if (token) {
              const decodedToken = JSON.parse(atob(token.split('.')[1]));
              setAuthState((prev) => ({
                ...prev,
                user: {
                  name: decodedToken.name,
                  email: decodedToken.email
                }
              }));
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

  return (
    <Section title="Google Drive Integration">
      <div className="flex flex-col gap-2">
        {error && <div className="text-error text-sm">Error: {error}</div>}
        {!authState.isSignedIn ? (
          <button
            onClick={handleSignIn}
            disabled={!authState.gapiInited || !authState.gisInited}
            className="btn btn-primary w-fit"
          >
            Connect Google Account
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div>
              Connected as: {authState.user?.name} ({authState.user?.email})
            </div>
            <button onClick={handleSignOut} className="btn btn-error w-fit">
              Disconnect Account
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
