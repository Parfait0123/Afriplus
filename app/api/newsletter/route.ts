// app/api/newsletter/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// 1. Définition du type correspondant à ton SQL
interface NewsletterSubscriber {
  id: string;
  email: string;
  confirmed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation basique de l'email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 2. Vérifier si l'utilisateur existe déjà (on cast en 'any' pour éviter le blocage Vercel)
    const { data: existing, error: fetchError } = await (supabase
      .from("newsletter_subscribers")
      .select("id, confirmed")
      .eq("email", email)
      .maybeSingle() as any);

    if (fetchError) {
      console.error("Erreur de récupération Supabase:", fetchError);
    }

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json(
          { message: "already_subscribed" },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { message: "pending_confirmation" },
        { status: 200 },
      );
    }

    // 3. Insérer l'abonné (le cast 'as any' ici règle l'erreur 'never' du build)
    const { error: insertError } = await (
      supabase.from("newsletter_subscribers") as any
    ).insert({
      email,
      confirmed: true,
    });

    if (insertError) {
      console.error("Erreur d'insertion Supabase:", insertError);
      throw insertError;
    }

    // 4. Envoyer email de bienvenue via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "AfriPulse <newsletter@afripulse.com>",
            to: email,
            subject: "Bienvenue sur AfriPulse Newsletter 🌍",
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #F8F6F1;">
                <h1 style="font-size: 2rem; color: #141410; letter-spacing: -0.04em; margin-bottom: 0.5rem;">
                  Afri<span style="color: #C08435;">Pulse</span>
                </h1>
                <div style="background: #fff; border-radius: 20px; padding: 2rem; border: 1px solid rgba(20,20,16,.07);">
                  <h2 style="font-size: 1.4rem; color: #141410; margin-bottom: 1rem;">Bienvenue ! 🎉</h2>
                  <p style="font-size: 0.95rem; color: #38382E; line-height: 1.75;">Vous êtes abonné(e) à la newsletter AfriPulse.</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "#"}" style="display: inline-block; margin-top: 1.5rem; background: #C08435; color: #fff; padding: 0.75rem 1.5rem; border-radius: 100px; text-decoration: none; font-size: 0.85rem; font-weight: 700;">Découvrir AfriPulse →</a>
                </div>
              </div>
            `,
          }),
        });
      } catch (e) {
        console.error("Erreur lors de l'envoi de l'email:", e);
      }
    }

    return NextResponse.json({ message: "subscribed" }, { status: 200 });
  } catch (err) {
    console.error("Newsletter global error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
