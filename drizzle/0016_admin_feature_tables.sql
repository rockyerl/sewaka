-- 0016_admin_feature_tables
-- Feature Flags, System Settings, Admin Audit Logs, Announcements

-- Feature Flags (ADM-04)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  scope TEXT NOT NULL DEFAULT 'global',
  target_id UUID,
  metadata JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_flags_name_idx ON feature_flags(name);
CREATE INDEX IF NOT EXISTS feature_flags_scope_idx ON feature_flags(scope);

-- System Settings (ADM-04)
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings(key);
CREATE INDEX IF NOT EXISTS system_settings_category_idx ON system_settings(category);

-- Admin Audit Logs (ADM-09)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_idx ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_action_idx ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx ON admin_audit_logs(created_at);

-- Announcements (ADM-NEW)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience TEXT NOT NULL DEFAULT 'all',
  target_workspace_id UUID REFERENCES wedding_workspaces(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS announcements_active_idx ON announcements(is_active);
CREATE INDEX IF NOT EXISTS announcements_date_idx ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON announcements(created_at);

-- Seed default feature flags
INSERT INTO feature_flags (name, description, is_enabled, scope, created_by)
SELECT 'subscription_enabled', 'Enable/disable subscription feature', true, 'global', id
FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO feature_flags (name, description, is_enabled, scope, created_by)
SELECT 'maintenance_mode', 'Enable maintenance mode - blocks all non-admin access', false, 'global', id
FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO feature_flags (name, description, is_enabled, scope, created_by)
SELECT 'registration_enabled', 'Enable/disable new user registration', true, 'global', id
FROM users WHERE role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- Seed default system settings
INSERT INTO system_settings (key, value, description, category)
VALUES ('maintenance_message', '{"message": "Sistem sedang dalam perawatan. Silakan coba lagi nanti."}', 'Maintenance mode message', 'general')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description, category)
VALUES ('max_file_size', '{"size": 52428800, "unit": "bytes"}', 'Maximum file upload size (50MB)', 'storage')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description, category)
VALUES ('email_from', '{"address": "noreply@sndwbites.net", "name": "Sewaka"}', 'Default email sender', 'email')
ON CONFLICT (key) DO NOTHING;
