/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configurar rewrites para proxy a Flask si es necesario
  async rewrites() {
    const flaskApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://iica-chile-plataforma.onrender.com';
    return [
      {
        source: '/api/flask/:path*',
        destination: `${flaskApiUrl}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
