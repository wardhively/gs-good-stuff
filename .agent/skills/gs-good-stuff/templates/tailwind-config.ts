import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: "#4A3728",       // Primary: headers, nav active, primary buttons
        root: "#332518",       // Dark text, emphasis
        petal: "#C17F4E",      // Accent: CTAs, highlights, prices, notifications
        "petal-lt": "#F5E4D2", // Accent light background
        leaf: "#5B7C4F",       // Success: growing status, revenue up, positive
        "leaf-lt": "#E6EFE3",  // Success light background
        "leaf-dk": "#3D5933",  // Dark green emphasis
        bloom: "#CB9B2D",      // Warning: sell-ready, caution, jugged
        "bloom-lt": "#FCF3DC", // Warning light background
        frost: "#B94A42",      // Danger: alerts, overdue, urgent
        "frost-lt": "#F9DEDD", // Danger light background
        creek: "#3E7A8C",      // Info: stored status, weather, informational
        "creek-lt": "#D6ECF2", // Info light background
        cream: "#FAF6EF",      // App background
        linen: "#FFFFFF",      // Card surfaces
        clay: "#F3ECE2",       // Secondary surfaces, filter chips
        fence: "#E4DDD2",      // Borders, dividers
        "fence-lt": "#EDE7DF", // Light borders
        "stone-c": "#8B7D6B", // Secondary text (stone-c avoids Tailwind conflict)
        ash: "#A99D8F",        // Tertiary text, placeholders
      },
      fontFamily: {
        display: ["Bitter", "serif"],     // Headers, display text
        body: ["DM Sans", "sans-serif"],  // Body, labels, UI text
      },
      borderRadius: {
        xl: "14px", // Card radius
      },
    },
  },
  plugins: [],
};

export default config;
