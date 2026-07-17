// src/hooks/useLiveCollection.ts
// Drop-in replacement for the demo's useCollection: same API, but backed by a
// REAL-TIME Firestore listener. Any change from any client updates every open
// screen instantly — no polling, no refresh.

import { useEffect, useState, useCallback } from "react";
import { subscribe, createRecord, updateRecord, deleteRecord, type Row } from "../lib/collections";

export function useLiveCollection(name: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribe(name, (data) => { setRows(data); setLoading(false); });
    return () => unsub();          // detach the listener on unmount
  }, [name]);

  const add = useCallback((item: Record<string, unknown>) => createRecord(name, item), [name]);
  const update = useCallback((id: string, item: Record<string, unknown>) => updateRecord(name, id, item), [name]);
  const remove = useCallback((id: string) => deleteRecord(name, id), [name]);

  return { rows, loading, add, update, remove };
}
