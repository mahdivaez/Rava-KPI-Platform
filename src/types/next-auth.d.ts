import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      isTechnicalDeputy: boolean
      /** True for brand-side contacts signed in through /client/login. */
      isClient: boolean
      /** The workgroup a client account belongs to; unset for team members. */
      workgroupId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
    isClient?: boolean
    workgroupId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    isTechnicalDeputy: boolean
    isClient?: boolean
    workgroupId?: string
  }
}
