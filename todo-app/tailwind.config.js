/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "hsl(var(--bg-surface) / <alpha-value>)",
        "surface-dim": "hsl(var(--bg-surface-dim) / <alpha-value>)",
        "surface-bright": "hsl(var(--bg-surface-bright) / <alpha-value>)",
        "surface-container-lowest": "hsl(var(--bg-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "hsl(var(--bg-surface-container-low) / <alpha-value>)",
        "surface-container": "hsl(var(--bg-surface-container) / <alpha-value>)",
        "surface-container-high": "hsl(var(--bg-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "hsl(var(--bg-surface-container-highest) / <alpha-value>)",
        "surface-glass": "hsl(var(--bg-surface-glass) / <alpha-value>)",
        "on-surface": "hsl(var(--text-primary) / <alpha-value>)",
        "on-surface-variant": "hsl(var(--text-secondary) / <alpha-value>)",
        "text-muted": "hsl(var(--text-muted) / <alpha-value>)",
        "outline": "hsl(var(--border-color) / <alpha-value>)",
        "outline-variant": "hsl(var(--border-variant) / <alpha-value>)",
        "border-glass": "hsl(var(--border-glass) / <alpha-value>)",
        "primary": "hsl(var(--primary) / <alpha-value>)",
        "on-primary": "hsl(var(--on-primary) / <alpha-value>)",
        "primary-container": "hsl(var(--primary-container) / <alpha-value>)",
        "on-primary-container": "hsl(var(--on-primary-container) / <alpha-value>)",
        "secondary": "hsl(var(--secondary) / <alpha-value>)",
        "on-secondary": "hsl(var(--on-secondary) / <alpha-value>)",
        "secondary-container": "hsl(var(--secondary-container) / <alpha-value>)",
        "on-secondary-container": "hsl(var(--on-secondary-container) / <alpha-value>)",
        "tertiary": "hsl(var(--tertiary) / <alpha-value>)",
        "on-tertiary": "hsl(var(--on-tertiary) / <alpha-value>)",
        "tertiary-container": "hsl(var(--tertiary-container) / <alpha-value>)",
        "error": "hsl(var(--error) / <alpha-value>)",
        "on-error": "hsl(var(--on-error) / <alpha-value>)",
        "error-container": "hsl(var(--error-container) / <alpha-value>)",
        "background": "hsl(var(--bg-base) / <alpha-value>)",
        "on-background": "hsl(var(--text-primary) / <alpha-value>)",
        "surface-variant": "hsl(var(--bg-surface-container-high) / <alpha-value>)"
      },
      boxShadow: {
        glow: "var(--glow-shadow)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        sidebar_width: "240px",
        gutter: "16px",
        margin_mobile: "16px",
        stack_tight: "4px",
        margin_desktop: "24px",
        stack_normal: "12px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        geist: ["Geist", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "mono-label": ["Geist", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "headline-lg": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "mono-label": ["11px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
}
