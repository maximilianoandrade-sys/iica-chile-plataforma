/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,

  // Configuración de paths
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },

  // Configuración de Turbopack (Next.js 16+)
  turbopack: {},

  // Headers de seguridad mejorados
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
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://*.gob.cl https://*.corfo.cl https://*.indap.cl",
              "frame-src 'self' https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },

  // Configuración de imágenes externas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: '**.gob.cl',
      },
      {
        protocol: 'https',
        hostname: '**.corfo.cl',
      },
      {
        protocol: 'https',
        hostname: '**.indap.cl',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.fao.org',
      },
      {
        protocol: 'https',
        hostname: '**.worldbank.org',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

module.exports = nextConfig
