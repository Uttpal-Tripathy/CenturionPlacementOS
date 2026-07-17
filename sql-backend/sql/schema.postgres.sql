-- PlacementOS relational schema (PostgreSQL).
-- Maps to SDD §5.3 target design (3NF, surrogate UUID keys, explicit FKs).
-- Run:  psql "$DATABASE_URL" -f schema.postgres.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- Single identity table for every role.
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'Student',
  status      TEXT NOT NULL DEFAULT 'Active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student-only attributes (1:0..1 extension of users).
CREATE TABLE IF NOT EXISTS students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  roll           TEXT UNIQUE,
  dept           TEXT,
  batch          TEXT,
  cgpa           NUMERIC(4,2),
  backlogs       INTEGER DEFAULT 0,
  status         TEXT DEFAULT 'Unplaced',
  email          TEXT,          -- institutional @cutm.ac.in / @cutmap.ac.in address (Google sign-in identity)
  personal_email TEXT,
  phone          TEXT,
  campus         TEXT,
  school         TEXT,
  gender         TEXT,
  domain         TEXT,          -- specialization / elective track
  cv_link        TEXT,
  interest       TEXT,          -- Job / Higher Education / Self Employment
  gfg_score      NUMERIC(6,2),  -- GeeksforGeeks coding score from the student roster
  tenth_pct      NUMERIC(5,2),  -- 10th standard percentage (from the student roster)
  twelfth_pct    NUMERIC(5,2),  -- 12th standard percentage (from the student roster)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  industry    TEXT,
  hr          TEXT,
  email       TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company       TEXT NOT NULL,
  title         TEXT NOT NULL,
  roles         TEXT,
  ctc           TEXT,
  location      TEXT,
  min_cgpa      NUMERIC(4,2),
  deadline      TEXT,
  status        TEXT DEFAULT 'Open',
  source        TEXT DEFAULT 'On-Campus',  -- On-Campus (drive) or Off-Campus (open hiring)
  apply_url     TEXT,                      -- external application link, for Off-Campus postings
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS internships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company     TEXT NOT NULL,
  role        TEXT,
  duration    TEXT,
  stipend     TEXT,
  location    TEXT,
  status      TEXT DEFAULT 'Open',
  deadline    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company     TEXT, role TEXT, date TEXT, mode TEXT, venue TEXT, status TEXT DEFAULT 'Pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, roll TEXT, dept TEXT, cgpa NUMERIC(4,2), backlogs INTEGER, status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student     TEXT NOT NULL,
  email       TEXT,
  company     TEXT,
  title       TEXT,
  type        TEXT DEFAULT 'Job',
  status      TEXT DEFAULT 'Applied',
  applied     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT, role TEXT, type TEXT, date TEXT, time TEXT, duration TEXT, status TEXT DEFAULT 'Upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student TEXT, company TEXT, round TEXT, date TEXT, time TEXT, mode TEXT, status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT, role TEXT, applied INTEGER, shortlisted INTEGER, interview INTEGER, selected INTEGER, status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student TEXT, company TEXT, role TEXT, ctc TEXT, "offerDate" TEXT, status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student TEXT, locations TEXT, industries TEXT, roles TEXT, "expectedCtc" TEXT, relocation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, category TEXT, audience TEXT, date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT, type TEXT, subject TEXT, body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, audience TEXT, date TEXT, body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, period TEXT, type TEXT, "generatedOn" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, dataset TEXT, "createdBy" TEXT, "createdOn" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, type TEXT, owner TEXT, date TEXT, size TEXT,
  email TEXT,          -- uploader's email, for self-service "my documents" filtering
  "dataUrl" TEXT,       -- base64 file content (student self-uploads: certificates, marksheets, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT, title TEXT, positions INTEGER, status TEXT DEFAULT 'Open', "postedOn" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student portal extras
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE, name TEXT, headline TEXT, skills TEXT, location TEXT, education TEXT,
  phone TEXT, "resumeName" TEXT, "resumeUrl" TEXT, "photoUrl" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savedjobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT, "itemId" TEXT, company TEXT, title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offerletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student TEXT, email TEXT, company TEXT, role TEXT, "fileName" TEXT, "dataUrl" TEXT, "updatedAt" TEXT,
  "driveRefId" TEXT,                                   -- links to placement_drives.refId (backfilled on verification)
  "verificationStatus" TEXT DEFAULT 'Pending',          -- Pending / Verified / Rejected
  "verificationNote" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessmentresults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student TEXT, email TEXT, aptitude INTEGER, coding INTEGER, gd INTEGER, total INTEGER, band TEXT, date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student-generated, job-type-tailored resumes with a heuristic ATS compatibility score.
CREATE TABLE IF NOT EXISTS cv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT, roll TEXT, student TEXT, "jobType" TEXT,
  summary TEXT, skills TEXT, projects TEXT, certifications TEXT, experience TEXT,
  "atsScore" INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================== PURSUIT MANAGER: PLACEMENT DRIVE LIFECYCLE ==============================
-- Exclusive to the "Pursuit Manager" role (see ACCESS.pmdrives in placementos.html). One row per recruiter
-- drive, carrying the standard Placement Notification template fields plus lifecycle state and the fields
-- filled in later (Campus Drive Communication payload).
CREATE TABLE IF NOT EXISTS placement_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "refId" TEXT UNIQUE,                         -- e.g. "PD-2026-0001", generated client-side at Publish
  "recruiterName" TEXT, "recruiterProfile" TEXT, website TEXT,
  "jobTitle" TEXT, "jobProfile" TEXT, "jobSkill" TEXT, ctc TEXT,
  "selectionProcess" TEXT, "jobLocation" TEXT,
  "eligibleBranches" TEXT, "eligibleBatch" TEXT, "minCgpa" NUMERIC(4,2), "maxBacklogs" INTEGER,
  "expectedDriveDate" TEXT, "registrationLink" TEXT, "registrationDeadline" TEXT,
  "trainingNeed" TEXT, "releasedBy" TEXT,
  status TEXT DEFAULT 'Draft',                 -- Draft/Notified/Reminder Sent/Registration Closed/
                                                -- Drive Communicated/Attendance Marked/Results Declared/Completed
  "reportingTime" TEXT, venue TEXT, "requiredDocuments" TEXT, "dressCode" TEXT,
  "interviewSchedule" TEXT, "companyInstructions" TEXT,
  "notifiedAt" TEXT, "campusCommunicatedAt" TEXT, "resultsDeclaredAt" TEXT, "createdBy" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One wide row per (drive x eligible student) -- registration through round-wise results.
-- Joined by "roll" (the only always-present, unique student key), never by name/email.
CREATE TABLE IF NOT EXISTS drive_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "driveRefId" TEXT NOT NULL,
  roll TEXT NOT NULL, name TEXT, email TEXT, dept TEXT, batch TEXT,
  "cgpaAtEntry" NUMERIC(4,2), "backlogsAtEntry" INTEGER,
  "registrationStatus" TEXT DEFAULT 'Not Registered',   -- Not Registered / Registered
  "registeredAt" TEXT,
  "reminderSent" TEXT DEFAULT 'No', "reminderSentAt" TEXT,
  attendance TEXT DEFAULT '',                            -- '' / Appeared / Absent
  "roundAptitude" TEXT DEFAULT '', "roundTechnical" TEXT DEFAULT '', "roundCoding" TEXT DEFAULT '',
  "roundGD" TEXT DEFAULT '', "roundHR" TEXT DEFAULT '',   -- '' / Qualified / Rejected / Waiting List
  "finalStatus" TEXT DEFAULT '',                          -- '' / Selected / Rejected / Waiting List
  "readStatus" TEXT DEFAULT 'Unknown',                    -- manually recorded, no real delivery channel exists
  "ackStatus" TEXT DEFAULT 'Not Acknowledged',            -- manually recorded
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per send EVENT (not per student) -- the Notification ID / Ref ID / delivery-status log.
CREATE TABLE IF NOT EXISTS drive_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         -- this IS the Notification ID
  "driveRefId" TEXT NOT NULL,
  type TEXT,                                             -- Initial / Reminder / CampusDetails / OfferLetterReminder
  channel TEXT,                                          -- label only, e.g. "ERP Portal" -- no real delivery exists
  "recipientCount" INTEGER, "sentAt" TEXT, "sentBy" TEXT,
  "deliveryStatus" TEXT DEFAULT 'Recorded',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apps_student ON applications(student);
CREATE INDEX IF NOT EXISTS idx_saved_email  ON savedjobs(email);
CREATE INDEX IF NOT EXISTS idx_offers_student ON offers(student);
CREATE INDEX IF NOT EXISTS idx_drivestudents_driveref ON drive_students("driveRefId");
CREATE INDEX IF NOT EXISTS idx_drivestudents_roll      ON drive_students(roll);
CREATE INDEX IF NOT EXISTS idx_drivenotif_driveref      ON drive_notifications("driveRefId");
CREATE INDEX IF NOT EXISTS idx_offerletters_driveref    ON offerletters("driveRefId");
