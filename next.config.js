/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  // Prevent Firebase from being bundled during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'];
    }
    return config;
  },
};

module.exports = nextConfig;