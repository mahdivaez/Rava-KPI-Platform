import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      isTechnicalDeputy: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
  }
}
