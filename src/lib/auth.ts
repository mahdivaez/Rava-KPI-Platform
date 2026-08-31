import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// NextAuth v5 configuration
// trustHost is controlled by AUTH_TRUST_HOST environment variable
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Use database for authentication
          if (!prisma) {
            console.error("Prisma client not available")
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.isActive) {
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            isAdmin: user.isAdmin,
            isTechnicalDeputy: user.isTechnicalDeputy,
            isClient: false,
          }
        } catch (error) {
          console.error("Database auth error:", error)
          return null
        }
      },
    }),

    // Brand-side contacts. A separate provider (rather than a flag on `User`)
    // keeps client credentials in their own table, so a client can never be
    // granted a team role or an admin flag by mistake.
    Credentials({
      id: "client-credentials",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          if (!prisma) {
            console.error("Prisma client not available")
            return null
          }

          const client = await prisma.clientAccount.findUnique({
            where: { email: credentials.email as string },
          })

          if (!client || !client.isActive) {
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            client.password
          )

          if (!isValid) {
            return null
          }

          return {
            id: client.id,
            email: client.email,
            name: client.contactName,
            isAdmin: false,
            isTechnicalDeputy: false,
            isClient: true,
            workgroupId: client.workgroupId,
          }
        } catch (error) {
          console.error("Client auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.isTechnicalDeputy = user.isTechnicalDeputy
        token.isClient = user.isClient ?? false
        token.workgroupId = user.workgroupId
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.isTechnicalDeputy = token.isTechnicalDeputy as boolean
        // Older sessions issued before client accounts existed carry no flag.
        session.user.isClient = (token.isClient as boolean | undefined) ?? false
        session.user.workgroupId = token.workgroupId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
  session: {
    strategy: "jwt",
  },
})
