import { prisma } from "@/lib/prisma"
import { isTeamRole, type TeamRole } from "@/lib/roles"
import { isClientEvaluableRole } from "@/lib/client-kpis"
import { getOpenPeriod } from "@/lib/evaluation-period"

export interface ClientEvaluationTarget {
  /** Stable key for a person-in-a-role-for-a-brand; form and API agree on it. */
  key: string
  brandId: string
  brandName: string
  userId: string
  firstName: string
  lastName: string
  image: string | null
  role: TeamRole
}

/** One brand's worth of work for the open month. */
export interface ClientBrandBoard {
  brandId: string
  brandName: string
  workgroupId: string
  workgroupName: string
  /** Everyone this brand's team asks the client about. */
  targets: ClientEvaluationTarget[]
  /** The subset still waiting — a filed evaluation is final. */
  pending: ClientEvaluationTarget[]
  doneCount: number
  completionPct: number
}

/** The brand fields a board needs; both the portal and the API pass these. */
export interface BrandRef {
  id: string
  brandName: string
  workgroupId: string
  workgroup: { name: string }
}

/** The open KPI month (admin-pinned or the calendar month) — the only one a client can file for. */
export async function currentPersianPeriod() {
  const { month, year } = await getOpenPeriod()
  return { month, year }
}

/**
 * A client who owns two brands may well have the same strategist on both.
 * That is two separate verdicts about two separate bodies of work, so the
 * brand is part of the key everywhere: in the form, in the payload and in the
 * database's uniqueness rule.
 */
export function targetKey(brandId: string, userId: string, role: string) {
  return `${brandId}:${userId}:${role}`
}

/** Target keys this client has already submitted, across every brand. */
export async function getSubmittedTargetKeys(
  clientId: string,
  month: number,
  year: number
): Promise<Set<string>> {
  if (!prisma) return new Set()

  const rows = await prisma.clientEvaluation.findMany({
    where: { clientId, month, year },
    select: { brandId: true, targetId: true, targetRole: true },
  })

  return new Set(rows.map((r) => targetKey(r.brandId, r.targetId, r.targetRole)))
}

/**
 * Every brand's board for the open month, in one pair of queries.
 *
 * The portal renders one card per brand from this, and the form renders the
 * pending sections, so both read the same shape and neither can drift from
 * the other on what counts as done.
 */
export async function getClientBoards(
  clientId: string,
  brands: BrandRef[],
  month: number,
  year: number
): Promise<ClientBrandBoard[]> {
  if (!prisma || brands.length === 0) return []

  const [members, submitted] = await Promise.all([
    prisma.workgroupMember.findMany({
      where: { workgroupId: { in: brands.map((b) => b.workgroupId) } },
      include: { user: true },
    }),
    getSubmittedTargetKeys(clientId, month, year),
  ])

  return brands.map((brand) => {
    const targets = toTargets(
      brand,
      members.filter((m) => m.workgroupId === brand.workgroupId)
    )
    const pending = targets.filter((t) => !submitted.has(t.key))
    const doneCount = targets.length - pending.length

    return {
      brandId: brand.id,
      brandName: brand.brandName,
      workgroupId: brand.workgroupId,
      workgroupName: brand.workgroup.name,
      targets,
      pending,
      doneCount,
      completionPct: targets.length ? (doneCount / targets.length) * 100 : 0,
    }
  })
}

type MemberWithUser = {
  userId: string
  role: string
  user: {
    firstName: string
    lastName: string
    image: string | null
    isActive: boolean
  }
}

/**
 * The people a client is asked about for one brand: every member of that
 * brand's workgroup whose role has a client-facing KPI set. Someone holding
 * two evaluable roles is listed once per role, since the questions differ.
 */
function toTargets(
  brand: BrandRef,
  members: MemberWithUser[]
): ClientEvaluationTarget[] {
  return members
    .filter((m) => m.user.isActive)
    .filter((m) => isTeamRole(m.role) && isClientEvaluableRole(m.role))
    .map((m) => ({
      key: targetKey(brand.id, m.userId, m.role),
      brandId: brand.id,
      brandName: brand.brandName,
      userId: m.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      image: m.user.image,
      role: m.role as TeamRole,
    }))
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "fa"))
}
