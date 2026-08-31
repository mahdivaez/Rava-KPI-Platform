"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ClientAccountDialog,
  type WorkgroupOption,
} from "@/components/admin/client-account-dialog"

export function CreateClientDialog({
  workgroups,
}: {
  workgroups: WorkgroupOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={workgroups.length === 0}>
        <Plus aria-hidden />
        مشتری جدید
      </Button>

      {/* Remounted per open so the form always starts empty. */}
      {open && (
        <ClientAccountDialog
          mode="create"
          workgroups={workgroups}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  )
}
