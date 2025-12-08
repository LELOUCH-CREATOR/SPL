-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (all roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  role TEXT CHECK(role IN ('SUPERADMIN','PRINCIPAL','TEACHER','HOMEROOM','PARENT','STUDENT')),
  school_id UUID, -- Foreign key constraint added later to allow circular dep if needed, or just defined inline if table exists. 
                  -- Blueprint had REFERENCES schools(id). I'll add it, but schools table must exist.
                  -- I will reorder tables to avoid dependency issues.
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_code TEXT UNIQUE NOT NULL,
  domain TEXT,
  status TEXT CHECK(status IN ('PENDING','ACTIVE','SUSPENDED')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add User -> School FK now that Schools exists
ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id);

-- Grades (e.g., Grade 1, Grade 2)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES grades(id),
  name TEXT,
  homeroom_teacher_id UUID REFERENCES users(id)
);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT
);

-- Teacher Assignments
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id)
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  student_code TEXT UNIQUE,
  dob DATE,
  enrollment_status TEXT CHECK(enrollment_status IN ('ACTIVE','SUSPENDED','GRADUATED'))
);

-- Parent-Student Links
CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id),
  student_id UUID REFERENCES students(id),
  verified_at TIMESTAMPTZ,
  pairing_method TEXT CHECK(pairing_method IN ('ADMIN','CODE','QR'))
);

-- Exams
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  created_by UUID REFERENCES users(id),
  available_from TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  duration INT,
  config JSONB
);

-- Exam Attempts
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  student_id UUID REFERENCES students(id),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  answers JSONB,
  status TEXT CHECK(status IN ('PENDING','SUBMITTED','GRADED'))
);

-- Grades Records
CREATE TABLE grades_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  exam_id UUID REFERENCES exams(id),
  score NUMERIC,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  school_id UUID REFERENCES schools(id),
  content TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  issued_by UUID REFERENCES users(id),
  type TEXT,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- Events / Calendar
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  title TEXT,
  description TEXT,
  event_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  before JSONB,
  after JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
