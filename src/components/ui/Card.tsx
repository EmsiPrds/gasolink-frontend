import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export function Card(props: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/60 bg-white/70 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm",
        "dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

export function CardHeader(props: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 p-4 dark:border-white/10">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{props.title}</p>
        {props.subtitle ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{props.subtitle}</p> : null}
      </div>
      {props.right ? <div className="shrink-0">{props.right}</div> : null}
    </div>
  );
}

export function CardBody(props: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={cn("p-4", props.className)} onClick={props.onClick}>
      {props.children}
    </div>
  );
}

