-- ==========================================
-- 1. STRICT TYPING (ENUMS)
-- ==========================================
-- Sourced directly from your SRS user roles and statuses
CREATE TYPE user_role AS ENUM ('Clerk', 'Staff', 'Principal', 'Institute Authority');
CREATE TYPE doc_status AS ENUM ('Valid', 'Expiring Soon', 'Expired');
CREATE TYPE approval_step AS ENUM ('Pending', 'Staff Reviewed', 'Principal Approved', 'Rejected');

-- ==========================================
-- 2. TABLE DEFINITIONS
-- ==========================================

-- Institutes Table
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (Extends Supabase's native auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    document_name TEXT NOT NULL,
    category TEXT NOT NULL,
    responsible_person TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    r2_file_key TEXT NOT NULL, -- The Cloudflare R2 reference pointer
    status doc_status DEFAULT 'Valid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals Table
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback TEXT,
    step approval_step DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Institute Policies
-- ------------------------------------------
-- Anyone logged in can view institutes, but only the system can create them.
CREATE POLICY "Institutes are viewable by all authenticated users."
ON institutes FOR SELECT TO authenticated USING (true);

-- ------------------------------------------
-- User Policies
-- ------------------------------------------
-- Users can see other users in their own institute OR if they are an Institute Authority.
CREATE POLICY "Users can view members of their own institute."
ON users FOR SELECT TO authenticated USING (
    institute_id = (SELECT institute_id FROM users WHERE id = auth.uid()) 
    OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'Institute Authority'
);

-- ------------------------------------------
-- Document Policies
-- ------------------------------------------
-- Users can only view documents belonging to their specific institute, unless they are Authority.
CREATE POLICY "Users can view documents for their institute."
ON documents FOR SELECT TO authenticated USING (
    institute_id = (SELECT institute_id FROM users WHERE id = auth.uid())
    OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'Institute Authority'
);

-- Only Clerks can insert new documents.
CREATE POLICY "Clerks can insert documents."
ON documents FOR INSERT TO authenticated WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'Clerk'
    AND 
    institute_id = (SELECT institute_id FROM users WHERE id = auth.uid())
);

-- ------------------------------------------
-- Approval Policies
-- ------------------------------------------
-- Anyone in the institute can see the approval workflow status.
CREATE POLICY "Users can view approvals for their institute's documents."
ON approvals FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM documents 
        WHERE documents.id = approvals.document_id 
        AND documents.institute_id = (SELECT institute_id FROM users WHERE id = auth.uid())
    )
);

-- Staff and Principals can insert/update approval feedback.
CREATE POLICY "Staff and Principals can manage approvals."
ON approvals FOR ALL TO authenticated USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('Staff', 'Principal')
);