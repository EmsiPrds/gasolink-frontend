import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { clearToken, getToken } from "../store/auth";
import { cn } from "../utils/cn";
import type { ReactNode } from "react";

export function AdminLayout() {
  const loc = useLocation();
  const token = getToken();
  const isLogin = loc.pathname === "/admin/login";

  if (!token && !isLogin) return <Navigate to="/admin/login" replace />;

  if (isLogin) return <Outlet />;

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="px-3 py-2 text-sm font-semibold text-white">Admin</p>
          <nav className="space-y-1 text-sm">
            <AdminLink to="/admin">Overview</AdminLink>
            <AdminLink to="/admin/ingestion">Ingestion</AdminLink>
            <AdminLink to="/admin/doe">DOE ingestion</AdminLink>
            <AdminLink to="/admin/ph-prices">PH prices</AdminLink>
            <AdminLink to="/admin/company-prices">Company prices</AdminLink>
            <AdminLink to="/admin/insights">Insights</AdminLink>
            <AdminLink to="/admin/alerts">Alerts</AdminLink>
            <AdminLink to="/admin/logs">Logs</AdminLink>
          </nav>
          <button
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
            onClick={() => {
              clearToken();
              window.location.href = "/admin/login";
            }}
          >
            Sign out
          </button>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLink(props: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          "block rounded-xl px-3 py-2 text-slate-200 hover:bg-white/5 hover:text-white",
          isActive && "bg-white/5 text-white",
        )
      }
      end={props.to === "/admin"}
    >
      {props.children}
    </NavLink>
  );
}

