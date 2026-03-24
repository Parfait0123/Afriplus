"use client";

/**
 * app/admin/opportunites/nouveau/page.tsx
 * Page de création d'une nouvelle opportunité.
 */

import OpportunityEditorPage from "@/app/admin/opportunites/[id]/page";

export default function NouvelleOpportunitePage() {
  return <OpportunityEditorPage params={{ id: "nouveau" }} />;
}