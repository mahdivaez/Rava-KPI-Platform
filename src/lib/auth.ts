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
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
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

        // For development, just use test users
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

export default NextAuth(authOptions)
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)