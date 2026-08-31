// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

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
  // Client accounts live in their own table and have no team membership;
  // sending them here would query `User` with a ClientAccount id.
  if (session.user.isClient) redirect('/client')

  const [memberships, currentUser] = await Promise.all([
    prisma.workgroupMember.findMany({
      where: { userId: session.user.id },
    }),
    // Only the avatar — the rest of the profile is fetched by the pages that
    // actually render it.
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    }),
  ])

  return (
    <>
      {/* Keyboard users reach the content without tabbing the whole sidebar. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-toast focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        رفتن به محتوای اصلی
      </a>
      <DashboardLayoutClient
        session={session}
        memberships={memberships}
        avatarUrl={currentUser?.image ?? null}
      >
        {children}
      </DashboardLayoutClient>
    </>
  )
}
