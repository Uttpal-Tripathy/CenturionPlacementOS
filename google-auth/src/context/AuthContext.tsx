// src/context/AuthContext.tsx
// Real Google sign-in for PlacementOS using Google Identity Services (GIS).
// Replaces the mock-user switcher described in SDD §8.2 with an authenticated flow.
//
// Flow:
//   1. GIS renders the "Sign in with Google" button and returns an ID token (a JWT).
//   2. We POST that token to /api/auth/google, where the server VERIFIES it and issues
//      an httpOnly session cookie. The browser never trusts the token itself.
//   3. GET /api/auth/me restores the session on reload; POST /api/auth/logout clears it.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Role =
  | "Student" | "Placement Officer" | "Employer" | "Faculty" | "Administrator"
  | "Career Coordinator" | "Pursuit Manager" | "HoD" | "Dean" | "Registrar"
  | "Vice Chancellor" | "Trainer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (roles: Role | Role[]) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// Minimal typing for the injected GIS global.
declare global {
  interface Window {
    google?: any;
    __gisReady?: boolean;
  }
}

/** Wait for the GIS script (loaded in index.html) to be available. */
function waitForGis(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.google?.accounts?.id) return resolve();
      if (Date.now() - start > timeoutMs) return reject(new Error("Google Identity Services failed to load"));
      setTimeout(tick, 100);
    };
    tick();
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session on mount.
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]) => {
      if (!user) return false;
      return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
    },
    [user],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.google?.accounts?.id?.disableAutoSelect?.();
    } finally {
      setUser(null);
    }
  }, []);

  // Exposed so LoginPage can initialise/render the Google button.
  const value: AuthState & { _initGoogle: (el: HTMLElement) => Promise<void> } = {
    user,
    loading,
    hasRole,
    signOut,
    _initGoogle: async (el: HTMLElement) => {
      await waitForGis();
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ idToken: resp.credential }),
          });
          if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: "Sign-in failed" }));
            throw new Error(error || "Sign-in failed");
          }
          const { user } = await res.json();
          setUser(user);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
      // Optional: show the One Tap prompt as well.
      window.google.accounts.id.prompt();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx as AuthState & { _initGoogle: (el: HTMLElement) => Promise<void> };
}
