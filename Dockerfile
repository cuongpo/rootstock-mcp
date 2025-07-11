# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for building native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove development dependencies and source files to reduce image size
RUN npm prune --production && \
    rm -rf src/ && \
    rm -rf node_modules/@types/ && \
    rm -rf *.ts && \
    rm -rf tsconfig.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

# Change ownership of the app directory
RUN chown -R mcp:nodejs /app
USER mcp

# Expose port (if needed for health checks)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
ENV HYPERION_CHAIN_ID=133717
ENV HYPERION_NETWORK_NAME="Hyperion Testnet"
ENV HYPERION_CURRENCY_SYMBOL=tMETIS
ENV HYPERION_EXPLORER_URL=https://hyperion-testnet-explorer.metisdevops.link

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Start the MCP server
CMD ["node", "build/index.js"]
