/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // বিল্ডের সময় ESLint error বা warning উপেক্ষা করবে
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript error থাকলেও বিল্ড চলবে (আপনি TS ব্যবহার করছেন না)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig