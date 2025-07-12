#!/bin/bash

# Hyperion MCP Server Quick Start Script
# This script helps you get started with the Hyperion MCP Server quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        return 1
    fi
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please edit .env file with your configuration before starting the server"
        else
            print_error ".env.example file not found"
            return 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command_exists npm; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "npm is not available. Please install Node.js and npm."
        return 1
    fi
}

# Function to build project
build_project() {
    print_status "Building the project..."
    
    npm run build
    print_success "Project built successfully"
}

# Function to setup dashboard
setup_dashboard() {
    print_status "Setting up web dashboard..."
    
    if [ -d "dashboard" ]; then
        cd dashboard
        
        if [ -f "package.json" ]; then
            npm install
            print_success "Dashboard dependencies installed"
            
            npm run build
            print_success "Dashboard built successfully"
        else
            print_error "Dashboard package.json not found"
            return 1
        fi
        
        cd ..
    else
        print_warning "Dashboard directory not found, skipping dashboard setup"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running basic tests..."
    
    if [ -f "examples/test-suite.js" ]; then
        node examples/test-suite.js --mock
        print_success "Basic tests completed"
    else
        print_warning "Test suite not found, skipping tests"
    fi
}

# Function to display next steps
show_next_steps() {
    echo ""
    echo "🎉 Hyperion MCP Server setup completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Edit .env file with your Hyperion blockchain configuration"
    echo "2. Add your private keys and RPC URL to .env"
    echo "3. Start the server with: npm start"
    echo "4. Or run in development mode: npm run dev"
    echo ""
    echo "🌐 Web Dashboard:"
    echo "- Navigate to dashboard/ directory"
    echo "- Run: npm run dev"
    echo "- Open: http://localhost:3000"
    echo ""
    echo "📚 Documentation:"
    echo "- API Reference: docs/api.md"
    echo "- Configuration: docs/configuration.md"
    echo "- Troubleshooting: docs/troubleshooting.md"
    echo ""
    echo "🔧 Integration:"
    echo "- Claude Desktop: See README.md for configuration"
    echo "- Smithery: Use smithery.yaml for marketplace deployment"
    echo "- Docker: docker build -t rootstock-mcp ."
    echo ""
}

# Function to show help
show_help() {
    echo "Rootstock MCP Server Quick Start Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --skip-dashboard    Skip dashboard setup"
    echo "  --skip-tests        Skip running tests"
    echo "  --dev               Setup for development (includes all steps)"
    echo "  --production        Setup for production (minimal setup)"
    echo ""
    echo "Examples:"
    echo "  $0                  # Full setup with all components"
    echo "  $0 --skip-dashboard # Setup without web dashboard"
    echo "  $0 --production     # Production setup only"
    echo ""
}

# Main function
main() {
    local skip_dashboard=false
    local skip_tests=false
    local setup_type="full"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --skip-dashboard)
                skip_dashboard=true
                shift
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --dev)
                setup_type="dev"
                shift
                ;;
            --production)
                setup_type="production"
                skip_tests=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Hyperion MCP Server Quick Start"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    if ! check_node_version; then
        exit 1
    fi
    
    # Setup steps
    setup_environment || exit 1
    install_dependencies || exit 1
    build_project || exit 1
    
    # Optional steps based on arguments
    if [ "$skip_dashboard" = false ]; then
        setup_dashboard || print_warning "Dashboard setup failed, continuing..."
    fi
    
    if [ "$skip_tests" = false ]; then
        run_tests || print_warning "Tests failed, continuing..."
    fi
    
    # Show completion message
    show_next_steps
}

# Run main function with all arguments
main "$@"
