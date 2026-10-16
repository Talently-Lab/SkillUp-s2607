import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { PageLoader } from "@/shared/components/Loader";
import { useAuthStore } from "@/shared/stores/authStore";
import type { AccountType } from "@/shared/types/account";
import { loginPath, roleHome } from "@/shared/utils/roles";

type RequireAuthProps = {
  role: AccountType;
  children: ReactNode;
};

export function RequireAuth({ role, children }: RequireAuthProps) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const { pathname } = useLocation();

  // Wait for the session to be restored before deciding
  if (status === "checking") return <PageLoader />;

  // Signing out navigates home, but the store updates before the navigation
  // transition, so the guard sends them home too instead of to the login
  if (status === "signedOut") return <Navigate to="/" replace />;

  if (!user) return <Navigate to={loginPath(role, pathname)} replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;

  return children;
}
