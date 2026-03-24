"use client";

/**
 * app/admin/bourses/nouveau/page.tsx
 * Page de création d'une nouvelle bourse.
 */

import BourseEditorPage from "@/app/admin/bourses/[id]/page";

export default function NouvelleboursePage() {
  return <BourseEditorPage params={{ id: "nouveau" }} />;
}