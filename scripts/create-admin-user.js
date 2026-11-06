/**
 * Script untuk membuat user admin baru
 * Usage: node scripts/create-admin-user.js
 */

const { hash } = require("bcryptjs");
const { eq } = require("drizzle-orm");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

async function createAdminUser() {
  const email = "admin@gmail.com";
  const name = "Admin Sewaka";
  const password = "admin0000";
  const role = "admin";

  console.log(`Membuat user admin: ${email}`);

  // Hash password
  const passwordHash = await hash(password, 10);
  console.log("Password berhasil di-hash");

  // Connect to database
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tidak ditemukan di .env");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
  });

  try {
    // Check if user already exists
    const existingResult = await pool.query(
      "SELECT id, role FROM users WHERE email = $1",
      [email]
    );

    if (existingResult.rows.length > 0) {
      const userId = existingResult.rows[0].id;
      console.log(`User sudah ada (ID: ${userId}), update role dan password...`);

      // Update role to admin
      await pool.query(
        "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2",
        [role, userId]
      );

      // Update or insert password
      await pool.query(
        `INSERT INTO user_credentials (user_id, password_hash, password_updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET password_hash = $2, password_updated_at = NOW()`,
        [userId, passwordHash]
      );

      console.log("✅ Role dan password berhasil di-update!");
    } else {
      // Insert new user
      const userResult = await pool.query(
        `INSERT INTO users (name, email, role, email_verified)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [name, email, role]
      );

      const userId = userResult.rows[0].id;
      console.log(`User berhasil dibuat (ID: ${userId})`);

      // Insert credentials
      await pool.query(
        `INSERT INTO user_credentials (user_id, password_hash, password_updated_at)
         VALUES ($1, $2, NOW())`,
        [userId, passwordHash]
      );

      console.log("✅ Credentials berhasil disimpan!");
    }

    console.log(`\n🎉 User admin berhasil dibuat/di-update!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`\nSilakan login di http://localhost:3000/sign-in`);

  } finally {
    await pool.end();
  }
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
