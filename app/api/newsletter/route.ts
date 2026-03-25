import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Vérifier si l'email existe déjà
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      { message: "already_subscribed" },
      { status: 409 }
    );
  }

  // Créer un token de confirmation
  const confirmationToken = crypto.randomUUID();

  // Insérer le nouvel abonné
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    confirmed: false,
    confirmation_token: confirmationToken,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Erreur technique" }, { status: 500 });
  }

  // Envoyer l'email de confirmation
  try {
   const response =  await resend.emails.send({
      from: "AfriPulse <onboarding@resend.dev>",
      to: email,
      subject: "Confirmez votre inscription",
      html: `
        <h1>Bienvenue sur AfriPulse !</h1>
        <p>Cliquez ici pour confirmer votre inscription :</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmationToken}">
          Confirmer
        </a>
      `,
    });
      console.log("Réponse Resend :", response);
  } catch (emailError) {
    // Même si l'email échoue, l'abonné est enregistré
    console.error("Erreur d'envoi d'email:", emailError);
  }

  return NextResponse.json({ success: true });
}