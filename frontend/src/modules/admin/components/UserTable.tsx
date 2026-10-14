import type { UserRow } from "@/modules/admin/hooks/useAdminUsers";
import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { StatusBadge } from "@/modules/admin/components/StatusBadge";
import type { AccountType } from "@/shared/types/account";
import { formatRelativeTime } from "@/shared/utils/format";
import { roleName } from "@/shared/utils/roles";
import BanIcon from "@/assets/icons/ban.svg";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg";
import "./Button.css";
import "./AdminTable.css";
import "./UserTable.css";

const roles: AccountType[] = ["student", "teacher", "admin"];

const joinedDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type UserTableProps = {
  rows: UserRow[];
  selfId: string | null;
  onRoleChange: (user: UserRow, role: AccountType) => void;
  onSuspend: (user: UserRow) => void;
  onReactivate: (user: UserRow) => void;
};

export function UserTable({
  rows,
  selfId,
  onRoleChange,
  onSuspend,
  onReactivate,
}: UserTableProps) {
  return (
    <div className="admin-table__scroll">
      <table className="admin-table user-table">
        <thead>
          <tr>
            <th scope="col">Usuario</th>
            <th scope="col">Rol</th>
            <th scope="col">Estado</th>
            <th scope="col" className="admin-table__numeric">
              Cursos
            </th>
            <th scope="col">Alta</th>
            <th scope="col">Última actividad</th>
            <th scope="col" className="admin-table__actions-head">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => {
            const self = user.id === selfId;
            const suspended = user.status === "suspended";

            return (
              <tr
                key={user.id}
                className={suspended ? "user-table__row--suspended" : undefined}
              >
                <td className="user-table__user">
                  <div className="user-table__user-body">
                    <span className="user-table__avatar" aria-hidden="true">
                      {user.name.charAt(0)}
                    </span>
                    <div className="user-table__identity">
                      <p className="user-table__name">
                        <span>{user.name}</span>
                        {self && <span className="user-table__self">Tú</span>}
                      </p>
                      <p className="user-table__email">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td data-label="Rol">
                  <label
                    htmlFor={`role-${user.id}`}
                    className="visually-hidden"
                  >
                    Rol de {user.name}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    className={`user-table__role user-table__role--${user.role}`}
                    value={user.role}
                    disabled={self || suspended}
                    onChange={(event) =>
                      onRoleChange(user, event.target.value as AccountType)
                    }
                    title={
                      self
                        ? "No puedes cambiar tu propio rol"
                        : suspended
                          ? "Reactiva la cuenta para cambiar el rol"
                          : undefined
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleName[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="user-table__status">
                  <StatusBadge status={user.status} />
                </td>
                <td data-label="Cursos" className="admin-table__numeric">
                  {user.role === "admin" ? (
                    <span className="user-table__muted">—</span>
                  ) : (
                    user.courseCount
                  )}
                  {user.role === "teacher" && (
                    <span className="user-table__muted"> asignados</span>
                  )}
                </td>
                <td data-label="Alta" className="user-table__date">
                  {joinedDate.format(new Date(`${user.joinedAt}T12:00:00`))}
                </td>
                <td data-label="Última actividad">
                  {formatRelativeTime(user.lastActiveAt)}
                </td>
                <td className="user-table__actions">
                  <div className="admin-table__buttons">
                    {self ? (
                      <span className="user-table__muted">Tu cuenta</span>
                    ) : suspended ? (
                      <button
                        type="button"
                        className="admin-button admin-button--sm admin-button--secondary"
                        onClick={() => onReactivate(user)}
                      >
                        <MaskIcon src={RotateCcwIcon} />
                        Reactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-button admin-button--sm admin-button--ghost-danger"
                        onClick={() => onSuspend(user)}
                      >
                        <MaskIcon src={BanIcon} />
                        Suspender
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
