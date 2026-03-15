"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useApplication,
  STATUS_LABEL,
  STATUS_COLOR,
  type ApplicationStatus,
} from "@/hooks/useAuth";

interface ApplyButtonProps {
  contentType: "scholarship" | "opportunity";
  contentSlug: string;
  contentTitle: string;
  deadline?: string;
  color?: string;
}

const ALL_STATUSES = Object.keys(STATUS_LABEL) as ApplicationStatus[];

export default function ApplyButton({
  contentType,
  contentSlug,
  contentTitle,
  deadline,
  color = "#1A5C40",
}: ApplyButtonProps) {
  const { application, loading, upsert, remove, isLoggedIn } = useApplication(
    contentType,
    contentSlug,
    contentTitle,
    deadline,
  );

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(application?.notes ?? "");

  if (loading)
    return (
      <div
        style={{
          height: 38,
          width: 190,
          borderRadius: 100,
          background: "rgba(20,20,16,.06)",
        }}
      />
    );

  if (!isLoggedIn)
    return (
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.7rem 1.4rem",
          borderRadius: 100,
          background: color,
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "0.86rem",
          boxShadow: `0 3px 12px ${color}40`,
        }}
      >
        Suivre ma candidature →
      </Link>
    );

  const sc = application ? STATUS_COLOR[application.status] : null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.7rem 1.4rem",
          borderRadius: 100,
          cursor: "pointer",
          background: sc ? sc.bg : color,
          color: sc ? sc.color : "#fff",
          border: `1.5px solid ${sc ? sc.color + "50" : "transparent"}`,
          fontWeight: 700,
          fontSize: "0.86rem",
          transition: "all .18s",
          boxShadow: sc ? "none" : `0 3px 12px ${color}40`,
          fontFamily: "inherit",
        }}
      >
        {application
          ? `📋 ${STATUS_LABEL[application.status]} ▾`
          : "Suivre ma candidature →"}
      </button>

      {open && (
        <>
          {/* Overlay cliquable pour fermer */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#fff",
              borderRadius: 18,
              padding: "1rem",
              boxShadow: "0 8px 32px rgba(20,20,16,.14)",
              border: "1px solid rgba(20,20,16,.08)",
              width: 280,
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#928E80",
                marginBottom: "0.75rem",
              }}
            >
              Statut de la candidature
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                marginBottom: "0.85rem",
              }}
            >
              {ALL_STATUSES.map((s) => {
                const sc2 = STATUS_COLOR[s];
                const active = application?.status === s;
                return (
                  <button
                    key={s}
                    onClick={async () => {
                      await upsert(s, notes || undefined);
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.85rem",
                      borderRadius: 10,
                      border: "none",
                      background: active ? sc2.bg : "transparent",
                      color: active ? sc2.color : "#38382E",
                      fontWeight: active ? 700 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      textAlign: "left",
                      outline: active ? `1.5px solid ${sc2.color}40` : "none",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: sc2.color,
                        flexShrink: 0,
                      }}
                    />
                    {STATUS_LABEL[s]}
                    {active && <span style={{ marginLeft: "auto" }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {application && (
              <textarea
                defaultValue={application.notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes personnelles…"
                rows={3}
                style={{
                  width: "100%",
                  resize: "none",
                  fontSize: "0.78rem",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 10,
                  border: "1px solid rgba(20,20,16,.12)",
                  background: "#F8F6F1",
                  color: "#38382E",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  marginBottom: "0.5rem",
                  outline: "none",
                }}
              />
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {application && notes !== (application.notes ?? "") && (
                <button
                  onClick={async () => {
                    await upsert(application.status, notes);
                    setOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: 9,
                    background: color,
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Enregistrer
                </button>
              )}
              {application && (
                <button
                  onClick={async () => {
                    await remove();
                    setOpen(false);
                  }}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 9,
                    background: "#FAEBE8",
                    color: "#B8341E",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
