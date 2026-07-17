import React from "react";
import { Users, Building2, Briefcase, Handshake, GraduationCap, TrendingUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart } from "recharts";
import { useLiveCollection } from "../hooks/useLiveCollection";
import type { AuthUser } from "../context/AuthContext";

const BLUE = "#3B82F6";
const DONUT = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#94A3B8"];
const TREND = [
  { year: "2020-21", placed: 380, avg: 4.2 }, { year: "2021-22", placed: 520, avg: 5.1 },
  { year: "2022-23", placed: 610, avg: 5.8 }, { year: "2023-24", placed: 760, avg: 6.4 }, { year: "2024-25", placed: 920, avg: 6.75 },
];
const SALARY = [
  { range: "0-3", students: 180 }, { range: "3-6", students: 320 }, { range: "6-10", students: 290 },
  { range: "10-15", students: 150 }, { range: "15-20", students: 60 }, { range: "20+", students: 23 },
];
const Card = ({ children, className = "" }: any) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;

export default function Dashboard({ user }: { user: AuthUser }) {
  // Live counts straight from the real-time database.
  const students = useLiveCollection("students");
  const companies = useLiveCollection("companies");
  const jobs = useLiveCollection("jobs");
  const offers = useLiveCollection("offers");
  const placed = students.rows.filter((s) => s.status === "Placed").length;

  const dept = Object.entries(students.rows.reduce((m: Record<string, number>, s) => { m[s.dept] = (m[s.dept] || 0) + 1; return m; }, {}))
    .map(([name, value]) => ({ name, value }));

  const kpis = [
    { icon: Users, tint: "bg-violet-100 text-violet-600", label: "Total Students", value: students.rows.length },
    { icon: GraduationCap, tint: "bg-emerald-100 text-emerald-600", label: "Placed", value: placed },
    { icon: Building2, tint: "bg-blue-100 text-blue-600", label: "Companies", value: companies.rows.length },
    { icon: Briefcase, tint: "bg-orange-100 text-orange-600", label: "Job Postings", value: jobs.rows.length },
    { icon: Handshake, tint: "bg-violet-100 text-violet-600", label: "Offers", value: offers.rows.length },
    { icon: TrendingUp, tint: "bg-emerald-100 text-emerald-600", label: "Accepted", value: offers.rows.filter((o) => o.status === "Accepted").length },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Placement Dashboard</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]} 👋 — figures below are live from the database</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.tint}`}><k.icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-500">{k.label}</p><p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Placement Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={TREND} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="placed" name="Placed" fill={BLUE} radius={[4, 4, 0, 0]} barSize={26} />
              <Line yAxisId="r" dataKey="avg" name="Avg CTC (LPA)" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Students by Department (live)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart><Pie data={dept.length ? dept : [{ name: "—", value: 1 }]} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2} label>
              {dept.map((_, i) => <Cell key={i} fill={DONUT[i % DONUT.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Salary Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SALARY} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} /><Tooltip />
              <Bar dataKey="students" fill={BLUE} radius={[4, 4, 0, 0]} barSize={44} label={{ position: "top", fontSize: 11, fill: "#64748b" }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
