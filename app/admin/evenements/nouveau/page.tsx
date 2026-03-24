"use client";

/**
 * app/admin/evenements/nouveau/page.tsx
 * Page de création d'une nouvelle evenement.
 */

import  EvenementEditorPage from "@/app/admin/evenements/[id]/page";

export default function NouvelleEvenementPage() {
  return <EvenementEditorPage params={{ id: "nouveau" }} />;
}