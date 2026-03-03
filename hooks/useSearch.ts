"use client";
import { useState, useEffect, useCallback } from "react";
import { articles, scholarships, opportunities, events } from "@/lib/data";

export interface SearchResult {
  id: string;
  type: "article" | "bourse" | "opportunite" | "evenement";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
}

function searchAll(query: string): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  articles
    .filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
    .slice(0, 4)
    .forEach((a) => results.push({
      id: a.id, type: "article",
      title: a.title,
      subtitle: `${a.category} · ${a.author} · ${a.date}`,
      href: `/actualites/${a.slug}`,
      badge: a.category, badgeBg: "#EBF0FB", badgeColor: "#1E4DA8",
    }));

  scholarships
    .filter((s) => s.title.toLowerCase().includes(q) || s.organization.toLowerCase().includes(q) || s.country.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((s) => results.push({
      id: s.id, type: "bourse",
      title: s.title,
      subtitle: `${s.organization} · ${s.flag} ${s.country} · ${s.level}`,
      href: `/bourses/${s.slug}`,
      badge: "Bourse", badgeBg: "#EAF4EF", badgeColor: "#1A5C40",
    }));

  opportunities
    .filter((o) => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) || o.location.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((o) => results.push({
      id: o.id, type: "opportunite",
      title: o.title,
      subtitle: `${o.company} · ${o.location} · ${o.type}`,
      href: `/opportunites/${o.slug}`,
      badge: o.type, badgeBg: "#FBF4E8", badgeColor: "#C08435",
    }));

  events
    .filter((e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach((e) => results.push({
      id: e.id, type: "evenement",
      title: e.title,
      subtitle: `${e.type} · ${e.location} · ${e.day} ${e.month} ${e.year}`,
      href: `/evenements/${e.slug}`,
      badge: e.type, badgeBg: "#FAEBE8", badgeColor: "#B8341E",
    }));

  return results;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback((q: string) => {
    setLoading(true);
    setTimeout(() => {
      setResults(searchAll(q));
      setLoading(false);
    }, 120);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => search(query), 220);
    return () => clearTimeout(timer);
  }, [query, search]);

  return { query, setQuery, results, loading };
}
