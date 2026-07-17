import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, ShieldCheck, FileText, Heart, Building2, Briefcase, CalendarDays,
  ClipboardList, MessageSquare, GitBranch, Handshake, GraduationCap, Bell, Mail, Megaphone,
  BarChart3, PieChart, FileBarChart, FolderOpen, Building, UserCog, Settings, SlidersHorizontal,
  Menu, ChevronDown, LogOut, ShieldAlert,
} from "lucide-react";
import { AuthProvider, useAuth, type Role } from "./context/AuthContext";
import { NAV, MODULES, canAccess, WRITE_ROLES, ROLES } from "./config/modules";
import CollectionPage from "./components/CollectionPage";
import Dashboard from "./components/Dashboard";

const NAVY = "#0E2146", NAVY_HOVER = "#182f5c", ACTIVE = "#2563EB";
const ICONS: Record<string, any> = {
  LayoutDashboard, Users, ShieldCheck, FileText, Heart, Building2, Briefcase, CalendarDays,
  ClipboardList, MessageSquare, GitBranch, Handshake, GraduationCap, Bell, Mail, Megaphone,
  BarChart3, PieChart, FileBarChart, FolderOpen, Building, UserCog, Settings, SlidersHorizontal,
};

function GoogleG() {
  return (<svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>);
}

function Login() {
  const { initGoogle, devLogin } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("Placement Officer");
  useEffect(() => { if (ref.current) initGoogle(ref.current).catch((e) => setErr(e.message)); }, [initGoogle]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `radial-gradient(circle at 20% 20%, #16305f, ${NAVY})` }}>
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6"><h1 className="text-2xl font-bold">Centurion PlacementOS</h1><p className="text-white/60 text-sm mt-1">Campus Recruitment Lifecycle · CUTM-AP</p></div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 text-center">Sign in to continue</h2>
          <div className="mt-6 flex justify-center" ref={ref} />
          {err && <p className="text-amber-600 text-xs text-center mt-3">Google button unavailable ({err}). Use dev login below.</p>}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <label className="text-xs text-gray-500">Dev login (no OAuth) — role</label>
            <div className="flex gap-2 mt-1">
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg">{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
              <button onClick={() => devLogin(role)} className="px-4 py-2 text-sm rounded-lg text-white" style={{ background: ACTIVE }}>Enter</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-gray-300 text-xs"><GoogleG /> Google sign-in requires VITE_GOOGLE_CLIENT_ID</div>
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const { user, signOut } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  if (!user) return null;
  const nav = NAV.map((g) => ({ ...g, items: g.items.filter((i) => canAccess(user.role, i.id)) })).filter((g) => g.items.length > 0);

  const render = () => {
    if (!canAccess(user.role, active)) return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-rose-50"><ShieldAlert className="w-7 h-7 text-rose-500" /></div>
        <h3 className="text-lg font-semibold text-gray-800">Access restricted</h3>
        <p className="text-gray-500 text-sm mt-2">Your role cannot view this module.</p>
      </div>
    );
    if (active === "dashboard") return <Dashboard user={user} />;
    if (MODULES[active]) return <CollectionPage id={active} canWrite={WRITE_ROLES.includes(user.role)} />;
    return <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-500">Module “{active}” — configuration screen.</div>;
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <aside className={`${open ? "w-64" : "w-0"} transition-all duration-300 shrink-0 overflow-hidden`} style={{ background: NAVY }}>
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10"><div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div><div><p className="text-white font-bold text-sm">ERP</p><p className="text-white/60 text-xs">Placement Module</p></div></div>
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {nav.map((group, gi) => (
              <div key={gi} className="mb-1">
                {group.section && <p className="text-white/40 text-[10px] font-semibold tracking-wider px-3 mt-4 mb-1">{group.section}</p>}
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon] || LayoutDashboard; const is = active === item.id;
                  return (
                    <button key={item.id} onClick={() => setActive(item.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5"
                      style={{ background: is ? ACTIVE : "transparent", color: is ? "#fff" : "rgba(255,255,255,0.7)" }}
                      onMouseEnter={(e) => { if (!is) e.currentTarget.style.background = NAVY_HOVER; }} onMouseLeave={(e) => { if (!is) e.currentTarget.style.background = "transparent"; }}>
                      <Icon className="w-4 h-4 shrink-0" /> <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
          <button onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
          <span className="text-xs text-gray-400 hidden sm:block">Centurion PlacementOS · CUTM-AP Vizianagaram</span>
          <div className="flex-1" />
          <div className="relative"><Bell className="w-6 h-6 text-gray-500" /><span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">12</span></div>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">{user.initials}</div>
              <div className="text-left hidden sm:block"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-500">{user.role}</p></div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {menu && <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
              <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-500 truncate">{user.email}</p><p className="text-xs text-blue-600 mt-1">{user.role}</p></div>
              <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><LogOut className="w-4 h-4" /> Sign out</button>
            </div>}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{render()}</main>
      </div>
    </div>
  );
}

function Gate() { const { user } = useAuth(); return user ? <Shell /> : <Login />; }
export default function App() { return <AuthProvider><Gate /></AuthProvider>; }
