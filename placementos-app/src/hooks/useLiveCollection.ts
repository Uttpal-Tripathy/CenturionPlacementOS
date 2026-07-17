import { useEffect, useState, useCallback } from "react";
import { subscribe, createRecord, updateRecord, deleteRecord, type Row } from "../lib/collections";

/** Real-time collection hook: rows update instantly across all clients. */
export function useLiveCollection(name: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribe(name, (data) => { setRows(data); setLoading(false); });
    return () => unsub();
  }, [name]);

  const add = useCallback((item: Record<string, any>) => createRecord(name, item), [name]);
  const update = useCallback((id: string, item: Record<string, any>) => updateRecord(name, id, item), [name]);
  const remove = useCallback((id: string) => deleteRecord(name, id), [name]);

  return { rows, loading, add, update, remove };
}
