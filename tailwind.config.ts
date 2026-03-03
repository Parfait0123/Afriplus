import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8F6F1",
        bg2: "#F0EDE4",
        ink: "#141410",
        ink2: "#38382E",
        muted: "#928E80",
        gold: "#C08435",
        gold2: "#E09B48",
        "gold-bg": "#FBF4E8",
        green: "#1A5C40",
        "green-bg": "#EAF4EF",
        red: "#B8341E",
        "red-bg": "#FAEBE8",
        blue: "#1E4DA8",
        "blue-bg": "#EBF0FB",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        "card-lg": "20px",
        "card-xl": "28px",
      },
      boxShadow: {
        s1: "0 1px 3px rgba(20,20,16,.04), 0 2px 8px rgba(20,20,16,.04)",
        s2: "0 4px 16px rgba(20,20,16,.07), 0 1px 3px rgba(20,20,16,.04)",
        s3: "0 12px 40px rgba(20,20,16,.10), 0 2px 8px rgba(20,20,16,.05)",
        s4: "0 24px 64px rgba(20,20,16,.13), 0 4px 16px rgba(20,20,16,.06)",
      },
    },
  },
  plugins: [],
};
export default config;
