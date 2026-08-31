"use server"

import { signOut } from "@/lib/auth"

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}



/** Clients return to their own login page, not the team one. */
export async function handleClientSignOut() {
  await signOut({ redirectTo: "/client/login" })
}
