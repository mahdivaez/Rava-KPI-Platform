"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, MessageSquareQuote, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ClientAccountDialog,
  type ClientAccountFormValues,
  type WorkgroupOption,
} from "@/components/admin/client-account-dialog"
import { resolveClientGreeting } from "@/lib/client-greeting"
import { faNumber } from "@/lib/design-tokens"

export interface ClientAccountRow extends ClientAccountFormValues {
  workgroupName: string
  evaluationCount: number
}

export function ClientAccountsTable({
  clients,
  workgroups,
}: {
  clients: ClientAccountRow[]
  workgroups: WorkgroupOption[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<ClientAccountRow | null>(null)

  async function handleDelete(client: ClientAccountRow) {
    const warning = client.evaluationCount
      ? `حذف «${client.contactName}» ${faNumber(client.evaluationCount)} ارزیابی ثبت‌شده او را هم پاک می‌کند. ادامه می‌دهید؟`
      : `آیا از حذف حساب «${client.contactName}» اطمینان دارید؟`

    if (!confirm(warning)) return

    try {
      const res = await fetch(`/api/admin/clients?id=${client.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("حساب مشتری حذف شد")
        router.refresh()
      } else {
        const result = await res.json()
        toast.error(result.error || "خطا در حذف حساب مشتری")
      }
    } catch {
      toast.error("خطای سرور")
    }
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={<Building2 />}
        title="هنوز حساب مشتری ساخته نشده است"
        description="با دکمه «مشتری جدید» یک حساب بسازید تا مخاطب برند بتواند تیم کارگروه خود را ارزیابی کند."
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>مخاطب</TableHead>
              <TableHead>کارگروه</TableHead>
              <TableHead>متن داشبورد</TableHead>
              <TableHead>ارزیابی‌ها</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-end">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const greeting = resolveClientGreeting(client)
              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {client.contactName}
                      </p>
                      <p
                        dir="ltr"
                        className="truncate text-start text-xs text-foreground-muted"
                      >
                        {client.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {client.workgroupName}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">
                        برند: {client.brandName}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[22rem]">
                    <p className="flex items-start gap-1.5 text-sm text-foreground-secondary">
                      <MessageSquareQuote
                        className="mt-0.5 size-3.5 shrink-0 text-foreground-subtle"
                        aria-hidden
                      />
                      <span className="line-clamp-2">{greeting.title}</span>
                    </p>
                    {greeting.isDefault && (
                      <Badge variant="outline" size="sm" className="mt-1.5">
                        پیش‌فرض
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <span data-numeric className="text-sm text-foreground-secondary">
                      {faNumber(client.evaluationCount)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge variant={client.isActive ? "success" : "neutral"} size="sm">
                      {client.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`ویرایش ${client.contactName}`}
                        onClick={() => setEditing(client)}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`حذف ${client.contactName}`}
                        onClick={() => handleDelete(client)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <ClientAccountDialog
          mode="edit"
          client={editing}
          workgroups={workgroups}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </>
  )
}
