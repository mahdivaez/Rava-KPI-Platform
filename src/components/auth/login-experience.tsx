"use client"

import { motion, type Variants } from "framer-motion"

import { LoginForm } from "@/components/auth/login-form"
import { BrandLockup } from "@/components/dashboard/brand"

/**
 * Login — elevated card with the brand image on one side and a
 * spring-staggered form on the other. Content and chrome come from the app's
 * design tokens; motion comes from framer-motion.
 */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
}

export function LoginExperience() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <motion.div
        className="grid h-[700px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:grid-cols-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Brand image — object-contain on the image's own background colour
            so the full illustration is always visible, never cropped. */}
        <div className="hidden bg-[#FFF8E6] lg:block">
          <img
            src="/login-image.jpeg"
            alt=""
            className="h-full w-full object-contain"
          />
        </div>

        {/* Login form */}
        <div className="flex h-full w-full flex-col items-center justify-center bg-card p-8 text-card-foreground md:p-12">
          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <BrandLockup />
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
              برای ورود به سامانه مدیریت عملکرد، اطلاعات حساب خود را وارد کنید.
            </motion.p>

            <motion.div variants={itemVariants}>
              <LoginForm />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-xs leading-relaxed text-foreground-subtle"
            >
              حساب کاربری توسط مدیر سیستم ساخته می‌شود. برای بازیابی رمز عبور
              با مدیر سامانه تماس بگیرید.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
