import { useRef, useState } from "react";
import { Link } from "react-router";

import { useDismiss } from "../hooks/useDismiss";
import type { AuthUser } from "../types/auth";
import { roleHome, rolePanelLabel } from "../utils/roles";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import LayoutDashboardIcon from "../../assets/icons/layout-dashboard.svg";
import LogOutIcon from "../../assets/icons/log-out.svg";
import "./UserMenu.css";

type UserMenuProps = {
  user: AuthUser;
  onSignOut: () => void;
};

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelLabel = rolePanelLabel[user.role];

  useDismiss(ref, isOpen, () => setIsOpen(false));

  return (
    <div ref={ref} className="user-menu">
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {user.name.charAt(0)}
        </span>
        <span className="user-menu__name">{user.name}</span>
        <img className="user-menu__chevron" src={ChevronDownIcon} alt="" />
      </button>

      {isOpen && (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__identity">
            <p className="user-menu__identity-name">{user.name}</p>
            <p className="user-menu__identity-email">{user.email}</p>
          </div>
          <div className="user-menu__divider" />
          {panelLabel && (
            <Link
              role="menuitem"
              to={roleHome[user.role]}
              className="user-menu__item"
              onClick={() => setIsOpen(false)}
            >
              <img
                className="user-menu__item-icon"
                src={LayoutDashboardIcon}
                alt=""
              />
              {panelLabel}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            className="user-menu__item"
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
          >
            <img className="user-menu__item-icon" src={LogOutIcon} alt="" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
