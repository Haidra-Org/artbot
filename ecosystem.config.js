/**
 * Configuration file for use with PM2 in prod environment.
 */

module.exports = {
  apps: [
    {
      name: "artbot",
      script: "node",
      args: "server.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
  ],
};