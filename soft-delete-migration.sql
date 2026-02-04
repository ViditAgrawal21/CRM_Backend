-- Soft Delete Migration for Supabase
-- Run this in Supabase SQL Editor to add soft delete functionality

-- Add soft delete columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_by ON leads(deleted_by);

-- Update existing records to set is_deleted = false (if column already existed with NULL values)
UPDATE leads SET is_deleted = false WHERE is_deleted IS NULL;

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'leads' 
  AND column_name IN ('is_deleted', 'deleted_by', 'deleted_at')
ORDER BY ordinal_position;
