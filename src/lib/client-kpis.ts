/**
 * The client-facing KPI set.
 *
 * Separate from `src/lib/roles.ts` on purpose: a client judges the roles it
 * actually meets, on four questions written in the client's own language, and
 * answers a short set of open questions. The internal matrix, its six metrics
 * per role and its self-evaluation rules do not apply here.
 *
 * Roles absent from this map (currently VIDEOGRAPHER) are simply never shown
 * to a client, so the form stays honest about what a brand can judge.
 */

import { SCORE_MAX, SCORE_MIN, type TeamRole } from "@/lib/roles"

export { SCORE_MAX, SCORE_MIN }

export interface ClientMetric {
  key: string
  title: string
  question: string
}

export interface ClientQuestion {
  key: string
  question: string
}

export interface ClientRoleKpi {
  role: TeamRole
  metrics: ClientMetric[]
  questions: ClientQuestion[]
}

/** Shown above every role section; ticking it stores the row with no scores. */
export const SKIP_LABEL = "تعامل کافی نداشتم / امکان ارزیابی ندارم"
export const SKIP_HINT =
  "با انتخاب این گزینه، امتیازدهی برای این فرد ثبت نمی‌شود و روی میانگین او اثری ندارد."

export const CLIENT_ROLE_KPIS: Partial<Record<TeamRole, ClientRoleKpi>> = {
  STRATEGIST: {
    role: "STRATEGIST",
    metrics: [
      {
        key: "understanding",
        title: "شناخت",
        question:
          "چقدر هویت برند و دغدغه‌های شما بدرستی توسط استراتژیست درک و تحلیل شده است؟",
      },
      {
        key: "ideas",
        title: "ایده",
        question:
          "چقدر ایده‌ها و پیشنهادهای ایشان برای شما تازه، کاربردی و قابل اجرا هستند؟",
      },
      {
        key: "foresight",
        title: "پیش‌بینی",
        question:
          "چقدر پیشنهادات ایشان در ارزیابی فرصت‌ها، ترندها یا مشکلات احتمالی موفق و مؤثر بوده است؟",
      },
      {
        key: "communication",
        title: "ارتباط و پاسخگویی",
        question:
          "چقدر پاسخگویی، تعامل و ارتباط با ایشان راحت، حرفه‌ای و رضایت‌بخش بوده است؟",
      },
    ],
    questions: [
      {
        key: "bestAction",
        question:
          "بهترین اقدام یا پیشنهادی که استراتژیست در این ماه برای برند شما انجام داد چه بود؟",
      },
      { key: "improvements", question: "چه چیزی در عملکرد او می‌تواند بهتر شود؟" },
      {
        key: "valuableSuggestion",
        question:
          "آیا این ماه پیشنهادی از او داشتید که واقعاً برایتان ارزشمند بوده باشد؟ توضیح دهید.",
      },
    ],
  },

  STRATEGIST_ASSISTANT: {
    role: "STRATEGIST_ASSISTANT",
    metrics: [
      {
        key: "ideas",
        title: "ایده",
        question:
          "چقدر ایده‌ها و پیشنهادهای ایشان برای شما تازه، کاربردی و قابل اجرا هستند؟",
      },
      {
        key: "availability",
        title: "پاسخگویی",
        question: "چقدر در زمان نیاز، در دسترس و پاسخگو است؟",
      },
      {
        key: "projectFlow",
        title: "کمک به روند پروژه",
        question:
          "چقدر حضور او باعث می‌شود روند کار برای شما راحت‌تر و منظم‌تر پیش برود؟",
      },
      {
        key: "communication",
        title: "ارتباط و پاسخگویی",
        question:
          "چقدر پاسخگویی، تعامل و ارتباط با ایشان راحت، حرفه‌ای و رضایت‌بخش بوده است؟",
      },
    ],
    questions: [
      {
        key: "bestAction",
        question:
          "بهترین اقدام یا پیشنهادی که در این ماه برای برند شما انجام داد چه بود؟",
      },
      { key: "improvements", question: "چه چیزی در عملکرد او می‌تواند بهتر شود؟" },
    ],
  },

  WRITER: {
    role: "WRITER",
    metrics: [
      {
        key: "understanding",
        title: "شناخت",
        question: "چقدر متن‌ها و سناریوها با شخصیت و لحن برند شما هماهنگ هستند؟",
      },
      {
        key: "creativity",
        title: "خلاقیت",
        question: "چقدر در متن و سناریو، ایده‌ها و زاویه‌های تازه ارائه می‌دهد؟",
      },
      {
        key: "feedbackAdoption",
        title: "پذیرش و اعمال بازخورد",
        question:
          "چقدر بازخوردهای شما را درست متوجه می‌شود و در اصلاحات به‌خوبی اعمال می‌کند؟",
      },
      {
        key: "collaboration",
        title: "ارتباط و همکاری",
        question: "چقدر ارتباط و همکاری با او برای شما راحت، حرفه‌ای و سازنده است؟",
      },
    ],
    questions: [
      {
        key: "bestWork",
        question: "بهترین ایده یا سناریویی که این ماه از او دیدید چه بود؟",
      },
      { key: "improvements", question: "چه چیزی در کار او می‌تواند بهتر شود؟" },
      {
        key: "wishlist",
        question:
          "آیا موضوع یا سبکی هست که دوست داشته باشید بیشتر در نوشته‌های او ببینید؟",
      },
    ],
  },

  DESIGNER: {
    role: "DESIGNER",
    metrics: [
      {
        key: "understanding",
        title: "شناخت",
        question: "چقدر ایده و طراحی‌ها با شخصیت و هویت برند شما هماهنگ هستند؟",
      },
      {
        key: "feedbackAdoption",
        title: "اعمال بازخورد",
        question:
          "چقدر بازخوردهای شما را درست متوجه می‌شود و اصلاحات را دقیق انجام می‌دهد؟",
      },
      {
        key: "creativity",
        title: "خلاقیت",
        question: "چقدر تدابیر فنی او خلاقانه، بروز و راهگشا بوده است؟",
      },
      {
        key: "collaboration",
        title: "ارتباط و همکاری",
        question: "چقدر ارتباط و همکاری با او برای شما راحت، حرفه‌ای و سازنده است؟",
      },
    ],
    questions: [
      {
        key: "bestWork",
        question: "کدام طراحی او در این ماه بیشتر مورد توجه شما قرار گرفت؟ چرا؟",
      },
      { key: "improvements", question: "چه چیزی در کار او می‌تواند بهتر شود؟" },
      {
        key: "wishlist",
        question: "آیا سبک یا نوع خاصی از طراحی هست که دوست دارید بیشتر ببینید؟",
      },
    ],
  },

  EDITOR: {
    role: "EDITOR",
    metrics: [
      {
        key: "understanding",
        title: "شناخت",
        question: "چقدر تدوین‌ها با فضای برند و سبک محتوای شما هماهنگ هستند؟",
      },
      {
        key: "quality",
        title: "کیفیت",
        question: "چقدر ویدئوهای تدوین‌شده برای شما جذاب و خوش‌ریتم هستند؟",
      },
      {
        key: "creativity",
        title: "خلاقیت",
        question: "چقدر در تدوین، انگیزه خلق ایده‌های تازه و توجه به ترندها وجود دارد؟",
      },
      {
        key: "collaboration",
        title: "ارتباط و همکاری",
        question: "چقدر ارتباط و همکاری با او برای شما راحت، حرفه‌ای و سازنده است؟",
      },
    ],
    questions: [
      {
        key: "bestWork",
        question: "بهترین تدوینی که این ماه از او دیدید چه بود؟ چرا؟",
      },
      {
        key: "footageReview",
        question: "آیا به کفایت راش‌های ارسالی شما بررسی و به‌گزین می‌شود؟",
      },
      {
        key: "wishlist",
        question:
          "آیا نوع خاصی از تدوین یا ایده‌ای هست که دوست دارید بیشتر در کارهای آینده ببینید؟",
      },
    ],
  },

  SOCIAL_ADMIN: {
    role: "SOCIAL_ADMIN",
    metrics: [
      {
        key: "responseSpeed",
        title: "سرعت عمل",
        question: "چقدر کامنت‌ها و دایرکت‌ها را سریع و دقیق پاسخ می‌دهد؟",
      },
      {
        key: "audienceQuality",
        title: "کیفیت برخورد با مخاطب",
        question: "چقدر در پاسخگویی، لحن و شخصیت برند شما را درست منتقل می‌کند؟",
      },
      {
        key: "issueDetection",
        title: "تشخیص موقعیت‌های مهم",
        question:
          "چقدر موارد مهم، حساس یا غیرعادی در پیج را درست تشخیص می‌دهد و به تیم اطلاع می‌دهد؟",
      },
      {
        key: "communication",
        title: "ارتباط و برخورد",
        question: "چقدر ارتباط و برخورد او با شما حرفه‌ای، محترمانه و خوشایند است؟",
      },
    ],
    questions: [
      { key: "bestWork", question: "بهترین عملکرد او در این ماه چه بود؟" },
      {
        key: "improvements",
        question:
          "آیا موردی در مدیریت پیج یا پاسخگویی وجود داشت که می‌توانست بهتر انجام شود؟",
      },
      {
        key: "opportunity",
        question:
          "آیا موردی بوده که ادمین به‌موقع متوجه یک مسئله یا فرصت در پیج شده باشد؟",
      },
    ],
  },

  ONSITE_ADMIN: {
    role: "ONSITE_ADMIN",
    metrics: [
      {
        key: "readiness",
        title: "آمادگی و نظم",
        question: "چقدر در روزهای تولید آماده، منظم و مسئولیت‌پذیر است؟",
      },
      {
        key: "contentNeed",
        title: "درک نیاز محتوا",
        question:
          "چقدر برای تهیه محتوای خلاقانه و تمرکز در افزایش بهره‌وری تولیدات و تکنیک‌های انتشار، متمرکز است؟",
      },
      {
        key: "ownership",
        title: "پیگیری و مسئولیت‌پذیری",
        question:
          "چقدر کارهایی که در زمان تولید به او سپرده می‌شود را درست و کامل پیگیری می‌کند؟",
      },
      {
        key: "professionalism",
        title: "برخورد حرفه‌ای",
        question:
          "چقدر برخورد او با شما، مهمانان و تیم حرفه‌ای، محترمانه و خوشایند است؟",
      },
    ],
    questions: [
      {
        key: "bestWork",
        question: "بهترین ویژگی او در روزهای تولید این ماه چه بود؟",
      },
      { key: "improvements", question: "چه چیزی در عملکرد او می‌تواند بهتر شود؟" },
      {
        key: "impact",
        question:
          "آیا موردی بوده که حضور یا عملکرد او باعث شده باشد روز تولید بهتر و راحت‌تر پیش برود؟",
      },
    ],
  },
}

/** Roles a client is asked about, in the order the form presents them. */
export const CLIENT_EVALUABLE_ROLES = Object.keys(CLIENT_ROLE_KPIS) as TeamRole[]

export function isClientEvaluableRole(role: string): role is TeamRole {
  return role in CLIENT_ROLE_KPIS
}

export function getClientRoleKpi(role: TeamRole): ClientRoleKpi | undefined {
  return CLIENT_ROLE_KPIS[role]
}

export interface ClientScoreValidation {
  /** Persian error message; absent when every metric validated. */
  error?: string
  scores: Record<string, number>
}

/** Validate one member's submitted scores against their role's client metrics. */
export function validateClientScores(
  role: TeamRole,
  scores: Record<string, unknown>
): ClientScoreValidation {
  const kpi = getClientRoleKpi(role)
  if (!kpi) return { error: "این نقش برای ارزیابی مشتری تعریف نشده است", scores: {} }

  const clean: Record<string, number> = {}

  for (const metric of kpi.metrics) {
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

/** Keep only the answers this role actually asks for, dropping blanks. */
export function pickClientAnswers(
  role: TeamRole,
  answers: Record<string, unknown> | undefined
): Record<string, string> {
  const kpi = getClientRoleKpi(role)
  if (!kpi || !answers) return {}

  const clean: Record<string, string> = {}
  for (const question of kpi.questions) {
    const value = answers[question.key]
    if (typeof value === "string" && value.trim().length > 0) {
      clean[question.key] = value.trim()
    }
  }
  return clean
}

export function summarizeClientScores(scores: Record<string, number>) {
  const values = Object.values(scores)
  const totalScore = values.reduce((sum, value) => sum + value, 0)
  const averageScore = values.length
    ? Number((totalScore / values.length).toFixed(2))
    : 0
  return { totalScore, averageScore, maxTotalScore: values.length * SCORE_MAX }
}
