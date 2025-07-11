# 🐳 Docker Troubleshooting Guide for Hyperion MCP Server

This guide helps you resolve Docker build and runtime issues with the Hyperion MCP Server.

## 🚨 Common Issues and Solutions

### Issue: "Unexpected internal error or timeout"

This error typically occurs due to:
1. **Network timeouts** during npm install
2. **Resource constraints** (memory/CPU)
3. **Docker daemon issues**
4. **Build context too large**

## 🔧 Quick Fixes

### 1. Use the Simple Dockerfile (Recommended for Testing)

```bash
# Build with the simple Dockerfile
docker build -f Dockerfile.simple -t hyperion-mcp:simple .

# Run the container
docker run -p 3000:3000 \
  -e HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link \
  -e HYPERION_CHAIN_ID=133717 \
  hyperion-mcp:simple
```

### 2. Increase Docker Resources

If you're on Docker Desktop:
- **Memory**: Increase to at least 4GB
- **CPU**: Allocate at least 2 cores
- **Disk**: Ensure sufficient space (>10GB free)

### 3. Clean Docker Cache

```bash
# Remove all unused containers, networks, images
docker system prune -a

# Remove build cache
docker builder prune -a

# Restart Docker daemon
# On macOS: Docker Desktop -> Restart
# On Linux: sudo systemctl restart docker
```

### 4. Build with Increased Timeout

```bash
# Build with longer timeout and more verbose output
docker build \
  --progress=plain \
  --no-cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t hyperion-mcp:latest .
```

## 🏗️ Step-by-Step Build Process

### Option 1: Simple Build (Fastest)

```bash
# 1. Use the simple Dockerfile
docker build -f Dockerfile.simple -t hyperion-mcp:simple .

# 2. Test the container
docker run --rm \
  -e HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link \
  -e HYPERION_CHAIN_ID=133717 \
  -e HYPERION_NETWORK_NAME="Hyperion Testnet" \
  -e HYPERION_CURRENCY_SYMBOL=tMETIS \
  hyperion-mcp:simple
```

### Option 2: Optimized Build (Production)

```bash
# 1. Use the optimized multi-stage Dockerfile
docker build -f Dockerfile.optimized -t hyperion-mcp:optimized .

# 2. Run with proper configuration
docker run --rm \
  -e HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link \
  -e HYPERION_PRIVATE_KEYS=your_private_key_here \
  hyperion-mcp:optimized
```

### Option 3: Debug Build

```bash
# Build with debug output
docker build \
  --progress=plain \
  --no-cache \
  -f Dockerfile.simple \
  -t hyperion-mcp:debug . 2>&1 | tee build.log

# Check the build log for errors
cat build.log | grep -i error
```

## 🔍 Debugging Steps

### 1. Check Docker Status

```bash
# Check Docker daemon status
docker version
docker info

# Check available resources
docker system df
```

### 2. Test Build Steps Individually

```bash
# Test Node.js base image
docker run --rm node:18-alpine node --version

# Test npm install only
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install

# Test build process
docker run --rm -v $(pwd):/app -w /app node:18-alpine sh -c "npm install && npm run build"
```

### 3. Check Network Connectivity

```bash
# Test if Docker can reach npm registry
docker run --rm node:18-alpine npm ping

# Test Hyperion testnet connectivity
docker run --rm node:18-alpine sh -c "
  apk add curl && 
  curl -s https://hyperion-testnet.metisdevops.link
"
```

## 🚀 Alternative Deployment Methods

### Method 1: Local Build + Docker Run

```bash
# Build locally first
npm install
npm run build

# Create a runtime-only Dockerfile
cat > Dockerfile.runtime << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build/ ./build/
ENV HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
ENV HYPERION_CHAIN_ID=133717
CMD ["node", "build/index.js"]
EOF

# Build and run
docker build -f Dockerfile.runtime -t hyperion-mcp:runtime .
docker run --rm hyperion-mcp:runtime
```

### Method 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  hyperion-mcp:
    build:
      context: .
      dockerfile: Dockerfile.simple
    environment:
      - HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
      - HYPERION_CHAIN_ID=133717
      - HYPERION_NETWORK_NAME=Hyperion Testnet
      - HYPERION_CURRENCY_SYMBOL=tMETIS
    restart: unless-stopped
```

Run with:
```bash
docker-compose up --build
```

### Method 3: Pre-built Image

If you have access to a container registry:

```bash
# Build and push
docker build -t your-registry/hyperion-mcp:latest .
docker push your-registry/hyperion-mcp:latest

# Pull and run on target machine
docker pull your-registry/hyperion-mcp:latest
docker run your-registry/hyperion-mcp:latest
```

## 🛠️ Environment-Specific Solutions

### macOS (Docker Desktop)

```bash
# Increase resources in Docker Desktop settings
# Preferences -> Resources -> Advanced
# Memory: 4GB+, CPUs: 2+, Disk: 64GB+

# Use Rosetta 2 if on Apple Silicon
# Preferences -> General -> Use Rosetta for x86/amd64 emulation
```

### Linux

```bash
# Increase Docker daemon limits
sudo systemctl edit docker

# Add these lines:
[Service]
LimitNOFILE=1048576
LimitNPROC=1048576
LimitCORE=infinity

# Restart Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Windows (Docker Desktop)

```powershell
# Increase WSL2 memory limit
# Create/edit %USERPROFILE%\.wslconfig
[wsl2]
memory=4GB
processors=2

# Restart WSL
wsl --shutdown
```

## 📊 Performance Optimization

### Reduce Build Context

```bash
# Check build context size
du -sh .

# Use .dockerignore to exclude unnecessary files
echo "node_modules/" >> .dockerignore
echo "build/" >> .dockerignore
echo "docs/" >> .dockerignore
echo "examples/" >> .dockerignore
```

### Use Build Cache

```bash
# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1

# Build with cache mount
docker build \
  --cache-from hyperion-mcp:latest \
  -t hyperion-mcp:latest .
```

## 🆘 Emergency Workaround

If Docker continues to fail, you can run without Docker:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Set environment variables
export HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link
export HYPERION_CHAIN_ID=133717
export HYPERION_NETWORK_NAME="Hyperion Testnet"
export HYPERION_CURRENCY_SYMBOL=tMETIS

# Run directly
node build/index.js
```

## 📞 Getting Help

If issues persist:

1. **Check Docker logs**: `docker logs <container_id>`
2. **Check system resources**: `docker system df`
3. **Try minimal example**: Use `Dockerfile.simple`
4. **Update Docker**: Ensure you're using latest version
5. **Restart Docker daemon**: Sometimes fixes mysterious issues

## ✅ Success Verification

Once your container is running:

```bash
# Check if container is healthy
docker ps

# Test MCP server functionality
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
docker exec -i <container_id> node build/index.js
```

Your Hyperion MCP Server should now be running successfully in Docker! 🎉
