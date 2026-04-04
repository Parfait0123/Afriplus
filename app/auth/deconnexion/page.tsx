// app/auth/deconnexion/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeconnexionPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.push("/");
    };
    logout();
  }, [supabase, router]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#F5F3EE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid rgba(20,20,16,.08)",
          borderTopColor: "#C08435",
          animation: "spin .8s linear infinite",
          margin: "0 auto 1rem"
        }} />
        <p style={{ color: "#928E80" }}>Déconnexion en cours...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}