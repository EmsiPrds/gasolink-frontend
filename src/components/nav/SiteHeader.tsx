import { Link, NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import gasolinkLogo from "../../assets/Gasolink-Logo.svg";
import { Moon, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-full items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600/15 ring-1 ring-brand-500/20">
            <img src={gasolinkLogo} alt="Gasolink" className="size-6" />
          </span>
          <span>Gasolink</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 text-sm text-slate-700 dark:text-slate-200 sm:flex">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5",
                  isActive && "bg-black/5 text-slate-900 dark:bg-white/5 dark:text-white dark:text-white",
                )
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard#global"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5",
                  isActive && "bg-black/5 text-slate-900 dark:bg-white/5 dark:text-white",
                )
              }
            >
              Global
            </NavLink>
            <NavLink
              to="/dashboard#philippines"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5",
                  isActive && "bg-black/5 text-slate-900 dark:bg-white/5 dark:text-white",
                )
              }
            >
              Philippines
            </NavLink>
            <NavLink
              to="/dashboard#insights"
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5",
                  isActive && "bg-black/5 text-slate-900 dark:bg-white/5 dark:text-white",
                )
              }
            >
              Insights
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/70 p-2 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/70 p-2 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Profile"
            title="Profile"
          >
            <UserCircle2 className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

