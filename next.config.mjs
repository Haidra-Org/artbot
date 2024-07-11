/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  reloadOnOnline: true,
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist({
  output: 'standalone'
});