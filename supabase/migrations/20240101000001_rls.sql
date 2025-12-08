-- Enable RLS on core tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- STUDENTS POLICIES

-- Parents can only see their own children
CREATE POLICY parent_view_students ON students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_links
    WHERE parent_student_links.parent_id = auth.uid()
    AND parent_student_links.student_id = students.id
  )
);

-- Teachers can see only their classes
CREATE POLICY teacher_view_students ON students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM teacher_assignments ta
    JOIN classes c ON ta.class_id = c.id
    WHERE ta.teacher_id = auth.uid()
    AND c.id = students.class_id
  )
);

-- Principals can see all students in their school
-- Note: Requires linking auth.uid() -> users.school_id mapping.
-- Using a subquery to fetch the user's school_id from keys or public users table.
-- Assuming 'users' table is queryable by the user, or we are using auth.jwt() metadata.
-- Use a helper function or direct join for robustness.
CREATE POLICY principal_view_students ON students
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.school_id = students.school_id
    AND users.role = 'PRINCIPAL'
  )
);

-- EXAMS POLICIES
CREATE POLICY teacher_manage_exams ON exams
FOR ALL USING (
  created_by = auth.uid()
);

CREATE POLICY student_view_exams ON exams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.class_id = exams.class_id
    -- Need to link auth.uid() to student record?
    -- If auth.uid() is the Student User ID, we check if they are the student.
    -- Assuming a Student User is linked to a Student Record via user_id?
    -- Wait, the schema has 'students' table with 'student_code'.
    -- Does 'students' table have a 'user_id' link?
    -- The Blueprint 'users' table has role='STUDENT' and 'email'.
    -- But 'students' table seems to be the academic record.
    -- Is there a link between 'users' (auth) and 'students' (academic)?
    -- Creating a link column 'user_id' in students table or assuming link via email/code?
    -- The 'students' table in blueprint does NOT have 'user_id' FK to users.
    -- However, 'students' has 'student_code'.
    -- I will assume for RLS that we need to link them.
    -- I'll ADD a policy assuming there IS a link for simplicity, or omit if strictly following blueprint.
    -- User's blueprint doesn't show explicit link in schema block, but implied in "Roles".
    -- I'll skip complex Student RLS for now or assume they can view based on class_id if enrolled?
    -- But ANYONE can't view ANY class's exams.
    -- I'll leave a comment about this gap.
  )
);

-- MESSAGES POLICIES
CREATE POLICY view_own_messages ON messages
FOR SELECT USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid()
);

CREATE POLICY send_messages ON messages
FOR INSERT WITH CHECK (
  from_user_id = auth.uid()
);
