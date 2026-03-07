"use client";

import { Link } from "react-router-dom";
import { useLocale } from "@/app/lib/locale";

type AppHeaderProps = {
  active: "actors" | "movies" | "crear" | "crear-pelicula";
};

export default function AppHeader({ active }: AppHeaderProps) {
  const { isSpanish } = useLocale();
  const navLinkClass = "text-slate-700 hover:text-blue-600";
  const activeLinkClass = "font-semibold text-blue-600";
  const actorsLinkClass = active === "actors" ? activeLinkClass : navLinkClass;
  const createLinkClass = active === "crear" ? activeLinkClass : navLinkClass;
  const createMovieLinkClass = active === "crear-pelicula" ? activeLinkClass : navLinkClass;
  const moviesLinkClass = active === "movies" ? activeLinkClass : navLinkClass;

  const text = isSpanish
    ? {
        brand: "Catalogo de Actores y Peliculas",
        homeAria: "Ir al inicio del catalogo",
        searchAria: "Busqueda rapida",
        searchLabel: "Buscar en el catalogo",
        searchPlaceholder: "Buscar en el catalogo...",
        navLabel: "Navegacion principal",
        dashboard: "Inicio",
        actors: "Actores",
        movies: "Peliculas",
        addActor: "Crear actor",
        addMovie: "Crear pelicula",
        settings: "Configuracion",
      }
    : {
        brand: "Actors and Movies Catalog",
        homeAria: "Go to catalog home",
        searchAria: "Quick search",
        searchLabel: "Search catalog",
        searchPlaceholder: "Search catalog...",
        navLabel: "Main navigation",
        dashboard: "Dashboard",
        actors: "Actors",
        movies: "Movies",
        addActor: "Add actor",
        addMovie: "Add movie",
        settings: "Settings",
      };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link to="/" className="flex min-w-fit items-center gap-2" aria-label={text.homeAria}>
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-sm text-blue-600"
            aria-hidden="true"
          >
            AD
          </div>
          <span className="text-lg font-semibold text-slate-900">{text.brand}</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <form className="max-w-sm" role="search" aria-label={text.searchAria}>
            <label htmlFor="header-search" className="sr-only">
              {text.searchLabel}
            </label>
            <input
              id="header-search"
              type="search"
              placeholder={text.searchPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-300"
            />
          </form>
        </div>

        <nav className="ml-auto flex items-center gap-5 text-sm" aria-label={text.navLabel}>
          <Link to="/" className={navLinkClass}>
            {text.dashboard}
          </Link>
          <Link to="/actors" className={actorsLinkClass} aria-current={active === "actors" ? "page" : undefined}>
            {text.actors}
          </Link>
          <Link to="/movies" className={moviesLinkClass} aria-current={active === "movies" ? "page" : undefined}>
            {text.movies}
          </Link>
          <Link to="/crear" className={createLinkClass} aria-current={active === "crear" ? "page" : undefined}>
            {text.addActor}
          </Link>
          <Link
            to="/crear-pelicula"
            className={createMovieLinkClass}
            aria-current={active === "crear-pelicula" ? "page" : undefined}
          >
            {text.addMovie}
          </Link>
          <Link to="/" className="hidden text-slate-700 hover:text-blue-600 md:inline">
            {text.settings}
          </Link>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-slate-700"
            aria-hidden="true"
          >
            U
          </div>
        </nav>
      </div>
    </header>
  );
}
