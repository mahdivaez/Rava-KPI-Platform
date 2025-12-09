import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        // --- تغییرات پیشنهادی اعمال شد: استفاده از return null بجای throw new Error ---
        
        if (!credentials?.email || !credentials?.password) {
          // در صورت نقص اطلاعات، بجای پرتاب خطا، null برمی‌گرداند.
          return null 
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive) {
          // در صورت عدم وجود کاربر یا غیرفعال بودن، null برمی‌گرداند.
          return null 
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          // در صورت اشتباه بودن رمز عبور، null برمی‌گرداند.
          return null 
        }

        // --- در صورت موفقیت، شیء کاربر برگردانده می‌شود ---
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          isAdmin: user.isAdmin,
          isTechnicalDeputy: user.isTechnicalDeputy,
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
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.isTechnicalDeputy = token.isTechnicalDeputy as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
})