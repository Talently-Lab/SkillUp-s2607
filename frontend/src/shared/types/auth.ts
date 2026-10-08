import type { AccountType } from "./account";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AccountType;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: AccountType;
}
