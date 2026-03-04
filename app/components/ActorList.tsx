"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";

type Actor = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  biography: string;
  birthDate: string;
  movies?: Array<{ title: string }>;
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "movies-asc"
  | "movies-desc"
  | "birthDate-asc"
  | "birthDate-desc";

const API_URL = "http://localhost:3000/api/v1/actors";

export default function ActorList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [actors, setActors] = useState<Actor[]>([]);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [onlyWithMovies, setOnlyWithMovies] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [deletingActorId, setDeletingActorId] = useState<string | null>(null);

  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editBiography, setEditBiography] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadActors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "no se pudieron cargar los actores"));
      }

      const data: Actor[] = await response.json();
      setActors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrio un error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActors();
  }, [loadActors]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    const navigationState = location.state as { toast?: { type: ToastType; message: string } } | null;
    if (!navigationState?.toast) return;

    setToast(navigationState.toast);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, nationalityFilter, onlyWithMovies, sortOption]);

  const uniqueNationalities = [...new Set(actors.map((actor) => actor.nationality))].sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredActors = actors.filter((actor) => {
    const query = search.toLowerCase().trim();
    const knownFor = actor.movies?.[0]?.title ?? "";

    const matchesQuery =
      !query ||
      actor.name.toLowerCase().includes(query) ||
      actor.nationality.toLowerCase().includes(query) ||
      knownFor.toLowerCase().includes(query) ||
      actor.biography.toLowerCase().includes(query);

    const matchesNationality =
      nationalityFilter === "all" || actor.nationality.toLowerCase() === nationalityFilter.toLowerCase();
    const matchesKnownWorks = !onlyWithMovies || Boolean(actor.movies?.length);

    return matchesQuery && matchesNationality && matchesKnownWorks;
  });

  const sortedActors = [...filteredActors].sort((a, b) => {
    if (sortOption === "name-asc") {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }

    if (sortOption === "name-desc") {
      return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
    }

    if (sortOption === "movies-asc") {
      return (a.movies?.length ?? 0) - (b.movies?.length ?? 0);
    }

    if (sortOption === "movies-desc") {
      return (b.movies?.length ?? 0) - (a.movies?.length ?? 0);
    }

    const dateA = new Date(a.birthDate).getTime();
    const dateB = new Date(b.birthDate).getTime();

    const normalizedDateA = Number.isNaN(dateA) ? 0 : dateA;
    const normalizedDateB = Number.isNaN(dateB) ? 0 : dateB;

    if (sortOption === "birthDate-asc") {
      return normalizedDateA - normalizedDateB;
    }

    return normalizedDateB - normalizedDateA;
  });

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(sortedActors.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleActors = sortedActors.slice(startIndex, startIndex + pageSize);
  const firstResult = sortedActors.length === 0 ? 0 : startIndex + 1;
  const lastResult = startIndex + visibleActors.length;
  const activeFiltersCount =
    (nationalityFilter !== "all" ? 1 : 0) + (onlyWithMovies ? 1 : 0) + (sortOption !== "name-asc" ? 1 : 0);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const handleClearFilters = () => {
    setNationalityFilter("all");
    setOnlyWithMovies(false);
    setSortOption("name-asc");
  };

  const openEditForm = (actor: Actor) => {
    setToast(null);
    setEditingActorId(actor.id);
    setEditName(actor.name);
    setEditPhoto(actor.photo);
    setEditNationality(actor.nationality);
    setEditBirthDate(actor.birthDate.split("T")[0] ?? actor.birthDate);
    setEditBiography(actor.biography);
  };

  const closeEditForm = () => {
    setEditingActorId(null);
    setIsSavingEdit(false);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingActorId) return;

    setIsSavingEdit(true);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/${editingActorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          photo: editPhoto,
          nationality: editNationality,
          birthDate: editBirthDate,
          biography: editBiography,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "no se pudo editar el actor"));
      }

      const updatedActor: Actor = await response.json();
      setActors((prevActors) =>
        prevActors.map((actor) => (actor.id === editingActorId ? updatedActor : actor)),
      );
      setToast({ type: "success", message: "Actor actualizado correctamente." });
      closeEditForm();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Ocurrio un error inesperado al editar",
      });
      setIsSavingEdit(false);
    }
  };

  const handleDeleteActor = async (actorId: string) => {
    setDeletingActorId(actorId);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/${actorId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(await getApiErrorMessage(response, "no se pudo eliminar el actor"));
      }

      setActors((prevActors) => prevActors.filter((actor) => actor.id !== actorId));
      setToast({ type: "success", message: "Actor eliminado correctamente." });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Ocurrio un error inesperado al eliminar",
      });
    } finally {
      setDeletingActorId(null);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">Cargando actores...</p>
        <p className="mt-1 text-xs text-slate-500">Estamos obteniendo la informacion mas reciente.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">No se pudo cargar la lista de actores</h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadActors()}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (actors.length === 0) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
        <h2 className="text-2xl font-semibold text-slate-900">No hay actores aun</h2>
        <p className="text-sm text-slate-600">Crea el primer actor para empezar a construir el catalogo.</p>
        <div className="pt-2">
          <Link
            to="/crear"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Add Actor
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Actors Catalog</h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage and browse through the global talent database.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
          >
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
          </button>
          <Link
            to="/crear"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Add Actor
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <input
          aria-label="Search actors"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search actors by name, nationality, or known works..."
          className="w-full border-none bg-transparent text-sm text-slate-600 outline-none"
        />
      </div>

      {showFilters ? (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label htmlFor="nationalityFilter" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Nationality
            </label>
            <select
              id="nationalityFilter"
              value={nationalityFilter}
              onChange={(event) => setNationalityFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <option value="all">All nationalities</option>
              {uniqueNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end sm:col-span-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyWithMovies}
                onChange={(event) => setOnlyWithMovies(event.target.checked)}
              />
              Only with known works
            </label>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="sortOption" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Sort by
            </label>
            <select
              id="sortOption"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="movies-desc">Movies (high to low)</option>
              <option value="movies-asc">Movies (low to high)</option>
              <option value="birthDate-desc">Birth date (newest first)</option>
              <option value="birthDate-asc">Birth date (oldest first)</option>
            </select>
          </div>

          <div className="flex items-end justify-start sm:col-span-1 sm:justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Name</th>
              <th className="w-1/5 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                Nationality
              </th>
              <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                Known For
              </th>
              <th className="w-1/6 px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleActors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No actors found with the current search/filters.
                </td>
              </tr>
            ) : (
              visibleActors.map((actor) => (
                <tr key={actor.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <Link to={`/actors/${actor.id}`} className="group flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={actor.photo}
                        alt={actor.name}
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                      />
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600">
                        {actor.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{actor.nationality}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {actor.movies?.[0]?.title ?? "No works"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-slate-500">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(actor)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Deseas eliminar este actor?")) {
                            void handleDeleteActor(actor.id);
                          }
                        }}
                        disabled={deletingActorId === actor.id}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingActorId === actor.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
          <span>
            Showing {firstResult} to {lastResult} of {sortedActors.length} results
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {"<"}
            </button>
            <span className="rounded-md bg-blue-600 px-3 py-1 font-semibold text-white">{currentPage}</span>
            <span className="text-xs text-slate-400">of {totalPages}</span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {editingActorId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Edit Actor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="edit-photo" className="mb-1 block text-sm font-medium text-slate-700">
                  Photo URL
                </label>
                <input
                  id="edit-photo"
                  type="url"
                  value={editPhoto}
                  onChange={(event) => setEditPhoto(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-nationality" className="mb-1 block text-sm font-medium text-slate-700">
                  Nationality
                </label>
                <input
                  id="edit-nationality"
                  type="text"
                  value={editNationality}
                  onChange={(event) => setEditNationality(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-birthDate" className="mb-1 block text-sm font-medium text-slate-700">
                  Birth Date
                </label>
                <input
                  id="edit-birthDate"
                  type="date"
                  value={editBirthDate}
                  onChange={(event) => setEditBirthDate(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="edit-biography" className="mb-1 block text-sm font-medium text-slate-700">
                  Biography
                </label>
                <textarea
                  id="edit-biography"
                  value={editBiography}
                  onChange={(event) => setEditBiography(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditForm}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
