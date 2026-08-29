import { prisma } from "@/lib/prisma"
import {
  ALLOW_SELF_EVALUATION,
  TEAM_ROLES,
  getEvaluableRolesForRoles,
  isTeamRole,
  type TeamRole,
} from "@/lib/roles"
import type { EvaluableWorkgroup } from "@/components/evaluations/role-evaluation-form"

/**
 * Workgroups the user can file role evaluations in, together with the roles and
 * people the permission matrix allows them to evaluate there.
 *
 * Admins get every active workgroup and every role, so they can fill gaps.
 */
export async function getEvaluableWorkgroups(
  userId: string,
  isAdmin = false
): Promise<EvaluableWorkgroup[]> {
  if (!prisma) return []

  const workgroups = await prisma.workgroup.findMany({
    where: isAdmin
      ? { isActive: true }
      : { isActive: true, members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
    },
    orderBy: { name: "asc" },
  })

  const result: EvaluableWorkgroup[] = []

  for (const workgroup of workgroups) {
    const myRoles = workgroup.members
      .filter((m) => m.userId === userId)
      .map((m) => m.role)
      .filter(isTeamRole) as TeamRole[]

    const evaluableRoles = isAdmin
      ? [...TEAM_ROLES]
      : getEvaluableRolesForRoles(myRoles)

    if (evaluableRoles.length === 0) continue

    const members = workgroup.members
      .filter((m) => isTeamRole(m.role))
      .filter((m) => evaluableRoles.includes(m.role as TeamRole))
      .filter((m) => ALLOW_SELF_EVALUATION || m.userId !== userId)
      .map((m) => ({
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        role: m.role as TeamRole,
        isSelf: m.userId === userId,
      }))

    // Only offer roles that actually have someone to evaluate.
    const rolesWithMembers = evaluableRoles.filter((role) =>
      members.some((m) => m.role === role)
    )

    if (rolesWithMembers.length === 0) continue

    result.push({
      id: workgroup.id,
      name: workgroup.name,
      myRoles,
      evaluableRoles: rolesWithMembers,
      members,
    })
  }

  return result
}
