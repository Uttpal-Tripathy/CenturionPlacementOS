// PlacementOS SQL API — the tier between the browser app and MySQL/PostgreSQL.
// A browser cannot connect to SQL directly; it calls these REST endpoints instead.
//
//   GET    /api/:table         list rows
//   POST   /api/:table         create row      (body = column:value)
//   PUT    /api/:table/:id      update row
//   DELETE /api/:table/:id      delete row
//
// Works with Postgres (DB_KIND=postgres) or MySQL (DB_KIND=mysql).
//   npm i express cors dotenv pg mysql2
//   node server/server.js

import express from "express";
import cors from "cors";
import crypto from "crypto";
import XLSX from "xlsx";
import "dotenv/config";

const KIND = (process.env.DB_KIND || "postgres").toLowerCase();
const PORT = process.env.PORT || 4000;
const API_TOKEN = process.env.API_TOKEN || ""; // optional bearer token; empty = open (dev only)

// Allowed tables and their writable columns (whitelist prevents SQL injection via identifiers).
const TABLES = {
  users:["name","email","role","status"],
  students:["name","roll","dept","batch","cgpa","backlogs","status","email","personal_email","phone","campus","school","gender","domain","cv_link","interest","gfg_score","tenth_pct","twelfth_pct"],
  companies:["name","industry","hr","email","website"],
  jobs:["company","title","roles","ctc","location","min_cgpa","deadline","status","source","apply_url"],
  internships:["company","role","duration","stipend","location","status","deadline"],
  drives:["company","role","date","mode","venue","status"],
  eligibility:["name","roll","dept","cgpa","backlogs","status"],
  applications:["student","email","company","title","type","status","applied"],
  assessments:["company","role","type","date","time","duration","status"],
  interviews:["student","company","round","date","time","mode","status"],
  tracking:["company","role","applied","shortlisted","interview","selected","status"],
  offers:["student","company","role","ctc","offerDate","status"],
  preferences:["student","locations","industries","roles","expectedCtc","relocation"],
  notifications:["title","category","audience","date"],
  email:["template","type","subject","body"],
  announcement:["title","audience","date","body"],
  reports:["name","period","type","generatedOn"],
  custom:["name","dataset","createdBy","createdOn"],
  documents:["name","type","owner","date","size","email","dataUrl"],
  employer:["company","title","positions","status","postedOn"],
  profiles:["email","name","headline","skills","location","education","phone","resumeName","resumeUrl","photoUrl"],
  savedjobs:["email","itemId","company","title"],
  offerletters:["student","email","company","role","fileName","dataUrl","updatedAt","driveRefId","verificationStatus","verificationNote"],
  assessmentresults:["student","email","aptitude","coding","gd","total","band","date"],
  cv_documents:["email","roll","student","jobType","summary","skills","projects","certifications","experience","atsScore"],
  // Pursuit Manager: placement drive lifecycle (exclusive to that role — see ACCESS.pmdrives in placementos.html)
  placement_drives:["refId","recruiterName","recruiterProfile","website","jobTitle","jobProfile","jobSkill",
    "ctc","selectionProcess","jobLocation","eligibleBranches","eligibleBatch","minCgpa","maxBacklogs",
    "expectedDriveDate","registrationLink","registrationDeadline","trainingNeed","releasedBy","status",
    "reportingTime","venue","requiredDocuments","dressCode","interviewSchedule","companyInstructions",
    "notifiedAt","campusCommunicatedAt","resultsDeclaredAt","createdBy"],
  drive_students:["driveRefId","roll","name","email","dept","batch","cgpaAtEntry","backlogsAtEntry",
    "registrationStatus","registeredAt","reminderSent","reminderSentAt","attendance",
    "roundAptitude","roundTechnical","roundCoding","roundGD","roundHR","finalStatus","readStatus","ackStatus"],
  drive_notifications:["driveRefId","type","channel","recipientCount","sentAt","sentBy","deliveryStatus","note"],
  // Real historical data (2024-2027 placement workbooks) — leadership, per-school stats, offer records.
  placement_users:["name","email","role","status"],
  placement_summary:["year","school","total_students","interested","drives","offers","placed","multiple_offers","placement_pct"],
  placement_offers:["year","regno","name","campus","school","branch","gender","company","ctc","manager","job_type","offer_status"],
};

/* ---------------- DB adapter (Postgres, MySQL, or local SQLite) ---------------- */
let db;
if (KIND === "sqlite") {
  const { DatabaseSync } = await import("node:sqlite");
  const path = (await import("path")).default;
  const fs = (await import("fs")).default;
  const file = process.env.SQLITE_FILE || "./data/placementos.db";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new DatabaseSync(file);
  sqlite.exec("PRAGMA journal_mode = WAL;");
  db = {
    quote: (id) => '"' + id.replace(/"/g, "") + '"',
    ph: () => "?",
    now: "datetime('now')", // SQLite has no now(); this is its equivalent
    async q(text, params = []) {
      const stmt = sqlite.prepare(text.replace(/\$(\d+)/g, "?"));
      if (/^\s*select/i.test(text)) return stmt.all(...params);
      stmt.run(...params);
      return [];
    },
  };
} else if (KIND === "mysql") {
  const mysql = (await import("mysql2/promise")).default;
  const pool = mysql.createPool(process.env.DATABASE_URL || {
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS,
    database: process.env.DB_NAME, port: process.env.DB_PORT || 3306, connectionLimit: 10,
  });
  db = {
    quote: (id) => "`" + id.replace(/`/g, "") + "`",
    ph: () => "?",
    now: "now()",
    async q(text, params = []) { const [rows] = await pool.query(text.replace(/\$\d+/g, "?"), params); return rows; },
  };
} else {
  const pg = (await import("pg")).default;
  const pool = new pg.Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS,
    database: process.env.DB_NAME, port: process.env.DB_PORT || 5432,
  });
  db = {
    quote: (id) => '"' + id.replace(/"/g, "") + '"',
    ph: (i) => "$" + i,
    now: "now()",
    async q(text, params = []) { const r = await pool.query(text, params); return r.rows; },
  };
}

/* ---------------- App ---------------- */
const app = express();
app.use(cors());                       // allow the browser app to call this API
app.use(express.json({ limit: "5mb" }));

// Optional bearer-token gate.
app.use("/api", (req, res, next) => {
  if (!API_TOKEN) return next();
  const t = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (t !== API_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
});

const validTable = (t) => Object.prototype.hasOwnProperty.call(TABLES, t);
const pick = (table, body) => {
  const cols = TABLES[table];
  const out = {};
  for (const k of Object.keys(body || {})) if (cols.includes(k)) out[k] = body[k];
  return out;
};

app.get("/api/:table", async (req, res) => {
  const { table } = req.params;
  if (!validTable(table)) return res.status(404).json({ error: "Unknown table" });
  try { res.json(await db.q(`SELECT * FROM ${db.quote(table)} ORDER BY created_at DESC`)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/:table", async (req, res) => {
  const { table } = req.params;
  if (!validTable(table)) return res.status(404).json({ error: "Unknown table" });
  const data = pick(table, req.body);
  const id = crypto.randomUUID();
  const keys = ["id", ...Object.keys(data)];
  const vals = [id, ...Object.values(data)];
  const cols = keys.map(db.quote).join(",");
  const phs = keys.map((_, i) => db.ph(i + 1)).join(",");
  try {
    await db.q(`INSERT INTO ${db.quote(table)} (${cols}) VALUES (${phs})`, vals);
    const rows = await db.q(`SELECT * FROM ${db.quote(table)} WHERE id = ${db.ph(1)}`, [id]);
    res.status(201).json(rows[0] || { id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!validTable(table)) return res.status(404).json({ error: "Unknown table" });
  const data = pick(table, req.body);
  const keys = Object.keys(data);
  if (!keys.length) return res.status(400).json({ error: "No valid columns" });
  const set = keys.map((k, i) => `${db.quote(k)} = ${db.ph(i + 1)}`).join(", ");
  const params = [...Object.values(data), id];
  try {
    await db.q(`UPDATE ${db.quote(table)} SET ${set}, ${db.quote("updated_at")} = ${db.now} WHERE id = ${db.ph(keys.length + 1)}`, params);
    const rows = await db.q(`SELECT * FROM ${db.quote(table)} WHERE id = ${db.ph(1)}`, [id]);
    res.json(rows[0] || { id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!validTable(table)) return res.status(404).json({ error: "Unknown table" });
  try { await db.q(`DELETE FROM ${db.quote(table)} WHERE id = ${db.ph(1)}`, [id]); res.json({ ok: true, id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Real .xlsx exports (built server-side with SheetJS — the browser app has no XLSX writer of its own).
const xlsxDownload = (res, wb, filename) => {
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(Buffer.from(buf));
};

// One table -> one-sheet workbook (used by the "Export Excel" button on every module page).
app.get("/api/export/:table/xlsx", async (req, res) => {
  const { table } = req.params;
  if (!validTable(table)) return res.status(404).json({ error: "Unknown table" });
  try {
    const rows = await db.q(`SELECT * FROM ${db.quote(table)} ORDER BY created_at DESC`);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), table.slice(0, 31));
    xlsxDownload(res, wb, `${table}.xlsx`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Pursuit Manager: one drive's Final Placement Report -> a 3-sheet workbook (Drive Summary,
// Student-wise Status, Offer Letters). Spans 3 tables, so the generic single-table endpoint above
// isn't enough for this one.
app.get("/api/report/drive/:refId/xlsx", async (req, res) => {
  const { refId } = req.params;
  try {
    const drive = (await db.q(`SELECT * FROM ${db.quote("placement_drives")} WHERE ${db.quote("refId")} = ${db.ph(1)}`, [refId]))[0];
    const students = await db.q(`SELECT * FROM ${db.quote("drive_students")} WHERE ${db.quote("driveRefId")} = ${db.ph(1)}`, [refId]);
    const letters = await db.q(`SELECT * FROM ${db.quote("offerletters")} WHERE ${db.quote("driveRefId")} = ${db.ph(1)}`, [refId]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([drive || {}]), "Drive Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(students.length ? students : [{}]), "Student-wise Status");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(letters.length ? letters : [{}]), "Offer Letters");
    xlsxDownload(res, wb, `drive-${refId}-final-report.xlsx`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Every table -> one workbook, one sheet each (the "download full backup" button).
app.get("/api/export/xlsx", async (_req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    for (const table of Object.keys(TABLES)) {
      const rows = await db.q(`SELECT * FROM ${db.quote(table)} ORDER BY created_at DESC`).catch(() => []);
      const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
      XLSX.utils.book_append_sheet(wb, ws, table.slice(0, 31));
    }
    xlsxDownload(res, wb, `placementos-backup-${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/health", (_req, res) => res.json({ ok: true, db: KIND }));

app.listen(PORT, () => console.log(`PlacementOS SQL API (${KIND}) on http://localhost:${PORT}`));
