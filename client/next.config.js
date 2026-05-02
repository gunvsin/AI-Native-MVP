
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    // For server-side builds, completely nullify the network-interceptor module.
    if (isServer) {
      config.module.rules.push({
        test: path.resolve(__dirname, 'lib/network-interceptor.js'),
        use: 'null-loader',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
