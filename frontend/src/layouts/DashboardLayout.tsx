import type { CSSProperties } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

import { Logo } from "@/shared/components/Logo";
import { useAuth } from "@/shared/hooks/useAuth";
import LogOutIcon from "@/assets/icons/log-out.svg";
import "./DashboardLayout.css";

export type DashboardNavItem = {
  to: string;
  label: string;
  icon: string;
};

type DashboardLayoutProps = {
  title: string;
  roleLabel: string;
  nav: DashboardNavItem[];
};

/** The svg is used as a mask so the icon takes the link color */
const iconStyle = (icon: string) =>
  ({ "--icon": `url("${icon}")` }) as CSSProperties;

export function DashboardLayout({
  title,
  roleLabel,
  nav,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    navigate("/");
    logout();
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__brand">
          <Logo />
          <p className="dashboard-layout__title">{title}</p>
        </div>

        <nav aria-label={title} className="dashboard-layout__nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="dashboard-layout__link"
            >
              <span
                className="dashboard-layout__icon"
                style={iconStyle(item.icon)}
                aria-hidden="true"
              />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-layout__user">
          <span className="dashboard-layout__avatar" aria-hidden="true">
            {user?.name.charAt(0)}
          </span>
          <div className="dashboard-layout__identity">
            <p className="dashboard-layout__name">{user?.name}</p>
            <p className="dashboard-layout__role">{roleLabel}</p>
          </div>
          <button
            type="button"
            className="dashboard-layout__signout"
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <span
              className="dashboard-layout__icon"
              style={iconStyle(LogOutIcon)}
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>

      <div className="dashboard-layout__body">
        <header className="dashboard-layout__topbar">
          <Logo />
          <button
            type="button"
            className="dashboard-layout__topbar-signout"
            onClick={handleSignOut}
          >
            Cerrar sesión
          </button>
        </header>
        {nav.length > 1 && (
          <nav
            aria-label={`${title} (móvil)`}
            className="dashboard-layout__mobile-nav"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className="dashboard-layout__mobile-link"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
