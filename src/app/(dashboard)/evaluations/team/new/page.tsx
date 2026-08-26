import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RoleEvaluationForm } from "@/components/evaluations/role-evaluation-form"
import { getEvaluableWorkgroups } from "@/lib/team-evaluations"

export default async function NewRoleEvaluationPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const workgroups = await getEvaluableWorkgroups(
    session.user.id,
    session.user.isAdmin
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 via-white to-nude-100 py-4 sm:py-6 lg:py-8">
      <RoleEvaluationForm workgroups={workgroups} />
    </div>
  )
}
