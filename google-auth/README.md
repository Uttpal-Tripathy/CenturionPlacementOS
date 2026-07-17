# Google Auth for Centurion PlacementOS

Adds real Google Sign-In to PlacementOS, replacing the mock-user switcher (SDD §8.2 → §8.3).
The browser gets a Google **ID token**; the Express server **verifies** it, maps the email to a
`Role`, and issues an **httpOnly session cookie**. RBAC is then enforced server-side on every route.

```
Browser (GIS button) --idToken--> POST /api/auth/google --verify--> set session cookie
                                                                     |
GET /api/auth/me  <----------- restores session on reload ----------+
POST /api/auth/logout --------- clears the cookie
```

## 1. Get a Client ID (Google Cloud Console)

1. Go to **console.cloud.google.com** → create/select a project.
2. **APIs & Services → OAuth consent screen** → choose *Internal* (Workspace) or *External*; add app name and your email.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins** — add every origin you serve the app from:
   - `http://localhost:5173` (Vite dev)
   - `http://localhost:3000` (or whatever your Express port is)
   - your production URL, e.g. `https://placements.cutm.ac.in`
6. Create → copy the **Client ID** (looks like `…apps.googleusercontent.com`).

> This is why live Google sign-in cannot run inside the Claude artifact preview: the sandbox
> origin is not (and cannot be) one of your Authorized JavaScript origins.

## 2. Configure environment

Copy `.env.example` to `.env` and fill in the Client ID in **both** `VITE_GOOGLE_CLIENT_ID`
and `GOOGLE_CLIENT_ID`. Generate a `SESSION_SECRET`. Set `ALLOWED_HOSTED_DOMAIN=cutm.ac.in`
to lock sign-in to your Workspace (or leave blank to allow any Google account).

## 3. Install dependencies

```bash
npm i google-auth-library jsonwebtoken cookie-parser
npm i -D @types/jsonwebtoken @types/cookie-parser
```

## 4. Load the GIS script

Add to `index.html` inside `<head>`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

## 5. Drop in the files

| File | Destination |
|------|-------------|
| `src/context/AuthContext.tsx` | `src/context/AuthContext.tsx` |
| `src/components/LoginPage.tsx` | `src/components/LoginPage.tsx` |
| `server/auth.ts` | `server/auth.ts` |

Then wire the server (see `server/server.integration.ts`): add `cookie-parser`,
mount `authRouter` at `/api/auth`, and wrap the Gemini routes with `requireAuth`
(and `requireRole(...)` where the SRS role matrix restricts a module).

## 6. Wrap the React app

In `src/main.tsx` / `src/App.tsx`:

```tsx
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth } from "./components/LoginPage";

<AuthProvider>
  <RequireAuth>
    <Layout />   {/* your existing routed shell */}
  </RequireAuth>
</AuthProvider>
```

Replace the old `mockUsers` switcher with `useAuth()`:

```tsx
const { user, hasRole, signOut } = useAuth();
// Sidebar: navConfig items stay visible only when hasRole(item.roles)
// Header user chip: {user.name} / {user.role}, with a Sign out button calling signOut()
```

## 7. Role assignment

`server/auth.ts` → `resolveRole()` currently uses a small `ROLE_MAP` plus a domain default.
Once the persistent `users` table (SDD §5.3) exists, replace it with a DB lookup so roles are
managed in-app rather than in code.

## Security notes

- The ID token is **never trusted client-side** — only the server-verified session cookie is.
- The cookie is `httpOnly` + `sameSite=lax`, and `secure` in production (serve over HTTPS).
- `verifyIdToken` checks the token signature, expiry, issuer, and that `audience` equals your
  Client ID — this is what stops forged/replayed tokens.
