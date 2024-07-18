/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  reloadOnOnline: true,
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  swUrl: '/sw.js',
});

const BASE_PATH = process.env.BASE_PATH || '';
const DEXIE_DB = process.env.DEXIE_DB || 'ArtBot_v2';

const nextConfig = {
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_API_BASE_PATH: BASE_PATH,
    NEXT_PUBLIC_DEXIE_DB: DEXIE_DB
  },
  output: 'standalone'
}

export default withSerwist(nextConfig);