"use server"

import { redirect } from "next/navigation"

export async function handleSignOut() {
  // NextAuth v4: redirect to signout endpoint
  redirect("/api/auth/signout")
}


