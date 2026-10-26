import { useState } from "react";
import { toast } from "sonner";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { ProgressBar } from "@/modules/student/components/ProgressBar";
import type { RosterEntry, RosterStatus } from "@/modules/teacher/types";
import {
  formatLastActive,
  INACTIVE_DAYS,
  initials,
} from "@/modules/teacher/utils/roster";
import type { Course } from "@/shared/types/course";
import { formatNumber, normalizeText } from "@/shared/utils/format";
import BellRingIcon from "@/assets/icons/bell-ring.svg";
import CloseIcon from "@/assets/icons/close.svg";
import DownloadIcon from "@/assets/icons/download.svg";
import MailIcon from "@/assets/icons/mail.svg";
import SearchIcon from "@/assets/icons/search.svg";
import SearchXIcon from "@/assets/icons/search-x.svg";
import "@/modules/admin/components/AdminTable.css";
import "@/modules/admin/components/TableToolbar.css";
import "./StudentRoster.css";

type StudentRosterProps = {
  course: Course;
  roster: RosterEntry[];
};

type Filter = "all" | RosterStatus;

const statusLabels: Record<RosterStatus, string> = {
  "on-track": "Al día",
  "at-risk": "En riesgo",
  completed: "Completado",
};

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "on-track", label: "Al día" },
  { value: "at-risk", label: "En riesgo" },
  { value: "completed", label: "Completados" },
];

export function StudentRoster({ course, roster }: StudentRosterProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = {
    all: roster.length,
    "on-track": roster.filter((entry) => entry.status === "on-track").length,
    "at-risk": roster.filter((entry) => entry.status === "at-risk").length,
    completed: roster.filter((entry) => entry.status === "completed").length,
  };

  const search = normalizeText(query.trim());
  const rows = roster
    .filter((entry) => filter === "all" || entry.status === filter)
    .filter(
      (entry) =>
        !search ||
        normalizeText(`${entry.name} ${entry.email}`).includes(search),
    )
    .sort(
      (a, b) =>
        a.lastActiveDays - b.lastActiveDays ||
        a.name.localeCompare(b.name, "es"),
    );

  const exportCsv = () => {
    const header = [
      "Nombre",
      "Email",
      "Progreso (%)",
      "Última actividad (días)",
      "Estado",
    ];
    const lines = [
      header,
      ...rows.map((entry) => [
        entry.name,
        entry.email,
        entry.progress,
        entry.lastActiveDays,
        statusLabels[entry.status],
      ]),
    ];
    const csv = lines
      .map((line) =>
        line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    // The BOM makes Excel read the accents right
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = `alumnos-${course.slug}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Listado exportado", {
      description: `${rows.length} alumnos en CSV`,
    });
  };

  // TODO: send the reminders and messages once the API supports them
  const remindAtRisk = () =>
    toast.success(
      `Recordatorio enviado a ${counts["at-risk"]} alumnos en riesgo`,
    );

  if (roster.length === 0) {
    return (
      <div className="student-roster__empty">
        <p className="student-roster__empty-title">
          Aún no hay alumnos inscritos
        </p>
        <p className="student-roster__empty-text">
          Cuando alguien se inscriba en este curso aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Alumnos inscritos" className="student-roster">
      <div className="table-toolbar">
        <div
          className="table-toolbar__tabs"
          role="radiogroup"
          aria-label="Filtrar por estado"
        >
          {filters.map((tab) => (
            <label key={tab.value} className="table-toolbar__tab">
              <input
                type="radio"
                name="roster-status"
                value={tab.value}
                checked={filter === tab.value}
                onChange={() => setFilter(tab.value)}
                className="visually-hidden"
              />
              {tab.label}
              <span className="table-toolbar__count">{counts[tab.value]}</span>
            </label>
          ))}
        </div>

        <div className="table-toolbar__filters student-roster__filters">
          <div className="table-toolbar__search student-roster__search">
            <label htmlFor="roster-search" className="visually-hidden">
              Buscar alumno
            </label>
            <MaskIcon src={SearchIcon} className="table-toolbar__search-icon" />
            <input
              id="roster-search"
              type="search"
              className="table-toolbar__input"
              placeholder="Buscar alumno"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                className="table-toolbar__clear"
                onClick={() => setQuery("")}
                aria-label="Borrar búsqueda"
              >
                <MaskIcon src={CloseIcon} />
              </button>
            )}
          </div>
          {counts["at-risk"] > 0 && (
            <button
              type="button"
              className="admin-button admin-button--secondary student-roster__action"
              onClick={remindAtRisk}
            >
              <MaskIcon src={BellRingIcon} className="student-roster__bell" />
              Recordar a en riesgo
            </button>
          )}
          <button
            type="button"
            className="admin-button admin-button--primary student-roster__action"
            onClick={exportCsv}
          >
            <MaskIcon src={DownloadIcon} />
            Exportar CSV
          </button>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="admin-table__scroll">
          <table className="admin-table student-roster__table">
            <thead>
              <tr>
                <th scope="col">Alumno</th>
                <th scope="col">Progreso</th>
                <th scope="col">Última actividad</th>
                <th scope="col">Estado</th>
                <th scope="col" className="admin-table__actions-head">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id}>
                  <td className="student-roster__student">
                    <div className="student-roster__student-body">
                      <span
                        className="student-roster__avatar"
                        aria-hidden="true"
                      >
                        {initials(entry.name)}
                      </span>
                      <div className="student-roster__identity">
                        <p className="student-roster__name">{entry.name}</p>
                        <p className="student-roster__email">{entry.email}</p>
                      </div>
                    </div>
                  </td>
                  <td
                    data-label="Progreso"
                    className="student-roster__progress"
                  >
                    <div className="student-roster__progress-body">
                      <ProgressBar
                        value={entry.progress}
                        size="sm"
                        label={`Progreso de ${entry.name}`}
                      />
                      <span className="student-roster__percent">
                        {entry.progress}%
                      </span>
                    </div>
                  </td>
                  <td
                    data-label="Última actividad"
                    className={
                      entry.lastActiveDays >= INACTIVE_DAYS
                        ? "student-roster__inactive"
                        : undefined
                    }
                  >
                    {formatLastActive(entry.lastActiveDays)}
                  </td>
                  <td className="student-roster__status">
                    <span
                      className={`student-roster__badge student-roster__badge--${entry.status}`}
                    >
                      {statusLabels[entry.status]}
                    </span>
                  </td>
                  <td className="student-roster__actions">
                    <div className="admin-table__buttons">
                      <button
                        type="button"
                        className="admin-button admin-button--sm admin-button--secondary"
                        aria-label={`Enviar mensaje a ${entry.name}`}
                        onClick={() =>
                          toast.success(`Mensaje enviado a ${entry.name}`)
                        }
                      >
                        <MaskIcon src={MailIcon} />
                        <span className="student-roster__message-label">
                          Mensaje
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-page__empty">
          <MaskIcon src={SearchXIcon} className="admin-page__empty-icon" />
          <p className="admin-page__empty-title">
            Ningún alumno coincide con la búsqueda
          </p>
          <p className="admin-page__empty-text">
            Prueba con otro nombre o cambia el filtro.
          </p>
          <button
            type="button"
            className="admin-button admin-button--secondary"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      <footer className="admin-page__footer">
        <span>
          Mostrando {rows.length} alumnos con actividad reciente de{" "}
          {formatNumber(course.students)} inscritos
        </span>
      </footer>
    </section>
  );
}
