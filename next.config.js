/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      }
    ]
  },
  experimental: {
    largePageDataBytes: 128 * 100000,
    proxyTimeout: 180000, // 3 minutes
  }
}

module.exports = nextConfig