import { createContext } from "react";

import type { AuthUser, LoginCredentials } from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
