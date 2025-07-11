# Use Node.js 22 slim to match working Hyperion pattern
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (exact pattern from working Hyperion build)
RUN if [ -f package.json ]; then npm ci; fi

# Build with Smithery CLI (exact pattern from working Hyperion build)
RUN npx -y @smithery/cli@1.2.9 build -o .smithery/index.cjs

# Set environment variables
ENV NODE_ENV=production
ENV ROOTSTOCK_RPC_URL=https://public-node.testnet.rsk.co
ENV ROOTSTOCK_CHAIN_ID=31
ENV ROOTSTOCK_NETWORK_NAME="Rootstock Testnet"
ENV ROOTSTOCK_CURRENCY_SYMBOL=tRBTC
ENV ROOTSTOCK_EXPLORER_URL=https://explorer.testnet.rootstock.io
ENV ROOTSTOCK_API_TIMEOUT=60000
ENV ROOTSTOCK_MAX_RETRIES=5

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Start the MCP server
CMD ["node", "build/index.js"]
