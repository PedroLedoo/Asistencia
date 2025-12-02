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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configurar path aliases para cliente y servidor
    const srcPath = path.resolve(__dirname, 'src')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
    }
    
    // Asegurar que los módulos se resuelvan correctamente
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, 'src'),
      'node_modules',
    ]
    
    return config
  }
}

module.exports = nextConfig
