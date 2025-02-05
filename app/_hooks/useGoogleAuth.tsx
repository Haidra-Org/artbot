import { useCallback, useEffect, useState } from 'react';
import { GOOGLE_API_CONFIG, GoogleAuthState } from '@/app/_types/google-api';
import {
  getGoogleAuthFromDexie,
  removeGoogleAuthFromDexie,
  saveGoogleAuthToDexie
} from '../_db/appSettings';

type TokenClient = {
  requestAccessToken: (params?: { prompt?: string }) => void;
};

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isSignedIn: false,
    user: null,
    gapiInited: false,
    gisInited: false
  });
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);

  // Initialize GAPI client and restore auth state
  const initializeGapiClient = useCallback(async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_CONFIG.API_KEY,
        discoveryDocs: [GOOGLE_API_CONFIG.DISCOVERY_DOC]
      });

      // Try to restore auth state from Dexie
      const savedAuth = await getGoogleAuthFromDexie();
      if (
        savedAuth?.accessToken &&
        savedAuth.expiresAt &&
        Date.now() < savedAuth.expiresAt
      ) {
        window.gapi.client.setToken({
          access_token: savedAuth.accessToken
        });

        setAuthState((prev) => ({
          ...prev,
          isSignedIn: true
        }));
      }

      setAuthState((prev) => ({ ...prev, gapiInited: true }));
    } catch (err) {
      setError('Failed to initialize GAPI client');
      console.error('GAPI init error:', err);
    }
  }, []);

  // Load the GAPI client and restore auth state
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
        callback: async (response) => {
          if (response.error) {
            setError('Failed to obtain access token');
            console.error('Access token error:', response);
            return;
          }

          let { expiresAt } = (await getGoogleAuthFromDexie()) || {};

          if (response.expires_in) {
            expiresAt = Date.now() + Number(response.expires_in || 3600) * 1000;
          }

          if (response.access_token) {
            window.gapi.client.setToken({
              access_token: response.access_token
            });

            await saveGoogleAuthToDexie({
              accessToken: response.access_token,
              expiresAt
            });
          }

          setAuthState((prev) => ({ ...prev, isSignedIn: true }));
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

    setTimeout(async () => {
      const token = window.gapi.client.getToken();
      if (token) {
        await saveGoogleAuthToDexie({
          accessToken: token.access_token,
          expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000
        });

        setAuthState((prev) => ({
          ...prev,
          isSignedIn: true
        }));
      }
    }, 500);
  }, [tokenClient]);

  const handleSignOut = useCallback(async () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      // @ts-expect-error - GAPI types expect string but actually accepts object
      window.gapi.client.setToken({});
    }
    setAuthState({
      isSignedIn: false,
      user: null,
      gapiInited: true,
      gisInited: true
    });

    // Remove from Dexie
    await removeGoogleAuthFromDexie();
  }, []);

  return {
    authState,
    error,
    handleSignIn,
    handleSignOut
  };
}
