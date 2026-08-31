/**
 * The admin reporting layer.
 *
 * Every analytics screen reads from here rather than querying evaluation
 * tables directly. The old admin pages each hard-coded the column names of
 * `StrategistEvaluation` and `WriterEvaluation`, which is why a workgroup
 * could hold eight roles and the reports would still only ever mention
 * استراتژیست and نویسنده.
 *
 * `RoleEvaluation` stores its metrics as a Json map keyed by the definitions in
 * `src/lib/roles.ts`, so flattening it once here means a new role or a new KPI
 * shows up across every chart with no further work.
 *
 * Internal (peer) and client scores are deliberately kept apart: they answer
 * different questions and are not averaged together.
 */

import moment from "moment-jalaali"

import { prisma } from "@/lib/prisma"
import {
  SCORE_MAX,
  TEAM_ROLES,
  getEvaluableRolesForRoles,
  getRoleDefinition,
  getRoleLabel,
  isTeamRole,
  type TeamRole,
} from "@/lib/roles"
import { getClientRoleKpi, isClientEvaluableRole } from "@/lib/client-kpis"

export interface MetricScore {
  key: string
  title: string
  score: number
}

/** One peer/self evaluation, flattened out of `RoleEvaluation`. */
export interface EvalRecord {
  id: string
  targetId: string
  targetName: string
  targetRole: TeamRole
  evaluatorId: string
  evaluatorName: string
  evaluatorRole: TeamRole | null
  workgroupId: string
  workgroupName: string
  month: number
  year: number
  /** Out of SCORE_MAX. */
  average: number
  total: number
  maxTotal: number
  metrics: MetricScore[]
  metricNotes: Record<string, string>
  strengths: string | null
  improvements: string | null
  example: string | null
  suggestions: string | null
  imageUrl: string | null
  createdAt: Date
  /** True when someone evaluated themselves. */
  isSelf: boolean
}

/** One client verdict, flattened out of `ClientEvaluation`. */
export interface ClientEvalRecord {
  id: string
  targetId: string
  targetName: string
  targetRole: TeamRole
  clientId: string
  clientName: string
  brandName: string
  workgroupId: string
  workgroupName: string
  month: number
  year: number
  /** True for «تعامل کافی نداشتم» — carries no scores and no average. */
  skipped: boolean
  average: number
  total: number
  maxTotal: number
  metrics: MetricScore[]
  answers: Array<{ key: string; question: string; answer: string }>
  createdAt: Date
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function numberOf(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value
  return typeof n === "number" && Number.isFinite(n) ? n : 0
}

/* ==========================================================================
   Loading
   ========================================================================== */

/**
 * Every role evaluation ever filed, newest first.
 *
 * Metrics are resolved against the role definition so a metric that was
 * removed from `roles.ts` after the fact simply drops out of the charts rather
 * than rendering as a raw key.
 */
export async function getRoleEvaluationRecords(): Promise<EvalRecord[]> {
  if (!prisma) return []

  const rows = await prisma.roleEvaluation.findMany({
    include: { target: true, evaluator: true, workgroup: true },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
  })

  return rows.filter((row) => isTeamRole(row.targetRole)).map((row) => {
    const targetRole = row.targetRole as TeamRole
    const scores = asRecord(row.scores)
    const notes = asRecord(row.metricNotes)

    const definition = getRoleDefinition(targetRole)

    const metrics: MetricScore[] = definition.metrics
      .filter((metric) => metric.key in scores)
      .map((metric) => ({
        key: metric.key,
        title: metric.title,
        score: numberOf(scores[metric.key]),
      }))

    // Anything stored under a key the role no longer defines — a renamed KPI,
    // or a row written before a definition changed. Shown under its raw key
    // rather than dropped, so a chart never reads as "no data" while the
    // database holds scores.
    const known = new Set(definition.metrics.map((m) => m.key))
    for (const [key, value] of Object.entries(scores)) {
      if (!known.has(key)) {
        metrics.push({ key, title: key, score: numberOf(value) })
      }
    }

    const metricNotes: Record<string, string> = {}
    for (const [key, value] of Object.entries(notes)) {
      if (typeof value === "string" && value.trim()) metricNotes[key] = value
    }

    return {
      id: row.id,
      targetId: row.targetId,
      targetName: `${row.target.firstName} ${row.target.lastName}`,
      targetRole,
      evaluatorId: row.evaluatorId,
      evaluatorName: `${row.evaluator.firstName} ${row.evaluator.lastName}`,
      evaluatorRole: isTeamRole(row.evaluatorRole)
        ? (row.evaluatorRole as TeamRole)
        : null,
      workgroupId: row.workgroupId,
      workgroupName: row.workgroup.name,
      month: row.month,
      year: row.year,
      average: row.averageScore,
      total: row.totalScore,
      maxTotal: metrics.length * SCORE_MAX,
      metrics,
      metricNotes,
      strengths: row.strengths,
      improvements: row.improvements,
      example: row.example,
      suggestions: row.suggestions,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
      isSelf: row.evaluatorId === row.targetId,
    }
  })
}

export async function getClientEvaluationRecords(): Promise<ClientEvalRecord[]> {
  if (!prisma) return []

  const rows = await prisma.clientEvaluation.findMany({
    include: { target: true, client: true, workgroup: true },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
  })

  return rows
    .filter((row) => isTeamRole(row.targetRole) && isClientEvaluableRole(row.targetRole))
    .map((row) => {
      const targetRole = row.targetRole as TeamRole
      const kpi = getClientRoleKpi(targetRole)
      const scores = asRecord(row.scores)
      const answers = asRecord(row.answers)

      const metrics: MetricScore[] = (kpi?.metrics ?? [])
        .filter((metric) => metric.key in scores)
        .map((metric) => ({
          key: metric.key,
          title: metric.title,
          score: numberOf(scores[metric.key]),
        }))

      return {
        id: row.id,
        targetId: row.targetId,
        targetName: `${row.target.firstName} ${row.target.lastName}`,
        targetRole,
        clientId: row.clientId,
        clientName: row.client.contactName,
        brandName: row.client.brandName,
        workgroupId: row.workgroupId,
        workgroupName: row.workgroup.name,
        month: row.month,
        year: row.year,
        skipped: row.skipped,
        average: row.averageScore,
        total: row.totalScore,
        maxTotal: metrics.length * SCORE_MAX,
        metrics,
        answers: (kpi?.questions ?? [])
          .filter((q) => typeof answers[q.key] === "string" && answers[q.key])
          .map((q) => ({
            key: q.key,
            question: q.question,
            answer: String(answers[q.key]),
          })),
        createdAt: row.createdAt,
      }
    })
}

/* ==========================================================================
   Coverage
   ========================================================================== */

export interface CoverageStats {
  month: number
  year: number
  /** How many evaluations the matrix expects this month across all workgroups. */
  expected: number
  /** How many of those were actually filed. */
  filed: number
  completionRate: number
}

/**
 * Expected evaluations for the current Persian month.
 *
 * Derived from the same permission matrix the forms enforce: for every
 * workgroup member, the people their roles allow them to evaluate there. This
 * replaces the old completion rate, which divided the legacy tables by each
 * other and produced NaN once those tables were empty.
 */
export async function getCoverageStats(): Promise<CoverageStats> {
  const now = moment()
  const month = now.jMonth() + 1
  const year = now.jYear()

  if (!prisma) return { month, year, expected: 0, filed: 0, completionRate: 0 }

  const [workgroups, filed] = await Promise.all([
    prisma.workgroup.findMany({
      where: { isActive: true },
      include: { members: { include: { user: true } } },
    }),
    prisma.roleEvaluation.count({ where: { month, year } }),
  ])

  let expected = 0

  for (const workgroup of workgroups) {
    const members = workgroup.members.filter(
      (m) => isTeamRole(m.role) && m.user.isActive
    )

    // One person may hold several roles here; their reach is the union.
    const byUser = new Map<string, TeamRole[]>()
    for (const member of members) {
      const roles = byUser.get(member.userId) ?? []
      roles.push(member.role as TeamRole)
      byUser.set(member.userId, roles)
    }

    for (const roles of byUser.values()) {
      const evaluable = getEvaluableRolesForRoles(roles)
      // Each (person, role) pair in reach is one expected evaluation.
      expected += members.filter((m) =>
        evaluable.includes(m.role as TeamRole)
      ).length
    }
  }

  return {
    month,
    year,
    expected,
    filed,
    completionRate: expected > 0 ? (filed / expected) * 100 : 0,
  }
}

/* ==========================================================================
   Aggregation
   ========================================================================== */

export interface PersonAggregate {
  id: string
  name: string
  role: TeamRole
  roleLabel: string
  count: number
  average: number
  /** Peer scores only — self-evaluations are excluded so they cannot inflate a rank. */
  peerCount: number
  peerAverage: number
  selfAverage: number | null
  workgroupNames: string[]
}

/** Average per person-and-role. Someone holding two roles ranks in each. */
export function aggregateByPerson(records: EvalRecord[]): PersonAggregate[] {
  const map = new Map<
    string,
    {
      id: string
      name: string
      role: TeamRole
      total: number
      count: number
      peerTotal: number
      peerCount: number
      selfTotal: number
      selfCount: number
      workgroups: Set<string>
    }
  >()

  for (const record of records) {
    const key = `${record.targetId}:${record.targetRole}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        id: record.targetId,
        name: record.targetName,
        role: record.targetRole,
        total: 0,
        count: 0,
        peerTotal: 0,
        peerCount: 0,
        selfTotal: 0,
        selfCount: 0,
        workgroups: new Set(),
      }
      map.set(key, entry)
    }

    entry.total += record.average
    entry.count += 1
    entry.workgroups.add(record.workgroupName)

    if (record.isSelf) {
      entry.selfTotal += record.average
      entry.selfCount += 1
    } else {
      entry.peerTotal += record.average
      entry.peerCount += 1
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      role: entry.role,
      roleLabel: getRoleLabel(entry.role),
      count: entry.count,
      average: entry.count ? entry.total / entry.count : 0,
      peerCount: entry.peerCount,
      peerAverage: entry.peerCount ? entry.peerTotal / entry.peerCount : 0,
      selfAverage: entry.selfCount ? entry.selfTotal / entry.selfCount : null,
      workgroupNames: Array.from(entry.workgroups),
    }))
    .sort((a, b) => b.peerAverage - a.peerAverage || b.average - a.average)
}

export interface RoleAggregate {
  role: TeamRole
  label: string
  count: number
  peopleCount: number
  average: number
  /** Average per metric, in the order the role defines them. */
  metrics: Array<{ key: string; title: string; average: number }>
}

/** One entry per team role — including roles with no evaluations yet. */
export function aggregateByRole(records: EvalRecord[]): RoleAggregate[] {
  return TEAM_ROLES.map((role) => {
    const forRole = records.filter((r) => r.targetRole === role)
    const definition = getRoleDefinition(role)

    // The definition's own metrics, plus any key the records carry that the
    // definition no longer lists, so nothing stored goes unreported.
    const known = definition.metrics.map((m) => ({ key: m.key, title: m.title }))
    const knownKeys = new Set(known.map((m) => m.key))
    const extra: Array<{ key: string; title: string }> = []

    for (const record of forRole) {
      for (const metric of record.metrics) {
        if (!knownKeys.has(metric.key) && !extra.some((e) => e.key === metric.key)) {
          extra.push({ key: metric.key, title: metric.title })
        }
      }
    }

    const metrics = [...known, ...extra].map((metric) => {
      const values = forRole
        .map((r) => r.metrics.find((m) => m.key === metric.key)?.score)
        .filter((v): v is number => typeof v === "number")

      return {
        key: metric.key,
        title: metric.title,
        average: values.length
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : 0,
      }
    })
    // Drop definition metrics nothing was ever scored against, but only when
    // the role has data at all — an empty role keeps its full metric list.
    .filter((metric) => forRole.length === 0 || metric.average > 0)

    return {
      role,
      label: definition.label,
      count: forRole.length,
      peopleCount: new Set(forRole.map((r) => r.targetId)).size,
      average: forRole.length
        ? forRole.reduce((sum, r) => sum + r.average, 0) / forRole.length
        : 0,
      metrics,
    }
  })
}

export interface PeriodAggregate {
  key: string
  month: number
  year: number
  label: string
  count: number
  average: number
  /** Average per role in this period; roles absent that month are omitted. */
  byRole: Partial<Record<TeamRole, number>>
}

export const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

/** Chronological, oldest first — charts read left-to-right in time. */
export function aggregateByPeriod(records: EvalRecord[]): PeriodAggregate[] {
  const map = new Map<string, EvalRecord[]>()

  for (const record of records) {
    const key = `${record.year}-${String(record.month).padStart(2, "0")}`
    const list = map.get(key) ?? []
    list.push(record)
    map.set(key, list)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const byRole: Partial<Record<TeamRole, number>> = {}
      for (const role of TEAM_ROLES) {
        const forRole = list.filter((r) => r.targetRole === role)
        if (forRole.length) {
          byRole[role] =
            forRole.reduce((sum, r) => sum + r.average, 0) / forRole.length
        }
      }

      const [year, month] = key.split("-").map(Number)

      return {
        key,
        month,
        year,
        label: `${PERSIAN_MONTHS[month - 1]} ${year.toLocaleString("fa-IR", {
          useGrouping: false,
        })}`,
        count: list.length,
        average: list.length
          ? list.reduce((sum, r) => sum + r.average, 0) / list.length
          : 0,
        byRole,
      }
    })
}

export interface WorkgroupAggregate {
  id: string
  name: string
  memberCount: number
  count: number
  average: number
  clientCount: number
  clientAverage: number
  roleBreakdown: Array<{ role: TeamRole; label: string; count: number; average: number }>
}

export function aggregateByWorkgroup(
  records: EvalRecord[],
  clientRecords: ClientEvalRecord[],
  workgroups: Array<{ id: string; name: string; memberCount: number }>
): WorkgroupAggregate[] {
  return workgroups
    .map((workgroup) => {
      const forGroup = records.filter((r) => r.workgroupId === workgroup.id)
      // Skipped client rows carry no score and must not drag an average down.
      const clientForGroup = clientRecords.filter(
        (r) => r.workgroupId === workgroup.id && !r.skipped
      )

      const roles = Array.from(new Set(forGroup.map((r) => r.targetRole)))

      return {
        id: workgroup.id,
        name: workgroup.name,
        memberCount: workgroup.memberCount,
        count: forGroup.length,
        average: forGroup.length
          ? forGroup.reduce((sum, r) => sum + r.average, 0) / forGroup.length
          : 0,
        clientCount: clientForGroup.length,
        clientAverage: clientForGroup.length
          ? clientForGroup.reduce((sum, r) => sum + r.average, 0) /
            clientForGroup.length
          : 0,
        roleBreakdown: roles.map((role) => {
          const forRole = forGroup.filter((r) => r.targetRole === role)
          return {
            role,
            label: getRoleLabel(role),
            count: forRole.length,
            average:
              forRole.reduce((sum, r) => sum + r.average, 0) / forRole.length,
          }
        }),
      }
    })
    .sort((a, b) => b.average - a.average)
}

/** Client averages per person-and-role, kept separate from peer scores. */
export function aggregateClientByPerson(records: ClientEvalRecord[]) {
  const map = new Map<
    string,
    { id: string; name: string; role: TeamRole; total: number; count: number; skipped: number }
  >()

  for (const record of records) {
    const key = `${record.targetId}:${record.targetRole}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        id: record.targetId,
        name: record.targetName,
        role: record.targetRole,
        total: 0,
        count: 0,
        skipped: 0,
      }
      map.set(key, entry)
    }

    if (record.skipped) {
      entry.skipped += 1
    } else {
      entry.total += record.average
      entry.count += 1
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      role: entry.role,
      roleLabel: getRoleLabel(entry.role),
      count: entry.count,
      skippedCount: entry.skipped,
      average: entry.count ? entry.total / entry.count : 0,
    }))
    .sort((a, b) => b.average - a.average)
}

export function overallAverage(records: EvalRecord[]): number {
  if (!records.length) return 0
  return records.reduce((sum, r) => sum + r.average, 0) / records.length
}
