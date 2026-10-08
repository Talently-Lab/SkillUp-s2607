import { useState, type ReactNode } from "react";

import { AuthContext } from "./AuthContext";
import { authService } from "@/shared/services/authService";
import type { AuthSession, LoginCredentials } from "@/shared/types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(
    authService.getStoredSession,
  );

  const start = (next: AuthSession) => {
    authService.storeSession(next);
    setSession(next);
    return next.user;
  };

  const login = async (credentials: LoginCredentials) =>
    start(await authService.login(credentials));

  const loginWithGoogle = async () =>
    start(await authService.loginWithGoogle());

  const logout = () => {
    authService.storeSession(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
