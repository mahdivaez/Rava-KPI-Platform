import moment from "moment-jalaali"

import { prisma } from "@/lib/prisma"
import { isTeamRole, type TeamRole } from "@/lib/roles"
import { isClientEvaluableRole } from "@/lib/client-kpis"

export interface ClientEvaluationTarget {
  /** Stable key for a person-in-a-role; the form and the API agree on it. */
  key: string
  userId: string
  firstName: string
  lastName: string
  image: string | null
  role: TeamRole
}

/** The current Persian month — the only period a client can file for. */
export function currentPersianPeriod() {
  const now = moment()
  return { month: now.jMonth() + 1, year: now.jYear() }
}

export function targetKey(userId: string, role: string) {
  return `${userId}:${role}`
}

/**
 * The people a client is asked about: every member of their workgroup whose
 * role has a client-facing KPI set. Someone holding two evaluable roles is
 * listed once per role, since the questions differ per role.
 */
export async function getClientEvaluationTargets(
  workgroupId: string
): Promise<ClientEvaluationTarget[]> {
  if (!prisma) return []

  const members = await prisma.workgroupMember.findMany({
    where: { workgroupId },
    include: { user: true },
  })

  return members
    .filter((m) => m.user.isActive)
    .filter((m) => isTeamRole(m.role) && isClientEvaluableRole(m.role))
    .map((m) => ({
      key: targetKey(m.userId, m.role),
      userId: m.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      image: m.user.image,
      role: m.role as TeamRole,
    }))
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "fa"))
}

/** Target keys this client has already submitted for the given period. */
export async function getSubmittedTargetKeys(
  clientId: string,
  month: number,
  year: number
): Promise<Set<string>> {
  if (!prisma) return new Set()

  const rows = await prisma.clientEvaluation.findMany({
    where: { clientId, month, year },
    select: { targetId: true, targetRole: true },
  })

  return new Set(rows.map((r) => targetKey(r.targetId, r.targetRole)))
}
