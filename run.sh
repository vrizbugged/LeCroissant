#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    local missing_deps=0
    
    # Check PHP
    if command_exists php; then
        PHP_VERSION=$(php -r 'echo PHP_VERSION;')
        print_success "PHP found: $PHP_VERSION"
        
        # Check PHP version (need 8.2+)
        PHP_MAJOR=$(php -r 'echo PHP_MAJOR_VERSION;')
        PHP_MINOR=$(php -r 'echo PHP_MINOR_VERSION;')
        if [ "$PHP_MAJOR" -lt 8 ] || ([ "$PHP_MAJOR" -eq 8 ] && [ "$PHP_MINOR" -lt 2 ]); then
            print_error "PHP 8.2 or higher is required. Found: $PHP_VERSION"
            missing_deps=1
        fi
    else
        print_error "PHP is not installed"
        missing_deps=1
    fi
    
    # Check Composer
    if command_exists composer; then
        COMPOSER_VERSION=$(composer --version | head -n 1)
        print_success "Composer found: $COMPOSER_VERSION"
    else
        print_error "Composer is not installed"
        missing_deps=1
    fi
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        missing_deps=1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: v$NPM_VERSION"
    else
        print_error "npm is not installed"
        missing_deps=1
    fi
    
    if [ $missing_deps -eq 1 ]; then
        print_error "Please install missing dependencies before continuing"
        exit 1
    fi
    
    echo ""
}

# Function to setup backend
setup_backend() {
    print_section "Setting up Backend (Laravel)"
    
    cd backend || exit 1
    
    # Install Composer dependencies
    print_info "Installing Composer dependencies..."
    if [ ! -d "vendor" ]; then
        composer install --no-interaction --prefer-dist
        if [ $? -eq 0 ]; then
            print_success "Composer dependencies installed"
        else
            print_error "Failed to install Composer dependencies"
            exit 1
        fi
    else
        print_warning "Vendor directory exists, skipping Composer install"
    fi
    
    # Setup .env file
    print_info "Setting up .env file..."
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
        else
            print_warning ".env.example not found, creating basic .env file"
            touch .env
            echo "APP_NAME=LeCroissant" >> .env
            echo "APP_ENV=local" >> .env
            echo "APP_KEY=" >> .env
            echo "APP_DEBUG=true" >> .env
            echo "APP_URL=http://localhost:8000" >> .env
            echo "" >> .env
            echo "DB_CONNECTION=mysql" >> .env
            echo "DB_HOST=127.0.0.1" >> .env
            echo "DB_PORT=3306" >> .env
            echo "DB_DATABASE=lecroissant" >> .env
            echo "DB_USERNAME=root" >> .env
            echo "DB_PASSWORD=" >> .env
            print_success "Basic .env file created"
        fi
    else
        print_warning ".env file already exists, skipping"
    fi
    
    # Generate Laravel key
    print_info "Generating Laravel application key..."
    if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
        php artisan key:generate --force
        if [ $? -eq 0 ]; then
            print_success "Laravel application key generated"
        else
            print_warning "Failed to generate application key (may already exist)"
        fi
    else
        print_warning "Application key already exists, skipping"
    fi
    
    # Setup storage permissions
    print_info "Setting up storage permissions..."
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true
    print_success "Storage permissions set"
    
    # Install npm dependencies for backend (Vite)
    print_info "Installing npm dependencies for backend (Vite)..."
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Backend npm dependencies installed"
        else
            print_error "Failed to install backend npm dependencies"
            exit 1
        fi
    else
        print_warning "Backend node_modules exists, skipping npm install"
    fi
    
    # Database migration and seeding
    print_info "Running database migrations..."
    read -p "Do you want to run database migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        php artisan migrate --force
        if [ $? -eq 0 ]; then
            print_success "Database migrations completed"
            
            # Run seeders
            print_info "Running database seeders..."
            read -p "Do you want to run database seeders? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                php artisan db:seed --force
                if [ $? -eq 0 ]; then
                    print_success "Database seeders completed"
                else
                    print_error "Failed to run database seeders"
                fi
            else
                print_warning "Skipping database seeders"
            fi
        else
            print_error "Failed to run database migrations"
            print_warning "Please check your database configuration in .env file"
        fi
    else
        print_warning "Skipping database migrations"
    fi
    
    cd ..
}

# Function to setup frontend
setup_frontend() {
    print_section "Setting up Frontend (Next.js)"
    
    cd frontend || exit 1
    
    # Install npm dependencies
    print_info "Installing npm dependencies..."
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Frontend npm dependencies installed"
        else
            print_error "Failed to install frontend npm dependencies"
            exit 1
        fi
    else
        print_warning "Frontend node_modules exists, skipping npm install"
    fi
    
    # Setup .env.local file
    print_info "Setting up .env.local file..."
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success ".env.local file created from .env.example"
        elif [ -f ".env" ]; then
            cp .env .env.local
            print_success ".env.local file created from .env"
        else
            print_warning "No .env.example or .env found for frontend"
            print_info "You may need to create .env.local manually"
        fi
    else
        print_warning ".env.local file already exists, skipping"
    fi
    
    cd ..
}

# Function to build assets (optional)
build_assets() {
    print_section "Building Assets (Optional)"
    
    read -p "Do you want to build assets now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Build backend assets
        print_info "Building backend assets..."
        cd backend || exit 1
        npm run build
        if [ $? -eq 0 ]; then
            print_success "Backend assets built"
        else
            print_warning "Failed to build backend assets"
        fi
        cd ..
        
        # Build frontend assets
        print_info "Building frontend assets..."
        cd frontend || exit 1
        npm run build
        if [ $? -eq 0 ]; then
            print_success "Frontend assets built"
        else
            print_warning "Failed to build frontend assets"
        fi
        cd ..
    else
        print_warning "Skipping asset build"
    fi
}

# Function to display instructions
show_instructions() {
    print_section "Setup Complete!"
    
    echo -e "${GREEN}Your project is ready to use!${NC}"
    echo ""
    echo "To start development servers:"
    echo ""
    echo -e "${YELLOW}Backend (Laravel):${NC}"
    echo "  cd backend"
    echo "  php artisan serve"
    echo "  # Or use: composer run dev (includes queue, logs, and vite)"
    echo ""
    echo -e "${YELLOW}Frontend (Next.js):${NC}"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo -e "${YELLOW}Or run both with:${NC}"
    echo "  # Terminal 1:"
    echo "  cd backend && composer run dev"
    echo ""
    echo "  # Terminal 2:"
    echo "  cd frontend && npm run dev"
    echo ""
    echo -e "${BLUE}Note:${NC} Make sure your database is configured in backend/.env before running migrations"
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   LeCroissant Project Setup Script     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # Get the directory where the script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    cd "$SCRIPT_DIR" || exit 1
    
    # Check prerequisites
    check_prerequisites
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Build assets (optional)
    build_assets
    
    # Show instructions
    show_instructions
}

# Run main function
main
