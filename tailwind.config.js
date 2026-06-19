/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        purple: '#9B7FFF',
        'purple-light': '#B8A8FF',
        gold: '#D4A84B',
        'gold-light': '#F0CC8A',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius)',
        sm: 'var(--radius)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'orb-float': 'orbFloat 18s ease-in-out infinite',
        'line-glow': 'lineGlow 8s ease-in-out infinite',
        'star-twinkle': 'starTwinkle 3s ease-in-out infinite',
        'crystal-float': 'crystalFloat 7s ease-in-out infinite',
        'gem-float': 'gemFloat 6s ease-in-out infinite',
        'marquee-scroll': 'marqueeScroll 22s linear infinite',
      },
    },
  },
  plugins: [],
}
