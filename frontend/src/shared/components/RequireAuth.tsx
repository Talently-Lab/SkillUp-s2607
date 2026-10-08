import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../hooks/useAuth";
import type { AccountType } from "../types/account";
import { loginPath, roleHome } from "../utils/roles";

type RequireAuthProps = {
  role: AccountType;
  children: ReactNode;
};

export function RequireAuth({ role, children }: RequireAuthProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return <Navigate to={loginPath(role, pathname)} replace />;
  if (user.role !== role) return <Navigate to={roleHome[user.role]} replace />;

  return children;
}
