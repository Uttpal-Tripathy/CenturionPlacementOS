// One-time seeder: populates every collection in Firestore from SEED.
// Run with: npm run seed   (reads VITE_FIREBASE_* from your environment / .env)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { SEED } from "../config/modules";
import "dotenv/config";

const cfg = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function main() {
  const db = getFirestore(initializeApp(cfg));
  for (const [name, rows] of Object.entries(SEED)) {
    const existing = await getDocs(collection(db, name));
    if (!existing.empty) { console.log(`skip ${name} (already has ${existing.size} docs)`); continue; }
    for (const row of rows) {
      await addDoc(collection(db, name), { ...row, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    console.log(`seeded ${name}: ${rows.length}`);
  }
  console.log("Done.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
