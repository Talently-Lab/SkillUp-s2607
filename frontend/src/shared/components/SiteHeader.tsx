import { startTransition, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { useAuth } from "../hooks/useAuth";
import { roleHome, rolePanelLabel } from "../utils/roles";
import CartShoppingIcon from "../../assets/icons/cart-shopping.svg";
import MenuIcon from "../../assets/icons/menu.svg";
import CloseIcon from "../../assets/icons/close.svg";
import "./SiteHeader.css";

const publicNavItems = [
  { to: "/", label: "Inicio", end: true },
  // Not `end`, so it stays active on /catalog/:courseId
  { to: "/catalog", label: "Catálogo", end: false },
];

const navLinkClass =
  (block: string) =>
  ({ isActive }: { isActive: boolean }) =>
    isActive ? `${block} ${block}--active` : block;

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isStudent = user?.role === "student";
  const panelLabel = user && rolePanelLabel[user.role];
  const navItems = panelLabel
    ? [
        ...publicNavItems,
        { to: roleHome[user.role], label: panelLabel, end: false },
      ]
    : publicNavItems;

  const handleSignOut = () => {
    setIsMenuOpen(false);
    // Same transition as the navigation, otherwise the panel guard sees the
    // user gone first and redirects to the login instead of home
    startTransition(() => {
      navigate("/");
      logout();
    });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <div className="site-header__brand">
          <Logo />
          <nav className="site-header__nav" aria-label="Principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass("site-header__link")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="site-header__actions">
          {(!user || isStudent) && (
            <button
              type="button"
              className="site-header__icon-btn"
              aria-label="Carrito de compras"
            >
              <img
                className="site-header__icon"
                src={CartShoppingIcon}
                alt=""
              />
            </button>
          )}
          {/* Keyed by user so the inbox resets when the account changes */}
          {user && isStudent && (
            <NotificationBell key={user.id} userId={user.id} />
          )}
          <div className="site-header__auth">
            {user ? (
              <UserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="site-header__btn site-header__btn--ghost"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="site-header__btn site-header__btn--primary"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="site-header__icon-btn site-header__menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <img
              className="site-header__icon"
              src={isMenuOpen ? CloseIcon : MenuIcon}
              alt=""
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu" className="site-header__mobile">
          <nav className="site-header__mobile-nav" aria-label="Principal móvil">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass("site-header__mobile-link")}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="site-header__mobile-user">
              <div className="site-header__mobile-identity">
                <span className="site-header__avatar" aria-hidden="true">
                  {user.name.charAt(0)}
                </span>
                <span className="site-header__mobile-name">{user.name}</span>
              </div>
              <button
                type="button"
                className="site-header__btn site-header__btn--ghost"
                onClick={handleSignOut}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="site-header__mobile-auth">
              <Link
                to="/login"
                className="site-header__btn site-header__btn--lg site-header__btn--outline"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="site-header__btn site-header__btn--lg site-header__btn--primary"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
