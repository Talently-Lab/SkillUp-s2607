import { create } from "zustand";

import { configureAuth } from "@/shared/api/http";
import { authService } from "@/shared/services/authService";
import type { AccountType } from "@/shared/types/account";
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "@/shared/types/auth";

/**
 * - `checking`: restoring the session when the app loads
 * - `signedOut`: the user just signed out, so the guards send them home
 */
type AuthStatus = "checking" | "authenticated" | "guest" | "signedOut";

/** The account's role can't sign in through this access (general vs admin) */
export class AccountTypeMismatchError extends Error {
  readonly allowed: AccountType[];
  readonly role: AccountType;

  constructor(allowed: AccountType[], role: AccountType) {
    super(`A ${role} account can't sign in here`);
    this.name = "AccountTypeMismatchError";
    this.allowed = allowed;
    this.role = role;
  }
}

type AuthState = {
  user: AuthUser | null;
  // Only in memory, never in localStorage
  accessToken: string | null;
  status: AuthStatus;
  restoreSession: () => Promise<void>;
  /** `allowed` are the roles this access accepts; the role itself comes from the API */
  login: (
    credentials: LoginCredentials,
    allowed: AccountType[],
  ) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => void;
};

// Two refreshes at once with the same cookie count as reuse and close the
// session, so every caller shares the one in flight
let refreshing: Promise<AuthSession | null> | null = null;

function refreshSession() {
  refreshing ??= authService
    .refresh()
    .then((session) => {
      useAuthStore.setState({ ...session, status: "authenticated" });
      return session;
    })
    .catch(() => {
      useAuthStore.setState({ user: null, accessToken: null, status: "guest" });
      return null;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

export const useAuthStore = create<AuthState>()((set) => {
  const start = ({ user, accessToken }: AuthSession) => {
    set({ user, accessToken, status: "authenticated" });
    return user;
  };

  return {
    user: null,
    accessToken: null,
    status: "checking",

    restoreSession: async () => {
      await refreshSession();
    },

    login: async (credentials, allowed) => {
      const session = await authService.login(credentials);
      if (!allowed.includes(session.user.role)) {
        await authService.logout().catch(() => undefined);
        throw new AccountTypeMismatchError(allowed, session.user.role);
      }
      return start(session);
    },

    register: async (data) => start(await authService.register(data)),

    logout: () => {
      set({ user: null, accessToken: null, status: "signedOut" });
      // The local session is already closed, a failed request doesn't change that
      authService.logout().catch(() => undefined);
    },
  };
});

configureAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: async () => (await refreshSession())?.accessToken ?? null,
});
