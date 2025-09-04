const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  // Moved from experimental in Next.js 15
  outputFileTracingRoot: path.join(__dirname, '../'),
  experimental: {
    // Completely disable worker threads and Jest workers
    workerThreads: false,
    cpus: 1,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  // Webpack configuration to completely disable parallelism
  webpack: (config, { dev, isServer }) => {
    // Force single-threaded compilation to avoid Jest worker issues
    config.parallelism = 1;
    
    // Disable all optimizations that use workers
    config.optimization = config.optimization || {};
    config.optimization.minimize = false;
    config.optimization.minimizer = [];
    
    // Disable caching to avoid worker process issues
    if (dev) {
      config.cache = false;
    }
    
    // Force Babel instead of SWC
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/babel': require.resolve('next/babel'),
    };
    
    return config;
  },
};

module.exports = nextConfig;
