"use client"

import { useState } from "react"
import { Award, Info } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { RankBadge } from "@/components/ui/rank"
import { RoleBadge } from "@/components/ui/role-badge"
import { ScoreBadge } from "@/components/ui/score"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { faNumber } from "@/lib/design-tokens"
import { getRoleLabel } from "@/lib/roles"
import type { PersonAggregate } from "@/lib/admin-analytics"

const MIN_EVALUATIONS = 1

/**
 * Highest averages across every role, not just two of them.
 *
 * Ranked on peer scores only — including someone's own self-evaluation would
 * let them rank themselves up, and the two numbers answer different questions.
 */
export function TopPerformers({ people }: { people: PersonAggregate[] }) {
  const [role, setRole] = useState("all")

  const ranked = people
    .filter((p) => p.peerCount >= MIN_EVALUATIONS)
    .filter((p) => role === "all" || p.role === role)
    .slice(0, 8)

  const roles = Array.from(new Set(people.map((p) => p.role)))

  const initialsOf = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="size-5 text-foreground-subtle" aria-hidden />
          برترین‌ها
        </CardTitle>
        <CardDescription>
          بالاترین میانگین امتیاز همکاران، در همه نقش‌ها
        </CardDescription>
        <CardAction>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger aria-label="فیلتر نقش" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه نقش‌ها</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {getRoleLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {ranked.length === 0 ? (
          <EmptyState
            icon={<Award />}
            title="هنوز رتبه‌بندی ممکن نیست"
            description="برای رتبه‌بندی، حداقل یک ارزیابی از سوی همکاران لازم است."
            size="sm"
          />
        ) : (
          <>
            <ul className="space-y-3">
              {ranked.map((person, index) => (
                <li
                  key={`${person.id}-${person.role}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-sunken p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <RankBadge rank={index + 1} />
                    <Avatar>
                      <AvatarFallback className="bg-muted text-foreground-secondary">
                        {initialsOf(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 truncate font-medium text-foreground">
                        {person.name}
                        <RoleBadge role={person.role} size="sm" showDot={false} />
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        {faNumber(person.peerCount)} ارزیابی همکاران
                        {person.selfAverage !== null && (
                          <> · خودارزیابی {faNumber(person.selfAverage, 1)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <ScoreBadge score={person.peerAverage} />
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-1.5 border-t border-border-subtle pt-3 text-xs leading-relaxed text-foreground-subtle">
              <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
              رتبه‌بندی فقط بر اساس ارزیابی همکاران است؛ خودارزیابی در میانگین
              رتبه محاسبه نمی‌شود.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
