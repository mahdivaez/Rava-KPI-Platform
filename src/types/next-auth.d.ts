import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      isTechnicalDeputy: boolean
      /** True for brand-side contacts signed in through /client/login. */
      isClient: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
    isClient?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
    isClient?: boolean
  }
}
