/**
 * Single source of truth for team roles, their KPI metrics and the
 * "who may evaluate whom" matrix.
 *
 * Every role has exactly 6 numeric KPIs (scored 1..10) and 4 open questions.
 * Adding a role = add it to the Prisma `WorkgroupRole` enum + one entry here.
 */

export const TEAM_ROLES = [
  "STRATEGIST",
  "STRATEGIST_ASSISTANT",
  "WRITER",
  "DESIGNER",
  "EDITOR",
  "VIDEOGRAPHER",
  "SOCIAL_ADMIN",
  "ONSITE_ADMIN",
] as const

export type TeamRole = (typeof TEAM_ROLES)[number]

/** Score range used by every KPI metric. */
export const SCORE_MIN = 1
export const SCORE_MAX = 10

/**
 * Whether a member may submit an evaluation for themselves.
 * The role matrix says each role comments on "نقش خودش" (their own role),
 * which we read as peers holding that role — not self-assessment.
 */
export const ALLOW_SELF_EVALUATION = false

export interface RoleMetric {
  key: string
  title: string
  description: string
  /** Extra guidance when a naive reading of the question would invert the scale. */
  hint?: string
}

export interface RoleQuestions {
  strengths: string
  improvements: string
  example: string
  suggestions: string
}

export interface RoleDefinition {
  role: TeamRole
  /** Persian display name. */
  label: string
  /** Plural Persian display name, used in list headings. */
  labelPlural: string
  /** URL-safe identifier. */
  slug: string
  /** Tailwind classes for the role badge. */
  badgeClass: string
  metrics: RoleMetric[]
  questions: RoleQuestions
}

const COMMON_QUESTION_IMPROVEMENTS =
  "اگر فقط یک چیز را در عملکردش بهتر کنیم، به نظرت چی باشد؟"
const COMMON_QUESTION_SUGGESTIONS =
  "برای اینکه ماه بعد عملکرد بهتری داشته باشد، چه پیشنهادی داری؟"

export const ROLE_DEFINITIONS: Record<TeamRole, RoleDefinition> = {
  STRATEGIST: {
    role: "STRATEGIST",
    label: "استراتژیست",
    labelPlural: "استراتژیست‌ها",
    slug: "strategist",
    badgeClass: "bg-info/10 text-info border border-info/30",
    metrics: [
      {
        key: "contentStrategy",
        title: "استراتژی محتوا",
        description: "استراتژی‌ای که برای پروژه می‌چیند چقدر درست و کاربردی است؟",
      },
      {
        key: "outcome",
        title: "نتیجه کار",
        description:
          "محتواهایی که زیر نظر او تولید می‌شوند چقدر به هدف و تارگت پروژه نزدیک می‌شوند؟",
      },
      {
        key: "briefing",
        title: "بریف و توضیحات",
        description: "چقدر ایده و منظورش را واضح به تیم منتقل می‌کند؟",
      },
      {
        key: "followUp",
        title: "پیگیری و اصلاح",
        description:
          "چقدر عملکرد محتوا را دنبال می‌کند و وقتی چیزی خوب پیش نمی‌رود، برای بهتر شدنش اقدام می‌کند؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر همکاری با او راحت، منظم و سازنده است؟",
      },
      {
        key: "creativity",
        title: "خلاقیت و ایده",
        description: "چقدر ایده‌های تازه و قابل اجرا برای بهتر شدن محتوا می‌دهد؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این استراتژیست در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کاری از او یادت هست که خیلی به بهتر شدن پروژه کمک کرده باشد؟ چی بوده؟",
      suggestions: "برای اینکه ماه بعد بهتر کار کند، چه پیشنهادی داری؟",
    },
  },

  STRATEGIST_ASSISTANT: {
    role: "STRATEGIST_ASSISTANT",
    label: "دستیار استراتژیست",
    labelPlural: "دستیاران استراتژیست",
    slug: "strategist-assistant",
    badgeClass: "bg-info/10 text-info border border-info/30",
    metrics: [
      {
        key: "followUp",
        title: "پیگیری کارها",
        description: "چقدر کارها را به‌موقع پیگیری می‌کند و چیزی از قلم نمی‌اندازد؟",
      },
      {
        key: "understanding",
        title: "درک استراتژی و نیاز پروژه",
        description: "چقدر منظور استراتژیست و نیاز پروژه را درست متوجه می‌شود؟",
      },
      {
        key: "teamwork",
        title: "ارتباط و همکاری",
        description: "چقدر ارتباط و همکاری با او راحت و سازنده است؟",
      },
      {
        key: "briefing",
        title: "انتقال شفاف به تیم",
        description: "چقدر ایده و منظورش را واضح به تیم منتقل می‌کند؟",
      },
      {
        key: "contentMonitoring",
        title: "رصد و اصلاح عملکرد محتوا",
        description:
          "چقدر عملکرد محتوا را دنبال می‌کند و وقتی چیزی خوب پیش نمی‌رود، برای بهتر شدنش اقدام می‌کند؟",
      },
      {
        key: "creativity",
        title: "خلاقیت و ایده",
        description: "چقدر ایده‌های تازه و قابل اجرا برای بهتر شدن محتوا می‌دهد؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این دستیار در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کاری از او یادت هست که باعث شد کار تیم راحت‌تر یا سریع‌تر پیش برود؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  WRITER: {
    role: "WRITER",
    label: "نویسنده",
    labelPlural: "نویسنده‌ها",
    slug: "writer",
    badgeClass: "bg-success/10 text-success border border-success/30",
    metrics: [
      {
        key: "contentQuality",
        title: "کیفیت محتوا",
        description: "چقدر متن‌هایی که می‌نویسد جذاب، روان و باکیفیت هستند؟",
      },
      {
        key: "briefUnderstanding",
        title: "درک بریف",
        description: "چقدر منظور، لحن و نیاز پروژه را درست متوجه می‌شود؟",
      },
      {
        key: "creativity",
        title: "خلاقیت در نوشتن",
        description: "چقدر ایده‌های تازه و جذاب برای محتوا و متن ارائه می‌دهد؟",
      },
      {
        key: "accuracy",
        title: "دقت و ویرایش",
        description: "چقدر متن‌هایش از نظر نگارشی، اطلاعاتی و جزئیات دقیق هستند؟",
      },
      {
        key: "punctuality",
        title: "تعهد به زمان‌بندی",
        description: "چقدر محتوا را به‌موقع و طبق زمان‌بندی تحویل می‌دهد؟",
      },
      {
        key: "meetingEngagement",
        title: "مشارکت و ارتباط در جلسات",
        description:
          "چقدر در جلسات تیمی و جلسه با مشتری مشارکت می‌کند، ایده می‌دهد و ارتباط مؤثری دارد؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این نویسنده در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کدام متن یا کاری که انجام داده بیشتر از بقیه به چشم تو آمد؟ چرا؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  DESIGNER: {
    role: "DESIGNER",
    label: "گرافیست",
    labelPlural: "گرافیست‌ها",
    slug: "designer",
    badgeClass: "bg-purple-100 text-purple-700 border border-purple-300",
    metrics: [
      {
        key: "briefUnderstanding",
        title: "درک بریف",
        description: "چقدر منظور، لحن و نیاز پروژه را درست متوجه می‌شود؟",
      },
      {
        key: "creativity",
        title: "خلاقیت و ایده‌پردازی",
        description: "چقدر ایده‌های تازه و خلاقانه برای اجرای بصری ارائه می‌دهد؟",
      },
      {
        key: "revisionRate",
        title: "میزان اصلاحات",
        description: "چقدر خروجی اولیه‌اش نیاز به اصلاح و رفت‌وبرگشت دارد؟",
        hint: "امتیاز بالاتر یعنی اصلاحات کمتر (۱۰ = تقریباً بدون رفت‌وبرگشت)",
      },
      {
        key: "punctuality",
        title: "تعهد به زمان‌بندی",
        description: "چقدر کارها را به‌موقع و طبق زمان‌بندی تحویل می‌دهد؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر ارتباط و همکاری با او راحت، منظم و سازنده است؟",
      },
      {
        key: "meetingEngagement",
        title: "مشارکت و ارتباط در جلسات",
        description:
          "چقدر در جلسات تیمی و جلسه با مشتری مشارکت می‌کند، ایده می‌دهد و ارتباط مؤثری دارد؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این گرافیست در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کدام طراحی یا کاری که انجام داده بیشتر از بقیه به چشم تو آمد؟ چرا؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  EDITOR: {
    role: "EDITOR",
    label: "تدوینگر",
    labelPlural: "تدوینگرها",
    slug: "editor",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-300",
    metrics: [
      {
        key: "briefUnderstanding",
        title: "درک بریف",
        description: "چقدر منظور، لحن و نیاز پروژه را درست متوجه می‌شود؟",
      },
      {
        key: "footageReview",
        title: "دقت در بررسی فایل‌های خام",
        description:
          "چقدر در بررسی راش‌ها و فایل‌های خام با دقت، حوصله و وسواس عمل می‌کند؟",
      },
      {
        key: "revisionRate",
        title: "میزان اصلاحات",
        description: "چقدر خروجی اولیه‌اش نیاز به اصلاح و رفت‌وبرگشت دارد؟",
        hint: "امتیاز بالاتر یعنی اصلاحات کمتر (۱۰ = تقریباً بدون رفت‌وبرگشت)",
      },
      {
        key: "punctuality",
        title: "تعهد به زمان‌بندی",
        description: "چقدر کارها را به‌موقع و طبق زمان‌بندی تحویل می‌دهد؟",
      },
      {
        key: "creativity",
        title: "خلاقیت در تدوین",
        description: "چقدر در تدوین ایده‌های تازه و جذاب برای بهتر شدن محتوا ارائه می‌دهد؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر ارتباط و همکاری با او راحت، منظم و سازنده است؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این تدوینگر در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کدام تدوین یا کاری که انجام داده بیشتر از بقیه به چشم تو آمد؟ چرا؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  VIDEOGRAPHER: {
    role: "VIDEOGRAPHER",
    label: "تصویربردار",
    labelPlural: "تصویربردارها",
    slug: "videographer",
    badgeClass: "bg-sky-100 text-sky-700 border border-sky-300",
    metrics: [
      {
        key: "briefUnderstanding",
        title: "درک بریف",
        description: "چقدر منظور، لحن و نیاز پروژه را درست متوجه می‌شود؟",
      },
      {
        key: "shootingQuality",
        title: "کیفیت فیلمبرداری",
        description:
          "چقدر از نظر کادر، نور، حرکت دوربین و کیفیت تصویر، خروجی خوبی ارائه می‌دهد؟",
      },
      {
        key: "executionMastery",
        title: "تسلط در اجرای پروژه",
        description:
          "چقدر هنگام فیلمبرداری، نیازهای محتوای نهایی و تدوین را در نظر می‌گیرد و شات‌های مناسب و کاربردی ثبت می‌کند؟",
      },
      {
        key: "punctuality",
        title: "تعهد به زمان‌بندی",
        description: "چقدر سر وقت در پروژه حاضر می‌شود و کارها را طبق زمان‌بندی پیش می‌برد؟",
      },
      {
        key: "creativity",
        title: "خلاقیت در فیلمبرداری",
        description:
          "چقدر برای بهتر شدن تصویر و متفاوت شدن خروجی، ایده‌های تازه و قابل اجرا ارائه می‌دهد؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر ارتباط و همکاری با او راحت، منظم و سازنده است؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این تصویربردار در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه کدام فیلمبرداری یا کاری که انجام داده بیشتر از بقیه به چشم تو آمد؟ چرا؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  SOCIAL_ADMIN: {
    role: "SOCIAL_ADMIN",
    label: "ادمین",
    labelPlural: "ادمین‌ها",
    slug: "social-admin",
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-300",
    metrics: [
      {
        key: "publishingAccuracy",
        title: "دقت در انتشار محتوا",
        description: "چقدر پست‌ها و استوری‌ها را دقیق و بدون اشتباه منتشر می‌کند؟",
      },
      {
        key: "pageManagement",
        title: "نظم در مدیریت پیج",
        description:
          "چقدر پیج را منظم و مداوم بررسی می‌کند و هیچ پیام، کامنت یا کاری را از قلم نمی‌اندازد؟",
      },
      {
        key: "responseSpeed",
        title: "سرعت پاسخگویی",
        description: "چقدر دایرکت‌ها و کامنت‌ها را به‌موقع پاسخ می‌دهد؟",
      },
      {
        key: "responseQuality",
        title: "کیفیت پاسخگویی",
        description: "چقدر پاسخ‌هایش درست، محترمانه و متناسب با لحن برند هستند؟",
      },
      {
        key: "issueDetection",
        title: "تشخیص موارد مهم",
        description:
          "چقدر پیام‌ها، کامنت‌ها و اتفاقات مهم پیج را درست تشخیص می‌دهد و موارد لازم را به تیم منتقل می‌کند؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر ارتباط و همکاری با او راحت، منظم و سازنده است؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این ادمین در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه موردی یادت هست که نحوه پاسخگویی یا مدیریت ادمین باعث شده باشد یک فرصت یا ارتباط خوب با مخاطب شکل بگیرد؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },

  ONSITE_ADMIN: {
    role: "ONSITE_ADMIN",
    label: "ادمین حضوری",
    labelPlural: "ادمین‌های حضوری",
    slug: "onsite-admin",
    badgeClass: "bg-teal-100 text-teal-700 border border-teal-300",
    metrics: [
      {
        key: "productionReadiness",
        title: "آمادگی برای تولید محتوا",
        description:
          "چقدر از قبل و هنگام تولید محتوا آماده است، ایده و طراحی از پیش تعیین‌شده دارد؟",
      },
      {
        key: "captureAccuracy",
        title: "دقت در ثبت محتوا",
        description:
          "چقدر در ثبت و جمع‌آوری عکس، ویدئو و محتوای موردنیاز دقت می‌کند و چیزی را از قلم نمی‌اندازد؟",
      },
      {
        key: "contentNeedUnderstanding",
        title: "درک نیاز محتوا",
        description:
          "چقدر می‌تواند با مشتری و مخاطب ارتباط برقرار کند و نیاز پروژه را برطرف نماید؟",
      },
      {
        key: "timeManagement",
        title: "مدیریت زمان در روز تولید",
        description:
          "چقدر می‌تواند زمان و کارهای روز تولید را منظم جلو ببرد و باعث اتلاف وقت تیم نشود؟",
      },
      {
        key: "problemSolving",
        title: "سرعت عمل و حل مسئله",
        description:
          "چقدر در شرایط پیش‌بینی‌نشده سریع تصمیم می‌گیرد و برای حل مشکل اقدام می‌کند؟",
      },
      {
        key: "teamwork",
        title: "همکاری با تیم",
        description: "چقدر ارتباط و همکاری با او در زمان تولید راحت، منظم و سازنده است؟",
      },
    ],
    questions: {
      strengths: "به نظرت بهترین ویژگی این ادمین حضوری در این ماه چی بوده؟",
      improvements: COMMON_QUESTION_IMPROVEMENTS,
      example:
        "این ماه موردی یادت هست که عملکرد ادمین حضوری باعث شد روند تولید محتوا بهتر یا سریع‌تر پیش برود؟",
      suggestions: COMMON_QUESTION_SUGGESTIONS,
    },
  },
}

/**
 * Which roles each role is allowed to evaluate.
 * Mirrors the agreed matrix: the first four roles rate everyone, the
 * production/support roles rate only the roles they actually work with.
 */
export const EVALUATION_MATRIX: Record<TeamRole, TeamRole[]> = {
  STRATEGIST: [...TEAM_ROLES],
  STRATEGIST_ASSISTANT: [...TEAM_ROLES],
  WRITER: [...TEAM_ROLES],
  DESIGNER: [...TEAM_ROLES],
  EDITOR: [
    "STRATEGIST",
    "STRATEGIST_ASSISTANT",
    "EDITOR",
    "DESIGNER",
    "VIDEOGRAPHER",
  ],
  VIDEOGRAPHER: [
    "STRATEGIST",
    "STRATEGIST_ASSISTANT",
    "VIDEOGRAPHER",
    "DESIGNER",
    "EDITOR",
  ],
  SOCIAL_ADMIN: [
    "STRATEGIST",
    "STRATEGIST_ASSISTANT",
    "WRITER",
    "DESIGNER",
    "SOCIAL_ADMIN",
  ],
  ONSITE_ADMIN: [
    "STRATEGIST",
    "STRATEGIST_ASSISTANT",
    "WRITER",
    "VIDEOGRAPHER",
    "EDITOR",
    "DESIGNER",
    "ONSITE_ADMIN",
  ],
}

export function isTeamRole(value: unknown): value is TeamRole {
  return typeof value === "string" && (TEAM_ROLES as readonly string[]).includes(value)
}

export function getRoleDefinition(role: TeamRole): RoleDefinition {
  return ROLE_DEFINITIONS[role]
}

export function getRoleLabel(role: string): string {
  return isTeamRole(role) ? ROLE_DEFINITIONS[role].label : role
}

export function getRoleBadgeClass(role: string): string {
  return isTeamRole(role)
    ? ROLE_DEFINITIONS[role].badgeClass
    : "bg-nude-100 text-nude-700 border border-nude-300"
}

export function getRoleMetrics(role: TeamRole): RoleMetric[] {
  return ROLE_DEFINITIONS[role].metrics
}

/** Roles that `evaluatorRole` is permitted to evaluate. */
export function getEvaluableRoles(evaluatorRole: TeamRole): TeamRole[] {
  return EVALUATION_MATRIX[evaluatorRole] ?? []
}

/** True when a member holding `evaluatorRole` may evaluate `targetRole`. */
export function canEvaluate(evaluatorRole: TeamRole, targetRole: TeamRole): boolean {
  return getEvaluableRoles(evaluatorRole).includes(targetRole)
}

/** Union of the roles evaluable by any of the evaluator's roles. */
export function getEvaluableRolesForRoles(evaluatorRoles: TeamRole[]): TeamRole[] {
  const allowed = new Set<TeamRole>()
  for (const role of evaluatorRoles) {
    for (const target of getEvaluableRoles(role)) {
      allowed.add(target)
    }
  }
  return TEAM_ROLES.filter((role) => allowed.has(role))
}

export interface ScoreValidationResult {
  /** Persian error message; absent when every metric validated. */
  error?: string
  /** Normalized scores, only meaningful when `error` is absent. */
  scores: Record<string, number>
}

/** Validate a submitted score map against a role's metrics. */
export function validateScores(
  role: TeamRole,
  scores: Record<string, unknown>
): ScoreValidationResult {
  const metrics = getRoleMetrics(role)
  const clean: Record<string, number> = {}

  for (const metric of metrics) {
    const raw = scores?.[metric.key]
    const value = typeof raw === "string" ? Number(raw) : raw

    if (typeof value !== "number" || !Number.isInteger(value)) {
      return { error: `امتیاز «${metric.title}» وارد نشده است`, scores: {} }
    }
    if (value < SCORE_MIN || value > SCORE_MAX) {
      return {
        error: `امتیاز «${metric.title}» باید بین ${SCORE_MIN} تا ${SCORE_MAX} باشد`,
        scores: {},
      }
    }
    clean[metric.key] = value
  }

  return { scores: clean }
}

export function summarizeScores(scores: Record<string, number>) {
  const values = Object.values(scores)
  const totalScore = values.reduce((sum, value) => sum + value, 0)
  const averageScore = values.length
    ? Number((totalScore / values.length).toFixed(2))
    : 0
  return { totalScore, averageScore, maxTotalScore: values.length * SCORE_MAX }
}
