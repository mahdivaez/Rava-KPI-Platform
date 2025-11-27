import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const memberships = await prisma.workgroupMember.findMany({
    where: { userId: session.user.id },
  })

  return <DashboardLayoutClient session={session} memberships={memberships}>{children}</DashboardLayoutClient>
}

