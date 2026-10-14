import type {
  RoleFilter,
  UserStatusFilter,
} from "@/modules/admin/hooks/useAdminUsers";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import CloseIcon from "@/assets/icons/close.svg";
import SearchIcon from "@/assets/icons/search.svg";
import "./TableToolbar.css";

const roleTabs: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "student", label: "Alumnos" },
  { value: "teacher", label: "Docentes" },
  { value: "admin", label: "Admins" },
];

type UserTableToolbarProps = {
  query: string;
  role: RoleFilter;
  status: UserStatusFilter;
  roleCounts: Record<RoleFilter, number>;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: RoleFilter) => void;
  onStatusChange: (value: UserStatusFilter) => void;
};

export function UserTableToolbar({
  query,
  role,
  status,
  roleCounts,
  onQueryChange,
  onRoleChange,
  onStatusChange,
}: UserTableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div className="table-toolbar__tabs" role="radiogroup" aria-label="Rol">
        {roleTabs.map((tab) => (
          <label key={tab.value} className="table-toolbar__tab">
            <input
              type="radio"
              name="user-role"
              value={tab.value}
              checked={role === tab.value}
              onChange={() => onRoleChange(tab.value)}
              className="visually-hidden"
            />
            {tab.label}
            <span className="table-toolbar__count">
              {roleCounts[tab.value]}
            </span>
          </label>
        ))}
      </div>

      <div className="table-toolbar__filters">
        <label htmlFor="user-status" className="visually-hidden">
          Estado de la cuenta
        </label>
        <select
          id="user-status"
          className="table-toolbar__select"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as UserStatusFilter)
          }
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
        </select>

        <div className="table-toolbar__search">
          <label htmlFor="user-search" className="visually-hidden">
            Buscar usuarios
          </label>
          <MaskIcon src={SearchIcon} className="table-toolbar__search-icon" />
          <input
            id="user-search"
            type="search"
            className="table-toolbar__input"
            placeholder="Buscar por nombre o email"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className="table-toolbar__clear"
              onClick={() => onQueryChange("")}
              aria-label="Borrar búsqueda"
            >
              <MaskIcon src={CloseIcon} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
