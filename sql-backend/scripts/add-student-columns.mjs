// Non-destructive migration: adds the new student profile columns to the live DB
// without touching existing rows (students, leadership, or anything a user already entered).
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dbFile = process.env.SQLITE_FILE || path.join(root, "data", "placementos.db");
const db = new DatabaseSync(dbFile);

const existing = db.prepare(`PRAGMA table_info("students")`).all().map((c) => c.name);
const wanted = {
  email: "TEXT",
  personal_email: "TEXT",
  phone: "TEXT",
  campus: "TEXT",
  school: "TEXT",
  gender: "TEXT",
  domain: "TEXT",
  cv_link: "TEXT",
  interest: "TEXT",
};
for (const [col, type] of Object.entries(wanted)) {
  if (!existing.includes(col)) {
    db.exec(`ALTER TABLE "students" ADD COLUMN "${col}" ${type}`);
    console.log("added column:", col);
  } else {
    console.log("already present:", col);
  }
}
db.close();
