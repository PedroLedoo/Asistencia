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
  // Asegurar que los path aliases funcionen correctamente
  webpack: (config, { isServer }) => {
    // Asegurar que los path aliases funcionen en producción
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      }
    }
    return config
  }
}

module.exports = nextConfig
