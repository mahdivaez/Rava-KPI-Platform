import NextAuth from "@/lib/auth"

// NextAuth v4: default export is the handler function
const handler = NextAuth

export { handler as GET, handler as POST }