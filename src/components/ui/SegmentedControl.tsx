import { cn } from "../../utils/cn";

export function SegmentedControl<T extends string>(props: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ label: string; value: T }>;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-2xl border border-white/10 bg-white/5 p-1", props.className)}>
      <span className="sr-only">{props.label}</span>
      {props.options.map((o) => {
        const active = o.value === props.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => props.onChange(o.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-semibold transition",
              active ? "bg-white/10 text-white" : "text-slate-300 hover:text-white",
            )}
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

