import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { BarChart3, Globe2, Lightbulb, MapPin } from "lucide-react";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: BarChart3 },
  { label: "Global", to: "/dashboard#global", icon: Globe2 },
  { label: "Philippines", to: "/dashboard#philippines", icon: MapPin },
  { label: "Insights", to: "/dashboard#insights", icon: Lightbulb },
] as const;

export function BottomNav() {
  const location = useLocation();

  if (location.pathname !== "/dashboard") return null;

  return (
    <nav
      aria-label="Bottom navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/60 bg-white/70 backdrop-blur sm:hidden",
        "dark:border-white/10 dark:bg-slate-950/80",
        "pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 pt-2">
        {items.map((it) => {
          const active =
            it.to === "/dashboard"
              ? location.hash === "" || location.hash === "#"
              : location.hash === it.to.replace("/dashboard", "");

          const Icon = it.icon;
          return (
            <Link
              key={it.label}
              to={it.to}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition",
                active
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl ring-1 transition",
                  active
                    ? "bg-brand-600/15 text-brand-100 ring-brand-500/20"
                    : "bg-black/5 text-slate-700 ring-black/10 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

