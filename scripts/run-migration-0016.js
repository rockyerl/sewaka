const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

async function run() {
  const pool = new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  });

  const tables = [
    {
      name: 'feature_flags',
      sql: `
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
      `
    },
    {
      name: 'system_settings',
      sql: `
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
      `
    },
    {
      name: 'admin_audit_logs',
      sql: `
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
      `
    },
    {
      name: 'announcements',
      sql: `
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
      `
    }
  ];

  for (const table of tables) {
    try {
      await pool.query(table.sql);
      console.log(`✅ Created: ${table.name}`);
    } catch (e) {
      console.log(`❌ Error: ${table.name} - ${e.message}`);
    }
  }

  // Seed feature flags
  const admin = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rows.length > 0) {
    const adminId = admin.rows[0].id;
    
    const flags = [
      ['subscription_enabled', 'Enable/disable subscription feature', true, 'global'],
      ['maintenance_mode', 'Enable maintenance mode', false, 'global'],
      ['registration_enabled', 'Enable/disable new user registration', true, 'global'],
    ];
    
    for (const [name, desc, enabled, scope] of flags) {
      try {
        await pool.query(
          "INSERT INTO feature_flags (name, description, is_enabled, scope, created_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING",
          [name, desc, enabled, scope, adminId]
        );
        console.log(`✅ Seed: ${name}`);
      } catch (e) {
        console.log(`⏭️  Skip: ${name}`);
      }
    }

    const settings = [
      ['maintenance_message', { message: "Sistem sedang dalam perawatan." }, 'Maintenance message', 'general'],
      ['max_file_size', { size: 52428800, unit: 'bytes' }, 'Max upload size 50MB', 'storage'],
      ['email_from', { address: 'noreply@sndwbites.net', name: 'Sewaka' }, 'Default email sender', 'email'],
    ];

    for (const [key, value, desc, category] of settings) {
      try {
        await pool.query(
          "INSERT INTO system_settings (key, value, description, category, updated_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO NOTHING",
          [key, value, desc, category, adminId]
        );
        console.log(`✅ Seed: ${key}`);
      } catch (e) {
        console.log(`⏭️  Skip: ${key}`);
      }
    }
  }

  // Verify
  const result = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('feature_flags','system_settings','admin_audit_logs','announcements')"
  );
  console.log(`\n✅ Tables created: ${result.rows.map(r => r.tablename).join(', ')}`);

  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
