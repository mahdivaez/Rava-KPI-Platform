#!/bin/bash

# Ubuntu Deployment Script for Rava Platform
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Rava Platform deployment on Ubuntu..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
   echo "❌ Please run this script as a regular user (not root)"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Nginx
echo "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Install PostgreSQL (optional - comment out if already installed)
echo "📦 Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Create project directory
echo "📁 Setting up project directory..."
PROJECT_DIR="/var/www/rava-platform"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Set working directory
cd $PROJECT_DIR

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "📋 This script assumes your project files are already in $PROJECT_DIR"
    echo "   Please copy your project files here before running this script"
    exit 1
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo "⚠️  Please edit .env file with your actual configuration values"
    else
        echo "❌ No .env.production.example found. Please create .env manually"
        exit 1
    fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Set up PM2 ecosystem file
echo "🔧 Setting up PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rava-platform',
    cwd: '/var/www/rava-platform',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Set up Nginx configuration
echo "🔧 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/rava-platform > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Static files - serve Next.js static assets directly
    location /_next/static/ {
        alias $PROJECT_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files - serve uploaded images directly
    location /uploads/ {
        alias $PROJECT_DIR/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/rava-platform /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Set proper permissions
echo "🔧 Setting permissions..."
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod -R 777 $PROJECT_DIR/public/uploads
# Ensure .next directory has correct permissions (set after build)
sudo chown -R www-data:www-data $PROJECT_DIR/.next 2>/dev/null || true
sudo chmod -R 755 $PROJECT_DIR/.next 2>/dev/null || true

# Add user to www-data group for file access
sudo usermod -a -G www-data $USER

# Build the application for production
echo "🏗️  Building application..."
npm run build

# Set proper permissions for build artifacts
echo "🔧 Setting permissions for build artifacts..."
sudo chown -R www-data:www-data $PROJECT_DIR/.next
sudo chmod -R 755 $PROJECT_DIR/.next

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete rava-platform 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Set up PM2 startup
echo "🔧 Setting up PM2 startup..."
pm2 startup | tail -n 1 | bash

# Restart nginx
echo "🔧 Restarting Nginx..."
sudo systemctl restart nginx

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database and configuration values"
echo "2. Run database migrations: npx prisma db push"
echo "3. Check application status: pm2 status"
echo "4. View logs: pm2 logs rava-platform"
echo "5. Test the application in your browser"
echo ""
echo "🔧 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs rava-platform"
echo "- Restart: pm2 restart rava-platform"
echo "- Stop: pm2 stop rava-platform"
echo "- Nginx config: sudo nano /etc/nginx/sites-available/rava-platform"
echo ""
echo "⚠️  Don't forget to:"
echo "- Configure your domain name in Nginx config"
echo "- Set up SSL certificate with: sudo certbot --nginx -d your-domain.com"
echo "- Configure your database and run migrations"