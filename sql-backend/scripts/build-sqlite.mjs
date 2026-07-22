// Builds the local SQLite database for PlacementOS: operational schema + the real
// leadership / 2024-2027 placement dataset already included in sql/placementos_data.postgres.sql.
// Run: node scripts/build-sqlite.mjs
import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dbFile = process.env.SQLITE_FILE || path.join(root, "data", "placementos.db");

fs.mkdirSync(path.dirname(dbFile), { recursive: true });
if (fs.existsSync(dbFile)) fs.rmSync(dbFile);
for (const ext of ["-wal", "-shm"]) { const f = dbFile + ext; if (fs.existsSync(f)) fs.rmSync(f); }

const db = new DatabaseSync(dbFile);
db.exec("PRAGMA journal_mode = WAL;");

// Postgres -> SQLite: strip the extension, drop pg-specific default expressions.
function toSqlite(sql) {
  return sql
    .replace(/^CREATE EXTENSION[^\n]*\n/gm, "")
    .replace(/UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/g, "TEXT PRIMARY KEY")
    .replace(/TIMESTAMPTZ NOT NULL DEFAULT now\(\)/g, "TEXT NOT NULL DEFAULT (datetime('now'))");
}

console.log("Creating operational schema...");
const schema = toSqlite(fs.readFileSync(path.join(root, "sql/schema.postgres.sql"), "utf8"));
db.exec(schema);

console.log("Loading real leadership + 2024-2027 placement dataset (this can take a few seconds)...");
const data = toSqlite(fs.readFileSync(path.join(root, "sql/placementos_data.postgres.sql"), "utf8"));
db.exec("BEGIN;");
db.exec(data);
db.exec("COMMIT;");

const counts = (t) => db.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n;
console.log("placement_users:", counts("placement_users"));
console.log("placement_summary:", counts("placement_summary"));
console.log("placement_offers:", counts("placement_offers"));

// Mirror the real leadership into the operational `users` table — this is what the live
// app's sign-in / User Management module actually reads.
console.log("Seeding leadership into operational users table...");
const leadership = [
  { name: "D N Rao", email: "d.n.rao@cutmap.ac.in", role: "Vice President" },
  { name: "Dr. Prashant Kumar Mohanty", email: "vc@cutmap.ac.in", role: "Vice Chancellor" },
  { name: "K V Ravi Kumar", email: "registrar@cutmap.ac.in", role: "Registrar" },
  { name: "Dr P A Sunny Dayal", email: "placement.officer@cutmap.ac.in", role: "Placement Officer" },
  { name: "Nilanjan Bhattacharya", email: "nilanjan.bhattacharya@cutmap.ac.in", role: "Pursuit Manager" },
  { name: "Administrator", email: "admin@cutmap.ac.in", role: "Administrator" },
];
const insUser = db.prepare(`INSERT OR IGNORE INTO "users" ("id","name","email","role","status") VALUES (?,?,?,?,'Active')`);
for (const u of leadership) insUser.run(crypto.randomUUID(), u.name, u.email, u.role);

// Baseline operational demo content so every module has something live to show / edit.
console.log("Seeding baseline demo content into operational tables...");
const SEED = {
  students: [
    { name: "Aarav Reddy", roll: "22CSE001", dept: "CSE", batch: "2026", cgpa: 8.9, backlogs: 0, status: "Placed" },
    { name: "Rohan Verma", roll: "22IT007", dept: "IT", batch: "2026", cgpa: 7.4, backlogs: 1, status: "Unplaced" },
  ],
  companies: [
    { name: "Infosys", industry: "IT Services", hr: "Priya Menon", email: "priya.m@infosys.com", website: "infosys.com" },
    { name: "TCS", industry: "IT Services", hr: "Rahul Das", email: "rahul.d@tcs.com", website: "tcs.com" },
  ],
  jobs: [
    { company: "Infosys", title: "Systems Engineer", roles: "Full Stack", ctc: "6.5 LPA", location: "Bengaluru", min_cgpa: 6.5, deadline: "25 Jul 2026", status: "Open" },
  ],
  internships: [
    { company: "Wipro", role: "Data Intern", duration: "3 months", stipend: "18k/mo", location: "Remote", status: "Open", deadline: "10 Aug 2026" },
  ],
  offers: [
    { student: "Aarav Reddy", company: "Infosys", role: "Systems Engineer", ctc: "6.5 LPA", offerDate: "20 Jun 2026", status: "Accepted" },
  ],
};
for (const [table, rows] of Object.entries(SEED)) {
  for (const row of rows) {
    const keys = ["id", ...Object.keys(row)];
    const vals = [crypto.randomUUID(), ...Object.values(row)];
    const cols = keys.map((k) => `"${k}"`).join(",");
    const phs = keys.map(() => "?").join(",");
    db.prepare(`INSERT INTO "${table}" (${cols}) VALUES (${phs})`).run(...vals);
  }
}

console.log("users:", counts("users"));
db.close();
console.log("Done. Database at", dbFile);
