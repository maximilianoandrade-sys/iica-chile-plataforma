/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizaciones para producción
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
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
  
  // Headers de seguridad y caché
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig
