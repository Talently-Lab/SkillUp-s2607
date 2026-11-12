import { TableRowsSkeleton } from "@/shared/components/Skeleton";
import { useDelayedFlag } from "@/shared/hooks/useDelayedFlag";
import "./AdminTable.css";

type Column = Parameters<typeof TableRowsSkeleton>[0]["columns"][number];

/** 8 placeholder rows shaped like the table, shown after a 300 ms wait (design doc §10) */
export function AdminTableSkeleton({ columns, label }: { columns: Column[]; label: string }) {
  const visible = useDelayedFlag(true);

  return (
    <div className="admin-table__scroll" aria-busy="true" aria-label={label}>
      {visible && (
        <table className="admin-table admin-table--skeleton">
          <tbody>
            <TableRowsSkeleton columns={columns} />
          </tbody>
        </table>
      )}
    </div>
  );
}
