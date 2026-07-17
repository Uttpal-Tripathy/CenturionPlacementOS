import type { Role } from "../context/AuthContext";

export interface Field {
  key: string; label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: string[]; filter?: boolean; badge?: boolean;
}
export interface ModuleConfig { title: string; subtitle: string; singular: string; fields: Field[]; }

const F = (key: string, label: string, opts: Partial<Field> = {}): Field => ({ key, label, ...opts });

export const MODULES: Record<string, ModuleConfig> = {
  students: { title: "Student Profiles", subtitle: "Master directory of student records", singular: "Student", fields: [
    F("name", "Name"), F("roll", "Roll No"), F("dept", "Dept", { type: "select", options: ["CSE", "IT", "ECE", "EEE", "MECH"], filter: true }),
    F("batch", "Batch"), F("cgpa", "CGPA", { type: "number" }), F("backlogs", "Backlogs", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Placed", "Unplaced", "Higher Studies"], filter: true, badge: true }) ] },
  eligibility: { title: "Eligibility Management", subtitle: "Screen students against CGPA / backlog rules", singular: "Record", fields: [
    F("name", "Name"), F("roll", "Roll No"), F("dept", "Branch", { type: "select", options: ["CSE", "IT", "ECE", "EEE", "MECH"], filter: true }),
    F("cgpa", "CGPA", { type: "number" }), F("backlogs", "Backlogs", { type: "number" }),
    F("status", "Eligibility", { type: "select", options: ["Eligible", "Not Eligible", "Pending Review"], filter: true, badge: true }) ] },
  applications: { title: "Applications", subtitle: "Track applications through the recruitment funnel", singular: "Application", fields: [
    F("student", "Student"), F("company", "Company"), F("title", "Role"),
    F("status", "Status", { type: "select", options: ["Applied", "Shortlisted", "Assessment", "Interview", "Selected", "Rejected", "Offered", "Accepted"], filter: true, badge: true }),
    F("applied", "Applied") ] },
  preferences: { title: "Placement Preferences", subtitle: "Student-stated preferences for matching", singular: "Preference", fields: [
    F("student", "Student"), F("locations", "Locations"), F("industries", "Industries"), F("roles", "Roles"),
    F("expectedCtc", "Expected CTC"), F("relocation", "Relocate", { type: "select", options: ["Yes", "No"], filter: true }) ] },
  companies: { title: "Company Database", subtitle: "Recruiting partner organisations", singular: "Company", fields: [
    F("name", "Company"), F("industry", "Industry", { type: "select", options: ["IT Services", "Consulting", "Core", "Product"], filter: true }),
    F("hr", "HR Contact"), F("email", "Email"), F("website", "Website") ] },
  jobs: { title: "Job Postings", subtitle: "Open, closed and draft requisitions", singular: "Job", fields: [
    F("company", "Company"), F("title", "Title"), F("roles", "Roles"), F("ctc", "CTC"),
    F("location", "Location", { type: "select", options: ["Bengaluru", "Hyderabad", "Chennai", "Pune", "Remote"], filter: true }),
    F("minCgpa", "Min CGPA", { type: "number" }), F("deadline", "Deadline"),
    F("status", "Status", { type: "select", options: ["Open", "Closed", "Draft"], filter: true, badge: true }) ] },
  drives: { title: "Recruitment Drives", subtitle: "On-campus and online recruitment events", singular: "Drive", fields: [
    F("company", "Company"), F("role", "Role"), F("date", "Date"),
    F("mode", "Mode", { type: "select", options: ["Online", "Offline"], filter: true }), F("venue", "Venue"),
    F("status", "Status", { type: "select", options: ["Pending", "Ongoing", "Completed"], filter: true, badge: true }) ] },
  assessments: { title: "Assessments", subtitle: "Scheduled tests and AI mock practice", singular: "Assessment", fields: [
    F("company", "Company"), F("role", "Role"), F("type", "Type", { type: "select", options: ["Aptitude", "Technical", "Coding Test"], filter: true }),
    F("date", "Date"), F("time", "Time"), F("duration", "Duration"),
    F("status", "Status", { type: "select", options: ["Upcoming", "Scheduled", "Completed"], filter: true, badge: true }) ] },
  interviews: { title: "Interviews", subtitle: "Interview rounds for shortlisted candidates", singular: "Interview", fields: [
    F("student", "Student"), F("company", "Company"), F("round", "Round"), F("date", "Date"), F("time", "Time"),
    F("mode", "Mode", { type: "select", options: ["Online", "Offline"], filter: true }),
    F("status", "Status", { type: "select", options: ["Scheduled", "Completed", "Pending"], filter: true, badge: true }) ] },
  tracking: { title: "Selection Tracking", subtitle: "Funnel counts per company / role", singular: "Track", fields: [
    F("company", "Company"), F("role", "Role"), F("applied", "Applied", { type: "number" }), F("shortlisted", "Shortlisted", { type: "number" }),
    F("interview", "In Interview", { type: "number" }), F("selected", "Selected", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Just Started", "Active", "Ongoing", "Completed"], filter: true, badge: true }) ] },
  offers: { title: "Offer Management", subtitle: "Offers extended and acceptance status", singular: "Offer", fields: [
    F("student", "Student"), F("company", "Company"), F("role", "Role"), F("ctc", "CTC"), F("offerDate", "Offer Date"),
    F("status", "Status", { type: "select", options: ["Pending", "Accepted", "Declined"], filter: true, badge: true }) ] },
  internships: { title: "Internship Management", subtitle: "Internship opportunities and lifecycle", singular: "Internship", fields: [
    F("company", "Company"), F("role", "Role"), F("duration", "Duration"), F("stipend", "Stipend"), F("location", "Location"),
    F("status", "Status", { type: "select", options: ["Open", "Closed"], filter: true, badge: true }), F("deadline", "Deadline") ] },
  notifications: { title: "Notifications", subtitle: "Placement-cell notifications", singular: "Notification", fields: [
    F("title", "Title"), F("category", "Category", { type: "select", options: ["Job", "Assessment", "Interview", "Offer", "General"], filter: true }),
    F("audience", "Audience"), F("date", "Date") ] },
  email: { title: "Email / SMS", subtitle: "Reusable communication templates", singular: "Template", fields: [
    F("template", "Template"), F("type", "Type", { type: "select", options: ["Email", "SMS"], filter: true }), F("subject", "Subject"), F("body", "Body", { type: "textarea" }) ] },
  announcement: { title: "Announcement", subtitle: "Broadcast announcements", singular: "Announcement", fields: [
    F("title", "Title"), F("audience", "Audience", { type: "select", options: ["All Students", "Final Year", "Faculty"], filter: true }), F("date", "Date"), F("body", "Body", { type: "textarea" }) ] },
  reports: { title: "Placement Reports", subtitle: "Generated placement statistics reports", singular: "Report", fields: [
    F("name", "Report Name"), F("period", "Period"), F("type", "Type", { type: "select", options: ["Annual", "Department", "Accreditation", "Custom"], filter: true }), F("generatedOn", "Generated On") ] },
  custom: { title: "Custom Reports", subtitle: "User-defined report definitions", singular: "Report", fields: [
    F("name", "Report Name"), F("dataset", "Dataset", { type: "select", options: ["Students", "Offers", "Applications", "Companies"], filter: true }), F("createdBy", "Created By"), F("createdOn", "Created On") ] },
  documents: { title: "Document Repository", subtitle: "Placement-related documents", singular: "Document", fields: [
    F("name", "File Name"), F("type", "Type", { type: "select", options: ["Resume", "Offer Letter", "Marksheet", "Certificate", "Image"], filter: true }), F("owner", "Owner"), F("date", "Date"), F("size", "Size") ] },
  employer: { title: "Employer Portal", subtitle: "Employer-submitted requisitions", singular: "Posting", fields: [
    F("company", "Company"), F("title", "Role"), F("positions", "Positions", { type: "number" }),
    F("status", "Status", { type: "select", options: ["Open", "Closed"], filter: true, badge: true }), F("postedOn", "Posted On") ] },
  users: { title: "User Management", subtitle: "System users and roles", singular: "User", fields: [
    F("name", "Name"), F("email", "Email"), F("role", "Role", { type: "select", options: ["Placement Officer", "Career Coordinator", "Administrator", "Faculty", "Student"], filter: true }),
    F("status", "Status", { type: "select", options: ["Active", "Inactive"], filter: true, badge: true }) ] },
};

export const ROLES: Role[] = ["Placement Officer", "Student", "Career Coordinator", "Administrator", "Employer", "Faculty", "Pursuit Manager", "HoD", "Dean", "Registrar", "Vice Chancellor", "Trainer"];

// SRS Appendix A — module id -> roles allowed to see it.
export const ACCESS: Record<string, Role[]> = {
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
export const canAccess = (role: Role, id: string) => (ACCESS[id] || []).includes(role);
export const WRITE_ROLES: Role[] = ["Placement Officer", "Administrator", "Career Coordinator", "Pursuit Manager", "Employer"];

export interface NavItem { id: string; label: string; icon: string; }
export const NAV: { section: string | null; items: NavItem[] }[] = [
  { section: null, items: [{ id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" }] },
  { section: "STUDENT MANAGEMENT", items: [
    { id: "students", label: "Student Profiles", icon: "Users" }, { id: "eligibility", label: "Eligibility Management", icon: "ShieldCheck" },
    { id: "applications", label: "Applications", icon: "FileText" }, { id: "preferences", label: "Placement Preferences", icon: "Heart" } ] },
  { section: "COMPANY MANAGEMENT", items: [
    { id: "companies", label: "Company Database", icon: "Building2" }, { id: "jobs", label: "Job Postings", icon: "Briefcase" },
    { id: "drives", label: "Recruitment Drives", icon: "CalendarDays" } ] },
  { section: "RECRUITMENT PROCESS", items: [
    { id: "assessments", label: "Assessments", icon: "ClipboardList" }, { id: "interviews", label: "Interviews", icon: "MessageSquare" },
    { id: "tracking", label: "Selection Tracking", icon: "GitBranch" }, { id: "offers", label: "Offer Management", icon: "Handshake" },
    { id: "internships", label: "Internship Management", icon: "GraduationCap" } ] },
  { section: "COMMUNICATION", items: [
    { id: "notifications", label: "Notifications", icon: "Bell" }, { id: "email", label: "Email / SMS", icon: "Mail" },
    { id: "announcement", label: "Announcement", icon: "Megaphone" } ] },
  { section: "REPORTS & ANALYTICS", items: [
    { id: "reports", label: "Placement Reports", icon: "BarChart3" }, { id: "analytics", label: "Analytics Dashboard", icon: "PieChart" },
    { id: "custom", label: "Custom Reports", icon: "FileBarChart" } ] },
  { section: "DOCUMENTS", items: [{ id: "documents", label: "Document Repository", icon: "FolderOpen" }] },
  { section: "PORTALS", items: [{ id: "employer", label: "Employer Portal", icon: "Building" }] },
  { section: "SYSTEM ADMIN", items: [
    { id: "users", label: "User Management", icon: "UserCog" }, { id: "config", label: "Configuration", icon: "Settings" },
    { id: "settings", label: "System Settings", icon: "SlidersHorizontal" } ] },
];

// Seed data used by `npm run seed`.
export const SEED: Record<string, any[]> = {
  students: [
    { name: "Aarav Reddy", roll: "22CSE001", dept: "CSE", batch: "2026", cgpa: 8.9, backlogs: 0, status: "Placed" },
    { name: "Diya Sharma", roll: "22CSE014", dept: "CSE", batch: "2026", cgpa: 9.2, backlogs: 0, status: "Placed" },
    { name: "Rohan Verma", roll: "22IT007", dept: "IT", batch: "2026", cgpa: 7.4, backlogs: 1, status: "Unplaced" },
    { name: "Ananya Nair", roll: "22ECE022", dept: "ECE", batch: "2026", cgpa: 8.1, backlogs: 0, status: "Unplaced" },
    { name: "Karthik Rao", roll: "22MECH003", dept: "MECH", batch: "2026", cgpa: 6.8, backlogs: 2, status: "Unplaced" },
    { name: "Vikram Singh", roll: "22EEE011", dept: "EEE", batch: "2026", cgpa: 7.9, backlogs: 0, status: "Placed" },
  ],
  eligibility: [
    { name: "Aarav Reddy", roll: "22CSE001", dept: "CSE", cgpa: 8.9, backlogs: 0, status: "Eligible" },
    { name: "Karthik Rao", roll: "22MECH003", dept: "MECH", cgpa: 6.8, backlogs: 2, status: "Not Eligible" },
    { name: "Sneha Iyer", roll: "22IT019", dept: "IT", cgpa: 8.4, backlogs: 0, status: "Pending Review" },
  ],
  applications: [
    { student: "Aarav Reddy", company: "Infosys", title: "Systems Engineer", status: "Accepted", applied: "02 May 2025" },
    { student: "Rohan Verma", company: "TCS", title: "Ninja Digital", status: "Interview", applied: "06 May 2025" },
    { student: "Ananya Nair", company: "Wipro", title: "Project Engineer", status: "Assessment", applied: "07 May 2025" },
  ],
  preferences: [
    { student: "Aarav Reddy", locations: "Bengaluru, Hyderabad", industries: "IT Services", roles: "Full Stack", expectedCtc: "8 LPA", relocation: "Yes" },
  ],
  companies: [
    { name: "Infosys", industry: "IT Services", hr: "Priya Menon", email: "priya.m@infosys.com", website: "infosys.com" },
    { name: "TCS", industry: "IT Services", hr: "Rahul Das", email: "rahul.d@tcs.com", website: "tcs.com" },
    { name: "Cognizant", industry: "Consulting", hr: "Sameer Khan", email: "sameer.k@cognizant.com", website: "cognizant.com" },
  ],
  jobs: [
    { company: "Infosys", title: "Systems Engineer", roles: "Full Stack", ctc: "6.5 LPA", location: "Bengaluru", minCgpa: 6.5, deadline: "25 May 2025", status: "Open" },
    { company: "TCS", title: "Ninja Digital", roles: "Backend", ctc: "3.6 LPA", location: "Hyderabad", minCgpa: 6.0, deadline: "28 May 2025", status: "Open" },
  ],
  drives: [
    { company: "Infosys", role: "Software Engineer", date: "28 May 2025", mode: "Offline", venue: "Auditorium A", status: "Ongoing" },
    { company: "TCS", role: "Ninja Digital", date: "30 May 2025", mode: "Online", venue: "MS Teams", status: "Pending" },
  ],
  assessments: [
    { company: "TCS", role: "Ninja Digital", type: "Aptitude", date: "25 May 2025", time: "10:00 AM", duration: "90 min", status: "Scheduled" },
    { company: "Cognizant", role: "Programmer Analyst", type: "Coding Test", date: "20 May 2025", time: "11:00 AM", duration: "120 min", status: "Completed" },
  ],
  interviews: [
    { student: "Aarav Reddy", company: "Infosys", round: "Technical", date: "26 May 2025", time: "10:30 AM", mode: "Offline", status: "Scheduled" },
  ],
  tracking: [
    { company: "Infosys", role: "Systems Engineer", applied: 320, shortlisted: 140, interview: 60, selected: 45, status: "Completed" },
    { company: "TCS", role: "Ninja Digital", applied: 410, shortlisted: 190, interview: 120, selected: 0, status: "Ongoing" },
  ],
  offers: [
    { student: "Aarav Reddy", company: "Infosys", role: "Systems Engineer", ctc: "6.5 LPA", offerDate: "22 May 2025", status: "Accepted" },
    { student: "Diya Sharma", company: "Cognizant", role: "Programmer Analyst", ctc: "7.0 LPA", offerDate: "23 May 2025", status: "Pending" },
  ],
  internships: [
    { company: "Infosys", role: "SDE Intern", duration: "6 months", stipend: "₹25,000/mo", location: "Bengaluru", status: "Open", deadline: "30 May 2025" },
  ],
  notifications: [
    { title: "New Job Posted by TCS", category: "Job", audience: "All Students", date: "24 May 2025" },
  ],
  email: [
    { template: "Job Posting Announcement", type: "Email", subject: "New opening at {company_name}", body: "Dear {student_name}, {company_name} is hiring for {job_title}." },
  ],
  announcement: [
    { title: "Placement Drive Week", audience: "All Students", date: "20 May 2025", body: "Placement week begins 28 May. Keep resumes updated." },
  ],
  reports: [
    { name: "Annual Placement Report 2024-25", period: "2024-25", type: "Annual", generatedOn: "22 May 2025" },
  ],
  custom: [
    { name: "CSE vs IT Package Comparison", dataset: "Offers", createdBy: "Rajesh Kumar", createdOn: "21 May 2025" },
  ],
  documents: [
    { name: "Aarav_Resume.pdf", type: "Resume", owner: "Aarav Reddy", date: "20 May 2025", size: "240 KB" },
  ],
  employer: [
    { company: "Infosys", title: "Systems Engineer", positions: 50, status: "Open", postedOn: "15 May 2025" },
  ],
  users: [
    { name: "Rajesh Kumar", email: "rajesh.kumar@cutm.ac.in", role: "Placement Officer", status: "Active" },
    { name: "Admin", email: "admin@cutm.ac.in", role: "Administrator", status: "Active" },
  ],
};
