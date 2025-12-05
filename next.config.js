/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizaciones para producción
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Configurar rewrites para proxy a Flask (mismo servidor)
  async rewrites() {
    // En producción, Flask corre en localhost:5000 en el mismo servidor
    const flaskApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/flask/:path*',
        destination: `${flaskApiUrl}/:path*`,
      },
      {
        source: '/api/proyectos',
        destination: `${flaskApiUrl}/api/proyectos`,
      },
      {
        source: '/api/:path*',
        destination: `${flaskApiUrl}/api/:path*`,
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
