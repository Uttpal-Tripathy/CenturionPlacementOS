// server/server.integration.ts
// Snippet showing HOW to wire auth.ts into your existing server.ts.
// Copy the marked lines into your real server.ts around the existing Express setup.

import express from "express";
import cookieParser from "cookie-parser";
import { authRouter, requireAuth, requireRole } from "./auth";

const app = express();

// --- ADD THESE (order matters: parsers before routes) --------------------
app.use(express.json({ limit: "50mb" }));   // already present in your build
app.use(cookieParser());                      // NEW: reads the session cookie
app.use("/api/auth", authRouter);             // NEW: /api/auth/google | /me | /logout
// -------------------------------------------------------------------------

// Protect the Gemini proxy endpoints. Any signed-in user may use the AI tools;
// tighten with requireRole(...) where a module is role-restricted (see SRS App. A).
app.post("/api/optimize-resume", requireAuth, /* ...existing handler... */ (req, res) => {});
app.post("/api/generate-assessment", requireAuth, (req, res) => {});
app.post("/api/evaluate-assessment", requireAuth, (req, res) => {});
app.post("/api/validate-code", requireAuth, (req, res) => {});
app.post("/api/career-mentor", requireAuth, (req, res) => {});

// Service Monitoring is Administrator-only (FR-17.5 / NFR-04).
app.get("/api/metrics", requireAuth, requireRole("Administrator"), (req, res) => {});

// Example of a data route gated to placement staff once persistence is added:
// app.get("/api/students", requireAuth,
//   requireRole("Placement Officer", "Administrator", "Career Coordinator", "HoD", "Dean"),
//   studentsHandler);

export default app;
