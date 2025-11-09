import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        nude: {
          50: 'rgb(var(--nude-50) / <alpha-value>)',
          100: 'rgb(var(--nude-100) / <alpha-value>)',
          200: 'rgb(var(--nude-200) / <alpha-value>)',
          300: 'rgb(var(--nude-300) / <alpha-value>)',
          400: 'rgb(var(--nude-400) / <alpha-value>)',
          500: 'rgb(var(--nude-500) / <alpha-value>)',
          600: 'rgb(var(--nude-600) / <alpha-value>)',
          700: 'rgb(var(--nude-700) / <alpha-value>)',
          800: 'rgb(var(--nude-800) / <alpha-value>)',
          900: 'rgb(var(--nude-900) / <alpha-value>)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'nude-sm': '0 1px 2px rgba(61, 53, 48, 0.05)',
        'nude-md': '0 4px 6px -1px rgba(61, 53, 48, 0.07), 0 2px 4px -1px rgba(61, 53, 48, 0.05)',
        'nude-lg': '0 10px 15px -3px rgba(61, 53, 48, 0.1), 0 4px 6px -2px rgba(61, 53, 48, 0.05)',
        'nude-xl': '0 20px 25px -5px rgba(61, 53, 48, 0.15), 0 10px 10px -5px rgba(61, 53, 48, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
