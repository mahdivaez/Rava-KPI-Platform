# Image Storage System Documentation

## Overview
This document explains the new image storage system implemented in the Rava Platform. Images are now stored in the filesystem instead of as base64 strings in the database.

## Previous System (Base64 in Database)
- Images were converted to base64 strings and stored directly in the `User.image` field
- This caused database bloat and performance issues
- Large images significantly increased database storage costs

## New System (Filesystem Storage)
- Images are stored as actual files in `/public/uploads/` directory
- Database only stores file paths/URLs
- Much more efficient storage and retrieval

## Directory Structure
```
public/
  uploads/
    profiles/     # User profile images
    evaluations/  # Evaluation form images
    .gitkeep      # Ensures directory is tracked in git
```

## Implementation Details

### API Endpoints
1. **POST /api/profile/upload-image**
   - Accepts multipart/form-data with `file` and `userId`
   - Validates file type and size (max 5MB)
   - Generates unique filename using crypto
   - Saves file to `/public/uploads/profiles/`
   - Updates database with file path

2. **POST /api/profile/delete-image**
   - Removes file from filesystem
   - Updates database to set image field to null

### File Validation
- **Allowed types**: JPG, JPEG, PNG, GIF, WebP
- **Maximum size**: 5MB
- **File naming**: Unique hex-based filenames to prevent collisions

### Database Changes
- No schema changes required
- `User.image` field now stores file paths like `/uploads/profiles/filename.jpg`
- Null values indicate no image uploaded

## Benefits
1. **Performance**: Faster database queries and responses
2. **Storage Efficiency**: Smaller database size, cheaper hosting
3. **Scalability**: Better handling of large images
4. **CDN Ready**: Easy to serve files via CDN in production
5. **Maintenance**: Easier to manage and backup image files

## Migration Notes
- Existing base64 images in database will continue to work
- New uploads will use the filesystem approach
- Consider migrating old images in a future update

## Production Considerations
1. **File Permissions**: Ensure proper read/write permissions
2. **Backup Strategy**: Include uploads directory in backup procedures
3. **CDN Integration**: Consider using CloudFront or similar for production
4. **Storage Limits**: Monitor disk usage and implement cleanup policies

## Security
- File type validation prevents malicious uploads
- Unique filenames prevent overwriting
- User authorization checks ensure users can only modify their own images
- Size limits prevent abuse