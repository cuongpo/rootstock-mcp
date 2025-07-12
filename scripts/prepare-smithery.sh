#!/bin/bash

# Rootstock MCP Server - Smithery Preparation Script
# This script helps prepare the project for Smithery publication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate smithery.yaml
validate_smithery_config() {
    print_status "Validating smithery.yaml configuration..."
    
    if [ ! -f "smithery.yaml" ]; then
        print_error "smithery.yaml not found!"
        return 1
    fi
    
    # Check required fields
    local required_fields=("name" "displayName" "description" "version" "author" "license")
    
    for field in "${required_fields[@]}"; do
        if ! grep -q "^${field}:" smithery.yaml; then
            print_error "Missing required field: ${field}"
            return 1
        fi
    done
    
    print_success "smithery.yaml validation passed"
    return 0
}

# Function to test build process
test_build() {
    print_status "Testing build process..."
    
    if ! npm install; then
        print_error "npm install failed"
        return 1
    fi
    
    if ! npm run build; then
        print_error "npm run build failed"
        return 1
    fi
    
    if [ ! -f "build/index.js" ]; then
        print_error "build/index.js not found after build"
        return 1
    fi
    
    print_success "Build process completed successfully"
    return 0
}

# Function to test server startup
test_server() {
    print_status "Testing server startup..."

    # Set test environment
    export ROOTSTOCK_RPC_URL="https://public-node.testnet.rsk.co"
    export ROOTSTOCK_CHAIN_ID="31"
    export ROOTSTOCK_NETWORK_NAME="Rootstock Testnet"
    export ROOTSTOCK_CURRENCY_SYMBOL="tRBTC"

    # Test server can start by checking if it imports without errors
    if node -e "
        try {
            require('./build/index.js');
            console.log('Server imports successfully');
            process.exit(0);
        } catch (error) {
            console.error('Server import failed:', error.message);
            process.exit(1);
        }
    " > /dev/null 2>&1; then
        print_success "Server imports and initializes successfully"
        return 0
    else
        print_error "Server failed to import or initialize"
        return 1
    fi
}

# Function to check documentation
check_documentation() {
    print_status "Checking documentation..."
    
    local required_files=("README.md" "LICENSE")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Missing required file: $file"
            return 1
        fi
    done
    
    # Check README.md has essential sections
    local readme_sections=("Installation" "Configuration" "Usage" "API" "License")
    
    for section in "${readme_sections[@]}"; do
        if ! grep -qi "$section" README.md; then
            print_warning "README.md might be missing section: $section"
        fi
    done
    
    print_success "Documentation check completed"
    return 0
}

# Function to check git repository
check_git_repo() {
    print_status "Checking git repository..."
    
    if [ ! -d ".git" ]; then
        print_error "Not a git repository. Initialize with: git init"
        return 1
    fi
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "There are uncommitted changes"
        print_status "Uncommitted files:"
        git diff --name-only
        echo ""
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_warning "No remote origin set. Add with: git remote add origin <URL>"
    else
        local origin_url=$(git remote get-url origin)
        print_success "Remote origin: $origin_url"
    fi
    
    return 0
}

# Function to generate submission info
generate_submission_info() {
    print_status "Generating Smithery submission information..."
    
    local repo_url=""
    if git remote get-url origin > /dev/null 2>&1; then
        repo_url=$(git remote get-url origin)
    else
        repo_url="https://github.com/YOUR_USERNAME/rootstock-mcp-server"
    fi
    
    echo ""
    echo "📋 Smithery Submission Information"
    echo "=================================="
    echo ""
    echo "Server Name: rootstock-mcp"
    echo "Display Name: Rootstock Blockchain MCP Server"
    echo "Description: Model Context Protocol server for Rootstock blockchain (testnet) interactions - wallet management, tRBTC transactions, smart contract interactions, and complete ERC20/ERC721 token deployment and management on Chain ID 31"
    echo "Repository URL: $repo_url"
    echo "Categories: blockchain, cryptocurrency, wallet, defi"
    echo "Keywords: rootstock, rootstock-testnet, blockchain, cryptocurrency, wallet, trbtc, smart-contracts, defi, mcp, model-context-protocol, chain-31"
    echo "License: MIT"
    echo "Node.js Version: >=18.0.0"
    echo ""
    echo "🔗 Smithery URL: https://smithery.ai/"
    echo ""
}

# Function to create release
create_release() {
    print_status "Preparing release..."
    
    local version=$(grep "^version:" smithery.yaml | cut -d' ' -f2)
    
    if [ -z "$version" ]; then
        print_error "Could not extract version from smithery.yaml"
        return 1
    fi
    
    print_status "Creating release for version: $version"
    
    # Check if tag already exists
    if git tag -l | grep -q "^v$version$"; then
        print_warning "Tag v$version already exists"
    else
        git tag "v$version"
        print_success "Created tag: v$version"
    fi
    
    print_status "To push the release:"
    echo "  git push origin main"
    echo "  git push --tags"
    
    return 0
}

# Main function
main() {
    echo "🚀 Hyperion MCP Server - Smithery Preparation"
    echo "============================================="
    echo ""
    
    local all_passed=true
    
    # Run all checks
    if ! validate_smithery_config; then
        all_passed=false
    fi
    
    echo ""
    
    if ! test_build; then
        all_passed=false
    fi
    
    echo ""
    
    if ! test_server; then
        all_passed=false
    fi
    
    echo ""
    
    if ! check_documentation; then
        all_passed=false
    fi
    
    echo ""
    
    if ! check_git_repo; then
        all_passed=false
    fi
    
    echo ""
    
    if [ "$all_passed" = true ]; then
        print_success "All checks passed! Ready for Smithery submission."
        echo ""
        
        if [ "$1" = "--release" ]; then
            create_release
            echo ""
        fi
        
        generate_submission_info
        
        echo "📝 Next Steps:"
        echo "1. Commit any remaining changes: git add . && git commit -m 'Prepare for Smithery'"
        echo "2. Push to GitHub: git push origin main"
        echo "3. Visit https://smithery.ai/ and submit your server"
        echo "4. Use the submission information above"
        echo ""
        print_success "Good luck with your Smithery submission! 🎉"
    else
        print_error "Some checks failed. Please fix the issues above before submitting to Smithery."
        return 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Rootstock MCP Server - Smithery Preparation Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h      Show this help message"
        echo "  --release       Create a git tag for release"
        echo ""
        echo "This script validates your project for Smithery submission by:"
        echo "• Checking smithery.yaml configuration"
        echo "• Testing build process"
        echo "• Verifying server startup"
        echo "• Checking documentation"
        echo "• Validating git repository"
        echo ""
        ;;
    *)
        main "$@"
        ;;
esac
