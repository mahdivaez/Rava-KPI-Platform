# Database Connection Setup - Neon PostgreSQL

## ✅ Setup Complete

Your Rava Platform has been successfully connected to the Neon PostgreSQL database.

## 🔌 Connection Details

- **Database Provider**: Neon (PostgreSQL)
- **Host**: ep-hidden-leaf-a432u6lp-pooler.us-east-1.aws.neon.tech
- **Database**: neondb
- **Connection Pooling**: Enabled (pooler)
- **SSL**: Required

## 📋 What Was Done

1. ✅ Created `.env` file with DATABASE_URL
2. ✅ Generated Prisma Client
3. ✅ Applied 7 database migrations to Neon database
4. ✅ Seeded database with initial admin user
5. ✅ Verified database connection

## 🗄️ Database Structure

The following tables have been created in your database:

- **User** - User accounts and profiles
- **Workgroup** - Team/workgroup management
- **WorkgroupMember** - User-workgroup relationships
- **StrategistEvaluation** - Performance evaluations for strategists
- **WriterEvaluation** - Performance evaluations for writers
- **WriterFeedback** - Feedback from writers
- **Goal** - Goals tracking (individual/team/company)
- **Task** - Task management and assignments
- **Comment** - Comments on evaluations/feedback
- **PointTransaction** - Gamification points system
- **Message** - Direct messaging between users

## 👤 Default Admin User

An admin user has been created for you:

- **Email**: `admin@kpi.com`
- **Password**: `Admin@123`
- **Permissions**: Full admin access

⚠️ **Important**: Change the admin password after your first login!

## 🚀 Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at: http://localhost:3000

## 🔧 Useful Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration (after schema changes)
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Seed the database
npx ts-node --transpile-only prisma/seed.ts
```

## 📝 Environment Variables

Your `.env` file contains:

```env
DATABASE_URL="postgresql://neondb_owner:npg_rZ8D0BtvdSJh@ep-hidden-leaf-a432u6lp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-replace-in-production"
```

⚠️ **Important**: Before deploying to production:
1. Generate a secure NEXTAUTH_SECRET: `openssl rand -base64 32`
2. Update NEXTAUTH_URL to your production URL

## 🔒 Security Notes

- The `.env` file is not committed to git (protected by .gitignore)
- An `.env.example` template has been created for reference
- Never share your database credentials or commit them to version control
- Use environment-specific credentials for different environments (dev/staging/prod)

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter connection issues:

1. Check that your DATABASE_URL is correctly set in `.env`
2. Verify your Neon database is active (check Neon dashboard)
3. Ensure your IP is allowed (Neon usually allows all IPs by default)
4. Try regenerating the Prisma Client: `npx prisma generate`

### Migration Issues

If migrations fail:

```bash
# Reset your local database
npx prisma migrate reset

# Regenerate and apply migrations
npx prisma generate
npx prisma migrate deploy
```

---

**Setup Date**: November 19, 2025
**Status**: ✅ Active and Ready

