import { useCallback, useState } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { Notice, type NoticeContent } from "@/modules/admin/components/Notice";
import { SuspendUserModal } from "@/modules/admin/components/SuspendUserModal";
import { UserTable } from "@/modules/admin/components/UserTable";
import { UserTableToolbar } from "@/modules/admin/components/UserTableToolbar";
import {
  useAdminUsers,
  type UserRow,
} from "@/modules/admin/hooks/useAdminUsers";
import type { AccountType } from "@/shared/types/account";
import { roleName } from "@/shared/utils/roles";
import SearchXIcon from "@/assets/icons/search-x.svg";
import "@/modules/admin/components/Button.css";
import "./AdminPage.css";

export function AdminUsers() {
  const table = useAdminUsers();
  const { users, roleCounts, changeRole, changeStatus } = table;
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [notice, setNotice] = useState<NoticeContent | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const handleRoleChange = (user: UserRow, role: AccountType) => {
    const previous = user.role;
    changeRole(user.id, role);
    setNotice({
      message: `${user.name} ahora es ${roleName[role]}.`,
      action: {
        label: "Deshacer",
        onClick: () => changeRole(user.id, previous),
      },
    });
  };

  const handleSuspend = () => {
    if (!suspendTarget) return;
    const target = suspendTarget;
    changeStatus(target.id, "suspended");
    setSuspendTarget(null);
    setNotice({
      message: `Se suspendió la cuenta de ${target.name}.`,
      action: {
        label: "Deshacer",
        onClick: () => changeStatus(target.id, "active"),
      },
    });
  };

  const handleReactivate = (user: UserRow) => {
    changeStatus(user.id, "active");
    setNotice({ message: `Se reactivó la cuenta de ${user.name}.` });
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Usuarios</h1>
          <p className="admin-page__subtitle">
            {users.length} cuentas registradas · {roleCounts.student} alumnos,{" "}
            {roleCounts.teacher} docentes y {roleCounts.admin} administradores
          </p>
        </div>
      </header>

      <section aria-label="Listado de usuarios" className="admin-page__panel">
        <UserTableToolbar
          query={table.query}
          role={table.role}
          status={table.status}
          roleCounts={roleCounts}
          onQueryChange={table.setQuery}
          onRoleChange={table.setRole}
          onStatusChange={table.setStatus}
        />

        {table.rows.length > 0 ? (
          <UserTable
            rows={table.rows}
            selfId={table.selfId}
            onRoleChange={handleRoleChange}
            onSuspend={setSuspendTarget}
            onReactivate={handleReactivate}
          />
        ) : (
          <div className="admin-page__empty">
            <MaskIcon src={SearchXIcon} className="admin-page__empty-icon" />
            <p className="admin-page__empty-title">
              Ningún usuario coincide con los filtros
            </p>
            <p className="admin-page__empty-text">
              Ajusta la búsqueda, el rol o el estado.
            </p>
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={table.resetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <footer className="admin-page__footer">
          <span>
            Mostrando {table.rows.length} de {users.length}
          </span>
          <span className="admin-page__hint">
            Cambia el rol directamente desde la tabla
          </span>
        </footer>
      </section>

      <p className="admin-page__note">
        Los usuarios son de demostración: los cambios se pierden al recargar la
        página.
      </p>

      <Notice notice={notice} onDismiss={dismissNotice} />

      {suspendTarget && (
        <SuspendUserModal
          user={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspend}
        />
      )}
    </div>
  );
}
