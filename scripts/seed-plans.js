/**
 * Seed default subscription plans
 * Run: node scripts/seed-plans.js
 */
const { Pool } = require("pg");
require("dotenv").config();

const plans = [
  {
    name: "Gratis",
    description: "Mulai persiapan pernikahanmu tanpa biaya.",
    price: "0",
    currency: "IDR",
    duration_months: null,
    max_vendors: 10,
    max_guests: 50,
    max_storage_bytes: 1073741824, // 1GB
    features: [
      "basic_tasks",
      "basic_budget",
      "basic_guests",
      "1 workspace pernikahan",
      "Hingga 50 tamu",
      "Hingga 10 vendor",
      "Checklist persiapan",
      "Manajemen anggaran dasar",
    ],
    is_active: "true",
    sort_order: 1,
  },
  {
    name: "Premium",
    description: "Semua fitur untuk persiapan sempurna.",
    price: "99000",
    currency: "IDR",
    duration_months: 1,
    max_vendors: null, // unlimited
    max_guests: 500,
    max_storage_bytes: 2147483647, // ~2GB (PostgreSQL integer max)
    features: [
      "basic_tasks",
      "basic_budget",
      "basic_guests",
      "digital_invitation",
      "qr_checkin",
      "family_collaboration",
      "financial_reports",
      "unlimited_vendors",
      "unlimited_guests",
      "priority_support",
      "guest_import_export",
      "vendor_comparison",
      "Semua fitur Gratis",
      "Hingga 500 tamu",
      "Vendor unlimited",
      "Digital invitation",
      "QR check-in",
      "Kolaborasi keluarga",
      "Laporan keuangan",
      "Prioritas support",
    ],
    is_active: "true",
    sort_order: 2,
  },
  {
    name: "Enterprise",
    description: "Untuk wedding planner dan venue.",
    price: "0",
    currency: "IDR",
    duration_months: null,
    max_vendors: null, // unlimited
    max_guests: null, // unlimited
    max_storage_bytes: null, // unlimited
    features: [
      "basic_tasks",
      "basic_budget",
      "basic_guests",
      "digital_invitation",
      "qr_checkin",
      "family_collaboration",
      "financial_reports",
      "unlimited_vendors",
      "unlimited_guests",
      "priority_support",
      "guest_import_export",
      "vendor_comparison",
      "multi_workspace",
      "white_label",
      "api_access",
      "dedicated_support",
      "Semua fitur Premium",
      "Multi-workspace",
      "Tamu unlimited",
      "White-label invitation",
      "API access",
      "Dedicated support",
      "Custom integration",
    ],
    is_active: "true",
    sort_order: 3,
  },
];

async function seed() {
  const pool = new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    for (const plan of plans) {
      await pool.query(`
        INSERT INTO subscription_plans (name, description, price, currency, duration_months, max_vendors, max_guests, max_storage_bytes, features, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          currency = EXCLUDED.currency,
          duration_months = EXCLUDED.duration_months,
          max_vendors = EXCLUDED.max_vendors,
          max_guests = EXCLUDED.max_guests,
          max_storage_bytes = EXCLUDED.max_storage_bytes,
          features = EXCLUDED.features,
          is_active = EXCLUDED.is_active,
          sort_order = EXCLUDED.sort_order
      `, [
        plan.name,
        plan.description,
        plan.price,
        plan.currency,
        plan.duration_months,
        plan.max_vendors,
        plan.max_guests,
        plan.max_storage_bytes,
        JSON.stringify(plan.features),
        plan.is_active,
        plan.sort_order,
      ]);
      console.log(`✓ Seeded plan: ${plan.name}`);
    }
    console.log("Done! All plans seeded.");
  } catch (err) {
    console.error("Error seeding plans:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
