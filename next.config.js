/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds to prevent build failures from lint errors.
    // Note: this only disables ESLint checks during `next build`/Vercel builds.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
