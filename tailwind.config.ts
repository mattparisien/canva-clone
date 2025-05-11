import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Brand colors
        brand: {
          blue: {
            DEFAULT: "var(--color-brand-blue)",
            light: "var(--color-brand-blue-light)",
            dark: "var(--color-brand-blue-dark)",
          },
          teal: {
            DEFAULT: "var(--color-brand-teal)",
            light: "var(--color-brand-teal-light)",
            dark: "var(--color-brand-teal-dark)",
          }
        },
        primary: {
          DEFAULT: "var(--color-brand-primary)",
          foreground: "var(--color-brand-primary-foreground)",
          50: "var(--color-purple-50)",
          100: "var(--color-purple-100)",
          200: "var(--color-purple-200)",
          300: "var(--color-purple-300)",
          400: "var(--color-purple-400)",
          500: "var(--color-purple-500)",
          600: "var(--color-purple-600)",
          700: "var(--color-purple-700)",
          800: "var(--color-purple-800)",
          900: "var(--color-purple-900)",
          950: "var(--color-purple-950)",
        },
        secondary: {
          DEFAULT: "var(--color-brand-secondary)",
          foreground: "var(--color-brand-secondary-foreground)",
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
        medium: "0 4px 20px rgba(0, 0, 0, 0.08)",
        "toolbar-float": "0px 0px 0px 1px rgba(64,87,109,.04),0px 6px 20px -4px rgba(64,87,109,.3)",
        "popover": "0px 0px 0px 1px rgba(64,87,109,.04),0px 4px 20px -4px rgba(64,87,109,.3)",
        'soft-xs': '0 1px 2px 0 rgba(0 0 0 / 0.03)',
        'soft-sm': '0 1px 3px 0 rgba(0 0 0 / 0.04), 0 1px 2px -1px rgba(0 0 0 / 0.02)',
        'soft': '0 2px 4px -1px rgba(0 0 0 / 0.04), 0 4px 6px -1px rgba(0 0 0 / 0.03)',
        'soft-md': '0 4px 6px -1px rgba(0 0 0 / 0.05), 0 10px 15px -3px rgba(0 0 0 / 0.04)',
        'soft-lg': '0 10px 15px -3px rgba(0 0 0 / 0.06), 0 20px 25px -5px rgba(0 0 0 / 0.04)',
        'soft-xl': '0 20px 25px -5px rgba(0 0 0 / 0.07), 0 40px 50px -12px rgba(0 0 0 / 0.05)',
      },
      width: {
        'sidebar': 'var(--sidebar-width)',
      },
      spacing: {
        'sidebar': 'var(--sidebar-width)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
