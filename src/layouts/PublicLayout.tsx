import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "../components/nav/SiteHeader";
import { BottomNav } from "../components/nav/BottomNav";
import { cn } from "../utils/cn";

export function PublicLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main
        className={cn(
          "mx-auto w-full max-w-full px-4 py-6",
          isDashboard ? "pb-24 sm:pb-6" : "",
        )}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

