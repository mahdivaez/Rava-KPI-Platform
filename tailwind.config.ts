import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

/**
 * Rava Design System — Tailwind binding layer.
 *
 * Every colour resolves to a CSS custom property declared in globals.css, so
 * the light/dark themes swap in one place and `bg-primary/10` still works.
 * Type sizes match Tailwind's defaults on purpose; only leading and tracking
 * are re-tuned, because Persian needs more leading than Latin at every size.
 */

/** rgb(var(--token) / <alpha-value>) — keeps the /opacity modifier working. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.5" }],
        xs: ["0.75rem", { lineHeight: "1.6" }],
        sm: ["0.875rem", { lineHeight: "1.7" }],
        base: ["1rem", { lineHeight: "1.75" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },

      colors: {
        /* --- Planes --- */
        background: token("background"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
          sunken: token("surface-sunken"),
          hover: token("surface-hover"),
        },

        /* --- Ink --- */
        foreground: {
          DEFAULT: token("foreground"),
          secondary: token("foreground-secondary"),
          muted: token("foreground-muted"),
          subtle: token("foreground-subtle"),
        },

        /* --- Rules --- */
        border: {
          DEFAULT: token("border"),
          strong: token("border-strong"),
          subtle: token("border-subtle"),
        },
        input: token("input"),
        ring: token("ring"),

        /* --- Brand --- */
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          foreground: token("primary-foreground"),
          subtle: token("primary-subtle"),
          "subtle-foreground": token("primary-subtle-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },

        /* --- Status --- */
        success: {
          DEFAULT: token("success"),
          foreground: token("success-foreground"),
          subtle: token("success-subtle"),
        },
        warning: {
          DEFAULT: token("warning"),
          foreground: token("warning-foreground"),
          subtle: token("warning-subtle"),
        },
        danger: {
          DEFAULT: token("danger"),
          foreground: token("danger-foreground"),
          subtle: token("danger-subtle"),
        },
        info: {
          DEFAULT: token("info"),
          foreground: token("info-foreground"),
          subtle: token("info-subtle"),
        },

        /* --- shadcn aliases --- */
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },

        /* --- Shell --- */
        sidebar: {
          DEFAULT: token("sidebar"),
          foreground: token("sidebar-foreground"),
          active: token("sidebar-active"),
          "active-foreground": token("sidebar-active-foreground"),
          border: token("sidebar-border"),
        },
        navbar: token("navbar"),
        overlay: token("overlay"),

        /* --- Data visualisation: fixed slot order, never cycled --- */
        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
          4: token("chart-4"),
          5: token("chart-5"),
          6: token("chart-6"),
          7: token("chart-7"),
          8: token("chart-8"),
          grid: token("chart-grid"),
          axis: token("chart-axis"),
          label: token("chart-label"),
        },

        /* --- Team-role identity: same slot order as the chart palette --- */
        role: {
          1: token("role-1"),
          2: token("role-2"),
          3: token("role-3"),
          4: token("role-4"),
          5: token("role-5"),
          6: token("role-6"),
          7: token("role-7"),
          8: token("role-8"),
          "1-ink": token("role-1-ink"),
          "2-ink": token("role-2-ink"),
          "3-ink": token("role-3-ink"),
          "4-ink": token("role-4-ink"),
          "5-ink": token("role-5-ink"),
          "6-ink": token("role-6-ink"),
          "7-ink": token("role-7-ink"),
          "8-ink": token("role-8-ink"),
        },

        /* --- KPI score bands --- */
        score: {
          critical: token("score-critical"),
          weak: token("score-weak"),
          fair: token("score-fair"),
          strong: token("score-strong"),
        },

        /* --- Primitive ramp, exposed for the rare direct reference --- */
        sand: {
          25: token("sand-25"),
          50: token("sand-50"),
          100: token("sand-100"),
          200: token("sand-200"),
          300: token("sand-300"),
          400: token("sand-400"),
          500: token("sand-500"),
          600: token("sand-600"),
          700: token("sand-700"),
          800: token("sand-800"),
          900: token("sand-900"),
          950: token("sand-950"),
        },

      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        none: "none",
      },

      /* 4pt rhythm, dashboard density. */
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
      },

      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },

      /* Layered z-index scale — no ad-hoc values anywhere else. */
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "20",
        drawer: "40",
        overlay: "50",
        modal: "60",
        popover: "70",
        toast: "80",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 200ms var(--ease-out)",
        "accordion-up": "accordion-up 200ms var(--ease-out)",
      },
    },
  },
  plugins: [animate],
}

export default config
