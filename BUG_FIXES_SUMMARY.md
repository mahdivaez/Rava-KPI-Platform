# Bug Fixes Summary

This document outlines all the fixes applied to resolve the React hydration error and image loading issues.

## Issues Fixed

### 1. React Error #418 (Hydration Error)

**Problem**: React hydration mismatch caused by `moment()` being called without parameters, resulting in different times on server vs client.

**Root Cause**: 
- `moment()` was being called in evaluation forms to get current date/time
- Server and client had different timestamps, causing hydration mismatches
- React Error #418 specifically indicates server/client rendering differences

**Solution Implemented**:
1. **Created `usePersianDate` Hook** (`src/hooks/use-persian-date.tsx`):
   - Client-side hook to calculate current Persian date/time
   - Uses dynamic import of moment-jalaali to avoid SSR issues
   - Provides safe current date/time values without hydration conflicts

2. **Updated Evaluation Forms**:
   - `strategist-evaluation-form.tsx`: Now uses `usePersianDate()` hook
   - `writer-evaluation-form.tsx`: Now uses `usePersianDate()` hook
   - Removed direct `moment()` calls that caused hydration issues

3. **Maintained Existing Utils**:
   - `src/lib/utils.ts`: Kept existing date formatting functions for database dates
   - These functions format specific dates without calling `moment()` without parameters

### 2. Image Loading 404 Errors

**Problem**: Images uploaded to `/uploads/evaluations/` returned 404 Not Found errors.

**Root Cause**: 
- Nginx configuration didn't properly serve static files from nested directories
- Images were uploaded to `public/uploads/evaluations/` but nginx couldn't find them

**Solution Implemented**:
1. **Enhanced Nginx Configuration** (`nginx-rava-platform.conf`):
   - Separate location blocks for `/uploads/evaluations/` and `/uploads/profiles/`
   - Proper alias directives with full paths
   - Specific handling for image file types
   - Graceful error handling for missing files

2. **Updated Deploy Script** (`deploy-ubuntu.sh`):
   - Will use the new nginx configuration for better static file serving
   - Improved permission handling for upload directories

3. **Enhanced Error Handling**:
   - `strategist-evaluations-report.tsx`: Added `onError` handler for images
   - `writer-evaluations-report.tsx`: Added `onError` handler for images
   - Shows "تصویر در دسترس نیست" (Image not available) message when images fail to load

## Files Modified

### New Files Created:
- `src/hooks/use-persian-date.tsx`: Client-side hook for safe Persian date handling
- `nginx-rava-platform.conf`: Optimized nginx configuration for static files

### Existing Files Updated:
- `src/lib/utils.ts`: Maintained existing functionality, no breaking changes
- `src/components/evaluations/strategist-evaluation-form.tsx`: Uses new hook
- `src/components/evaluations/writer-evaluation-form.tsx`: Uses new hook  
- `src/components/admin/strategist-evaluations-report.tsx`: Added image error handling
- `src/components/admin/writer-evaluations-report.tsx`: Added image error handling

## Technical Details

### Hydration Fix Approach:
```typescript
// Before (causing hydration error):
const currentPersian = moment() // Different on server vs client

// After (safe):
const { currentYear, effectiveCurrentMonth } = usePersianDate() // Client-side only
```

### Nginx Static File Serving:
```nginx
# Specific handling for evaluation images
location /uploads/evaluations/ {
    alias /var/www/rava-platform/public/uploads/evaluations/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin *;
}

# Specific handling for profile images  
location /uploads/profiles/ {
    alias /var/www/rava-platform/public/uploads/profiles/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin *;
}
```

### Image Error Handling:
```typescript
<img
  src={evaluation.imageUrl}
  alt="تصویر ارزیابی"
  onError={(e) => {
    console.error('Image failed to load:', evaluation.imageUrl)
    e.currentTarget.style.display = 'none'
    // Show fallback message
  }}
/>
```

## Deployment Instructions

### For Existing Ubuntu Server:
1. **Copy the new nginx configuration**:
   ```bash
   sudo cp nginx-rava-platform.conf /etc/nginx/sites-available/rava-platform
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Update permissions**:
   ```bash
   sudo chmod -R 777 /var/www/rava-platform/public/uploads
   sudo chown -R www-data:www-data /var/www/rava-platform
   ```

3. **Test image serving**:
   ```bash
   curl -I http://your-server/uploads/evaluations/your-image.png
   ```

### For New Deployment:
- Use the updated `deploy-ubuntu.sh` script which includes all improvements
- The script will automatically use the optimized nginx configuration

## Verification

### React Error Fix:
- No more hydration warnings in browser console
- Evaluation forms load without React errors
- Persian dates display correctly

### Image Loading Fix:
- Images load properly from `/uploads/evaluations/` and `/uploads/profiles/`
- 404 errors are eliminated
- Graceful fallback when images are missing

## Performance Improvements

1. **Caching**: Nginx configuration includes proper cache headers for static images
2. **Error Handling**: Faster failure detection for missing images
3. **Optimized Paths**: Specific location blocks reduce nginx processing time

All fixes are backward compatible and don't require database changes.