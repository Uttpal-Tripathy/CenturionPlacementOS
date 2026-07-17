# Centurion PlacementOS — Complete Bundle

Campus Recruitment Lifecycle Management System for CUTM-AP, Vizianagaram.
This bundle contains every deliverable, in four formats, from quickest-to-run to
most-production-ready.

## What's inside

```
placementos.html              ← Self-contained web page. Double-click to run. No install, no
                                internet needed. All modules live on a local database; fill
                                FIREBASE_CONFIG (top of file) for real Google sign-in + cloud
                                real-time Firestore. Sign-in is restricted to @cutm.ac.in and
                                @cutmap.ac.in accounts.

placementos-app/              ← Full runnable project (Vite + React 19 + TypeScript).
placementos-app.zip             Every module live against Cloud Firestore (real-time) with
                                Google sign-in. See its README to run:
                                  npm install → set .env → npm run seed → npm run dev

google-auth/                  ← Drop-in Google OAuth for an existing Express/React codebase:
placementos-google-auth.zip     GIS front-end, server-side ID-token verification, session
                                issuance, and requireAuth / requireRole RBAC middleware.

realtime-db/                  ← Drop-in Cloud Firestore real-time data layer for an existing
placementos-realtime-db.zip     codebase: firebase init, generic CRUD + onSnapshot subscribe,
                                useLiveCollection hook, and firestore.rules (role-based).


sql-backend/                  ← SQL database tier (MySQL or PostgreSQL). Express REST API +
                                schema + seed. Set window.API_BASE in placementos.html to the
                                running API URL to store everything in SQL. See its README.

PlacementOS.jsx               ← Single-file React component (the in-chat preview build):
                                dashboard, RBAC nav, and all modules on a persistent store.
```

## Which one should I use?

- **Just want to see/use it now** → open `placementos.html`.
- **Deploying for the department** → run `placementos-app/` (real Firestore + Google login).
- **Adding auth to code you already have** → `google-auth/`.
- **Adding a real-time DB to code you already have** → `realtime-db/`.

## Common concepts across all formats

- **Modules**: Dashboard, Student Profiles, Eligibility, Applications, Preferences, Company
  Database, Job Postings, Recruitment Drives, Assessments, Interviews, Selection Tracking,
  Offer Management, Internship Management, Notifications, Email/SMS, Announcement, Placement
  Reports, Analytics, Custom Reports, Document Repository, Employer Portal, User Management.
- **RBAC**: the 12 roles and the module access matrix follow the SRS Appendix A. The same
  matrix drives the sidebar (client) and the Firestore rules / Express middleware (server).
- **Database**: a generic collection model — each module is one collection with a field
  config that drives its table, filters, and add/edit form.

## Keys you must supply (not included, and cannot be generated for you)

- **Google OAuth Client ID** — Google Cloud Console → Credentials → OAuth client ID (Web),
  with your app's origin as an Authorized JavaScript origin.
- **Firebase web config** — Firebase Console → Project settings → Web app.

Each sub-folder's README has the step-by-step setup.

— Generated for Uttpal Tripathy, Responsible AI Lab, CUTM-AP.
