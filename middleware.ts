// middleware.ts — Protection des routes /admin, redirection profil incomplet, bannis, etc.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // --------------------------------------------------------------------
  // 0. Vérification du statut banni (pour TOUTES les routes protégées)
  // --------------------------------------------------------------------
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("banned, role")
      .eq("id", user.id)
      .single();

    // Si l'utilisateur est banni
    if (profile?.banned === true) {
      // Autoriser l'accès à la page d'information de ban et à la déconnexion
      const allowedPaths = ["/auth/ban", "/auth/deconnexion", "/api/auth/logout"];
      const isAllowedPath = allowedPaths.some((p) => pathname.startsWith(p));
      
      if (!isAllowedPath) {
        // Rediriger vers la page d'information de ban
        return NextResponse.redirect(new URL("/auth/ban", request.url));
      }
    }
  }

  // --------------------------------------------------------------------
  // 1. Protection des routes /admin
  // --------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/connexion?redirect=/admin", request.url));
    }
    
    // Vérifier rôle admin (et s'assurer que l'utilisateur n'est pas banni)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, banned")
      .eq("id", user.id)
      .single();

    if (!profile || profile.banned === true) {
      return NextResponse.redirect(new URL("/auth/ban", request.url));
    }

    if (!["admin", "editor"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }
  }

  // --------------------------------------------------------------------
  // 2. Redirection des utilisateurs connectés depuis les pages auth
  //    (sauf /auth/callback et /auth/ban qui doivent rester accessibles)
  // --------------------------------------------------------------------
  if (pathname.startsWith("/auth/") && 
      !pathname.startsWith("/auth/callback") && 
      !pathname.startsWith("/auth/ban") &&
      !pathname.startsWith("/auth/deconnexion") &&
      user) {
    // Vérifier si l'utilisateur banni peut rester sur la page de ban
    const { data: profile } = await supabase
      .from("profiles")
      .select("banned")
      .eq("id", user.id)
      .single();
    
    if (profile?.banned !== true) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --------------------------------------------------------------------
  // 3. Vérification de la complétion du profil pour le tableau de bord
  // --------------------------------------------------------------------
  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/profile")) {
    if (!user) {
      const redirectUrl = new URL("/auth/connexion", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Vérifier que l'utilisateur n'est pas banni
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, country, banned")
      .eq("id", user.id)
      .single();

    if (profile?.banned === true) {
      return NextResponse.redirect(new URL("/auth/ban", request.url));
    }

    const isProfileComplete = profile && profile.full_name && profile.country;

    if (!isProfileComplete) {
      const redirectUrl = new URL("/dashboard/profile", request.url);
      redirectUrl.searchParams.set("incomplete", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};