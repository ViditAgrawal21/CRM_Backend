-- =====================================================
-- SUPABASE DATABASE SCHEMA FOR CRM SYSTEM
-- Production-Ready Version
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    
    -- Monthly targets (set by admin/owner)
    monthly_meeting_target INTEGER DEFAULT 0,
    monthly_visit_target INTEGER DEFAULT 0,
    monthly_revenue_target DECIMAL(12, 2) DEFAULT 0,
    monthly_bonus DECIMAL(12, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 2. LEADS TABLE
-- =====================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    type VARCHAR(10) NOT NULL CHECK (type IN ('lead', 'data')),
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    configuration TEXT,
    location TEXT,
    remark TEXT,
    
    -- Status management
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
        'new', 'contacted', 'interested', 'not_interested', 
        'prospect', 'converted', 'spam'
    )),
    
    -- Assignment tracking
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_date ON leads(date);

-- =====================================================
-- 3. TEMPLATES TABLE
-- =====================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_is_active ON templates(is_active);

-- =====================================================
-- 4. FOLLOWUPS TABLE
-- =====================================================

CREATE TABLE followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'missed', 'done')),
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_followups_lead_id ON followups(lead_id);
CREATE INDEX idx_followups_user_id ON followups(user_id);
CREATE INDEX idx_followups_reminder_at ON followups(reminder_at);
CREATE INDEX idx_followups_status ON followups(status);

-- =====================================================
-- 5. MEETINGS TABLE
-- =====================================================

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
    location TEXT,
    notes TEXT,
    outcome TEXT,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- =====================================================
-- 6. VISITS TABLE
-- =====================================================

CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
    site_location TEXT,
    notes TEXT,
    outcome TEXT,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_visits_lead_id ON visits(lead_id);
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_scheduled_at ON visits(scheduled_at);
CREATE INDEX idx_visits_status ON visits(status);

-- =====================================================
-- 7. LOGS TABLE
-- =====================================================

CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'call', 'whatsapp', 'template', 'meeting', 'visit', 'note', 'status_change'
    )),
    duration INTEGER,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    outcome TEXT,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_lead_id ON logs(lead_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);

-- =====================================================
-- 8. NOTES TABLE
-- =====================================================

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_lead_id ON notes(lead_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- =====================================================
-- 9. TARGETS TABLE
-- =====================================================

CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    
    -- Targets (set by admin)
    meeting_target INTEGER DEFAULT 0,
    visit_target INTEGER DEFAULT 0,
    revenue_target DECIMAL(12, 2) DEFAULT 0,
    bonus DECIMAL(12, 2) DEFAULT 0,
    
    -- Achievements (auto-calculated)
    meeting_achieved INTEGER DEFAULT 0,
    visit_achieved INTEGER DEFAULT 0,
    revenue_achieved DECIMAL(12, 2) DEFAULT 0,
    
    -- Bonus approval
    bonus_approved BOOLEAN DEFAULT false,
    bonus_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    bonus_approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

CREATE INDEX idx_targets_user_id ON targets(user_id);
CREATE INDEX idx_targets_month ON targets(month);
CREATE INDEX idx_targets_bonus_approved ON targets(bonus_approved);

-- =====================================================
-- 10. DAILY REPORTS TABLE
-- =====================================================

CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    
    -- Stats
    visits_till_now INTEGER DEFAULT 0,
    meetings_till_now INTEGER DEFAULT 0,
    prospects_till_now INTEGER DEFAULT 0,
    today_meetings INTEGER DEFAULT 0,
    today_visits INTEGER DEFAULT 0,
    total_calls INTEGER DEFAULT 0,
    
    -- Prospects data
    prospects_data JSONB,
    
    -- Next day plan
    next_day_plan TEXT,
    
    -- WhatsApp share tracking
    shared_to_parent BOOLEAN DEFAULT false,
    shared_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, report_date)
);

CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(report_date);

-- =====================================================
-- TRIGGERS
-- =====================================================

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

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION mark_missed_followups()
RETURNS void AS $$
BEGIN
    UPDATE followups
    SET status = 'missed'
    WHERE status = 'pending'
      AND reminder_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_target_achievements()
RETURNS void AS $$
BEGIN
    UPDATE targets t
    SET 
        meeting_achieved = (
            SELECT COUNT(*) 
            FROM meetings m 
            WHERE m.user_id = t.user_id 
              AND m.status = 'completed'
              AND DATE_TRUNC('month', m.completed_at) = t.month
        ),
        visit_achieved = (
            SELECT COUNT(*) 
            FROM visits v 
            WHERE v.user_id = t.user_id 
              AND v.status = 'completed'
              AND DATE_TRUNC('month', v.completed_at) = t.month
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_team(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    phone VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    level INTEGER
) AS $$
WITH RECURSIVE team_tree AS (
    SELECT id, name, phone, role, parent_id, is_active, 0 AS level
    FROM users
    WHERE id = user_uuid
    
    UNION ALL
    
    SELECT u.id, u.name, u.phone, u.role, u.parent_id, u.is_active, t.level + 1
    FROM users u
    INNER JOIN team_tree t ON u.parent_id = t.id
)
SELECT id, name, phone, role, is_active, level
FROM team_tree
ORDER BY level, name;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION deactivate_user_cascade(user_uuid UUID)
RETURNS void AS $$
WITH RECURSIVE user_tree AS (
    SELECT id FROM users WHERE id = user_uuid
    UNION ALL
    SELECT u.id FROM users u
    INNER JOIN user_tree t ON u.parent_id = t.id
)
UPDATE users
SET is_active = false, updated_at = NOW()
WHERE id IN (SELECT id FROM user_tree);
$$ LANGUAGE sql;

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW user_hierarchy AS
SELECT 
    u.id,
    u.name,
    u.phone,
    u.role,
    u.is_active,
    u.parent_id,
    p.name AS parent_name,
    p.phone AS parent_phone,
    u.created_at
FROM users u
LEFT JOIN users p ON u.parent_id = p.id;

CREATE VIEW leads_detailed AS
SELECT 
    l.id,
    l.type,
    l.date,
    l.name,
    l.phone,
    l.status,
    l.configuration,
    l.location,
    l.remark,
    u1.name AS assigned_to_name,
    u1.phone AS assigned_to_phone,
    u2.name AS created_by_name,
    l.created_at,
    l.updated_at
FROM leads l
LEFT JOIN users u1 ON l.assigned_to = u1.id
LEFT JOIN users u2 ON l.created_by = u2.id;

-- =====================================================
-- SEED DATA (Create Owner)
-- =====================================================

-- IMPORTANT: Hash the password using bcrypt in your backend before inserting
-- This is just a placeholder
INSERT INTO users (name, phone, password_hash, role, parent_id, is_active)
VALUES (
    'System Owner',
    '9999999999',
    '$2b$10$placeholder_hash_password_with_bcrypt',
    'owner',
    NULL,
    true
) ON CONFLICT (phone) DO NOTHING;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
