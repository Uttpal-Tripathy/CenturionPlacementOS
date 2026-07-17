// Imports real student profile data from the CUTM-AP placement workbook into the
// operational `students` table. Upserts on roll number so re-running is safe.
//
// Usage: node scripts/import-students-xlsx.mjs "<path to .xlsx>" [batch]
import { DatabaseSync } from "node:sqlite";
import XLSX from "xlsx";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dbFile = process.env.SQLITE_FILE || path.join(root, "data", "placementos.db");
const filePath = process.argv[2];
const batch = process.argv[3] || "2027";
if (!filePath) { console.error("Usage: node import-students-xlsx.mjs <xlsx path> [batch]"); process.exit(1); }

// Sheets that aren't clean per-student rosters (scrambled pairing / duplicate partial listing).
const SKIP_SHEETS = new Set(["Sheet3", "Sheet9"]);

function findKey(row, ...substrings) {
  const keys = Object.keys(row);
  for (const s of substrings) {
    const hit = keys.find((k) => k.toLowerCase().includes(s.toLowerCase()));
    if (hit && row[hit] !== null && row[hit] !== undefined && row[hit] !== "") return row[hit];
  }
  return null;
}
const asText = (v) => (v === null || v === undefined ? null : String(v).trim() || null);
const asNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const wb = XLSX.readFile(filePath);
const db = new DatabaseSync(dbFile);
const upsert = db.prepare(`
  INSERT INTO "students" ("id","name","roll","dept","batch","cgpa","backlogs","status","email","personal_email","phone","campus","school","gender","domain","cv_link","interest","gfg_score")
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT("roll") DO UPDATE SET
    name=excluded.name, dept=excluded.dept, batch=excluded.batch, cgpa=excluded.cgpa, backlogs=excluded.backlogs,
    email=excluded.email, personal_email=excluded.personal_email, phone=excluded.phone, campus=excluded.campus,
    school=excluded.school, gender=excluded.gender, domain=excluded.domain, cv_link=excluded.cv_link,
    interest=excluded.interest, gfg_score=excluded.gfg_score, updated_at=(datetime('now'))
`);

let imported = 0, skipped = 0;
const perSheet = {};

for (const sheetName of wb.SheetNames) {
  if (SKIP_SHEETS.has(sheetName)) continue;
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null });
  let sheetCount = 0;
  for (const row of rows) {
    const roll = asText(findKey(row, "college reg no", "registration number"));
    const name = asText(findKey(row, "students name", "name"));
    if (!roll || !name || !/^\d+$/.test(roll)) { skipped++; continue; } // drops section-header / malformed rows

    const dept = asText(findKey(row, "branch", "program")) || sheetName;
    const cgpa = asNumber(findKey(row, "current cgpa", "current cgps"));
    const backlogs = asNumber(findKey(row, "backlogs"));
    const email = asText(findKey(row, "college mail id", "e-mail"));
    const personalEmail = asText(findKey(row, "personal mail id"));
    const phone = asText(findKey(row, "contact number"));
    const campus = asText(findKey(row, "campus")) || "CUTM-AP Vizianagaram";
    const school = asText(findKey(row, "school"));
    const gender = asText(findKey(row, "gender"));
    const domain = asText(findKey(row, "domain"));
    const cvLink = asText(findKey(row, "cv link"));
    const interest = asText(findKey(row, "interested for job"));
    const gfgScore = asNumber(findKey(row, "geeks for geeks score", "geeksforgeeks"));

    upsert.run(
      crypto.randomUUID(), name, roll, dept, batch,
      cgpa, backlogs ?? 0, "Unplaced",
      email, personalEmail, phone, campus, school, gender, domain, cvLink, interest, gfgScore
    );
    imported++; sheetCount++;
  }
  if (sheetCount) perSheet[sheetName] = sheetCount;
}

console.log("Imported/updated per sheet:", perSheet);
console.log("Total imported:", imported, "| skipped (no roll/name):", skipped);
const total = db.prepare(`SELECT COUNT(*) AS n FROM "students"`).get().n;
const withEmail = db.prepare(`SELECT COUNT(*) AS n FROM "students" WHERE email IS NOT NULL`).get().n;
console.log("students table now has:", total, "rows |", withEmail, "with an institutional email");
db.close();
