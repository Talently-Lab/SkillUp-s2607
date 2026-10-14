import type { CSSProperties } from "react";

import "./MaskIcon.css";

type MaskIconProps = {
  src: string;
  className?: string;
};

export function MaskIcon({ src, className = "" }: MaskIconProps) {
  return (
    <span
      className={`mask-icon ${className}`}
      style={{ "--icon": `url("${src}")` } as CSSProperties}
      aria-hidden="true"
    />
  );
}
