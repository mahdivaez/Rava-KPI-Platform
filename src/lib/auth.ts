import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

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

export const authOptions: NextAuthOptions = {
  secret: (globalThis as any).process?.env?.NEXTAUTH_SECRET || 'fallback-secret',
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
          // First try to find user in test users (for development)
          const testUser = testUsers.find(user => user.email === credentials.email)
          if (testUser) {
            const isValidPassword = await bcrypt.compare(
              credentials.password as string,
              testUser.password
            )
            if (isValidPassword) {
              return {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name,
                isAdmin: testUser.isAdmin,
                isTechnicalDeputy: testUser.isTechnicalDeputy,
              }
            }
          }

          // If not found in test users, try database
          try {
            const { prisma } = await import('@/lib/prisma')
            const user = await prisma.user.findUnique({
              where: { email: credentials.email as string },
            })

            if (!user || !user.isActive) {
              return null
            }

            const isValidPassword = await bcrypt.compare(
              credentials.password as string,
              user.password
            )

            if (!isValidPassword) {
              return null
            }

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              isAdmin: user.isAdmin,
              isTechnicalDeputy: user.isTechnicalDeputy,
            }
          } catch (dbError) {
            console.log('Database not available, using test users only')
            return null
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.isTechnicalDeputy = user.isTechnicalDeputy
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id
        session.user.isAdmin = token.isAdmin
        session.user.isTechnicalDeputy = token.isTechnicalDeputy
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const,
  },
}

export default NextAuth(authOptions)
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)