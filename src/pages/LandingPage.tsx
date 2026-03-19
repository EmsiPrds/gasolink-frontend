import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ChartLine, MapPin, Shield } from "lucide-react";
import type { ReactNode } from "react";

export function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-b from-brand-600/20 to-transparent p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-600/15 px-3 py-1 text-xs font-medium text-brand-100">
            Oil Price Monitoring • Philippines-focused
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Understand global oil moves and what they may mean for PH fuel prices.
          </h1>
          <p className="text-pretty text-slate-200">
            Gasolink connects global reference prices (Brent/WTI + USD/PHP) with Philippine local fuel prices and
            company comparisons—explained in simple, everyday wording.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500"
            >
              View Dashboard <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Admin Login <Shield className="size-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-300">
            Clear labels: <span className="font-semibold text-white">Verified</span>,{" "}
            <span className="font-semibold text-white">Advisory</span>,{" "}
            <span className="font-semibold text-white">Estimate</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">Global Reference</p>
              <p className="mt-1 text-lg font-semibold">Brent • WTI • USD/PHP</p>
              <p className="mt-2 text-xs text-slate-300">Real-time (or near real-time) source-ready structure.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">PH Local Prices</p>
              <p className="mt-1 text-lg font-semibold">Gas • Diesel • Kerosene</p>
              <p className="mt-2 text-xs text-slate-300">Weekly adjustments shown clearly.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">Company Comparison</p>
              <p className="mt-1 text-lg font-semibold">By region + fuel type</p>
              <p className="mt-2 text-xs text-slate-300">Petron, Shell, Caltex, and more.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">Insights & Alerts</p>
              <p className="mt-1 text-lg font-semibold">Plain-language guidance</p>
              <p className="mt-2 text-xs text-slate-300">Forecasts always marked as Estimate only.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Feature
          icon={<ChartLine className="size-5" />}
          title="Clean charts & trends"
          desc="Compare Brent vs Gasoline/Diesel and filter by 7/30/90 days."
        />
        <Feature
          icon={<MapPin className="size-5" />}
          title="Philippines-first filtering"
          desc="NCR, Luzon, Visayas, Mindanao—so comparisons make sense locally."
        />
        <Feature
          icon={<BadgeCheck className="size-5" />}
          title="Transparent data labels"
          desc="Verified, Advisory, or Estimate—never confusing projections with official values."
        />
      </section>

      <footer className="border-t border-white/10 py-10 text-sm text-slate-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-white">Gasolink</p>
          <p>Built for clarity and transparency for Filipino users.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature(props: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-brand-200">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-600/15 ring-1 ring-brand-500/20">
          {props.icon}
        </span>
        <p className="font-semibold text-white">{props.title}</p>
      </div>
      <p className="mt-3 text-sm text-slate-200">{props.desc}</p>
    </div>
  );
}

