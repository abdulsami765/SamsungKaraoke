/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Tizen TV deployment
  output: process.env.BUILD_TARGET === 'tizen' ? 'export' : undefined,
  trailingSlash: true,
  
  // Disable image optimization for TV deployment
  images: {
    unoptimized: true,
    domains: ['example.com'], // Add your image domains here
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  // TV-specific optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Asset prefix for TV deployment
  assetPrefix: process.env.BUILD_TARGET === 'tizen' ? './' : '',
  
  // Webpack configuration for TV compatibility
  webpack: (config, { isServer }) => {
    if (process.env.BUILD_TARGET === 'tizen') {
      // TV-specific webpack optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      };
    }
    
    return config;
  },
  
  // Headers for TV app security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
