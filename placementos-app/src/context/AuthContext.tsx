import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Role =
  | "Placement Officer" | "Student" | "Career Coordinator" | "Administrator"
  | "Employer" | "Faculty" | "Pursuit Manager" | "HoD" | "Dean" | "Registrar"
  | "Vice Chancellor" | "Trainer";

export interface AuthUser { name: string; email: string; role: Role; avatar?: string; initials: string; }

interface Ctx {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (r: Role | Role[]) => boolean;
  signOut: () => void;
  initGoogle: (el: HTMLElement) => Promise<void>;
  devLogin: (role: Role) => void; // convenience for local testing without OAuth
}

const AuthContext = createContext<Ctx | undefined>(undefined);
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// Map an email to a role. Replace with a Firestore /users lookup in production.
const ROLE_MAP: Record<string, Role> = {
  "rajesh.kumar@cutm.ac.in": "Placement Officer",
  "admin@cutm.ac.in": "Administrator",
};
function resolveRole(email: string): Role {
  if (ROLE_MAP[email]) return ROLE_MAP[email];
  return email.endsWith("@cutm.ac.in") ? "Faculty" : "Student";
}
function decodeJwt(token: string): any {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return {}; }
}
const initials = (name: string) => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

function waitForGis(timeout = 8000): Promise<void> {
  return new Promise((res, rej) => {
    const t0 = Date.now();
    const tick = () => {
      if ((window as any).google?.accounts?.id) return res();
      if (Date.now() - t0 > timeout) return rej(new Error("Google Identity Services failed to load"));
      setTimeout(tick, 100);
    };
    tick();
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore a previous session (persisted only as identity, not as a trusted token).
  useEffect(() => {
    const raw = sessionStorage.getItem("placementos_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);
  useEffect(() => {
    if (user) sessionStorage.setItem("placementos_user", JSON.stringify(user));
    else sessionStorage.removeItem("placementos_user");
  }, [user]);

  const hasRole = useCallback(
    (r: Role | Role[]) => (!user ? false : Array.isArray(r) ? r.includes(user.role) : user.role === r),
    [user],
  );

  const signOut = useCallback(() => {
    (window as any).google?.accounts?.id?.disableAutoSelect?.();
    setUser(null);
  }, []);

  const devLogin = useCallback((role: Role) => {
    setUser({ name: "Rajesh Kumar", email: "rajesh.kumar@cutm.ac.in", role, initials: "RK" });
  }, []);

  const initGoogle = useCallback(async (el: HTMLElement) => {
    await waitForGis();
    const g = (window as any).google;
    g.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (resp: { credential: string }) => {
        const p = decodeJwt(resp.credential); // NOTE: verify server-side in production (see google-auth pkg)
        const email = p.email as string;
        setUser({ name: p.name || email, email, role: resolveRole(email), avatar: p.picture, initials: initials(p.name || email) });
      },
      auto_select: false,
    });
    g.accounts.id.renderButton(el, { theme: "outline", size: "large", width: 320, text: "signin_with", shape: "rectangular" });
    g.accounts.id.prompt();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasRole, signOut, initGoogle, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
