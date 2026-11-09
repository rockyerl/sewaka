import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { hash } from "bcryptjs";
import { Client } from "pg";

export default async function globalSetup() {
  const connectionString = process.env.E2E_DATABASE_URL;
  const branch = process.env.E2E_BRANCH;
  if (!connectionString || !branch || branch === "production") {
    throw new Error("Authenticated E2E requires E2E_DATABASE_URL and a non-production E2E_BRANCH");
  }
  const dbUrl = new URL(connectionString);
  if (dbUrl.hostname.includes("-pooler")) throw new Error("E2E_DATABASE_URL must use the direct Neon endpoint");

  const email = `e2e-${randomUUID()}@sewaka.invalid`;
  const password = `E2e-${randomBytes(18).toString("base64url")}!a9`;
  const adminEmail = `e2e-admin-${randomUUID()}@sewaka.invalid`;
  const adminPassword = `E2e-${randomBytes(18).toString("base64url")}!a9`;
  const settingKey = `e2e_admin_${randomUUID().replaceAll("-", "")}`;
  const client = new Client({ connectionString });
  await client.connect();
  let userId: string | undefined;
  let adminUserId: string | undefined;
  let workspaceId: string | undefined;
  let supportTicketId: string | undefined;
  try {
    await client.query("BEGIN");
    userId = (await client.query(
      "INSERT INTO users(name,email,email_verified) VALUES('E2E Test Account',$1,now()) RETURNING id",
      [email],
    )).rows[0].id;
    await client.query(
      "INSERT INTO user_credentials(user_id,password_hash) VALUES($1,$2)",
      [userId, await hash(password, 10)],
    );
    adminUserId = (await client.query(
      "INSERT INTO users(name,email,email_verified,role) VALUES('E2E Admin Account',$1,now(),'admin') RETURNING id",
      [adminEmail],
    )).rows[0].id;
    await client.query(
      "INSERT INTO user_credentials(user_id,password_hash) VALUES($1,$2)",
      [adminUserId, await hash(adminPassword, 10)],
    );
    await client.query(
      "INSERT INTO system_settings(key,value,description,category,updated_by) VALUES($1,$2,'Temporary E2E admin setting','general',$3)",
      [settingKey, JSON.stringify({ source: "e2e" }), adminUserId],
    );
    workspaceId = (await client.query(
      "INSERT INTO wedding_workspaces(name,couple_one,couple_two,wedding_date,invitation_slug) VALUES('E2E Test Workspace','E2E Couple One','E2E Couple Two',now() + interval '30 days',$1) RETURNING id",
      [`e2e-${randomUUID()}`],
    )).rows[0].id;
    await client.query(
      "INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,'OWNER')",
      [workspaceId,userId],
    );
    await client.query(
      "INSERT INTO wedding_events(workspace_id,name,event_date,location,notes) VALUES($1,'E2E Seed Event',now() + interval '30 days','Test venue','Seed event for calendar workflow')",
      [workspaceId],
    );
    supportTicketId = (await client.query(
      "INSERT INTO support_tickets(user_id,workspace_id,subject,message,category,priority) VALUES($1,$2,'E2E Support Ticket','Seed ticket for admin workflow test','TECHNICAL','MEDIUM') RETURNING id",
      [userId, workspaceId],
    )).rows[0].id;
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }

  const fixtureDir = resolve("test-results");
  mkdirSync(fixtureDir, { recursive: true });
  writeFileSync(resolve(fixtureDir, ".e2e-account.json"), JSON.stringify({ email, password, userId, workspaceId, supportTicketId, settingKey, adminAccount: { email: adminEmail, password: adminPassword, userId: adminUserId } }));
}
