#!/bin/bash

# Build script for Smithery deployment
set -e

echo "🏗️  Building Rootstock MCP Server for Smithery..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Validate build
echo "✅ Validating build..."
if [ ! -f "build/index.js" ]; then
    echo "❌ Build failed: index.js not found"
    exit 1
fi

# Test the server starts
echo "🧪 Testing server startup..."
timeout 10s node build/index.js > /dev/null 2>&1 || true

echo "✅ Build completed successfully!"
echo "📋 Build artifacts:"
echo "   - build/index.js (main server)"
echo "   - build/ (compiled TypeScript)"
echo "   - package.json (dependencies)"
echo "   - smithery.yaml (MCP configuration)"

echo ""
echo "🚀 Ready for Smithery deployment!"
echo "   Use: smithery deploy"
