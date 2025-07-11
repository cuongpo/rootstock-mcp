/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    ROOTSTOCK_RPC_URL: process.env.ROOTSTOCK_RPC_URL,
    ROOTSTOCK_NETWORK_NAME: process.env.ROOTSTOCK_NETWORK_NAME,
    ROOTSTOCK_EXPLORER_URL: process.env.ROOTSTOCK_EXPLORER_URL,
  },
}

module.exports = nextConfig
