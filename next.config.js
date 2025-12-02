const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: ['localhost']
  },
  // Asegurar que los path aliases funcionen correctamente en producción
  webpack: (config) => {
    // Configurar path aliases para cliente y servidor
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    }
    return config
  }
}

module.exports = nextConfig
