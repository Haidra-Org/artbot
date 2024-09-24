/** @type {import('next').NextConfig} */
import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  reloadOnOnline: true,
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  swUrl: '/sw.js'
});

const BASE_PATH = process.env.BASE_PATH || ''; // Should be '' or '/artbot'
const DEXIE_DB = process.env.DEXIE_DB || 'ArtBot_beta_v2';
let HORDE_API_HOST = process.env.HORDE_API_HOST || 'https://aihorde.net';

/**
 * Enable mock Horde API for testing API responses in local dev environment
 */

// const HORDE_MOCK_API_HOST = '';
const HORDE_MOCK_API_HOST = 'http://localhost:3001';

if (process.env.NODE_ENV === 'development') {
  if (HORDE_MOCK_API_HOST) {
    console.log('\n\nMOCK_API: using mock Horde API -', HORDE_MOCK_API_HOST);
    HORDE_API_HOST = HORDE_MOCK_API_HOST;
  }
}

const nextConfig = {
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_API_BASE_PATH: BASE_PATH,
    NEXT_HORDE_API_HOST: HORDE_API_HOST,
    NEXT_PUBLIC_DEXIE_DB: DEXIE_DB,
    NEXT_PUBLIC_SAVE_DEBUG_LOGS: 'false', // "true" or "false"
    NEXT_TELEMETRY_DISABLED: '1', // disable Vercel / NextJS telemetry
    ARTBOT_STATUS_API: process.env.ARTBOT_STATUS_API
  },
  output: 'standalone'
};

const analyzeBundleConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

export default analyzeBundleConfig(withSerwist(nextConfig));
