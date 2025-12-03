/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurar rewrites para proxy a Flask si es necesario
  async rewrites() {
    return [
      {
        source: '/api/flask/:path*',
        destination: `${process.env.FLASK_API_URL || 'http://localhost:5000'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
