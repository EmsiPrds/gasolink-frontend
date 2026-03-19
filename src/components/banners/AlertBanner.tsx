import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { BellRing } from "lucide-react";

export function AlertBanner(props: {
  title: string;
  message: string;
  href?: string;
  footnote?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/60 bg-gradient-to-r from-brand-600/15 via-white/70 to-transparent p-4",
        "dark:border-white/10 dark:from-brand-600/20 dark:via-white/5",
        props.className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-brand-600/15 ring-1 ring-brand-500/20">
            <BellRing className="size-5 text-brand-100" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{props.title}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{props.message}</p>
          </div>
        </div>
        {props.href ? (
          <Link
            to={props.href}
            className="shrink-0 rounded-xl border border-slate-200/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            See details
          </Link>
        ) : null}
      </div>
      {props.footnote ? <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{props.footnote}</p> : null}
    </div>
  );
}

