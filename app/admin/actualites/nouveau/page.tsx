"use client";

/**
 * app/admin/actualites/nouveau/page.tsx
 * Page de création d'un nouvel article.
 * Rend directement l'éditeur avec id="nouveau".
 */

import ArticleEditorPage from "@/app/admin/actualites/[id]/page";

export default function NouvelArticlePage() {
  return <ArticleEditorPage params={{ id: "nouveau" }} />;
}