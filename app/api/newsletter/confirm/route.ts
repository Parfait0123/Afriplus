// app/api/newsletter/confirm/route.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Utilitaire pour créer le client Supabase avec gestion des cookies (SSR)
 * Compatible avec Next.js 15+ (async cookies)
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Géré par le middleware dans les Server Components
          }
        },
      },
    }
  );
}

// GET : Confirmation de l'inscription via le lien dans l'email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", request.url));
  }

  const supabase = await getSupabaseClient();

  // 1. Vérifier l'existence du token
  const { data: subscriber, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, confirmed")
    .eq("confirmation_token", token)
    .single();

  if (fetchError || !subscriber) {
    return NextResponse.redirect(new URL("/?error=invalid_token", request.url));
  }

  // 2. Si déjà confirmé, rediriger directement
  if (subscriber.confirmed) {
    return NextResponse.redirect(new URL("/newsletter/confirmation?already_confirmed=true", request.url));
  }

  // 3. Valider l'inscription
  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({ 
      confirmed: true, 
      confirmed_at: new Date().toISOString(),
      confirmation_token: null // Sécurité : on invalide le token utilisé
    })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Erreur update confirmation:", updateError);
    return NextResponse.redirect(new URL("/?error=update_failed", request.url));
  }

  return NextResponse.redirect(new URL("/newsletter/confirmation?success=true", request.url));
}

// POST : Envoi ou renvoi de l'email de confirmation
export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();
    const supabase = await getSupabaseClient();

    // Vérifier l'abonné dans la DB
    const { data: subscriber, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !subscriber) {
      return NextResponse.json({ error: "Abonné introuvable" }, { status: 404 });
    }

    if (subscriber.confirmed) {
      return NextResponse.json({ error: "Déjà confirmé" }, { status: 400 });
    }

    const confirmationToken = token || subscriber.confirmation_token;

    // Envoi de l'email via Resend
    const { error: mailError } = await resend.emails.send({
      from: "AfriPulse <newsletter@afripulse.com>",
      to: email,
      subject: "Confirmez votre inscription à la newsletter AfriPulse",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; background-color: #f5f3ee; padding: 20px; margin: 0;">
            <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; border: 1px solid #e8e4dc;">
              <h1 style="color: #141410; margin-bottom: 20px;">Afri<span style="color: #C08435;">Pulse</span></h1>
              <p style="color: #141410; font-size: 16px;">Merci de vous être inscrit ! Pour activer votre abonnement, cliquez sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/api/newsletter/confirm?token=${confirmationToken}" 
                   style="background: #C08435; color: #fff; padding: 12px 28px; text-decoration: none; border-radius: 100px; font-weight: 600; display: inline-block;">
                  Confirmer mon inscription
                </a>
              </div>
              <p style="font-size: 12px; color: #928e80;">
                Si le bouton ne fonctionne pas, copiez ce lien : <br/>
                ${SITE_URL}/api/newsletter/confirm?token=${confirmationToken}
              </p>
              <hr style="border: 0; border-top: 1px solid #e8e4dc; margin: 20px 0;" />
              <p style="font-size: 12px; color: #928e80;">© ${new Date().getFullYear()} AfriPulse. Tous droits réservés.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (mailError) throw mailError;

    return NextResponse.json({ success: true, message: "Email envoyé" });

  } catch (err: any) {
    console.error("Erreur POST Newsletter:", err);
    return NextResponse.json(
      { error: err.message || "Une erreur technique est survenue" }, 
      { status: 500 }
    );
  }
}
