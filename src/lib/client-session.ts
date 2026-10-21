import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * The signed-in client together with every brand they speak for.
 *
 * Every /client route calls this: it is the single place that turns a session
 * into a live `ClientAccount`, so a deactivated or deleted account loses access
 * on its next request rather than at token expiry.
 *
 * Brands come back in creation order — the order the admin added them is the
 * order the portal lists them in, which is the one the client will recognise.
 */
export async function requireClient() {
  const session = await auth()

  if (!session?.user) redirect("/client/login")
  if (!session.user.isClient) redirect("/dashboard")
  if (!prisma) redirect("/client/login")

  const client = await prisma.clientAccount.findUnique({
    where: { id: session.user.id },
    include: {
      brands: {
        include: { workgroup: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!client || !client.isActive) redirect("/client/login")

  return client
}

/** The signed-in client, as `requireClient` returns them. */
export type SignedInClient = Awaited<ReturnType<typeof requireClient>>
