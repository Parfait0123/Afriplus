"use client";

/**
 * hooks/useAuth.ts
 * Tous les types viennent de @/types — rien n'est redéfini ici.
 * Ré-exporté pour rétrocompatibilité avec le reste du projet.
 */

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

import type {
  UserRole,
  Profile,
  ContentType,
  ApplicationStatus,
} from "@/types";

import { STATUS_LABEL, STATUS_COLOR } from "@/types";

/* ── Ré-exports pour rétrocompatibilité ── */
export type { UserRole, Profile, ContentType, ApplicationStatus };
export { STATUS_LABEL, STATUS_COLOR };

/* ── Client Supabase navigateur ── */
function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/* ══════════════════════════════════════════════════════
   useAuth — authentification + profil + rôles
══════════════════════════════════════════════════════ */
export function useAuth() {
  const supabase = getClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data: p }) => {
            setProfile(p);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    profile,
    loading,
    signOut,
    isLoggedIn: !!user,
    isAdmin: profile?.role === "admin",
    isEditor: profile?.role === "editor" || profile?.role === "admin",
  };
}

/* ══════════════════════════════════════════════════════
   useSave — état de sauvegarde d'un contenu
══════════════════════════════════════════════════════ */
export function useSave(
  contentType: ContentType,
  contentSlug: string,
  contentTitle?: string,
  contentMeta?: Record<string, unknown>,
) {
  const supabase = getClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      const { data: row } = await supabase
        .from("saves")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("content_type", contentType)
        .eq("content_slug", contentSlug)
        .maybeSingle();
      setSaved(!!row);
      setLoading(false);
    });
  }, [contentType, contentSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (saved) {
      setSaved(false);
      await supabase
        .from("saves")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_slug", contentSlug);
    } else {
      setSaved(true);
      await supabase.from("saves").insert({
        user_id: user.id,
        content_type: contentType,
        content_slug: contentSlug,
        content_title: contentTitle ?? null,
        content_meta: contentMeta ?? null,
      });
    }
  }, [saved, contentType, contentSlug, contentTitle, contentMeta]); // eslint-disable-line react-hooks/exhaustive-deps

  return { saved, loading, toggle, isLoggedIn };
}

/* ══════════════════════════════════════════════════════
   useApplication — suivi de candidature
══════════════════════════════════════════════════════ */
export function useApplication(
  contentType: "scholarship" | "opportunity",
  contentSlug: string,
  contentTitle?: string,
  deadline?: string,
) {
  const supabase = getClient();
  const [application, setApplication] = useState<{
    id: string;
    status: ApplicationStatus;
    notes: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      const { data: row } = await supabase
        .from("applications")
        .select("id, status, notes")
        .eq("user_id", data.user.id)
        .eq("content_type", contentType)
        .eq("content_slug", contentSlug)
        .maybeSingle();
      setApplication(row ?? null);
      setLoading(false);
    });
  }, [contentType, contentSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  /* upsert — envoie title et deadline depuis les props du hook */
  const upsert = useCallback(
    async (status: ApplicationStatus, notes?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const payload = {
        user_id: user.id,
        content_type: contentType,
        content_slug: contentSlug,
        content_title: contentTitle ?? null,
        content_meta: {},
        status,
        notes: notes ?? null,
        /* deadline est de type DATE en base — on ne l'envoie pas
         depuis une string française non parseable ("15 Mar 2025").
         Elle peut être mise à jour séparément si nécessaire. */
      };
      const { data } = await supabase
        .from("applications")
        .upsert(payload, { onConflict: "user_id,content_type,content_slug" })
        .select("id, status, notes")
        .single();
      if (data) setApplication(data);
    },
    [contentType, contentSlug, contentTitle, deadline],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = useCallback(async () => {
    if (!application) return;
    await supabase.from("applications").delete().eq("id", application.id);
    setApplication(null);
  }, [application]); // eslint-disable-line react-hooks/exhaustive-deps

  return { application, loading, upsert, remove, isLoggedIn };
}

/* ══════════════════════════════════════════════════════
   useEventRegistration — inscription + export .ics
══════════════════════════════════════════════════════ */
export function useEventRegistration(
  eventSlug: string,
  eventTitle?: string,
  eventDate?: string,
  eventLocation?: string,
) {
  const supabase = getClient();
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      const { data: row } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("event_slug", eventSlug)
        .maybeSingle();
      setRegistered(!!row);
      setLoading(false);
    });
  }, [eventSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (registered) {
      setRegistered(false);
      await supabase
        .from("event_registrations")
        .delete()
        .eq("user_id", user.id)
        .eq("event_slug", eventSlug);
    } else {
      setRegistered(true);
      await supabase.from("event_registrations").insert({
        user_id: user.id,
        event_slug: eventSlug,
        event_title: eventTitle ?? null,
        event_date: eventDate ?? null,
        event_location: eventLocation ?? null,
      });
    }
  }, [registered, eventSlug, eventTitle, eventDate, eventLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportICS = useCallback(() => {
    if (!eventDate) return;
    const dt = eventDate.replace(/-/g, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AroMe//FR",
      "BEGIN:VEVENT",
      `UID:${eventSlug}@afripulse.com`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:${eventTitle ?? eventSlug}`,
      eventLocation ? `LOCATION:${eventLocation}` : "",
      `URL:https://afripulse.com/evenements/${eventSlug}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: `${eventSlug}.ics`,
    }).click();
    URL.revokeObjectURL(url);
  }, [eventSlug, eventTitle, eventDate, eventLocation]);

  return { registered, loading, toggle, exportICS, isLoggedIn };
}
