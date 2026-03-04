"use client";

import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "@/app/components/AppHeader";
import ActorCreateForm from "@/app/components/ActorCreateForm";
import ActorDetail from "@/app/components/ActorDetail";
import ActorList from "@/app/components/ActorList";

function DashboardView() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-stone-800">Gestion de actores</h1>
        <p className="mt-2 text-stone-600">Visitar lista de actores o crear un nuevo actor</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/actors"
            className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-amber-800"
          >
            Ver actores
          </Link>
          <Link
            to="/crear"
            className="rounded-md border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            Crear actor
          </Link>
        </div>
      </section>
    </main>
  );
}

function ActorsView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader brand="Actors Directory" active="actors" />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorList />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        (c) 2026 Actors Directory. Professional Talent Management Platform.
      </footer>
    </div>
  );
}

function ActorDetailView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader brand="Actors Directory" active="actors" />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorDetail />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        (c) 2026 Actors Directory. Professional Talent Management Platform.
      </footer>
    </div>
  );
}

function CrearView() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader brand="Actors Catalog" active="crear" />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <ActorCreateForm />
      </main>
      <footer className="py-4 text-center text-xs text-slate-400">
        (c) 2026 Actors Catalog Management System. All rights reserved.
      </footer>
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

export default function RouterApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
        <p className="text-slate-500">Loading application...</p>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/actors" element={<ActorsView />} />
        <Route path="/actors/:id" element={<ActorDetailView />} />
        <Route path="/crear" element={<CrearView />} />
        <Route path="/actores" element={<Navigate to="/actors" replace />} />
        <Route path="/actores/:id" element={<SpanishActorAliasRedirect />} />
        <Route path="/crear-actor" element={<Navigate to="/crear" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
