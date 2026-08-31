import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { ClientLoginExperience } from "@/components/client/client-login-experience"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "ورود مشتریان",
  description: "ورود به بخش ارزیابی مشتریان راوا",
}

export default async function ClientLoginPage() {
  const session = await auth()
  if (session?.user?.isClient) redirect("/client")

  return <ClientLoginExperience />
}
