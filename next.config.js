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
  webpack: (config) => {
    return config
  }
}

module.exports = nextConfig
