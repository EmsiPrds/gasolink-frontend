import type { PriceStatus } from "../../types/domain";
import { cn } from "../../utils/cn";

export function StatusBadge({ status }: { status: PriceStatus }) {
  const styles =
    status === "Verified" || status === "Official"
      ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-200"
      : status === "Advisory"
        ? "border-sun-600/25 bg-sun-500/10 text-sun-700 dark:border-sun-400/20 dark:text-sun-200"
        : status === "Observed"
          ? "border-sky-600/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:text-sky-200"
        : "border-energy-600/20 bg-energy-500/10 text-energy-700 dark:border-energy-500/20 dark:text-energy-200";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", styles)}>
      {status}
    </span>
  );
}

