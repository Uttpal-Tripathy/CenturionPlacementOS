# Centurion PlacementOS — runnable app

A complete Vite + React 19 + TypeScript app where **every module is an active portal backed by
Cloud Firestore (a real-time database)** and sign-in uses **Google**. Add / edit / delete a
record in any module and it writes to Firestore and updates live on every open client.

Active modules: Student Profiles, Eligibility Management, Applications, Placement Preferences,
Company Database, Job Postings, Recruitment Drives, Assessments, Interviews, Selection Tracking,
Offer Management, Internship Management, Notifications, Email/SMS, Announcement, Placement Reports,
Analytics Dashboard, Custom Reports, Document Repository, Employer Portal, User Management.

## Run it

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed              # one-time: loads sample data into Firestore
npm run dev               # http://localhost:5173
```

### 1. Firebase (the real-time database)
- console.firebase.google.com → create project → add a **Web app** → copy the config into the
  six `VITE_FIREBASE_*` vars in `.env`.
- **Build → Firestore Database → Create database**.
- Deploy the rules: `firebase deploy --only firestore:rules` (file: `firestore.rules`).

### 2. Google sign-in
- console.cloud.google.com → **Credentials → OAuth client ID → Web application**.
- Authorized JavaScript origins: `http://localhost:5173` (and your production URL).
- Put the client ID in `VITE_GOOGLE_CLIENT_ID`.
- No client ID yet? The login screen has a **Dev login** (pick a role, click Enter) so you can
  explore RBAC before wiring OAuth.

## How it works

- `src/lib/collections.ts` — `subscribe(name, cb)` attaches a Firestore `onSnapshot` listener;
  `createRecord` / `updateRecord` / `deleteRecord` do the writes.
- `src/hooks/useLiveCollection.ts` — React hook exposing `{ rows, loading, add, update, remove }`.
- `src/components/CollectionPage.tsx` — one generic page renders any module from its field config
  (search, filters, add/edit modal, delete, CSV export). Live count chip on every page.
- `src/config/modules.ts` — field definitions, the SRS Appendix A **RBAC matrix**, the sidebar
  nav, and the seed data. Add a module by adding one entry here.
- `firestore.rules` — server-enforced RBAC keyed to the user's role claim (students read, staff
  write, admin-only user management), matching the in-app checks.

## Roles in production
`resolveRole()` in `AuthContext.tsx` maps email → role; swap it for a Firestore `/users` lookup.
Mirror the role to a custom auth claim so `firestore.rules` can read `request.auth.token.role`:

```ts
import { getAuth } from "firebase-admin/auth";
await getAuth().setCustomUserClaims(uid, { role: "Placement Officer" });
```

## Notes
- The dev login and client-side `decodeJwt` are conveniences. For a hardened deployment, verify
  the Google ID token server-side (see the separate `placementos-google-auth` package) and issue
  a session there.
