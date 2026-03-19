import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { setToken } from "../../store/auth";
import type { ApiResponse } from "../../types/api";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ token: string }>>("/auth/login", { email, password });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.token;
    },
    onSuccess: (token) => {
      setToken(token);
      nav("/admin", { replace: true });
    },
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-200">Sign in to manage PH prices, company prices, insights, and alerts.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Email</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none ring-brand-500/30 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gasolink.local"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Password</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none ring-brand-500/30 focus:ring-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
            type="submit"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {login.isError ? (
          <div className="mt-4 rounded-xl border border-energy-500/20 bg-energy-500/10 p-3 text-sm text-energy-200">
            {login.error instanceof Error ? login.error.message : "Login failed"}
          </div>
        ) : null}

        <div className="mt-4 text-xs text-slate-300">
          <Link to="/" className="hover:text-white">
            ← Back to site
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Admin access is secured with JWT and server-side verification.
      </p>
    </div>
  );
}

