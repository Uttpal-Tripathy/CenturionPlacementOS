import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, Users, ShieldCheck, FileText, Heart, Building2, Briefcase,
  CalendarDays, ClipboardList, MessageSquare, GitBranch, Handshake, GraduationCap,
  Bell, Mail, Megaphone, BarChart3, PieChart as PieIcon, FileBarChart, FolderOpen,
  Building, UserCog, Settings, SlidersHorizontal, Menu, ChevronDown, Search,
  TrendingUp, IndianRupee, CheckCircle2, UserPlus, Download, ChevronRight,
  Award, Users2, LogOut, ShieldAlert, Plus, Pencil, Trash2, X, Database,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart,
} from "recharts";

/* ============================== BRAND TOKENS ============================== */
const NAVY = "#0E2146";
const NAVY_HOVER = "#182f5c";
const ACTIVE = "#2563EB";
const BLUE = "#3B82F6";
const DONUT = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#94A3B8"];

/* ============================== PERSISTENT DB LAYER ==============================
 * Uses the artifact persistent key-value store (window.storage) when available,
 * with an in-memory fallback. Each module is a "collection" persisted under its own key.
 * This is what makes every portal "active with a database": records survive reloads
 * and update live as they are created / edited / deleted.
 * ============================================================================== */
const _mem = {};
async function dbGet(key) {
  try {
    if (window?.storage?.get) { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; }
  } catch { /* key missing or unavailable */ }
  return _mem[key] ?? null;
}
async function dbSet(key, val) {
  _mem[key] = val;
  try { if (window?.storage?.set) await window.storage.set(key, JSON.stringify(val)); } catch { /* ignore */ }
}
function useCollection(name, seed) {
  const key = `placementos:${name}`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      let data = await dbGet(key);
      if (!Array.isArray(data)) { data = seed; await dbSet(key, seed); }
      if (alive) { setRows(data); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [key]);
  const persist = (next) => { setRows(next); dbSet(key, next); };
  const add = (item) => persist([{ ...item, id: `${name}_${Date.now()}` }, ...rows]);
  const update = (id, item) => persist(rows.map((r) => (r.id === id ? { ...r, ...item } : r)));
  const remove = (id) => persist(rows.filter((r) => r.id !== id));
  return { rows, loading, add, update, remove };
}

/* ============================== DASHBOARD STATIC DATA ============================== */
const KPIS = [
  { icon: Users, tint: "bg-violet-100 text-violet-600", label: "Total Students", value: "2,458", sub: "5.6% from last year", up: true },
  { icon: Users2, tint: "bg-emerald-100 text-emerald-600", label: "Eligible Students", value: "1,872", sub: "76.2% of total students" },
  { icon: Building2, tint: "bg-blue-100 text-blue-600", label: "Companies", value: "156", sub: "18 new this year", up: true },
  { icon: Briefcase, tint: "bg-orange-100 text-orange-600", label: "Job Postings", value: "89", sub: "12 active drives" },
  { icon: GraduationCap, tint: "bg-violet-100 text-violet-600", label: "Placed Students", value: "1,023", sub: "54.7% Placement Rate" },
  { icon: IndianRupee, tint: "bg-emerald-100 text-emerald-600", label: "Highest Package", value: "₹ 24.50 LPA", sub: "Offered this year" },
];
const FUNNEL = [
  { n: 1, icon: UserPlus, label: "Student Registration", count: "2,458", color: "text-violet-600 bg-violet-50" },
  { n: 2, icon: CheckCircle2, label: "Eligibility Verified", count: "1,872", color: "text-emerald-600 bg-emerald-50" },
  { n: 3, icon: Building2, label: "Companies Onboarded", count: "156", color: "text-blue-600 bg-blue-50" },
  { n: 4, icon: Megaphone, label: "Jobs Published", count: "89", color: "text-violet-600 bg-violet-50" },
  { n: 5, icon: FileText, label: "Applications Received", count: "1,346", color: "text-orange-600 bg-orange-50" },
  { n: 6, icon: Users2, label: "Assessment & Interviews", count: "In Progress", color: "text-sky-600 bg-sky-50" },
  { n: 7, icon: Award, label: "Selections Made", count: "1,023", color: "text-emerald-600 bg-emerald-50" },
  { n: 8, icon: Handshake, label: "Offers Accepted", count: "812", color: "text-amber-600 bg-amber-50" },
  { n: 9, icon: BarChart3, label: "Joined", count: "689", color: "text-blue-600 bg-blue-50" },
];
const STATS_CHART = [
  { year: "2020-21", placed: 380, avg: 4.2 }, { year: "2021-22", placed: 520, avg: 5.1 },
  { year: "2022-23", placed: 610, avg: 5.8 }, { year: "2023-24", placed: 760, avg: 6.4 },
  { year: "2024-25", placed: 920, avg: 6.75 },
];
const DEPT = [
  { name: "CSE", value: 420, pct: "41.1%" }, { name: "IT", value: 210, pct: "20.5%" },
  { name: "ECE", value: 150, pct: "14.7%" }, { name: "EEE", value: 90, pct: "8.8%" },
  { name: "MECH", value: 75, pct: "7.3%" }, { name: "Others", value: 78, pct: "7.6%" },
];
const SALARY = [
  { range: "0-3", students: 180 }, { range: "3-6", students: 320 }, { range: "6-10", students: 290 },
  { range: "10-15", students: 150 }, { range: "15-20", students: 60 }, { range: "20+", students: 23 },
];
const ACTIVITIES = [
  { activity: "Offers Released", company: "Infosys", role: "Systems Engineer", students: "45", status: "Completed", date: "22 May 2025" },
  { activity: "GD Round Completed", company: "TCS", role: "Ninja Digital", students: "120", status: "Completed", date: "21 May 2025" },
  { activity: "Aptitude Test Conducted", company: "Wipro", role: "Project Engineer", students: "95", status: "Completed", date: "20 May 2025" },
  { activity: "Technical Interviews", company: "Cognizant", role: "Programmer Analyst", students: "60", status: "In Progress", date: "19 May 2025" },
  { activity: "Job Posting Published", company: "Capgemini", role: "Analyst", students: "–", status: "Published", date: "18 May 2025" },
];
const NOTIFS = [
  { t: "New Job Posted by TCS", ago: "10 mins ago" }, { t: "Aptitude Test scheduled for 25 May", ago: "30 mins ago" },
  { t: "5 New Offers Released", ago: "1 hour ago" }, { t: "Company Visit: Infosys on 28 May", ago: "2 hours ago" },
  { t: "GD shortlisted list published", ago: "3 hours ago" },
];
const DRIVES_SIDE = [
  { c: "Infosys", role: "Software Engineer", date: "28 May 2025", eligible: 245 },
  { c: "TCS", role: "Ninja Digital", date: "30 May 2025", eligible: 198 },
  { c: "Wipro", role: "Project Engineer", date: "02 Jun 2025", eligible: 167 },
  { c: "Cognizant", role: "Programmer Analyst", date: "05 Jun 2025", eligible: 132 },
];
const QUICK = [
  { label: "Add New Company", icon: Building2, tint: "bg-blue-50 text-blue-600" },
  { label: "Post New Job", icon: Briefcase, tint: "bg-emerald-50 text-emerald-600" },
  { label: "Schedule Drive", icon: CalendarDays, tint: "bg-violet-50 text-violet-600" },
  { label: "Upload Notification", icon: Bell, tint: "bg-orange-50 text-orange-600" },
  { label: "Generate Report", icon: FileBarChart, tint: "bg-rose-50 text-rose-600" },
  { label: "View Analytics", icon: BarChart3, tint: "bg-sky-50 text-sky-600" },
];

/* ============================== SEED DATA (per SDD) ============================== */
const SEED = {
  students: [
    { id: "S1", name: "Aarav Reddy", roll: "22CSE001", dept: "CSE", batch: "2026", cgpa: 8.9, backlogs: 0, status: "Placed" },
    { id: "S2", name: "Diya Sharma", roll: "22CSE014", dept: "CSE", batch: "2026", cgpa: 9.2, backlogs: 0, status: "Placed" },
    { id: "S3", name: "Rohan Verma", roll: "22IT007", dept: "IT", batch: "2026", cgpa: 7.4, backlogs: 1, status: "Unplaced" },
    { id: "S4", name: "Ananya Nair", roll: "22ECE022", dept: "ECE", batch: "2026", cgpa: 8.1, backlogs: 0, status: "Unplaced" },
    { id: "S5", name: "Karthik Rao", roll: "22MECH003", dept: "MECH", batch: "2026", cgpa: 6.8, backlogs: 2, status: "Unplaced" },
    { id: "S6", name: "Ishita Gupta", roll: "22CSE045", dept: "CSE", batch: "2026", cgpa: 8.7, backlogs: 0, status: "Higher Studies" },
    { id: "S7", name: "Vikram Singh", roll: "22EEE011", dept: "EEE", batch: "2026", cgpa: 7.9, backlogs: 0, status: "Placed" },
    { id: "S8", name: "Sneha Iyer", roll: "22IT019", dept: "IT", batch: "2026", cgpa: 8.4, backlogs: 0, status: "Unplaced" },
  ],
  eligibility: [
    { id: "E1", name: "Aarav Reddy", roll: "22CSE001", dept: "CSE", cgpa: 8.9, backlogs: 0, status: "Eligible" },
    { id: "E2", name: "Rohan Verma", roll: "22IT007", dept: "IT", cgpa: 7.4, backlogs: 1, status: "Eligible" },
    { id: "E3", name: "Karthik Rao", roll: "22MECH003", dept: "MECH", cgpa: 6.8, backlogs: 2, status: "Not Eligible" },
    { id: "E4", name: "Ananya Nair", roll: "22ECE022", dept: "ECE", cgpa: 8.1, backlogs: 0, status: "Eligible" },
    { id: "E5", name: "Sneha Iyer", roll: "22IT019", dept: "IT", cgpa: 8.4, backlogs: 0, status: "Pending Review" },
  ],
  applications: [
    { id: "A1", student: "Aarav Reddy", company: "Infosys", title: "Systems Engineer", status: "Accepted", applied: "02 May 2025" },
    { id: "A2", student: "Diya Sharma", company: "Cognizant", title: "Programmer Analyst", status: "Offered", applied: "04 May 2025" },
    { id: "A3", student: "Rohan Verma", company: "TCS", title: "Ninja Digital", status: "Interview", applied: "06 May 2025" },
    { id: "A4", student: "Ananya Nair", company: "Wipro", title: "Project Engineer", status: "Assessment", applied: "07 May 2025" },
    { id: "A5", student: "Sneha Iyer", company: "Infosys", title: "Systems Engineer", status: "Shortlisted", applied: "08 May 2025" },
    { id: "A6", student: "Karthik Rao", company: "Capgemini", title: "Analyst", status: "Applied", applied: "09 May 2025" },
  ],
  preferences: [
    { id: "P1", student: "Aarav Reddy", locations: "Bengaluru, Hyderabad", industries: "IT Services", roles: "Full Stack", expectedCtc: "8 LPA", relocation: "Yes" },
    { id: "P2", student: "Ananya Nair", locations: "Chennai", industries: "Electronics", roles: "Embedded", expectedCtc: "6 LPA", relocation: "No" },
    { id: "P3", student: "Sneha Iyer", locations: "Remote, Pune", industries: "Consulting", roles: "Data", expectedCtc: "7 LPA", relocation: "Yes" },
  ],
  companies: [
    { id: "C1", name: "Infosys", industry: "IT Services", hr: "Priya Menon", email: "priya.m@infosys.com", website: "infosys.com" },
    { id: "C2", name: "TCS", industry: "IT Services", hr: "Rahul Das", email: "rahul.d@tcs.com", website: "tcs.com" },
    { id: "C3", name: "Wipro", industry: "IT Services", hr: "Anita Roy", email: "anita.r@wipro.com", website: "wipro.com" },
    { id: "C4", name: "Cognizant", industry: "Consulting", hr: "Sameer Khan", email: "sameer.k@cognizant.com", website: "cognizant.com" },
    { id: "C5", name: "Capgemini", industry: "Consulting", hr: "Neha Jain", email: "neha.j@capgemini.com", website: "capgemini.com" },
  ],
  jobs: [
    { id: "J1", company: "Infosys", title: "Systems Engineer", roles: "Full Stack", ctc: "6.5 LPA", location: "Bengaluru", minCgpa: 6.5, deadline: "25 May 2025", status: "Open" },
    { id: "J2", company: "TCS", title: "Ninja Digital", roles: "Backend", ctc: "3.6 LPA", location: "Hyderabad", minCgpa: 6.0, deadline: "28 May 2025", status: "Open" },
    { id: "J3", company: "Wipro", title: "Project Engineer", roles: "Frontend", ctc: "5.5 LPA", location: "Chennai", minCgpa: 6.0, deadline: "20 May 2025", status: "Closed" },
    { id: "J4", company: "Cognizant", title: "Programmer Analyst", roles: "Full Stack", ctc: "7.0 LPA", location: "Pune", minCgpa: 7.0, deadline: "02 Jun 2025", status: "Open" },
    { id: "J5", company: "Capgemini", title: "Analyst", roles: "Data", ctc: "4.8 LPA", location: "Remote", minCgpa: 6.5, deadline: "10 Jun 2025", status: "Draft" },
  ],
  drives: [
    { id: "D1", company: "Infosys", role: "Software Engineer", date: "28 May 2025", mode: "Offline", venue: "Auditorium A", status: "Ongoing" },
    { id: "D2", company: "TCS", role: "Ninja Digital", date: "30 May 2025", mode: "Online", venue: "MS Teams", status: "Pending" },
    { id: "D3", company: "Wipro", role: "Project Engineer", date: "02 Jun 2025", mode: "Offline", venue: "Seminar Hall", status: "Pending" },
  ],
  assessments: [
    { id: "AS1", company: "TCS", role: "Ninja Digital", type: "Aptitude", date: "25 May 2025", time: "10:00 AM", duration: "90 min", status: "Scheduled" },
    { id: "AS2", company: "Infosys", role: "Systems Engineer", type: "Technical", date: "27 May 2025", time: "02:00 PM", duration: "60 min", status: "Upcoming" },
    { id: "AS3", company: "Cognizant", role: "Programmer Analyst", type: "Coding Test", date: "20 May 2025", time: "11:00 AM", duration: "120 min", status: "Completed" },
  ],
  interviews: [
    { id: "I1", student: "Aarav Reddy", company: "Infosys", round: "Technical", date: "26 May 2025", time: "10:30 AM", mode: "Offline", status: "Scheduled" },
    { id: "I2", student: "Rohan Verma", company: "TCS", round: "HR", date: "31 May 2025", time: "03:00 PM", mode: "Online", status: "Pending" },
    { id: "I3", student: "Diya Sharma", company: "Cognizant", round: "Managerial", date: "19 May 2025", time: "01:00 PM", mode: "Online", status: "Completed" },
  ],
  tracking: [
    { id: "T1", company: "Infosys", role: "Systems Engineer", applied: 320, shortlisted: 140, interview: 60, selected: 45, status: "Completed" },
    { id: "T2", company: "TCS", role: "Ninja Digital", applied: 410, shortlisted: 190, interview: 120, selected: 0, status: "Ongoing" },
    { id: "T3", company: "Wipro", role: "Project Engineer", applied: 260, shortlisted: 95, interview: 0, selected: 0, status: "Active" },
  ],
  offers: [
    { id: "O1", student: "Aarav Reddy", company: "Infosys", role: "Systems Engineer", ctc: "6.5 LPA", offerDate: "22 May 2025", status: "Accepted" },
    { id: "O2", student: "Diya Sharma", company: "Cognizant", role: "Programmer Analyst", ctc: "7.0 LPA", offerDate: "23 May 2025", status: "Pending" },
    { id: "O3", student: "Vikram Singh", company: "Wipro", role: "Project Engineer", ctc: "5.5 LPA", offerDate: "20 May 2025", status: "Declined" },
  ],
  internships: [
    { id: "N1", company: "Infosys", role: "SDE Intern", duration: "6 months", stipend: "₹25,000/mo", location: "Bengaluru", status: "Open", deadline: "30 May 2025" },
    { id: "N2", company: "Wipro", role: "Data Intern", duration: "3 months", stipend: "₹18,000/mo", location: "Remote", status: "Open", deadline: "05 Jun 2025" },
    { id: "N3", company: "TCS", role: "QA Intern", duration: "6 months", stipend: "₹20,000/mo", location: "Hyderabad", status: "Closed", deadline: "10 May 2025" },
  ],
  notifications: [
    { id: "NT1", title: "New Job Posted by TCS", category: "Job", audience: "All Students", date: "24 May 2025" },
    { id: "NT2", title: "Aptitude Test scheduled for 25 May", category: "Assessment", audience: "Eligible", date: "23 May 2025" },
    { id: "NT3", title: "5 New Offers Released", category: "Offer", audience: "Shortlisted", date: "22 May 2025" },
  ],
  email: [
    { id: "M1", template: "Job Posting Announcement", type: "Email", subject: "New opening at {company_name}", body: "Dear {student_name}, {company_name} is hiring for {job_title}." },
    { id: "M2", template: "Interview Reminder", type: "SMS", subject: "Interview {interview_time}", body: "Reminder: your interview with {company_name} is at {interview_time}." },
  ],
  announcement: [
    { id: "AN1", title: "Placement Drive Week", audience: "All Students", date: "20 May 2025", body: "Placement week begins 28 May. Keep resumes updated." },
    { id: "AN2", title: "Resume Workshop", audience: "Final Year", date: "18 May 2025", body: "Mandatory resume workshop on 22 May, 3 PM." },
  ],
  reports: [
    { id: "R1", name: "Annual Placement Report 2024-25", period: "2024-25", type: "Annual", generatedOn: "22 May 2025" },
    { id: "R2", name: "Department Placement Summary", period: "2024-25", type: "Department", generatedOn: "20 May 2025" },
    { id: "R3", name: "NAAC Placement Statistics", period: "2024-25", type: "Accreditation", generatedOn: "18 May 2025" },
  ],
  custom: [
    { id: "CR1", name: "CSE vs IT Package Comparison", dataset: "Offers", createdBy: "Rajesh Kumar", createdOn: "21 May 2025" },
    { id: "CR2", name: "Backlog Impact on Placement", dataset: "Students", createdBy: "Rajesh Kumar", createdOn: "19 May 2025" },
  ],
  documents: [
    { id: "DC1", name: "Aarav_Resume.pdf", type: "Resume", owner: "Aarav Reddy", date: "20 May 2025", size: "240 KB" },
    { id: "DC2", name: "Offer_Letter_Infosys.pdf", type: "Offer Letter", owner: "Aarav Reddy", date: "22 May 2025", size: "180 KB" },
    { id: "DC3", name: "Marksheet_Sem6.pdf", type: "Marksheet", owner: "Sneha Iyer", date: "18 May 2025", size: "320 KB" },
  ],
  employer: [
    { id: "EP1", company: "Infosys", title: "Systems Engineer", positions: 50, status: "Open", postedOn: "15 May 2025" },
    { id: "EP2", company: "TCS", title: "Ninja Digital", positions: 120, status: "Open", postedOn: "16 May 2025" },
    { id: "EP3", company: "Wipro", title: "Project Engineer", positions: 40, status: "Closed", postedOn: "10 May 2025" },
  ],
  users: [
    { id: "U1", name: "Rajesh Kumar", email: "rajesh.kumar@cutm.ac.in", role: "Placement Officer", status: "Active" },
    { id: "U2", name: "S. Lakshmi", email: "lakshmi@cutm.ac.in", role: "Career Coordinator", status: "Active" },
    { id: "U3", name: "Admin", email: "admin@cutm.ac.in", role: "Administrator", status: "Active" },
  ],
};

/* ============================== MODULE CONFIGS (fields drive CRUD forms) ============================== */
const F = (key, label, opts = {}) => ({ key, label, ...opts });
const MODULES = {
  students: { title: "Student Profiles", subtitle: "Master directory of student records", singular: "Student", fields: [
    F("name", "Name"), F("roll", "Roll No"), F("dept", "Dept", { type: "select", options: ["CSE", "IT", "ECE", "EEE", "MECH"], filter: true }),
    F("batch", "Batch"), F("cgpa", "CGPA", { type: "number" }), F("backlogs", "Backlogs", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Placed", "Unplaced", "Higher Studies"], filter: true, badge: true }),
  ]},
  eligibility: { title: "Eligibility Management", subtitle: "Screen students against CGPA / backlog rules", singular: "Record", fields: [
    F("name", "Name"), F("roll", "Roll No"), F("dept", "Branch", { type: "select", options: ["CSE", "IT", "ECE", "EEE", "MECH"], filter: true }),
    F("cgpa", "CGPA", { type: "number" }), F("backlogs", "Backlogs", { type: "number" }),
    F("status", "Eligibility", { type: "select", options: ["Eligible", "Not Eligible", "Pending Review"], filter: true, badge: true }),
  ]},
  applications: { title: "Applications", subtitle: "Track applications through the recruitment funnel", singular: "Application", fields: [
    F("student", "Student"), F("company", "Company"), F("title", "Role"),
    F("status", "Status", { type: "select", options: ["Applied", "Shortlisted", "Assessment", "Interview", "Selected", "Rejected", "Offered", "Accepted"], filter: true, badge: true }),
    F("applied", "Applied"),
  ]},
  preferences: { title: "Placement Preferences", subtitle: "Student-stated preferences for matching", singular: "Preference", fields: [
    F("student", "Student"), F("locations", "Locations"), F("industries", "Industries"), F("roles", "Roles"),
    F("expectedCtc", "Expected CTC"), F("relocation", "Relocate", { type: "select", options: ["Yes", "No"], filter: true }),
  ]},
  companies: { title: "Company Database", subtitle: "Recruiting partner organisations", singular: "Company", fields: [
    F("name", "Company"), F("industry", "Industry", { type: "select", options: ["IT Services", "Consulting", "Core", "Product"], filter: true }),
    F("hr", "HR Contact"), F("email", "Email"), F("website", "Website"),
  ]},
  jobs: { title: "Job Postings", subtitle: "Open, closed and draft requisitions", singular: "Job", fields: [
    F("company", "Company"), F("title", "Title"), F("roles", "Roles"), F("ctc", "CTC"),
    F("location", "Location", { type: "select", options: ["Bengaluru", "Hyderabad", "Chennai", "Pune", "Remote"], filter: true }),
    F("minCgpa", "Min CGPA", { type: "number" }), F("deadline", "Deadline"),
    F("status", "Status", { type: "select", options: ["Open", "Closed", "Draft"], filter: true, badge: true }),
  ]},
  drives: { title: "Recruitment Drives", subtitle: "On-campus and online recruitment events", singular: "Drive", fields: [
    F("company", "Company"), F("role", "Role"), F("date", "Date"),
    F("mode", "Mode", { type: "select", options: ["Online", "Offline"], filter: true }), F("venue", "Venue"),
    F("status", "Status", { type: "select", options: ["Pending", "Ongoing", "Completed"], filter: true, badge: true }),
  ]},
  assessments: { title: "Assessments", subtitle: "Scheduled tests and AI mock practice", singular: "Assessment", fields: [
    F("company", "Company"), F("role", "Role"),
    F("type", "Type", { type: "select", options: ["Aptitude", "Technical", "Coding Test"], filter: true }),
    F("date", "Date"), F("time", "Time"), F("duration", "Duration"),
    F("status", "Status", { type: "select", options: ["Upcoming", "Scheduled", "Completed"], filter: true, badge: true }),
  ]},
  interviews: { title: "Interviews", subtitle: "Interview rounds for shortlisted candidates", singular: "Interview", fields: [
    F("student", "Student"), F("company", "Company"), F("round", "Round"), F("date", "Date"), F("time", "Time"),
    F("mode", "Mode", { type: "select", options: ["Online", "Offline"], filter: true }),
    F("status", "Status", { type: "select", options: ["Scheduled", "Completed", "Pending"], filter: true, badge: true }),
  ]},
  tracking: { title: "Selection Tracking", subtitle: "Funnel counts per company / role", singular: "Track", fields: [
    F("company", "Company"), F("role", "Role"), F("applied", "Applied", { type: "number" }),
    F("shortlisted", "Shortlisted", { type: "number" }), F("interview", "In Interview", { type: "number" }),
    F("selected", "Selected", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Just Started", "Active", "Ongoing", "Completed"], filter: true, badge: true }),
  ]},
  offers: { title: "Offer Management", subtitle: "Offers extended and acceptance status", singular: "Offer", fields: [
    F("student", "Student"), F("company", "Company"), F("role", "Role"), F("ctc", "CTC"), F("offerDate", "Offer Date"),
    F("status", "Status", { type: "select", options: ["Pending", "Accepted", "Declined"], filter: true, badge: true }),
  ]},
  internships: { title: "Internship Management", subtitle: "Internship opportunities and lifecycle", singular: "Internship", fields: [
    F("company", "Company"), F("role", "Role"), F("duration", "Duration"), F("stipend", "Stipend"),
    F("location", "Location"), F("status", "Status", { type: "select", options: ["Open", "Closed"], filter: true, badge: true }), F("deadline", "Deadline"),
  ]},
  notifications: { title: "Notifications", subtitle: "Placement-cell notifications", singular: "Notification", fields: [
    F("title", "Title"), F("category", "Category", { type: "select", options: ["Job", "Assessment", "Interview", "Offer", "General"], filter: true }),
    F("audience", "Audience"), F("date", "Date"),
  ]},
  email: { title: "Email / SMS", subtitle: "Reusable communication templates", singular: "Template", fields: [
    F("template", "Template"), F("type", "Type", { type: "select", options: ["Email", "SMS"], filter: true }),
    F("subject", "Subject"), F("body", "Body", { type: "textarea" }),
  ]},
  announcement: { title: "Announcement", subtitle: "Broadcast announcements", singular: "Announcement", fields: [
    F("title", "Title"), F("audience", "Audience", { type: "select", options: ["All Students", "Final Year", "Faculty"], filter: true }),
    F("date", "Date"), F("body", "Body", { type: "textarea" }),
  ]},
  reports: { title: "Placement Reports", subtitle: "Generated placement statistics reports", singular: "Report", fields: [
    F("name", "Report Name"), F("period", "Period"),
    F("type", "Type", { type: "select", options: ["Annual", "Department", "Accreditation", "Custom"], filter: true }), F("generatedOn", "Generated On"),
  ]},
  custom: { title: "Custom Reports", subtitle: "User-defined report definitions", singular: "Report", fields: [
    F("name", "Report Name"), F("dataset", "Dataset", { type: "select", options: ["Students", "Offers", "Applications", "Companies"], filter: true }),
    F("createdBy", "Created By"), F("createdOn", "Created On"),
  ]},
  documents: { title: "Document Repository", subtitle: "Placement-related documents", singular: "Document", fields: [
    F("name", "File Name"), F("type", "Type", { type: "select", options: ["Resume", "Offer Letter", "Marksheet", "Certificate", "Image"], filter: true }),
    F("owner", "Owner"), F("date", "Date"), F("size", "Size"),
  ]},
  employer: { title: "Employer Portal", subtitle: "Employer-submitted requisitions", singular: "Posting", fields: [
    F("company", "Company"), F("title", "Role"), F("positions", "Positions", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Open", "Closed"], filter: true, badge: true }), F("postedOn", "Posted On"),
  ]},
  users: { title: "User Management", subtitle: "System users and roles", singular: "User", fields: [
    F("name", "Name"), F("email", "Email"),
    F("role", "Role", { type: "select", options: ["Placement Officer", "Career Coordinator", "Administrator", "Faculty", "Student"], filter: true }),
    F("status", "Status", { type: "select", options: ["Active", "Inactive"], filter: true, badge: true }),
  ]},
};

/* ============================== ROLES & RBAC (SRS Appendix A) ============================== */
const ROLES = ["Placement Officer", "Student", "Career Coordinator", "Administrator", "Employer", "Faculty", "Pursuit Manager", "HoD", "Dean", "Registrar", "Vice Chancellor", "Trainer"];
const ACCESS = {
  dashboard: ROLES,
  students: ["Placement Officer", "Faculty", "Administrator", "Career Coordinator", "Pursuit Manager", "HoD", "Dean", "Registrar", "Vice Chancellor"],
  eligibility: ["Placement Officer", "Administrator", "Career Coordinator"],
  applications: ["Placement Officer", "Student", "Career Coordinator"],
  preferences: ["Placement Officer", "Student", "Career Coordinator"],
  companies: ["Placement Officer", "Administrator", "Career Coordinator", "Pursuit Manager", "HoD"],
  jobs: ["Student", "Placement Officer", "Employer", "Administrator", "Career Coordinator", "Pursuit Manager"],
  drives: ["Student", "Placement Officer", "Employer", "Career Coordinator", "Pursuit Manager"],
  assessments: ["Placement Officer", "Employer", "Student"],
  interviews: ["Placement Officer", "Employer", "Student", "Trainer"],
  tracking: ["Placement Officer", "Employer", "Career Coordinator"],
  offers: ["Placement Officer", "Student", "Career Coordinator"],
  internships: ["Placement Officer", "Student", "Career Coordinator"],
  notifications: ["Placement Officer", "Student", "Employer", "Faculty"],
  email: ["Placement Officer", "Administrator", "Career Coordinator"],
  announcement: ["Placement Officer", "Administrator", "HoD", "Dean"],
  reports: ["Placement Officer", "Administrator", "HoD", "Dean", "Registrar", "Vice Chancellor"],
  analytics: ["Placement Officer", "Administrator", "HoD", "Dean", "Vice Chancellor"],
  custom: ["Placement Officer", "Administrator"],
  documents: ["Placement Officer", "Student", "Administrator"],
  employer: ["Placement Officer", "Administrator"],
  users: ["Administrator"], config: ["Administrator"], settings: ["Administrator"],
};
const canAccess = (role, id) => (ACCESS[id] || []).includes(role);

const NAV = [
  { section: null, items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "STUDENT MANAGEMENT", items: [
    { id: "students", label: "Student Profiles", icon: Users }, { id: "eligibility", label: "Eligibility Management", icon: ShieldCheck },
    { id: "applications", label: "Applications", icon: FileText }, { id: "preferences", label: "Placement Preferences", icon: Heart },
  ]},
  { section: "COMPANY MANAGEMENT", items: [
    { id: "companies", label: "Company Database", icon: Building2 }, { id: "jobs", label: "Job Postings", icon: Briefcase },
    { id: "drives", label: "Recruitment Drives", icon: CalendarDays },
  ]},
  { section: "RECRUITMENT PROCESS", items: [
    { id: "assessments", label: "Assessments", icon: ClipboardList }, { id: "interviews", label: "Interviews", icon: MessageSquare },
    { id: "tracking", label: "Selection Tracking", icon: GitBranch }, { id: "offers", label: "Offer Management", icon: Handshake },
    { id: "internships", label: "Internship Management", icon: GraduationCap },
  ]},
  { section: "COMMUNICATION", items: [
    { id: "notifications", label: "Notifications", icon: Bell }, { id: "email", label: "Email / SMS", icon: Mail },
    { id: "announcement", label: "Announcement", icon: Megaphone },
  ]},
  { section: "REPORTS & ANALYTICS", items: [
    { id: "reports", label: "Placement Reports", icon: BarChart3 }, { id: "analytics", label: "Analytics Dashboard", icon: PieIcon },
    { id: "custom", label: "Custom Reports", icon: FileBarChart },
  ]},
  { section: "DOCUMENTS", items: [{ id: "documents", label: "Document Repository", icon: FolderOpen }] },
  { section: "PORTALS", items: [{ id: "employer", label: "Employer Portal", icon: Building }] },
  { section: "SYSTEM ADMIN", items: [
    { id: "users", label: "User Management", icon: UserCog }, { id: "config", label: "Configuration", icon: Settings },
    { id: "settings", label: "System Settings", icon: SlidersHorizontal },
  ]},
];

/* ============================== SHARED UI ============================== */
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
const BADGE = {
  Completed: "bg-emerald-100 text-emerald-700", "In Progress": "bg-amber-100 text-amber-700", Published: "bg-violet-100 text-violet-700",
  Placed: "bg-emerald-100 text-emerald-700", Unplaced: "bg-gray-100 text-gray-600", "Higher Studies": "bg-blue-100 text-blue-700",
  Open: "bg-emerald-100 text-emerald-700", Closed: "bg-rose-100 text-rose-700", Draft: "bg-gray-100 text-gray-600",
  Accepted: "bg-emerald-100 text-emerald-700", Offered: "bg-blue-100 text-blue-700", Interview: "bg-violet-100 text-violet-700",
  Assessment: "bg-amber-100 text-amber-700", Shortlisted: "bg-sky-100 text-sky-700", Applied: "bg-gray-100 text-gray-600",
  Rejected: "bg-rose-100 text-rose-700", Selected: "bg-emerald-100 text-emerald-700", Eligible: "bg-emerald-100 text-emerald-700",
  "Not Eligible": "bg-rose-100 text-rose-700", "Pending Review": "bg-amber-100 text-amber-700", Pending: "bg-amber-100 text-amber-700",
  Ongoing: "bg-sky-100 text-sky-700", Scheduled: "bg-blue-100 text-blue-700", Upcoming: "bg-violet-100 text-violet-700",
  Declined: "bg-rose-100 text-rose-700", Active: "bg-emerald-100 text-emerald-700", Inactive: "bg-gray-100 text-gray-600",
  "Just Started": "bg-gray-100 text-gray-600",
};
const StatusBadge = ({ status }) => <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${BADGE[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;

function downloadCSV(name, fields, rows) {
  const head = fields.map((f) => f.label).join(",");
  const body = rows.map((r) => fields.map((f) => `"${String(r[f.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  try {
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
  } catch { /* ignore */ }
}

/* ============================== RECORD FORM MODAL ============================== */
function RecordModal({ config, initial, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    const base = {}; config.fields.forEach((f) => (base[f.key] = initial?.[f.key] ?? "")); return base;
  });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{initial ? `Edit ${config.singular}` : `Add ${config.singular}`}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {config.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "col-span-2" : ""}>
              <label className="text-xs font-medium text-gray-500">{f.label}</label>
              {f.type === "select" ? (
                <select value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">Select…</option>{f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} rows={3}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
              ) : (
                <input type={f.type === "number" ? "number" : "text"} value={form[f.key]} onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
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

/* ============================== GENERIC LIVE COLLECTION PAGE ============================== */
function CollectionPage({ id, canWrite }) {
  const config = MODULES[id];
  const { rows, loading, add, update, remove } = useCollection(id, SEED[id] || []);
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState({});
  const [modal, setModal] = useState(null); // 'new' | row object

  const filters = config.fields.filter((f) => f.filter);
  const filtered = useMemo(() => rows.filter((r) => {
    const mq = !q || config.fields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(q.toLowerCase()));
    const mf = filters.every((f) => !flt[f.key] || String(r[f.key]) === flt[f.key]);
    return mq && mf;
  }), [rows, q, flt]);

  const save = (form) => { if (modal === "new") add(form); else update(modal.id, form); setModal(null); };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{config.subtitle}</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
          <Database className="w-3.5 h-3.5" /> Live database · {rows.length} records
        </span>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          {filters.map((f) => (
            <select key={f.key} value={flt[f.key] || ""} onChange={(e) => setFlt((a) => ({ ...a, [f.key]: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">All {f.label}</option>{f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          <button onClick={() => downloadCSV(id, config.fields, filtered)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> CSV
          </button>
          {canWrite && (
            <button onClick={() => setModal("new")} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white" style={{ background: ACTIVE }}>
              <Plus className="w-4 h-4" /> Add {config.singular}
            </button>
          )}
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
                      {f.badge ? <StatusBadge status={r[f.key]} />
                        : <span className={ci === 0 ? "font-medium text-gray-800" : "text-gray-600"}>
                            {f.type === "textarea" ? String(r[f.key] ?? "").slice(0, 40) + (String(r[f.key] ?? "").length > 40 ? "…" : "") : r[f.key]}
                          </span>}
                    </td>
                  ))}
                  {canWrite && (
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      <button onClick={() => setModal(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={config.fields.length + 1} className="py-10 text-center text-gray-400">No records match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-4">Showing {filtered.length} of {rows.length} · changes persist to the database</p>
      </Card>

      {modal && <RecordModal config={config} initial={modal === "new" ? null : modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ============================== ANALYTICS PAGE ============================== */
function Analytics() {
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1><p className="text-gray-500 text-sm mt-1">Placement analytics across departments, salary and years</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Placement Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={STATS_CHART} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis yAxisId="l" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="placed" name="Placed" fill={BLUE} radius={[4, 4, 0, 0]} barSize={26} />
              <Line yAxisId="r" dataKey="avg" name="Avg CTC (LPA)" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Department Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart><Pie data={DEPT} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={2}>{DEPT.map((_, i) => <Cell key={i} fill={DONUT[i]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">{DEPT.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT[i] }} />{d.name}</span>
                <span className="text-gray-500">{d.value} ({d.pct})</span>
              </div>
            ))}</div>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Salary Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SALARY} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} /><YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} /><Tooltip />
              <Bar dataKey="students" fill={BLUE} radius={[4, 4, 0, 0]} barSize={44} label={{ position: "top", fontSize: 11, fill: "#64748b" }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ============================== SIMPLE SETTINGS ============================== */
function SettingsPage({ title }) {
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="text-gray-500 text-sm mt-1">Administrator configuration</p></div>
      <Card className="p-6 max-w-2xl space-y-4">
        {["Institution Name", "Academic Year", "Placement Cell Email", "Gemini API Key (masked)"].map((l, i) => (
          <div key={l}><label className="text-xs font-medium text-gray-500">{l}</label>
            <input defaultValue={["Centurion University (CUTM-AP)", "2024-2025", "placements@cutm.ac.in", "••••••••••••"][i]}
              className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        ))}
        <button className="px-4 py-2 text-sm rounded-lg text-white" style={{ background: ACTIVE }}>Save changes</button>
      </Card>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */
function Dashboard({ user }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Placement Dashboard</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]} 👋</p></div>
        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white"><option>2024 - 2025</option><option>2023 - 2024</option></select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {KPIS.map((k) => (
          <Card key={k.label} className="p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.tint}`}><k.icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-500">{k.label}</p><p className="text-xl font-bold text-gray-800 mt-1">{k.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${k.up ? "text-emerald-600" : "text-gray-400"}`}>{k.up && <TrendingUp className="w-3 h-3" />} {k.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Placement Process — Live Tracking</h2>
        <div className="flex items-start justify-between gap-1 overflow-x-auto pb-2">
          {FUNNEL.map((f, i) => (
            <React.Fragment key={f.n}>
              <div className="flex flex-col items-center text-center min-w-[92px]">
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 text-xs flex items-center justify-center mb-2">{f.n}</span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${f.color}`}><f.icon className="w-5 h-5" /></div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{f.label}</p>
                <p className={`text-sm font-bold mt-1 ${f.count === "In Progress" ? "text-amber-600 text-xs" : "text-gray-800"}`}>{f.count}</p>
              </div>
              {i < FUNNEL.length - 1 && <ChevronRight className="w-5 h-5 text-gray-300 mt-8 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2"><span className="font-medium">Overall Placement Progress:</span><span className="font-bold" style={{ color: ACTIVE }}>54.7%</span></div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: "54.7%", background: `linear-gradient(90deg, #60A5FA, ${ACTIVE})` }} /></div>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Placement Statistics</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View Report</button></div>
          <div className="grid grid-cols-4 gap-2 mb-4">{[["Average Package", "₹ 6.75 LPA"], ["Median Package", "₹ 5.20 LPA"], ["Total Offers", "1,145"], ["Placement Rate", "54.7%"]].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-[10px] text-gray-500 leading-tight">{l}</p><p className="text-sm font-bold text-gray-800 mt-1">{v}</p></div>
          ))}</div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={STATS_CHART} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#94a3b8" }} /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="placed" name="Placed Students" fill={BLUE} radius={[4, 4, 0, 0]} barSize={22} />
              <Line yAxisId="r" dataKey="avg" name="Average Package (LPA)" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Department Wise Placement</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View Report</button></div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}><PieChart><Pie data={DEPT} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={2}>{DEPT.map((_, i) => <Cell key={i} fill={DONUT[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            <div className="flex-1 space-y-1.5">{DEPT.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT[i] }} />{d.name}</span><span className="text-gray-500">{d.value} ({d.pct})</span></div>
            ))}</div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2"><span className="font-bold text-gray-800">1,023</span> Placed</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Salary Distribution</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View Report</button></div>
          <ResponsiveContainer width="100%" height={244}>
            <BarChart data={SALARY} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} /><XAxis dataKey="range" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Package Range (LPA)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} /><YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} /><Tooltip />
              <Bar dataKey="students" fill={BLUE} radius={[4, 4, 0, 0]} barSize={30} label={{ position: "top", fontSize: 10, fill: "#64748b" }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-800">Recent Placement Activities</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View All</button></div>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">{["Activity", "Company", "Role", "Students", "Status", "Date"].map((h) => <th key={h} className="py-2 pr-4 font-medium text-xs">{h}</th>)}</tr></thead>
            <tbody>{ACTIVITIES.map((a, i) => (
              <tr key={i} className="border-b border-gray-50"><td className="py-3 pr-4 text-gray-700">{a.activity}</td><td className="py-3 pr-4 text-gray-600">{a.company}</td><td className="py-3 pr-4 text-gray-600">{a.role}</td><td className="py-3 pr-4 text-gray-600">{a.students}</td><td className="py-3 pr-4"><StatusBadge status={a.status} /></td><td className="py-3 pr-4 text-gray-500">{a.date}</td></tr>
            ))}</tbody>
          </table></div>
        </Card>
        <div className="space-y-6">
          <Card className="p-5"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-800">Notifications</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View All</button></div>
            <div className="space-y-3">{NOTIFS.map((n, i) => (<div key={i} className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div><div><p className="text-sm text-gray-700 leading-tight">{n.t}</p><p className="text-xs text-gray-400 mt-0.5">{n.ago}</p></div></div>))}</div>
          </Card>
          <Card className="p-5"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-800">Upcoming Drives</h3><button className="text-xs font-medium" style={{ color: ACTIVE }}>View All</button></div>
            <div className="space-y-3">{DRIVES_SIDE.map((d, i) => (<div key={i} className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">{d.c.slice(0, 2).toUpperCase()}</div><div className="flex-1"><p className="text-sm font-medium text-gray-800 leading-tight">{d.c}</p><p className="text-xs text-gray-500">{d.role}</p></div><div className="text-right"><p className="text-xs text-gray-500">{d.date}</p><p className="text-xs text-gray-400">Eligible: {d.eligible}</p></div></div>))}</div>
          </Card>
          <Card className="p-5"><h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">{QUICK.map((a) => (<button key={a.label} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${a.tint} hover:opacity-80`}><a.icon className="w-4 h-4" /> {a.label}</button>))}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================== LOGIN ============================== */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
function LoginPage({ onSignIn }) {
  const [role, setRole] = useState("Placement Officer");
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `radial-gradient(circle at 20% 20%, #16305f, ${NAVY})` }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3"><GraduationCap className="w-7 h-7" /></div>
          <h1 className="text-2xl font-bold">Centurion PlacementOS</h1><p className="text-white/60 text-sm mt-1">Campus Recruitment Lifecycle Management · CUTM-AP</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 text-center">Sign in to continue</h2>
          <p className="text-gray-500 text-sm text-center mt-1">Use your institutional Google account (@cutm.ac.in)</p>
          <button onClick={() => onSignIn({ name: "Rajesh Kumar", email: "rajesh.kumar@cutm.ac.in", role, initials: "RK" })}
            className="mt-6 w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"><GoogleG /> Sign in with Google</button>
          <div className="mt-5"><label className="text-xs text-gray-500">Preview as role (demo)</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">Preview simulates sign-in for RBAC exploration. The deployed build uses Google Identity Services + your OAuth Client ID with server-side verification (see included Google Auth code).</p>
        </div>
      </div>
    </div>
  );
}

/* ============================== ROUTER ============================== */
function Page({ id, user }) {
  if (!canAccess(user.role, id)) {
    return (
      <Card className="p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-rose-50"><ShieldAlert className="w-7 h-7 text-rose-500" /></div>
        <h3 className="text-lg font-semibold text-gray-800">Access restricted</h3>
        <p className="text-gray-500 text-sm mt-2 max-w-md">Your role does not have permission to view this module.</p>
      </Card>
    );
  }
  if (id === "dashboard") return <Dashboard user={user} />;
  if (id === "analytics") return <Analytics />;
  if (id === "config" || id === "settings") return <SettingsPage title={id === "config" ? "Configuration" : "System Settings"} />;
  if (MODULES[id]) {
    // students can only read their own-facing modules; staff roles can write
    const canWrite = ["Placement Officer", "Administrator", "Career Coordinator", "Pursuit Manager", "Employer"].includes(user.role);
    return <CollectionPage id={id} canWrite={canWrite} />;
  }
  return <div className="text-gray-400">Unknown module</div>;
}

/* ============================== APP SHELL ============================== */
function Shell({ user, onSignOut }) {
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  const nav = NAV.map((g) => ({ ...g, items: g.items.filter((i) => canAccess(user.role, i.id)) })).filter((g) => g.items.length > 0);
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <aside className={`${open ? "w-64" : "w-0"} transition-all duration-300 shrink-0 overflow-hidden`} style={{ background: NAVY }}>
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10"><div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div><div className="leading-tight"><p className="text-white font-bold text-sm">ERP</p><p className="text-white/60 text-xs">Placement Module</p></div></div>
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {nav.map((group, gi) => (
              <div key={gi} className="mb-1">
                {group.section && <p className="text-white/40 text-[10px] font-semibold tracking-wider px-3 mt-4 mb-1">{group.section}</p>}
                {group.items.map((item) => {
                  const is = active === item.id;
                  return (
                    <button key={item.id} onClick={() => setActive(item.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors"
                      style={{ background: is ? ACTIVE : "transparent", color: is ? "#fff" : "rgba(255,255,255,0.7)" }}
                      onMouseEnter={(e) => { if (!is) e.currentTarget.style.background = NAVY_HOVER; }} onMouseLeave={(e) => { if (!is) e.currentTarget.style.background = "transparent"; }}>
                      <item.icon className="w-4 h-4 shrink-0" /> <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
          <button onClick={() => setOpen((o) => !o)} className="p-1.5 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
          <span className="text-xs text-gray-400 hidden sm:block">Centurion PlacementOS · CUTM-AP Vizianagaram</span>
          <div className="flex-1" />
          <div className="relative"><Bell className="w-6 h-6 text-gray-500" /><span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">12</span></div>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">{user.initials}</div>
              <div className="leading-tight text-left hidden sm:block"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-500">{user.role}</p></div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-500 truncate">{user.email}</p><p className="text-xs text-blue-600 mt-1">{user.role}</p></div>
                <button onClick={onSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Page id={active} user={user} /></main>
      </div>
    </div>
  );
}

/* ============================== ROOT ============================== */
export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginPage onSignIn={setUser} />;
  return <Shell user={user} onSignOut={() => setUser(null)} />;
}
