// src/lib/collections.ts
// Generic Firestore CRUD + real-time subscription for any PlacementOS module.
// Every module (students, jobs, drives, offers, …) is a Firestore collection.

import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, serverTimestamp, type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export type Row = DocumentData & { id: string };

/** Live subscription: fires `cb` immediately and again on every server change. */
export function subscribe(name: string, cb: (rows: Row[]) => void): () => void {
  const q = query(collection(db, name), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    // Fallback if a doc has no updatedAt yet (unordered):
    () => onSnapshot(collection(db, name), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
  );
}

export async function createRecord(name: string, data: Record<string, unknown>) {
  return addDoc(collection(db, name), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateRecord(name: string, id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRecord(name: string, id: string) {
  return deleteDoc(doc(db, name, id));
}
