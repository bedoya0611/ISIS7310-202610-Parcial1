"use client";

import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import ActorCreateForm from "@/app/components/ActorCreateForm";
import ActorDetail from "@/app/components/ActorDetail";
import ActorList from "@/app/components/ActorList";
import AppHeader from "@/app/components/AppHeader";
import MovieCreateForm from "@/app/components/MovieCreateForm";
import MovieDetail from "@/app/components/MovieDetail";
import MovieList from "@/app/components/MovieList";
import { useLocale } from "@/app/lib/locale";

function DashboardView() {
  const { isSpanish } = useLocale();
  const text = isSpanish
    ? {
        title: "Gestion de catalogo",
        description: "Administra actores y registra nuevas peliculas con sus asociaciones.",
        viewActors: "Ver actores",
        viewMovies: "Ver peliculas",
        createActor: "Crear actor",
        createMovie: "Crear pelicula",
      }
    : {
        title: "Catalog management",
        description: "Manage actors and register new movies with their associations.",
        viewActors: "View actors",
        viewMovies: "View movies",
        createActor: "Create actor",
        createMovie: "Create movie",
      };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title" className="text-3xl font-bold text-stone-800">
          {text.title}
        </h1>
        <p className="mt-2 text-stone-600">{text.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/actors"
            className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-800"
          >
            {text.viewActors}
          </Link>
          <Link
            to="/movies"
            className="rounded-md border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            {text.viewMovies}
          </Link>
          <Link
            to="/crear"
            className="rounded-md border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            {text.createActor}
          </Link>
          <Link
            to="/crear-pelicula"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            {text.createMovie}
          </Link>
        </div>
      </section>
    </main>
  );
}

function AppFooter({ compact = false }: { compact?: boolean }) {
  const { isSpanish } = useLocale();
  const message = isSpanish
    ? compact
      ? "© 2026 Sistema de gestion del catalogo. Todos los derechos reservados."
      : "© 2026 Plataforma profesional de gestion de talento."
    : compact
      ? "© 2026 Catalog management system. All rights reserved."
      : "© 2026 Professional talent management platform.";

  return (
    <footer className={compact ? "py-4 text-center text-xs text-slate-400" : "border-t border-slate-200 py-6 text-center text-xs text-slate-400"}>
      {message}
    </footer>
  );
}

function MoviesView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="movies" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">
        <MovieList />
      </main>
      <AppFooter />
    </div>
  );
}

function MovieDetailView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="movies" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">
        <MovieDetail />
      </main>
      <AppFooter />
    </div>
  );
}

function ActorsView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="actors" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorList />
      </main>
      <AppFooter />
    </div>
  );
}

function ActorDetailView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="actors" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorDetail />
      </main>
      <AppFooter />
    </div>
  );
}

function CrearView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="crear" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorCreateForm />
      </main>
      <AppFooter compact />
    </div>
  );
}

function CrearPeliculaView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader active="crear-pelicula" />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-6 py-10">
        <MovieCreateForm />
      </main>
      <AppFooter compact />
    </div>
  );
}

function SpanishActorAliasRedirect() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/actors" replace />;
  }

  return <Navigate to={`/actors/${id}`} replace />;
}

function SpanishMovieAliasRedirect() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/movies" replace />;
  }

  return <Navigate to={`/movies/${id}`} replace />;
}

export default function RouterApp() {
  const { isSpanish } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!mounted) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
        <p className="text-slate-500" role="status" aria-live="polite">
          {isSpanish ? "Cargando aplicacion..." : "Loading application..."}
        </p>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/actors" element={<ActorsView />} />
        <Route path="/movies" element={<MoviesView />} />
        <Route path="/movies/:id" element={<MovieDetailView />} />
        <Route path="/actors/:id" element={<ActorDetailView />} />
        <Route path="/crear" element={<CrearView />} />
        <Route path="/crear-pelicula" element={<CrearPeliculaView />} />
        <Route path="/actores" element={<Navigate to="/actors" replace />} />
        <Route path="/peliculas" element={<Navigate to="/movies" replace />} />
        <Route path="/peliculas/:id" element={<SpanishMovieAliasRedirect />} />
        <Route path="/actores/:id" element={<SpanishActorAliasRedirect />} />
        <Route path="/crear-actor" element={<Navigate to="/crear" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
