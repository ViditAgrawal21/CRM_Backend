-- Create targets table if it doesn't exist
CREATE TABLE IF NOT EXISTS targets (
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

CREATE INDEX IF NOT EXISTS idx_targets_user_id ON targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_month ON targets(month);
CREATE INDEX IF NOT EXISTS idx_targets_bonus_approved ON targets(bonus_approved);
