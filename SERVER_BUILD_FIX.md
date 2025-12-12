# Fix "Cannot find module 'tailwindcss'" Error on Server

## Problem
Build fails on server with: `Error: Cannot find module 'tailwindcss'`

## Root Cause
`tailwindcss`, `autoprefixer`, and `postcss` are in `devDependencies` but are required for the build process. They may not be installed if:
- Server ran `npm install --production` (skips devDependencies)
- `npm install` didn't complete properly
- `node_modules` is corrupted

## Solution

### Step 1: Clean Install (Recommended)

```bash
cd /var/www/Rava-KPI-Platform

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Install ALL dependencies (including devDependencies)
npm install

# Verify tailwindcss is installed
ls node_modules | grep tailwindcss
# Should show: tailwindcss

# Verify postcss is installed
ls node_modules | grep postcss
# Should show: postcss

# Verify autoprefixer is installed
ls node_modules | grep autoprefixer
# Should show: autoprefixer
```

### Step 2: Rebuild

```bash
# Clean previous build
rm -rf .next

# Build (should work now)
npm run build
```

### Alternative: If npm install fails

If `npm install` fails or is slow, try:

```bash
# Use npm ci for clean install (faster, more reliable)
rm -rf node_modules package-lock.json
npm ci

# Or if you have yarn
yarn install
```

## Why This Happens

Next.js needs `tailwindcss`, `autoprefixer`, and `postcss` at **build time** to process CSS files, even though they're technically "dev" dependencies. The build process runs on the server, so these packages must be installed.

## Prevention

Always run `npm install` (not `npm install --production`) on the server before building, as the build process requires devDependencies.

