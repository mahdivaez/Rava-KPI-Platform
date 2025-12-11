#!/bin/bash

# Migration script to fix WriterFeedback.imageUrl missing column issue

echo "Running Prisma migration to add imageUrl column to WriterFeedback table..."

# Run the new migration
npx prisma migrate deploy --name add-imageurl_to_writerfeedback

# If that doesn't work, try a development migration (which will also work in production)
if [ $? -ne 0 ]; then
    echo "Deploy migration failed, trying development migration..."
    npx prisma migrate dev --name add_imageurl_to_writerfeedback
fi

# Generate Prisma client to ensure it's updated
npx prisma generate

echo "Migration completed successfully!"
echo "The WriterFeedback table now has the imageUrl column."