// src/components/LoginPage.tsx
// Renders the real Google Sign-In button (via AuthContext._initGoogle) and a route guard.

import React, { useEffect, useRef, useState } from "react";
import { useAuth, type Role } from "../context/AuthContext";

export function LoginPage() {
  const { _initGoogle } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (btnRef.current) {
      _initGoogle(btnRef.current).catch((e) => setErr(e.message));
    }
  }, [_initGoogle]);

  return (
    <div
      style={{ background: "radial-gradient(circle at 20% 20%, #16305f, #0E2146)" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6">
          <h1 className="text-2xl font-bold">Centurion PlacementOS</h1>
          <p className="text-white/60 text-sm mt-1">Campus Recruitment Lifecycle Management · CUTM-AP</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 text-center">Sign in to continue</h2>
          <p className="text-gray-500 text-sm text-center mt-1">Use your institutional Google account (@cutm.ac.in)</p>
          <div className="mt-6 flex justify-center" ref={btnRef} />
          {err && <p className="text-rose-500 text-xs text-center mt-4">{err}</p>}
        </div>
      </div>
    </div>
  );
}

/** Wrap the whole app. Shows a loader while restoring the session, LoginPage if signed out. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading session…
      </div>
    );
  }
  if (!user) return <LoginPage />;
  return <>{children}</>;
}

/** Gate individual pages/actions by role (mirrors server-side enforcement). */
export function RoleProtected({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { hasRole } = useAuth();
  if (!hasRole(roles)) {
    return (
      <div className="p-16 text-center text-gray-500">
        <h3 className="text-lg font-semibold text-gray-800">Access restricted</h3>
        <p className="text-sm mt-2">Your role does not have permission to view this module.</p>
      </div>
    );
  }
  return <>{children}</>;
}
