/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A', // Azul escuro / Preto suave
          light: '#334155',
        },
        accent: '#D97706', // Uma cor de destaque (ex: Laranja/Dourado)
      },
      fontFamily: {
        // Defina sua fonte padrão aqui (ex: Inter, Roboto, Geist)
        sans: ['var(--font-geist-sans)'], 
      },
    },
  },
  plugins: [],
}