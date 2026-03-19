import type { ReactNode } from "react";

export function SectionHeader(props: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{props.title}</p>
        {props.subtitle ? <p className="mt-1 text-sm text-slate-200">{props.subtitle}</p> : null}
      </div>
      {props.right ? <div className="shrink-0">{props.right}</div> : null}
    </div>
  );
}

