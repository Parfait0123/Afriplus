"use client";

/**
 * hooks/useToast.ts
 * Système de toast global via Context
 * Usage : const { toast } = useToast()
 *         toast.success("Article publié !")
 *         toast.error("Erreur Supabase")
 *         toast.warning("Deadline dépassée")
 *         toast.info("Brouillon enregistré")
 */

import { createContext, useContext, useState, useCallback, useId } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id:       string;
  type:     ToastType;
  title:    string;
  message?: string;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  add:    (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans un ToastProvider");
  return ctx;
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => remove(id), toast.duration);
  }, [remove]);

  const success = useCallback((title: string, message?: string) =>
    add({ type: "success", title, message, duration: 4000 }), [add]);

  const error = useCallback((title: string, message?: string) =>
    add({ type: "error", title, message, duration: 6000 }), [add]);

  const warning = useCallback((title: string, message?: string) =>
    add({ type: "warning", title, message, duration: 5000 }), [add]);

  const info = useCallback((title: string, message?: string) =>
    add({ type: "info", title, message, duration: 4000 }), [add]);

  return { toasts, add, remove, success, error, warning, info };
}