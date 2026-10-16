import { request } from "@/shared/api/http";
import type { AccountType } from "@/shared/types/account";
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "@/shared/types/auth";

type ApiUser = {
  id: string;
  email: string;
  fullName: string;
  role: AccountType;
  status: "active" | "suspended";
  createdAt: string;
};

type ApiSession = {
  user: ApiUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

function toAuthUser({ id, fullName, email, role }: ApiUser): AuthUser {
  return { id, name: fullName, email, role };
}

function toSession({ user, accessToken }: ApiSession): AuthSession {
  return { user: toAuthUser(user), accessToken };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await request<ApiSession>("/auth/login", {
      method: "POST",
      body: credentials,
    });
    return toSession(session);
  },

  async register({
    name,
    email,
    password,
  }: RegisterData): Promise<AuthSession> {
    const session = await request<ApiSession>("/auth/register", {
      method: "POST",
      body: { fullName: name, email, password },
    });
    return toSession(session);
  },

  /** Uses the refresh cookie to get a new access token (and rotates the cookie) */
  async refresh(): Promise<AuthSession> {
    const session = await request<ApiSession>("/auth/refresh", {
      method: "POST",
    });
    return toSession(session);
  },

  async logout(): Promise<void> {
    await request<void>("/auth/logout", { method: "POST" });
  },

  async me(): Promise<AuthUser> {
    const { user } = await request<{ user: ApiUser }>("/auth/me", {
      auth: true,
    });
    return toAuthUser(user);
  },
};
