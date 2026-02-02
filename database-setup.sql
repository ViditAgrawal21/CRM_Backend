-- ========================================
-- CRM Database Schema Setup Script
-- Execute this in Supabase SQL Editor
-- ========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_type AS ENUM ('lead', 'call_back', 'not_interested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'prospect', 'spam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_action AS ENUM ('call', 'whatsapp', 'template');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_outcome AS ENUM ('interested', 'not_interested', 'call_back', 'no_answer', 'wrong_number');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visit_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    monthly_meeting_target INTEGER DEFAULT 0,
    monthly_visit_target INTEGER DEFAULT 0,
    monthly_revenue_target DECIMAL(15, 2) DEFAULT 0,
    monthly_bonus DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create templates table (BEFORE logs table)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type lead_type NOT NULL,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    configuration VARCHAR(100),
    location VARCHAR(255),
    remark TEXT,
    status lead_status DEFAULT 'new',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create followups table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reminder_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    outcome call_outcome,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    status meeting_status DEFAULT 'scheduled',
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    site_location VARCHAR(255) NOT NULL,
    status visit_status DEFAULT 'scheduled',
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create logs table (AFTER templates table)
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action log_action NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    duration INTEGER,
    outcome call_outcome,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create targets table
CREATE TABLE IF NOT EXISTS targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    meeting_target INTEGER DEFAULT 0,
    visit_target INTEGER DEFAULT 0,
    revenue_target DECIMAL(15, 2) DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    meetings_achieved INTEGER DEFAULT 0,
    visits_achieved INTEGER DEFAULT 0,
    revenue_achieved DECIMAL(15, 2) DEFAULT 0,
    bonus_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- 12. Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    total_whatsapp INTEGER DEFAULT 0,
    total_templates INTEGER DEFAULT 0,
    total_meetings INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    next_day_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, report_date)
);

-- ========================================
-- Functions
-- ========================================

-- Function to get user's team (recursive)
CREATE OR REPLACE FUNCTION get_user_team(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    phone VARCHAR,
    role user_role,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE team AS (
        SELECT u.id, u.name, u.phone, u.role, u.is_active, u.created_at, u.created_by
        FROM users u
        WHERE u.id = p_user_id
        
        UNION ALL
        
        SELECT u.id, u.name, u.phone, u.role, u.is_active, u.created_at, u.created_by
        FROM users u
        INNER JOIN team t ON u.created_by = t.id
    )
    SELECT t.id, t.name, t.phone, t.role, t.is_active, t.created_at
    FROM team t;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate user and cascade to subordinates
CREATE OR REPLACE FUNCTION deactivate_user_cascade(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    WITH RECURSIVE team AS (
        SELECT id FROM users WHERE id = p_user_id
        UNION ALL
        SELECT u.id FROM users u
        INNER JOIN team t ON u.created_by = t.id
    )
    UPDATE users
    SET is_active = false, updated_at = NOW()
    WHERE id IN (SELECT id FROM team);
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark missed followups
CREATE OR REPLACE FUNCTION mark_missed_followups()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE followups
    SET status = 'missed'
    WHERE status = 'pending'
    AND reminder_at < NOW();
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update target achievements
CREATE OR REPLACE FUNCTION update_target_achievements(p_user_id UUID, p_month DATE)
RETURNS VOID AS $$
BEGIN
    UPDATE targets t
    SET
        meetings_achieved = (
            SELECT COUNT(*)
            FROM meetings m
            WHERE m.user_id = p_user_id
            AND DATE_TRUNC('month', m.scheduled_at) = DATE_TRUNC('month', p_month)
            AND m.status = 'completed'
        ),
        visits_achieved = (
            SELECT COUNT(*)
            FROM visits v
            WHERE v.user_id = p_user_id
            AND DATE_TRUNC('month', v.scheduled_at) = DATE_TRUNC('month', p_month)
            AND v.status = 'completed'
        ),
        updated_at = NOW()
    WHERE t.user_id = p_user_id
    AND DATE_TRUNC('month', t.month) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Triggers
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_followups_user_id ON followups(user_id);
CREATE INDEX IF NOT EXISTS idx_followups_reminder_at ON followups(reminder_at);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_targets_user_month ON targets(user_id, month);

-- ========================================
-- Initial Owner User Seed
-- Password: owner123
-- ========================================

INSERT INTO users (name, phone, password_hash, role, created_by, is_active)
VALUES (
    'System Owner',
    '9999999999',
    '$2b$10$h4tT0ASG3BFbts6ml5n3A.9dMHiwJFaCgn4AZmT1V5e7rMvSi/kKa',
    'owner',
    NULL,
    true
)
ON CONFLICT (phone) DO NOTHING;

-- ========================================
-- Success Message
-- ========================================

SELECT 'Database schema created successfully! Owner user: 9999999999 / owner123' AS message;
