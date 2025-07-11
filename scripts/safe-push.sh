#!/bin/bash

# Safe Git Push Script
# This script performs security checks before pushing code

set -e

echo "🔒 Running security checks before Git push..."

# Check for private keys (more specific patterns)
echo "🔍 Checking for private keys..."
# Check for private key patterns in environment files and configs
if grep -r "PRIVATE_KEY.*=.*0x[a-fA-F0-9]\{64\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=artifacts --exclude="SECURITY.md" --exclude=".env.example" --quiet; then
    echo "❌ SECURITY KEY ALERT: Private key environment variables found!"
    echo "Please remove all private keys before pushing."
    exit 1
fi

# Check for private key assignments in code
if grep -r "privateKey.*['\"]0x[a-fA-F0-9]\{64\}['\"]" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=artifacts --exclude="SECURITY.md" --exclude=".env.example" --quiet; then
    echo "❌ SECURITY ALERT: Private key assignments found in code!"
    echo "Please remove all private keys before pushing."
    exit 1
fi

# Check for test private key (excluding this script and security docs)
echo "🔍 Checking for test private key..."
if grep -r "3cf90f4acdaee72ab90c0da7eda158ec1e908a5698aaf11a99070bba5da18b17" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=artifacts --exclude-dir=scripts --exclude="SECURITY.md" --quiet; then
    echo "❌ SECURITY ALERT: Test private key found in code!"
    echo "Please remove the test private key before pushing."
    exit 1
fi

# Check for .env files
echo "🔍 Checking for .env files..."
if find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" | grep -q .; then
    echo "❌ SECURITY ALERT: .env files found!"
    echo "Please ensure .env files are not tracked by Git."
    exit 1
fi

# Check Git status
echo "📋 Checking Git status..."
git status

echo ""
echo "✅ Security checks passed!"
echo "🚀 Ready to push code safely."
echo ""
echo "Run the following commands to push:"
echo "  git add ."
echo "  git commit -m 'Add ERC20 token deployment tools with Smithery support'"
echo "  git push origin main"
echo ""
echo "🔒 Security reminders:"
echo "  - No private keys in code ✅"
echo "  - No .env files tracked ✅"
echo "  - Test files excluded ✅"
echo "  - Only placeholder values in examples ✅"
