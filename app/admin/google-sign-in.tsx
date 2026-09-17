"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./admin.module.css";

declare global {
  interface Window {
    google?: {
      accounts: { id: {
        initialize(options: { client_id: string; callback: (response: { credential?: string }) => void; auto_select: boolean }): void;
        renderButton(element: HTMLElement, options: Record<string, string | number>): void;
      } };
    };
  }
}

export default function GoogleSignIn({ clientId }: { clientId: string }) {
  const button = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.google || !button.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: async ({ credential }) => {
          if (!credential) return setError("Google sign-in did not complete. Please try again.");
          setError("");
          try {
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential }),
            });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error || "Google sign-in failed");
            window.location.assign("/admin");
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Google sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(button.current, {
        type: "standard", theme: "outline", size: "large", text: "signin_with", shape: "pill", width: 280,
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (window.google) render();
      else existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => setError("Google sign-in could not load. Please refresh and try again.");
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [clientId]);

  return <div className={styles.googleLogin}><div ref={button}/>{error && <p role="alert">{error}</p>}</div>;
}
