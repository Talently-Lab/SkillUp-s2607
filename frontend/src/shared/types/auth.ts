import type { AccountType } from "./account";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AccountType;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
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
