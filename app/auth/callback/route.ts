// app/auth/callback/route.ts
// Handler de callback OAuth (Google) et confirmation email
// Redirige les nouveaux utilisateurs vers /dashboard/profil pour compléter leur profil

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") ?? "/";
  // Paramètre optionnel passé par notre bouton Google
  const error = searchParams.get("error");

  // Si Supabase a renvoyé une erreur OAuth
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/connexion?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession error:", exchangeError.message);
      return NextResponse.redirect(
        `${origin}/auth/connexion?error=callback`
      );
    }

    const user = data?.user;
    if (!user) {
      return NextResponse.redirect(`${origin}/auth/connexion?error=no_user`);
    }

    // ── Vérifier si le profil existe déjà en base ──────────────
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, full_name, country")
      .eq("id", user.id)
      .single();

    // ── Cas 1 : Nouvel utilisateur Google (profil inexistant) ──
    if (!existingProfile) {
      // Créer le profil à partir des données Google
      const googleName  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
      const googleAvatar = user.user_metadata?.avatar_url ?? null;

      await supabase.from("profiles").insert({
        id:         user.id,
        email:      user.email ?? "",
        full_name:  googleName,
        avatar_url: googleAvatar,
        role:       "reader",
      });

      // Toujours rediriger vers le dashboard de complétion de profil
      return NextResponse.redirect(`${origin}/dashboard/profil?new=1`);
    }

    // ── Cas 2 : Utilisateur Google déjà connu, profil incomplet ──
    // (pas de pays ou de nom renseigné)
    const isIncomplete = !existingProfile.country || !existingProfile.full_name;
    if (isIncomplete && next === "/dashboard/profil") {
      return NextResponse.redirect(`${origin}/dashboard/profil?new=1`);
    }

    // ── Cas 3 : Utilisateur connu, profil complet ──────────────
    // On respecte le `next` passé en paramètre (page d'origine)
    // Sécurité : on n'autorise que les redirections relatives
    const safeNext = next.startsWith("/") ? next : "/";
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // Pas de code dans l'URL — retour à la connexion
  return NextResponse.redirect(`${origin}/auth/connexion?error=no_code`);
}