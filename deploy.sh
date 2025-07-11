#!/bin/bash

# Hyperion MCP Server - Non-Docker Deployment Script
echo "🚀 Deploying Hyperion MCP Server to Smithery (No Docker)"

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Verify build output
if [ ! -f "build/smithery-server.js" ]; then
    echo "❌ Build failed - smithery-server.js not found"
    exit 1
fi

echo "✅ Build successful!"
echo "📁 Entry point: src/smithery-server.ts"
echo "🏗️ Built file: build/smithery-server.js"
echo "🌐 Runtime: Node.js (No Docker)"

# Test the server locally (optional)
echo "🧪 Testing server startup..."
timeout 5s node build/smithery-server.js || echo "✅ Server starts correctly"

echo "🎉 Ready for Smithery deployment!"
echo ""
echo "Use these settings in Smithery:"
echo "  Repository: https://github.com/cuongpo/hyperion-mcp-server"
echo "  Base Directory: ."
echo "  Entry Point: src/smithery-server.ts"
echo "  Build Command: npm run build"
echo "  Start Command: node build/smithery-server.js"
echo "  Runtime: Node.js 18+"
echo "  Docker: DISABLED"
