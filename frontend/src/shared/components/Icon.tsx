/** Names available in /public/brand-icons.svg (the design system icon sprite) */
export type IconName =
  | "arrow" | "arrow-left" | "search" | "clock" | "level" | "star" | "check"
  | "check-circle" | "play" | "lock" | "users" | "book" | "grid" | "logout"
  | "sliders" | "chevron-down" | "pencil" | "external" | "plus" | "grip"
  | "eye" | "trend-up" | "alert" | "flame" | "cert" | "device" | "code"
  | "chart" | "pen" | "megaphone" | "coin" | "globe" | "compass" | "cloud"
  | "google" | "shield";

type IconProps = {
  name: IconName;
  className?: string;
  size?: number;
};

/** Decorative icon that takes currentColor. Give the parent the accessible name. */
export function Icon({ name, className = "ico", size }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/brand-icons.svg#${name}`} />
    </svg>
  );
}
