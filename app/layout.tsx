import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import NavigationProgress from "@/components/ui/NavigationProgress";

// ── Métadonnées optimisées ─────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "AroMe — L'Afrique en temps réel",
    template: "%s | AroMe",
  },
  description:
    "La plateforme de référence pour l'actualité africaine, les bourses d'études et les opportunités du continent.",
  keywords: [
    "Afrique",
    "actualités africaines",
    "bourses d'études",
    "opportunités",
    "emploi Afrique",
    "événements africains",
  ],
  authors: [{ name: "AroMe" }],
  creator: "AroMe",
  publisher: "AroMe",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AroMe — L'Afrique en temps réel",
    description:
      "Actualités, bourses d'études, opportunités professionnelles et événements africains.",
    type: "website",
    locale: "fr_FR",
    siteName: "AroMe",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AroMe — L'Afrique en temps réel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AroMe — L'Afrique en temps réel",
    description:
      "Actualités, bourses d'études, opportunités professionnelles et événements africains.",
    images: ["/og-image.jpg"],
    creator: "@AroMe",
  },
  alternates: {
    canonical: "https://afripulse.com",
  },
  manifest: "/manifest.json",
};

// ── Viewport (séparé dans Next.js 15) ──────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#141410" },
  ],
};

// ── Layout avec optimisations ──────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Polices optimisées avec preconnect */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,200;1,9..144,400;1,9..144,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />

        {/* DNS Prefetch pour les domaines fréquents */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Favicon et PWA */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased bg-[#FAFAF8] text-[#141410]">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>

        {/* Skip to main content pour accessibilité */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#C08435] focus:text-white focus:rounded-lg"
        >
          Aller au contenu principal
        </a>

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
