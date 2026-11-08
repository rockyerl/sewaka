import "server-only";

import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { getDb } from "./index";
import { accounts, sessions, users, verificationTokens } from "./schema";

export function createAuthAdapter() {
  return DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });
}
