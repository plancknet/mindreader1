import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        'zone-left': "hsl(var(--zone-left))",
        'zone-center': "hsl(var(--zone-center))",
        'zone-right': "hsl(var(--zone-right))",
        alert: "hsl(var(--alert))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-alert': 'var(--gradient-alert)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'alert': 'var(--shadow-alert)',
      },
      transitionProperty: {
        'smooth': 'var(--transition-smooth)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "magical-reveal": {
          "0%": {
            opacity: "0",
            transform: "scale(0.3) rotateY(90deg)",
            filter: "blur(10px) brightness(2)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05) rotateY(0deg)",
            filter: "blur(2px) brightness(1.5)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotateY(0deg)",
            filter: "blur(0px) brightness(1)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(217 91% 60% / 0.4), 0 0 40px hsl(217 91% 60% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(217 91% 60% / 0.6), 0 0 80px hsl(217 91% 60% / 0.3)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "magical-reveal": "magical-reveal 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
