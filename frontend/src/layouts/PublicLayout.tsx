import { Outlet } from "react-router";
import { SiteHeader } from "../shared/components/SiteHeader";
import { SiteFooter } from "../shared/components/SiteFooter";
import "./PublicLayout.css";

export function PublicLayout() {
  return (
    <div className="public-layout">
      <SiteHeader />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
