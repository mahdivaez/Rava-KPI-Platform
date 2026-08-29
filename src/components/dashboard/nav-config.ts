import {
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  PieChart,
  TrendingUp,
  UserCog,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Short line shown in the mobile drawer, where there is room for it. */
  hint?: string
}

export interface NavSection {
  /** Omitted for the first, unlabelled group. */
  title?: string
  items: NavItem[]
}

export interface NavAudience {
  isAdmin: boolean
  isTechnicalDeputy: boolean
  isTeamMember: boolean
}

/**
 * The navigation tree, derived from the same conditions the pages themselves
 * enforce. Nothing here grants access — the routes still guard themselves.
 */
export function buildNavigation({
  isAdmin,
  isTechnicalDeputy,
  isTeamMember,
}: NavAudience): NavSection[] {
  const sections: NavSection[] = [
    {
      items: [
        {
          href: "/dashboard",
          label: "داشبورد",
          icon: LayoutDashboard,
          hint: "نمای کلی وضعیت شما",
        },
      ],
    },
  ]

  const workspace: NavItem[] = []

  if (isTeamMember || isAdmin) {
    workspace.push({
      href: "/evaluations/team",
      label: "ارزیابی همکاران",
      icon: ClipboardCheck,
      hint: "ارزیابی ماهانه بر اساس نقش",
    })
  }

  if (isTechnicalDeputy) {
    workspace.push({
      href: "/evaluations/strategist",
      label: "ارزیابی استراتژیست‌ها",
      icon: TrendingUp,
      hint: "ارزیابی‌های معاون فنی",
    })
  }

  workspace.push(
    {
      href: "/messages",
      label: "پیام‌ها",
      icon: MessageSquareText,
      hint: "گفتگو با همکاران",
    },
    {
      href: "/profile",
      label: "پروفایل من",
      icon: UserRound,
      hint: "اطلاعات و امنیت حساب",
    }
  )

  sections.push({ title: "فضای کاری", items: workspace })

  if (isAdmin) {
    sections.push({
      title: "مدیریت",
      items: [
        {
          href: "/admin/dashboard",
          label: "داشبورد تحلیلی",
          icon: PieChart,
          hint: "آمار و نمودارهای عملکرد",
        },
        {
          href: "/admin/reports",
          label: "گزارش‌ها",
          icon: BarChart3,
          hint: "ارزیابی‌ها با جزئیات کامل",
        },
        {
          href: "/admin/users",
          label: "کاربران",
          icon: Users,
          hint: "افزودن و ویرایش کاربران",
        },
        {
          href: "/admin/workgroups",
          label: "کارگروه‌ها",
          icon: FolderKanban,
          hint: "کارگروه‌ها و اعضای آن‌ها",
        },
        {
          href: "/admin/roles",
          label: "نقش‌ها و دسترسی‌ها",
          icon: UserCog,
          hint: "ماتریس ارزیابی و سطوح دسترسی",
        },
      ],
    })
  }

  return sections
}

/**
 * True when `pathname` is inside `href`.
 * Compares whole segments so `/admin/users` never lights up `/admin/user`.
 */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}
