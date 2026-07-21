import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [
    // Registers `light:` as a real variant (selector: `html.light &`) so it
    // works for ANY utility, not just the hand-picked ones. Previously only
    // ~20 specific light: classes were hardcoded in index.css — any other
    // light: class used in a component silently did nothing.
    plugin(({ addVariant }) => {
      addVariant('light', 'html.light &')
    }),
  ],
}
