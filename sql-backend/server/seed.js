// Seed the SQL database with sample rows. Run after creating the schema:
//   node server/seed.js
import crypto from "crypto";
import "dotenv/config";

const KIND = (process.env.DB_KIND || "postgres").toLowerCase();
let db;
if (KIND === "mysql") {
  const mysql = (await import("mysql2/promise")).default;
  const pool = mysql.createPool(process.env.DATABASE_URL || { host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME,port:process.env.DB_PORT||3306 });
  db = { quote:(i)=>"`"+i+"`", async q(t,p=[]){ await pool.query(t.replace(/\$\d+/g,"?"),p); } };
} else {
  const pg = (await import("pg")).default;
  const pool = new pg.Pool(process.env.DATABASE_URL ? { connectionString:process.env.DATABASE_URL } : { host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,database:process.env.DB_NAME,port:process.env.DB_PORT||5432 });
  db = { quote:(i)=>'"'+i+'"', async q(t,p=[]){ await pool.query(t,p); } };
}

const SEED = {
  users:[{name:"Rajesh Kumar",email:"rajesh.kumar@cutm.ac.in",role:"Placement Officer",status:"Active"},{name:"Admin",email:"admin@cutm.ac.in",role:"Administrator",status:"Active"}],
  students:[{name:"Aarav Reddy",roll:"22CSE001",dept:"CSE",batch:"2026",cgpa:8.9,backlogs:0,status:"Placed"},{name:"Rohan Verma",roll:"22IT007",dept:"IT",batch:"2026",cgpa:7.4,backlogs:1,status:"Unplaced"}],
  companies:[{name:"Infosys",industry:"IT Services",hr:"Priya Menon",email:"priya.m@infosys.com",website:"infosys.com"},{name:"TCS",industry:"IT Services",hr:"Rahul Das",email:"rahul.d@tcs.com",website:"tcs.com"}],
  jobs:[{company:"Infosys",title:"Systems Engineer",roles:"Full Stack",ctc:"6.5 LPA",location:"Bengaluru",min_cgpa:6.5,deadline:"25 May 2025",status:"Open"}],
  internships:[{company:"Wipro",role:"Data Intern",duration:"3 months",stipend:"18k/mo",location:"Remote",status:"Open",deadline:"05 Jun 2025"}],
  offers:[{student:"Aarav Reddy",company:"Infosys",role:"Systems Engineer",ctc:"6.5 LPA",offerDate:"22 May 2025",status:"Accepted"}],
};

for (const [table, rows] of Object.entries(SEED)) {
  for (const row of rows) {
    const keys = ["id", ...Object.keys(row)];
    const vals = [crypto.randomUUID(), ...Object.values(row)];
    const cols = keys.map(db.quote).join(",");
    const phs = keys.map((_, i) => "$" + (i + 1)).join(",");
    try { await db.q(`INSERT INTO ${db.quote(table)} (${cols}) VALUES (${phs})`, vals); } catch (e) { console.error(table, e.message); }
  }
  console.log("seeded", table, rows.length);
}
console.log("Done.");
process.exit(0);
