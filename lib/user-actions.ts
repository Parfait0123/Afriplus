"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/* ─── Client Supabase serveur — pattern @supabase/ssr ─── */
function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

async function requireUser() {
  const supabase = getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Non connecté");
  return { supabase, user };
}

/* ══════════════════════════════════════════════════════
   PROFIL
   Note : la table profiles existe déjà avec les champs
   id, full_name, avatar_url, role.
   On utilise ALTER TABLE dans le SQL pour ajouter les
   nouveaux champs sans casser l'existant.
══════════════════════════════════════════════════════ */

export async function getProfile() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(formData: {
  full_name?: string;
  country?: string;
  city?: string;
  bio?: string;
  domain?: string;
  level?: string;
  linkedin_url?: string;
  website_url?: string;
  notify_saves?: boolean;
  notify_news?: boolean;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update(formData)
    .eq("id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/* ══════════════════════════════════════════════════════
   SAUVEGARDES
══════════════════════════════════════════════════════ */

export type ContentType = "article" | "scholarship" | "opportunity" | "event";

export async function getSaves(type?: ContentType) {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("saves")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (type) query = query.eq("content_type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function toggleSave(
  contentType: ContentType,
  contentSlug: string,
  contentTitle: string,
  contentMeta?: Record<string, unknown>
) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .eq("content_slug", contentSlug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("saves").delete().eq("id", existing.id);
    if (error) throw error;
    revalidatePath("/dashboard");
    return { saved: false };
  } else {
    const { error } = await supabase.from("saves").insert({
      user_id:       user.id,
      content_type:  contentType,
      content_slug:  contentSlug,
      content_title: contentTitle,
      content_meta:  contentMeta ?? {},
    });
    if (error) throw error;
    revalidatePath("/dashboard");
    return { saved: true };
  }
}

export async function deleteSave(saveId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("id", saveId)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/* ══════════════════════════════════════════════════════
   CANDIDATURES
══════════════════════════════════════════════════════ */

export type ApplicationStatus =
  | "interested" | "in_progress" | "submitted"
  | "interview"  | "accepted"    | "rejected" | "withdrawn";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  interested:  "Intéressé",
  in_progress: "En cours",
  submitted:   "Soumis",
  interview:   "Entretien",
  accepted:    "Accepté",
  rejected:    "Refusé",
  withdrawn:   "Retiré",
};

export const STATUS_COLOR: Record<ApplicationStatus, { color: string; bg: string }> = {
  interested:  { color: "#928E80", bg: "#F0EDE4" },
  in_progress: { color: "#1E4DA8", bg: "#EBF0FB" },
  submitted:   { color: "#C08435", bg: "#FBF4E8" },
  interview:   { color: "#7A1E4A", bg: "#F9EBF3" },
  accepted:    { color: "#1A5C40", bg: "#EAF4EF" },
  rejected:    { color: "#B8341E", bg: "#FAEBE8" },
  withdrawn:   { color: "#928E80", bg: "#F0EDE4" },
};

export async function getApplications(status?: ApplicationStatus) {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("deadline", { ascending: true, nullsFirst: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function upsertApplication(payload: {
  contentType: "scholarship" | "opportunity";
  contentSlug: string;
  contentTitle: string;
  contentMeta?: Record<string, unknown>;
  status: ApplicationStatus;
  notes?: string;
  deadline?: string;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("applications")
    .upsert(
      {
        user_id:       user.id,
        content_type:  payload.contentType,
        content_slug:  payload.contentSlug,
        content_title: payload.contentTitle,
        content_meta:  payload.contentMeta ?? {},
        status:        payload.status,
        notes:         payload.notes ?? null,
        deadline:      payload.deadline ?? null,
        applied_at:    payload.status === "submitted" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,content_type,content_slug" }
    );
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("applications")
    .update({
      status,
      notes,
      applied_at: status === "submitted" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function deleteApplication(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/* ══════════════════════════════════════════════════════
   INSCRIPTIONS ÉVÉNEMENTS
══════════════════════════════════════════════════════ */

export async function getEventRegistrations() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function toggleEventRegistration(payload: {
  eventSlug: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
}) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_slug", payload.eventSlug)
    .maybeSingle();

  if (existing) {
    await supabase.from("event_registrations").delete().eq("id", existing.id);
    revalidatePath("/dashboard");
    return { registered: false };
  } else {
    await supabase.from("event_registrations").insert({
      user_id:        user.id,
      event_slug:     payload.eventSlug,
      event_title:    payload.eventTitle,
      event_date:     payload.eventDate ?? null,
      event_location: payload.eventLocation ?? null,
    });
    revalidatePath("/dashboard");
    return { registered: true };
  }
}

export async function deleteEventRegistration(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/dashboard");
}

/* ══════════════════════════════════════════════════════
   DASHBOARD — tout en une passe
══════════════════════════════════════════════════════ */

export async function getDashboardData() {
  const { supabase, user } = await requireUser();
  const [profileRes, savesRes, appsRes, eventsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("saves").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("applications").select("*").eq("user_id", user.id).order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("event_registrations").select("*").eq("user_id", user.id).order("event_date", { ascending: true }),
  ]);
  return {
    user,
    profile:            profileRes.data,
    saves:              savesRes.data ?? [],
    applications:       appsRes.data ?? [],
    eventRegistrations: eventsRes.data ?? [],
  };
}