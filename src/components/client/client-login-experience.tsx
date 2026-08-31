"use client"

import { motion, type Variants } from "framer-motion"
import { MessageSquareQuote, ShieldCheck, Sparkles } from "lucide-react"

import { ClientLoginForm } from "@/components/client/client-login-form"

/**
 * Client sign-in — the same card geometry as the team login, but the brand
 * panel explains what a client is being asked for rather than showing the
 * internal product illustration. Nobody arriving here should have to guess
 * whether they are in the right place.
 */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
}

const POINTS = [
  {
    icon: Sparkles,
    title: "ارزیابی ماهانه تیم",
    body: "به هر عضو تیمی که روی برند شما کار می‌کند امتیاز بدهید.",
  },
  {
    icon: MessageSquareQuote,
    title: "نظر تشریحی",
    body: "هرجا لازم بود، توضیح بدهید تا بازخورد دقیق‌تر به تیم برسد.",
  },
  {
    icon: ShieldCheck,
    title: "فقط برای مدیریت راوا",
    body: "پاسخ‌های شما در اختیار مدیریت است و برای بهبود عملکرد تیم استفاده می‌شود.",
  },
]

export function ClientLoginExperience() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <motion.div
        className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:min-h-[620px] lg:grid-cols-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* What this portal is for. */}
        <div className="hidden flex-col justify-center gap-8 bg-surface-sunken p-12 lg:flex">
          <div>
            <span className="block font-display text-3xl font-black leading-tight tracking-tight text-foreground">
              Rava
            </span>
            <span className="mt-1.5 block text-sm text-foreground-muted">
              بخش ارزیابی مشتریان
            </span>
          </div>

          <ul className="space-y-6">
            {POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-foreground-secondary"
                >
                  <point.icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {point.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-foreground-muted">
                    {point.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign-in */}
        <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-card-foreground md:p-12">
          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-10 text-center lg:hidden">
              <span className="block font-display text-4xl font-black leading-tight tracking-tight text-foreground">
                Rava
              </span>
              <span className="mt-1.5 block text-sm text-foreground-muted">
                بخش ارزیابی مشتریان
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground"
            >
              خوش آمدید
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mb-8 text-sm text-foreground-muted"
            >
              با حسابی که تیم راوا برای شما ساخته است وارد شوید.
            </motion.p>

            <motion.div variants={itemVariants}>
              <ClientLoginForm />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-xs leading-relaxed text-foreground-subtle"
            >
              اگر حساب ندارید یا رمز عبورتان را فراموش کرده‌اید، با تیم راوا
              تماس بگیرید.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
