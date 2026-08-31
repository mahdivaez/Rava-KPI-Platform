import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * The signed-in client together with their workgroup.
 *
 * Every /client route calls this: it is the single place that turns a session
 * into a live `ClientAccount`, so a deactivated or deleted account loses access
 * on its next request rather than at token expiry.
 */
export async function requireClient() {
  const session = await auth()

  if (!session?.user) redirect("/client/login")
  if (!session.user.isClient) redirect("/dashboard")
  if (!prisma) redirect("/client/login")

  const client = await prisma.clientAccount.findUnique({
    where: { id: session.user.id },
    include: { workgroup: true },
  })

  if (!client || !client.isActive) redirect("/client/login")

  return client
}
