import { Outlet } from "react-router";

type DashboardLayoutProps = {
  title: string;
};

export function DashboardLayout({ title }: DashboardLayoutProps) {
  return (
    <div>
      <aside>
        <h2>{title}</h2>
        <nav></nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
