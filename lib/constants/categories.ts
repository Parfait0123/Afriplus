export const CATEGORIES = [
  "Politique",
  "Économie",
  "Tech",
  "Sport",
  "Culture",
  "Santé",
  "Environnement",
] as const;

export type Category = typeof CATEGORIES[number];

export const CAT_COLOR: Record<Category, string> = {
  Politique: "#5A7FD4",
  Économie:  "#C08435",
  Tech:      "#4A9E6F",
  Sport:     "#C25B3F",
  Culture:   "#9B6B3A",
  Santé:     "#4A9E9E",
  Environnement: "#5A8F5A",
};

export const CAT_GRADIENT: Record<Category, string> = {
  Politique:     "linear-gradient(135deg,#050010,#0a0020,#10003a)",
  Économie:      "linear-gradient(135deg,#0a0800,#1a1400,#2a2000)",
  Tech:          "linear-gradient(135deg,#001a0f,#002e1a,#004025)",
  Sport:         "linear-gradient(135deg,#0e0005,#1a000a,#260010)",
  Culture:       "linear-gradient(135deg,#0a0500,#1a0e00,#2e1800)",
  Santé:         "linear-gradient(135deg,#001005,#001a0a,#002814)",
  Environnement: "linear-gradient(135deg,#001018,#001a28,#002535)",
};