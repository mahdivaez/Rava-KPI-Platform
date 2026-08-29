# Ubuntu Server Deployment Guide

This guide will help you deploy your Next.js application on Ubuntu Linux server with proper image serving configuration.

## Prerequisites

- Ubuntu 20.04+ server
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Web server (nginx recommended)

## Step 1: Install Node.js and npm

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Install PostgreSQL (if not already installed)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE rava_platform;
CREATE USER rava_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rava_platform TO rava_user;
\q
```

## Step 3: Install and Configure Nginx

```bash
# Install nginx
sudo apt install nginx -y

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 4: Deploy Your Application

```bash
# Clone your repository (or upload your project files)
cd /var/www/
sudo git clone <your-repository-url> rava-platform
sudo chown -R $USER:$USER rava-platform
cd rava-platform

# Install dependencies
npm install

# Create environment file
cp .env.production.example .env
```

Edit the `.env` file with your actual values:

```bash
# Database
DATABASE_URL="postgresql://rava_user:your_secure_password@localhost:5432/rava_platform"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret"

# Other environment variables...
```

## Step 5: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npm run db:seed
```

## Step 6: Configure Nginx for Next.js and Static Files

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/rava-platform
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files - serve uploaded images directly
    location /uploads/ {
        alias /var/www/rava-platform/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Enable CORS for images if needed
        add_header Access-Control-Allow-Origin *;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/rava-platform /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 7: Set Up Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem file
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
mkdir logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the instructions provided by the command
```

## Step 8: Set Up SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: Configure File Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/rava-platform

# Set proper permissions
sudo chmod -R 755 /var/www/rava-platform
sudo chmod -R 777 /var/www/rava-platform/public/uploads

# Ensure PM2 can read files
sudo usermod -a -G www-data $USER
```

## Step 10: Monitor and Maintain

```bash
# Check application status
pm2 status

# View logs
pm2 logs rava-platform

# Restart application
pm2 restart rava-platform

# Monitor system resources
htop
df -h
```

## Troubleshooting

### Images not loading:
1. Check file permissions: `ls -la /var/www/rava-platform/public/uploads/`
2. Verify nginx configuration: `sudo nginx -t`
3. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify PM2 logs: `pm2 logs rava-platform`

### Database connection issues:
1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Verify database connection string in `.env`
3. Test database connection: `psql -h localhost -U rava_user -d rava_platform`

### Application won't start:
1. Check Node.js version: `node --version`
2. Install missing dependencies: `npm install`
3. Check PM2 logs: `pm2 logs rava-platform`
4. Verify environment variables: `pm2 env 0`

## Security Recommendations

1. **Firewall**: Configure UFW firewall
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

2. **Regular Updates**: Keep system updated
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Fail2Ban**: Install intrusion prevention
   ```bash
   sudo apt install fail2ban -y
   ```

4. **Database Security**: Change default PostgreSQL settings and use strong passwords.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Process manager (PM2) set up
- [ ] Nginx configured for static files
- [ ] File permissions set correctly
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Logs rotation configured

Your application should now be running with proper image serving on your Ubuntu server!