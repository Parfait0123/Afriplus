"use client";

/**
 * components/ui/ImageUpload.tsx
 * Composant d'upload d'image vers Supabase Storage
 *
 * Usage :
 *   <ImageUpload
 *     bucket="articles"
 *     path={`articles/${slug}`}
 *     value={imageUrl}
 *     onChange={(url) => setImageUrl(url)}
 *     onError={(msg) => toast.error(msg)}
 *   />
 */

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatFileSize } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

interface ImageUploadProps {
  bucket:      string;
  path:        string;
  value?:      string | null;
  onChange:    (url: string) => void;
  onError?:    (message: string) => void;
  accept?:     string;
  maxSizeMB?:  number;
  aspectRatio?: string;   // ex: "16/9", "1/1"
  label?:      string;
}

const IcoUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IcoImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

const IcoTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
  </svg>
);

const IcoLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

export function ImageUpload({
  bucket, path, value, onChange, onError,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  aspectRatio = "16/9",
  label = "Image de couverture",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const [showUrl,   setShowUrl]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = useCallback(async (file: File) => {
    // Validation taille
    if (file.size > maxSizeMB * 1_048_576) {
      onError?.(`Fichier trop lourd (max ${maxSizeMB} Mo, reçu ${formatFileSize(file.size)})`);
      return;
    }
    // Validation type
    if (!accept.split(",").some(t => file.type === t.trim())) {
      onError?.("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Nom unique
      const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${path}-${Date.now()}.${ext}`;

      // Simuler la progression (Supabase ne supporte pas encore le progress natif)
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: true, contentType: file.type });

      clearInterval(progressInterval);

      if (uploadError) {
        onError?.(`Upload échoué : ${uploadError.message}`);
        return;
      }

      setProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      onChange(`${publicUrl}?t=${Date.now()}`);
    } catch (err) {
      onError?.("Erreur inattendue lors de l'upload.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }, [bucket, path, maxSizeMB, accept, onChange, onError, supabase]);

  const handleFile = useCallback((file: File | undefined) => {
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrl(false);
    }
  };

  const handleRemove = () => onChange("");

  return (
    <div>
      <div style={{
        fontSize: "0.78rem", fontWeight: 600,
        color: "rgba(248,246,241,.55)",
        marginBottom: "0.65rem",
        letterSpacing: "0.03em",
      }}>
        {label}
      </div>

      {/* Prévisualisation si image existante */}
      {value ? (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
          <div style={{
            aspectRatio,
            background: "#0a0800",
            position: "relative",
          }}>
            <img
              src={value}
              alt="Aperçu"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
              }}
            />

            {/* Overlay actions */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.6) 100%)",
              display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
              padding: "0.85rem",
              gap: "0.5rem",
            }}>
              {/* Remplacer */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.5rem 0.85rem", borderRadius: 8,
                  background: "rgba(248,246,241,.9)",
                  border: "none", cursor: "pointer",
                  fontSize: "0.72rem", fontWeight: 700,
                  color: "#141410",
                  backdropFilter: "blur(8px)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                <IcoUpload /> Remplacer
              </button>

              {/* Supprimer */}
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(184,52,30,.85)",
                  border: "none", cursor: "pointer",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
              >
                <IcoTrash />
              </button>
            </div>
          </div>

          {/* URL affichée */}
          <div style={{
            padding: "0.6rem 0.85rem",
            background: "rgba(248,246,241,.04)",
            border: "1px solid rgba(248,246,241,.06)",
            borderTop: "none",
            borderRadius: "0 0 14px 14px",
            display: "flex", alignItems: "center", gap: "0.4rem",
          }}>
            <IcoImage />
            <span style={{
              fontSize: "0.65rem", color: "rgba(248,246,241,.3)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              flex: 1,
            }}>
              {value}
            </span>
          </div>
        </div>
      ) : (
        /* Zone de dépôt */
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              aspectRatio,
              border: `2px dashed ${dragging ? "#C08435" : "rgba(248,246,241,.12)"}`,
              borderRadius: 14,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "0.85rem",
              cursor: uploading ? "wait" : "pointer",
              background: dragging
                ? "rgba(192,132,53,.05)"
                : "rgba(248,246,241,.02)",
              transition: "all .2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {uploading ? (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <Spinner size={32} />
                <div style={{ width: 160 }}>
                  <div style={{
                    height: 3, background: "rgba(248,246,241,.1)", borderRadius: 100, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", background: "#C08435", borderRadius: 100,
                      width: `${progress}%`, transition: "width .2s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(248,246,241,.3)", marginTop: "0.5rem" }}>
                    {progress < 100 ? "Upload en cours…" : "Traitement…"}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(192,132,53,.1)",
                  border: "1px solid rgba(192,132,53,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#C08435",
                }}>
                  <IcoUpload />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(248,246,241,.65)" }}>
                    Glissez une image ou <span style={{ color: "#C08435" }}>parcourir</span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(248,246,241,.25)", marginTop: "0.3rem" }}>
                    JPEG, PNG, WebP — max {maxSizeMB} Mo
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Option URL */}
          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setShowUrl(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.72rem", color: "rgba(248,246,241,.35)",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                padding: "0.25rem 0",
              }}
            >
              <IcoLink />
              {showUrl ? "Masquer" : "Ou entrer une URL directement"}
            </button>

            {showUrl && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleUrlSubmit(); } }}
                  placeholder="https://…"
                  style={{
                    flex: 1,
                    background: "rgba(248,246,241,.05)",
                    border: "1px solid rgba(248,246,241,.1)",
                    borderRadius: 10,
                    padding: "0.6rem 0.85rem",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "0.82rem", color: "#F8F6F1",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  style={{
                    padding: "0.6rem 1rem", borderRadius: 10,
                    background: "#C08435", border: "none",
                    color: "#fff", fontWeight: 700, fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input fichier caché */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}