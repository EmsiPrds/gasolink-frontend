import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardBody } from "../ui/Card";
import type { ReactNode } from "react";

export function MetricCard(props: {
  metaLabel?: string;
  label: string;
  value: string;
  changePercent?: number;
  lastUpdated?: string;
  rightBadge?: ReactNode;
  onClick?: () => void;
}) {
  const change = props.changePercent ?? 0;
  const up = change > 0.05;
  const down = change < -0.05;
  const trendColor = up
    ? "text-emerald-700 dark:text-emerald-200"
    : down
      ? "text-energy-700 dark:text-energy-200"
      : "text-slate-700 dark:text-slate-200";

  return (
    <Card className={"p-0 " + (props.onClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5" : "")}>
      <CardBody className="space-y-2" onClick={props.onClick}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {props.metaLabel ? (
              <span className="inline-flex items-center rounded-full border border-slate-200/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {props.metaLabel}
              </span>
            ) : null}
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{props.label}</p>
          </div>
          {props.rightBadge}
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{props.value}</p>
          <div className={"flex items-center gap-1 text-sm " + trendColor}>
            {up ? <ArrowUpRight className="size-4" /> : down ? <ArrowDownRight className="size-4" /> : null}
            <span>{change.toFixed(2)}%</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Last updated:{" "}
          {props.lastUpdated ? format(new Date(props.lastUpdated), "PP p") : "—"}
        </p>
      </CardBody>
    </Card>
  );
}

