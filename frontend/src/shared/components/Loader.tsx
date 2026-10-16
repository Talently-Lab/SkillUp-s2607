import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

import "./Loader.css";

type LoaderProps = {
  size?: number;
  /** Any css color. By default it takes the text color of its parent */
  color?: string;
  /** Read by screen readers. Leave it empty when a text next to it already says it */
  label?: string;
};

export function Loader({
  size = 20,
  color = "currentColor",
  label,
}: LoaderProps) {
  return (
    <span
      className="loader"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Spiral size={size} color={color} />
    </span>
  );
}

export function PageLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="page-loader">
      <Loader size={40} color="var(--color-primary)" label={label} />
    </div>
  );
}
