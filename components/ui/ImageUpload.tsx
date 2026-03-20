"use client";

/**
 * components/ui/ImageUpload.tsx
 * Upload vers Supabase Storage — thème clair, classes imu-*
 */

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  bucket:       string;
  path:         string;
  value?:       string | null;
  onChange:     (url: string) => void;
  onError?:     (message: string) => void;
  accept?:      string;
  maxSizeMB?:   number;
  aspectRatio?: string;
  label?:       string;
}

function formatFileSize(b: number) {
  if (b < 1024) return `${b} o`;
  if (b < 1_048_576) return `${(b/1024).toFixed(0)} Ko`;
  return `${(b/1_048_576).toFixed(1)} Mo`;
}

const IcoUpload = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcoTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>;
const IcoLink  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;

export function ImageUpload({
  bucket, path, value, onChange, onError,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 8, aspectRatio = "16/9",
  label = "Image de couverture",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [showUrl,   setShowUrl]   = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSizeMB * 1_048_576) {
      onError?.(`Fichier trop lourd (max ${maxSizeMB} Mo, reçu ${formatFileSize(file.size)})`);
      return;
    }
    if (!accept.split(",").map(t => t.trim()).includes(file.type)) {
      onError?.("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }
    setUploading(true); setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + 12, 85)), 180);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${path}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true, contentType: file.type });
      clearInterval(iv);
      if (error) { onError?.(`Upload échoué : ${error.message}`); return; }
      setProgress(100);
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
      onChange(`${publicUrl}?t=${Date.now()}`);
    } catch { onError?.("Erreur inattendue."); }
    finally { clearInterval(iv); setUploading(false); setTimeout(() => setProgress(0), 1000); }
  }, [bucket, path, maxSizeMB, accept, onChange, onError, supabase]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) uploadFile(f);
  }, [uploadFile]);

  const applyUrl = () => {
    const url = urlInput.trim();
    if (url) { onChange(url); setUrlInput(""); setShowUrl(false); }
  };

  return (
    <div className="imu-wrap">
      <label className="aa-section-label">{label}</label>

      {value ? (
        <div className="imu-preview-wrap">
          <div className="imu-img-box" style={{ aspectRatio }}>
            <img src={value} alt="Aperçu" className="imu-img" />
            <div className="imu-overlay">
              <button type="button" className="imu-btn-replace"
                onClick={() => inputRef.current?.click()}>
                <IcoUpload /> Remplacer
              </button>
              <button type="button" className="imu-btn-del"
                onClick={() => onChange("")}>
                <IcoTrash />
              </button>
            </div>
          </div>
          <div className="imu-filename">
            ✓ {value.split("?")[0].split("/").pop() ?? "image uploadée"}
          </div>
        </div>
      ) : (
        <div>
          <div
            className={["imu-drop", dragging && "imu-drop--drag", uploading && "imu-drop--loading"].filter(Boolean).join(" ")}
            style={{ aspectRatio }}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="imu-loading-inner">
                <div className="imu-ring" />
                <div className="imu-progress-track">
                  <div className="imu-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="imu-loading-label">
                  {progress < 100 ? `${progress}%` : "Finalisation…"}
                </span>
              </div>
            ) : (
              <div className="imu-idle-inner">
                <div className="imu-icon"><IcoUpload /></div>
                <p className="imu-idle-title">
                  Glissez une image ou <span className="imu-browse">parcourir</span>
                </p>
                <p className="imu-idle-sub">JPEG · PNG · WebP · max {maxSizeMB} Mo</p>
              </div>
            )}
          </div>

          <div className="imu-url-section">
            <button type="button" className="imu-url-toggle"
              onClick={() => setShowUrl(v => !v)}>
              <IcoLink />
              {showUrl ? "Masquer" : "Ou entrer une URL externe"}
            </button>
            {showUrl && (
              <div className="imu-url-row">
                <input type="url" className="aa-field imu-url-input"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
                  placeholder="https://images.unsplash.com/…"
                />
                <button type="button" className="imu-url-ok" onClick={applyUrl}>OK</button>
              </div>
            )}
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept}
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
      />
    </div>
  );
}