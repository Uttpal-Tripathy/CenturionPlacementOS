# Real-Time Database for Centurion PlacementOS (Cloud Firestore)

Turns every module — Eligibility, Applications, Preferences, Companies, Jobs, Drives,
Assessments, Interviews, Selection Tracking, Offers, Internships, Notifications,
Email/SMS, Announcements, Reports, Analytics, Custom Reports, Documents, Employer Portal —
into a **live, shared database**. A change made by any user appears on every open screen
instantly through Firestore's real-time listeners (no polling, no refresh).

## Why Firestore
It's Google's real-time database, so it slots into the same Google account / OAuth you just
added: the signed-in Google user *is* the Firestore user, and access is enforced by security
rules keyed to the same `Role` values from the SRS.

## Setup

1. **Create a project** at console.firebase.google.com → add a **Web app** → copy the config.
2. Copy `.env.firebase.example` → `.env` and fill the six `VITE_FIREBASE_*` values.
3. Install the SDK: `npm i firebase`
4. Drop in the files:
   - `src/lib/firebase.ts` — SDK init
   - `src/lib/collections.ts` — generic CRUD + `subscribe()` real-time listener
   - `src/hooks/useLiveCollection.ts` — React hook
5. Deploy the rules: `firebase deploy --only firestore:rules` (file: `firestore.rules`).

## Wiring it into the app

The demo's `useCollection(...)` and `useLiveCollection(...)` expose the **same API**
(`{ rows, loading, add, update, remove }`), so switching the modules to the real-time DB is a
one-line change in `CollectionPage`:

```diff
- import { useCollection } from "./demo-storage";
+ import { useLiveCollection as useCollection } from "./hooks/useLiveCollection";
```

Everything else — search, filters, the add/edit modal, delete, CSV export — keeps working.
Now two people editing Offers see each other's changes live.

## Roles → security rules

Store each user's role at `/users/{uid}.role` and mirror it to a **custom claim** so
`firestore.rules` can read `request.auth.token.role`. Set the claim from a small callable /
Cloud Function or the Admin SDK when a user is created:

```ts
import { getAuth } from "firebase-admin/auth";
await getAuth().setCustomUserClaims(uid, { role: "Placement Officer" });
```

The included `firestore.rules` then enforces the SRS Appendix A matrix on the server —
students can read job/drive collections but only staff can write; user management is
administrator-only, and so on. This is the real-time counterpart to the Express `requireRole`
middleware from the Google Auth package.

## Seeding

On first run the collections are empty. Seed them once from the browser console or a script
using the `createRecord(name, data)` helper with the sample data already in the app
(`SEED` object), or import via the Firebase console.
