import "server-only";

import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) =>
        value.toLowerCase().startsWith("postgres://") ||
        value.toLowerCase().startsWith("postgresql://"),
      { message: "DATABASE_URL must use the postgres or postgresql protocol" },
    ),
  AUTH_SECRET: z
    .string()
    .min(32)
    .refine((value) => !value.startsWith("replace-"), {
      message: "Generate a random AUTH_SECRET; example placeholders are not valid",
    }),
  AUTH_GOOGLE_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  AUTH_GOOGLE_SECRET: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(30).default(10),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RESEND_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  MAIL_FROM: z.string().email().default("noreply@sewaka.com"),
  MIDTRANS_SERVER_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  MIDTRANS_CLIENT_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
  MIDTRANS_IS_PRODUCTION: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean(),
  ).default(false),
  WHATSAPP_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
}).refine(
  (env) => Boolean(env.AUTH_GOOGLE_ID) === Boolean(env.AUTH_GOOGLE_SECRET),
  { message: "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be configured together" },
);

export function getEnv() {
  const env = environmentSchema.parse(process.env);

  if (env.NODE_ENV === "production") {
    const databaseUser = decodeURIComponent(new URL(env.DATABASE_URL).username);
    if (databaseUser !== "sewaka_app" && databaseUser !== "neondb_owner") {
      throw new Error("Production DATABASE_URL must use the least-privilege sewaka_app or neondb_owner role");
    }
  }

  return env;
}
