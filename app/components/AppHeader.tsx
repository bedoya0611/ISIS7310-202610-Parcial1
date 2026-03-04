"use client";

import { Link } from "react-router-dom";

type AppHeaderProps = {
  brand: string;
  active: "actors" | "crear";
};

export default function AppHeader({ brand, active }: AppHeaderProps) {
  const actorsLinkClass =
    active === "actors"
      ? "text-blue-600 font-semibold"
      : "text-slate-700 hover:text-blue-600";
  const createLinkClass =
    active === "crear"
      ? "text-blue-600 font-semibold"
      : "text-slate-700 hover:text-blue-600";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <div className="flex min-w-fit items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-sm text-blue-600">
            AD
          </div>
          <span className="text-lg font-semibold text-slate-900">{brand}</span>
        </div>

        <div className="hidden flex-1 md:block">
          <div className="relative max-w-sm">
            <input
              aria-label="Quick search"
              type="text"
              placeholder="Search actors..."
              className="w-full rounded-md border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-600 outline-none focus:border-blue-300"
            />
            <span className="absolute left-3 top-2 text-slate-400">⌕</span>
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link to="/" className="text-slate-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/actors" className={actorsLinkClass}>
            Actors
          </Link>
          <Link to="/crear" className={createLinkClass}>
            Add Actor
          </Link>
          <Link to="/" className="hidden text-slate-700 hover:text-blue-600 md:inline">
            Settings
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-slate-700">
            U
          </div>
        </nav>
      </div>
    </header>
  );
}
