// server/auth.ts
// Server-side Google ID-token verification + session issuance + RBAC middleware.
// Implements SDD §8.3: "verify tokens server-side, issue signed session tokens,
// enforce per-route role checks keyed to the Role enumeration."
//
// npm i google-auth-library jsonwebtoken cookie-parser
// npm i -D @types/jsonwebtoken @types/cookie-parser

import { Router, type Request, type Response, type NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;      // same value as VITE_GOOGLE_CLIENT_ID
const SESSION_SECRET = process.env.SESSION_SECRET!;          // long random string
const ALLOWED_HD = process.env.ALLOWED_HOSTED_DOMAIN;        // e.g. "cutm.ac.in" (optional)
const SESSION_TTL = "8h";
const COOKIE = "placementos_session";

export type Role =
  | "Student" | "Placement Officer" | "Employer" | "Faculty" | "Administrator"
  | "Career Coordinator" | "Pursuit Manager" | "HoD" | "Dean" | "Registrar"
  | "Vice Chancellor" | "Trainer";

export interface SessionUser {
  id: string; name: string; email: string; role: Role; avatar?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: SessionUser } }
}

const oauth = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ---------------------------------------------------------------------------
 * Role assignment. In production, look the email up in your users table.
 * Here we use an explicit allow-map plus a default for the institutional domain.
 * ------------------------------------------------------------------------- */
const ROLE_MAP: Record<string, Role> = {
  "placement.officer@cutm.ac.in": "Placement Officer",
  "hod.cse@cutm.ac.in": "HoD",
  "dean@cutm.ac.in": "Dean",
  "registrar@cutm.ac.in": "Registrar",
  "vc@cutm.ac.in": "Vice Chancellor",
  "admin@cutm.ac.in": "Administrator",
};
function resolveRole(email: string, hd?: string): Role {
  if (ROLE_MAP[email]) return ROLE_MAP[email];
  // Institutional staff domain -> Faculty by default; student subdomain -> Student.
  if (hd === "cutm.ac.in") return "Faculty";
  return "Student";
}

/* ---------------------------------------------------------------------------
 * Middleware
 * ------------------------------------------------------------------------- */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.user = jwt.verify(token, SESSION_SECRET) as SessionUser;
    next();
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden for your role" });
    next();
  };
}

/* ---------------------------------------------------------------------------
 * Routes
 * ------------------------------------------------------------------------- */
export const authRouter = Router();

// Exchange a verified Google ID token for an app session cookie.
authRouter.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body ?? {};
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    const ticket = await oauth.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (!p?.email || !p.email_verified) {
      return res.status(401).json({ error: "Unverified Google account" });
    }
    if (ALLOWED_HD && p.hd !== ALLOWED_HD) {
      return res.status(403).json({ error: `Only ${ALLOWED_HD} accounts are allowed` });
    }

    const user: SessionUser = {
      id: p.sub!,
      name: p.name ?? p.email,
      email: p.email,
      role: resolveRole(p.email, p.hd),
      avatar: p.picture,
    };

    const session = jwt.sign(user, SESSION_SECRET, { expiresIn: SESSION_TTL });
    res.cookie(COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// Restore session on page reload.
authRouter.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

// Clear the session cookie.
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});
