import type { CSSProperties } from "react";

type SkeletonProps = {
  variant?: "block" | "text" | "title" | "circle" | "pill";
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  className?: string;
};

/** Base placeholder shape. The container that holds skeletons sets aria-busy. */
export function Skeleton({
  variant = "block",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const variantClass = variant === "block" ? "" : ` sk--${variant}`;
  return (
    <span
      className={`sk${variantClass} ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

type TableSkeletonProps = {
  /** One entry per column: the placeholder shape for that cell */
  columns: Array<"avatar-text" | "text" | "pill" | "button" | "media-text">;
  rows?: number;
};

/** Table body rows for admin and teacher tables (8 rows, the typical page) */
export function TableRowsSkeleton({ columns, rows = 8 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden="true" className="table-skeleton-row">
          {columns.map((shape, col) => (
            <td key={col}>
              {shape === "avatar-text" || shape === "media-text" ? (
                <span className="table-skeleton-row__lead">
                  {shape === "avatar-text" ? (
                    <Skeleton variant="circle" width={34} height={34} />
                  ) : (
                    <Skeleton width={52} height={36} />
                  )}
                  <span style={{ flex: 1 }}>
                    <Skeleton variant="text" width="75%" />
                    <Skeleton variant="text" width="45%" />
                  </span>
                </span>
              ) : shape === "pill" ? (
                <Skeleton variant="pill" width={80} height={22} />
              ) : shape === "button" ? (
                <Skeleton width={80} height={32} />
              ) : (
                <Skeleton variant="text" width="70%" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
