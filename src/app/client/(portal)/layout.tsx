// Force dynamic rendering — every page here depends on the signed-in client.
export const dynamic = "force-dynamic"

import { handleClientSignOut } from "@/app/actions/auth"
import { ClientShell } from "@/components/client/client-shell"
import { requireClient } from "@/lib/client-session"

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = await requireClient()

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-toast focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        رفتن به محتوای اصلی
      </a>
      <ClientShell
        contactName={client.contactName}
        brandName={client.brandName}
        signOutAction={handleClientSignOut}
      >
        {children}
      </ClientShell>
    </>
  )
}
