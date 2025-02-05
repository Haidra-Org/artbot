'use client';

import Button from '@/app/_components/Button';
import Section from '../../../_components/Section';
import { useGoogleAuth } from '@/app/_hooks/useGoogleAuth';
import { IconBrandGoogleDrive, IconLogout2 } from '@tabler/icons-react';

export default function GoogleAuth() {
  const { authState, error, handleSignIn, handleSignOut } = useGoogleAuth();

  return (
    <Section title="Google Drive Integration">
      <div className="flex flex-col gap-2">
        {error && <div className="text-error text-sm">Error: {error}</div>}
        {!authState.isSignedIn ? (
          <Button
            onClick={handleSignIn}
            disabled={!authState.gapiInited || !authState.gisInited}
            className="btn btn-primary w-fit"
          >
            <div className="flex flex-row gap-2 items-center">
              <IconBrandGoogleDrive /> Connect Google Account
            </div>
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSignOut}
              className="btn btn-error w-fit"
              theme="danger"
            >
              <div className="flex flex-row gap-2 items-center">
                <IconLogout2 /> Unlink Google Account
              </div>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
