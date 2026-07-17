import React, { useState, useMemo } from "react";
import { Search, Download, Plus, Pencil, Trash2, X, Database } from "lucide-react";
import { MODULES, type Field } from "../config/modules";
import { useLiveCollection } from "../hooks/useLiveCollection";

const ACTIVE = "#2563EB";
const BADGE: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700", "In Progress": "bg-amber-100 text-amber-700", Placed: "bg-emerald-100 text-emerald-700",
  Unplaced: "bg-gray-100 text-gray-600", "Higher Studies": "bg-blue-100 text-blue-700", Open: "bg-emerald-100 text-emerald-700",
  Closed: "bg-rose-100 text-rose-700", Draft: "bg-gray-100 text-gray-600", Accepted: "bg-emerald-100 text-emerald-700",
  Offered: "bg-blue-100 text-blue-700", Interview: "bg-violet-100 text-violet-700", Assessment: "bg-amber-100 text-amber-700",
  Shortlisted: "bg-sky-100 text-sky-700", Applied: "bg-gray-100 text-gray-600", Rejected: "bg-rose-100 text-rose-700",
  Selected: "bg-emerald-100 text-emerald-700", Eligible: "bg-emerald-100 text-emerald-700", "Not Eligible": "bg-rose-100 text-rose-700",
  "Pending Review": "bg-amber-100 text-amber-700", Pending: "bg-amber-100 text-amber-700", Ongoing: "bg-sky-100 text-sky-700",
  Scheduled: "bg-blue-100 text-blue-700", Upcoming: "bg-violet-100 text-violet-700", Declined: "bg-rose-100 text-rose-700",
  Active: "bg-emerald-100 text-emerald-700", Inactive: "bg-gray-100 text-gray-600", "Just Started": "bg-gray-100 text-gray-600",
};
const Badge = ({ s }: { s: string }) => <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${BADGE[s] || "bg-gray-100 text-gray-600"}`}>{s}</span>;

function csv(name: string, fields: Field[], rows: any[]) {
  const head = fields.map((f) => f.label).join(",");
  const body = rows.map((r) => fields.map((f) => `"${String(r[f.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([head + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
}

function Modal({ config, initial, onSave, onClose }: any) {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const b: Record<string, any> = {}; config.fields.forEach((f: Field) => (b[f.key] = initial?.[f.key] ?? "")); return b;
  });
  const set = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{initial ? `Edit ${config.singular}` : `Add ${config.singular}`}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {config.fields.map((f: Field) => (
            <div key={f.key} className={f.type === "textarea" ? "col-span-2" : ""}>
              <label className="text-xs font-medium text-gray-500">{f.label}</label>
              {f.type === "select" ? (
                <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg">
                  <option value="">Select…</option>{f.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              ) : (
                <input type={f.type === "number" ? "number" : "text"} value={form[f.key]}
                  onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm rounded-lg text-white" style={{ background: ACTIVE }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage({ id, canWrite }: { id: string; canWrite: boolean }) {
  const config = MODULES[id];
  const { rows, loading, add, update, remove } = useLiveCollection(id);
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<null | "new" | any>(null);
  const filters = config.fields.filter((f) => f.filter);

  const filtered = useMemo(() => rows.filter((r) => {
    const mq = !q || config.fields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(q.toLowerCase()));
    const mf = filters.every((f) => !flt[f.key] || String(r[f.key]) === flt[f.key]);
    return mq && mf;
  }), [rows, q, flt]);

  const save = (form: any) => { modal === "new" ? add(form) : update(modal.id, form); setModal(null); };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-gray-800">{config.title}</h1><p className="text-gray-500 text-sm mt-1">{config.subtitle}</p></div>
        <span className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"><Database className="w-3.5 h-3.5" /> Live · {rows.length} records</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg" />
          </div>
          {filters.map((f) => (
            <select key={f.key} value={flt[f.key] || ""} onChange={(e) => setFlt((a) => ({ ...a, [f.key]: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600">
              <option value="">All {f.label}</option>{f.options!.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          <button onClick={() => csv(id, config.fields, filtered)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Download className="w-4 h-4" /> CSV</button>
          {canWrite && <button onClick={() => setModal("new")} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white" style={{ background: ACTIVE }}><Plus className="w-4 h-4" /> Add {config.singular}</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">
              {config.fields.map((f) => <th key={f.key} className="py-3 pr-4 font-medium whitespace-nowrap">{f.label}</th>)}
              {canWrite && <th className="py-3 pr-4 font-medium text-right">Actions</th>}
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan={config.fields.length + 1} className="py-10 text-center text-gray-400">Loading from database…</td></tr>}
              {!loading && filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {config.fields.map((f, ci) => (
                    <td key={f.key} className="py-3 pr-4 align-top">
                      {f.badge ? <Badge s={r[f.key]} /> : <span className={ci === 0 ? "font-medium text-gray-800" : "text-gray-600"}>
                        {f.type === "textarea" ? String(r[f.key] ?? "").slice(0, 40) : r[f.key]}</span>}
                    </td>
                  ))}
                  {canWrite && <td className="py-3 pr-4 text-right whitespace-nowrap">
                    <button onClick={() => setModal(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </td>}
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={config.fields.length + 1} className="py-10 text-center text-gray-400">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-4">Showing {filtered.length} of {rows.length} · live-synced via Firestore</p>
      </div>
      {modal && <Modal config={config} initial={modal === "new" ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
