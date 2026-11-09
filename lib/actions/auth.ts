import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";

import { getEnv } from "@/lib/utils/env";
import { getDb } from "@/lib/db";
import { userCredentials, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { createAuthAdapter } from "@/lib/db/auth-adapter";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = getEnv();

  const providers: Array<ReturnType<typeof Credentials> | ReturnType<typeof Google>> = [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = getDb();
        const userRow = await db
          .select({
            user: users,
            passwordHash: userCredentials.passwordHash,
          })
          .from(users)
          .innerJoin(userCredentials, eq(users.id, userCredentials.userId))
          .where(eq(users.email, String(credentials.email)))
          .limit(1);

        if (userRow.length === 0) {
          return null;
        }

        const [row] = userRow;
        const isValid = await compare(String(credentials.password), row.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          image: row.user.image,
          emailVerified: row.user.emailVerified,
        };
      },
    }),
  ];

  if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  return {
    adapter: createAuthAdapter(),
    providers,
    secret: env.AUTH_SECRET,
    session: {
      strategy: "jwt",
      maxAge: 60 * 60 * 24 * 14,
      updateAge: 60 * 60 * 24,
    },
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
      callbackUrl: {
        name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
      csrfToken: {
        name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
      pkceCodeVerifier: {
        name: process.env.NODE_ENV === "production" ? "__Host-next-auth.pkce.code-verifier" : "next-auth.pkce.code-verifier",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
      state: {
        name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.state" : "next-auth.state",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
      nonce: {
        name: process.env.NODE_ENV === "production" ? "__Host-next-auth.nonce" : "next-auth.nonce",
        options: {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        },
      },
    },
    callbacks: {
      session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.sub ?? "";
          session.user.name = token.name ?? session.user.name;
          session.user.email = token.email ?? session.user.email;
          session.user.image = token.picture ?? session.user.image;
        }

        return session;
      },
    },
    pages: {
      signIn: "/",
    },
  };
});
