'use client';

import Section from '../../../_components/Section';
import { useGoogleAuth } from '@/app/_hooks/useGoogleAuth';

export default function GoogleAuth() {
  const { authState, error, handleSignIn, handleSignOut } = useGoogleAuth();

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
