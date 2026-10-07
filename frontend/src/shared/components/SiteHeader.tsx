import { useState } from "react";
import { Link, NavLink } from "react-router";

import { Logo } from "./Logo";
import CartShoppingIcon from "../../assets/icons/cart-shopping.svg";
import MenuIcon from "../../assets/icons/menu.svg";
import CloseIcon from "../../assets/icons/close.svg";
import "./SiteHeader.css";

const navItems = [
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
          <div className="site-header__auth">
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
        </div>
      )}
    </header>
  );
}
