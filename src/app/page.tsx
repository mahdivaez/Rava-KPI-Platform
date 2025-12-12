// import { auth } from "@/lib/auth" // Temporarily disabled
import { redirect } from "next/navigation"

export default async function HomePage() {
  // Temporarily redirect to login since auth is disabled
  redirect('/login')
}
