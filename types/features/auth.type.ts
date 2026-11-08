/**
 * Auth feature types
 * Corresponds to: users, userCredentials, accounts, sessions, verificationTokens tables
 */

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  redirect?: string;
}

export interface VerificationToken {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}
