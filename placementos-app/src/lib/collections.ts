// Generic real-time CRUD for any module collection.
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Row = Record<string, any> & { id: string };

/** Live listener — fires immediately and on every server change. Returns an unsubscribe fn. */
export function subscribe(name: string, cb: (rows: Row[]) => void): () => void {
  return onSnapshot(collection(db, name), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
  );
}

export const createRecord = (name: string, data: Record<string, any>) =>
  addDoc(collection(db, name), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateRecord = (name: string, id: string, data: Record<string, any>) =>
  updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });

export const deleteRecord = (name: string, id: string) => deleteDoc(doc(db, name, id));
