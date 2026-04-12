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
        soil: "#4A3728",
        root: "#332518",
        petal: {
          DEFAULT: "#C17F4E",
          lt: "#F5E4D2",
        },
        leaf: {
          DEFAULT: "#5B7C4F",
          lt: "#E6EFE3",
          dk: "#3D5933",
        },
        bloom: {
          DEFAULT: "#CB9B2D",
          lt: "#FCF3DC",
        },
        frost: {
          DEFAULT: "#B94A42",
          lt: "#F9DEDD",
        },
        creek: {
          DEFAULT: "#3E7A8C",
          lt: "#D6ECF2",
        },
        cream: "#FAF6EF",
        linen: "#FFFFFF",
        clay: "#F3ECE2",
        fence: {
          DEFAULT: "#E4DDD2",
          lt: "#EDE7DF",
        },
        "stone-c": "#8B7D6B",
        ash: "#A99D8F",
      },
    },
  },
  plugins: [],
};
export default config;
