import { mockGoogleUserId, mockUsers } from "@/shared/mocks/users";
import type { AccountType } from "@/shared/types/account";
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
} from "@/shared/types/auth";

const SESSION_KEY = "skillup-session";
const MOCK_DELAY_MS = 700;

export class AuthError extends Error {}

const roleLabel: Record<AccountType, string> = {
  student: "alumno",
  teacher: "docente",
  admin: "administrador",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSession({ id, name, email, role }: AuthUser): AuthSession {
  return { user: { id, name, email, role }, token: `mock-token-${id}` };
}

// TODO: reemplazar los mocks por las llamadas a la API de auth (POST /auth/login)
export const authService = {
  async login({
    email,
    password,
    role,
  }: LoginCredentials): Promise<AuthSession> {
    await wait(MOCK_DELAY_MS);
    const user = mockUsers.find(
      (item) =>
        item.email === email.trim().toLowerCase() && item.password === password,
    );
    if (!user)
      throw new AuthError("El email o la contraseña no son correctos.");
    if (user.role !== role)
      throw new AuthError(`Esta cuenta no es de ${roleLabel[role]}.`);
    return toSession(user);
  },

  async loginWithGoogle(): Promise<AuthSession> {
    await wait(MOCK_DELAY_MS);
    const user = mockUsers.find((item) => item.id === mockGoogleUserId)!;
    return toSession(user);
  },

  getStoredSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },

  storeSession(session: AuthSession | null) {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage unavailable, the session only lives in memory
    }
  },
};
