import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Test users for development when database is not available
const testUsers = [
  {
    id: '1',
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    isAdmin: true,
    isTechnicalDeputy: false,
  },
  {
    id: '2',
    email: 'user@test.com',
    password: 'user123',
    name: 'Test User',
    isAdmin: false,
    isTechnicalDeputy: false,
  },
]

const authSecret = process.env.NEXTAUTH_SECRET
if (!authSecret) {
  throw new Error('NEXTAUTH_SECRET is not set')
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Try database first
          if (prisma) {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email as string },
            })

            if (user && user.isActive) {
              const isValid = await bcrypt.compare(
                credentials.password as string,
                user.password
              )

              if (isValid) {
                return {
                  id: user.id,
                  email: user.email,
                  name: `${user.firstName} ${user.lastName}`,
                  isAdmin: user.isAdmin,
                  isTechnicalDeputy: user.isTechnicalDeputy,
                }
              }
            }
          }
        } catch (error) {
          console.error("Database auth error:", error)
          // Fall through to test users if DB fails
        }

        // Fallback to test users for development
        const testUser = testUsers.find(user => user.email === credentials.email)
        if (testUser && credentials.password === testUser.password) {
          return {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
            isAdmin: testUser.isAdmin,
            isTechnicalDeputy: testUser.isTechnicalDeputy,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.isTechnicalDeputy = user.isTechnicalDeputy
      }
      return token
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.isTechnicalDeputy = token.isTechnicalDeputy as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
  session: {
    strategy: "jwt" as const,
  },
}

// NextAuth v4: NextAuth() returns a handler function
const handler = NextAuth(authOptions)

// Export handler for API route
export default handler

// Helper function to get server session (NextAuth v4 way)
export async function getSession() {
  return await getServerSession(authOptions)
}