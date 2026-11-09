import { Client } from "pg";
import "dotenv/config";

const url = process.env.MIGRATION_DATABASE_URL;
if (!url || process.env.NEON_BRANCH !== "production") {
  throw new Error("Set MIGRATION_DATABASE_URL and NEON_BRANCH=production for this read-only check");
}
const parsed = new URL(url);
if (parsed.hostname.includes("-pooler")) throw new Error("Use a direct endpoint for migration inspection");
const client = new Client({ connectionString: url });
await client.connect();
try {
  const state = await client.query(`
    SELECT
      to_regclass('public.nikah_berkas') IS NOT NULL AS legacy_table,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='document_description') AS document_fields,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='calendar_syncs' AND column_name='token_expires_at') AS calendar_expiry,
      to_regprocedure('public.public_guest_check_in(text)') IS NOT NULL AS public_checkin_function
  `);
  let legacyCount = 0;
  let conflictCount = 0;
  if (state.rows[0].legacy_table) {
    const counts = await client.query(`
      SELECT
        (SELECT count(*)::int FROM public.nikah_berkas) AS legacy_count,
        (SELECT count(*)::int FROM public.nikah_berkas old
         JOIN public.documents existing ON existing.id=old.id) AS id_conflicts
    `);
    legacyCount = counts.rows[0].legacy_count;
    conflictCount = counts.rows[0].id_conflicts;
  }
  console.log(JSON.stringify({ ...state.rows[0], legacyCount, conflictCount }));
} finally {
  await client.end();
}
