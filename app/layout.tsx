import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfriPulse — L'Afrique en temps réel",
  description:
    "La plateforme de référence pour l'actualité africaine, les bourses d'études et les opportunités du continent.",
  openGraph: {
    title: "AfriPulse — L'Afrique en temps réel",
    description:
      "Actualités, bourses d'études, opportunités professionnelles et événements africains.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,200;1,9..144,400;1,9..144,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
