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
        // Définition d'une palette de gris pour un thème noir et blanc
        // Tailwind a déjà une excellente palette de gris par défaut, nous pouvons l'utiliser.
        // Si des couleurs spécifiques sont nécessaires, elles peuvent être ajoutées ici.
      }
    },
  },
  plugins: [],
}