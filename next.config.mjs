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

const nextConfig = {
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_API_BASE_PATH: BASE_PATH
  },
  output: 'standalone'
}

export default withSerwist(nextConfig);