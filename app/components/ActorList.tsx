"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { useLocale } from "@/app/lib/locale";

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
const FILTERS_PANEL_ID = "actor-filters-panel";
const EDIT_DIALOG_TITLE_ID = "actor-edit-dialog-title";
const EDIT_DIALOG_DESCRIPTION_ID = "actor-edit-dialog-description";

export default function ActorList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSpanish, translateNationality } = useLocale();
  const editNameInputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const text = useMemo(
    () =>
      isSpanish
        ? {
            loadErrorFallback: "no se pudieron cargar los actores",
            updateErrorFallback: "no se pudo editar el actor",
            deleteErrorFallback: "no se pudo eliminar el actor",
            loadingTitle: "Cargando actores...",
            loadingDescription: "Estamos obteniendo la informacion mas reciente.",
            errorTitle: "No se pudo cargar la lista de actores",
            retry: "Reintentar",
            emptyTitle: "No hay actores aun",
            emptyDescription: "Crea el primer actor para empezar a construir el catalogo.",
            title: "Catalogo de actores",
            description: "Explora y administra la base de datos global de talento.",
            filters: "Filtros",
            addActor: "Crear actor",
            searchLabel: "Buscar actores",
            searchPlaceholder: "Buscar actores por nombre, nacionalidad o trabajos destacados...",
            filtersRegion: "Filtros de actores",
            nationality: "Nacionalidad",
            allNationalities: "Todas las nacionalidades",
            onlyWithKnownWorks: "Solo con trabajos conocidos",
            sortBy: "Ordenar por",
            sortNameAsc: "Nombre (A-Z)",
            sortNameDesc: "Nombre (Z-A)",
            sortMoviesDesc: "Peliculas (de mayor a menor)",
            sortMoviesAsc: "Peliculas (de menor a mayor)",
            sortBirthDateDesc: "Fecha de nacimiento (mas reciente primero)",
            sortBirthDateAsc: "Fecha de nacimiento (mas antigua primero)",
            clearFilters: "Limpiar filtros",
            resultsSummary: (first: number, last: number, total: number) =>
              `Mostrando ${first} a ${last} de ${total} resultados`,
            tableCaption: "Lista de actores con nacionalidad, trabajos destacados y acciones.",
            name: "Nombre",
            knownFor: "Conocido por",
            actions: "Acciones",
            noResults: "No se encontraron actores con la busqueda o los filtros actuales.",
            noWorks: "Sin trabajos",
            edit: "Editar",
            editAria: (name: string) => `Editar a ${name}`,
            delete: "Eliminar",
            deleteAria: (name: string) => `Eliminar a ${name}`,
            deleteConfirm: (name: string) => `Deseas eliminar a ${name}?`,
            deleting: "Eliminando...",
            pagination: "Paginacion de actores",
            pageOf: (current: number, total: number) => `Pagina ${current} de ${total}`,
            previousPage: "Ir a la pagina anterior",
            nextPage: "Ir a la pagina siguiente",
            editDialogTitle: "Editar actor",
            editDialogDescription: "Actualiza la informacion del actor y guarda los cambios.",
            formName: "Nombre",
            formPhotoUrl: "URL de la foto",
            formNationality: "Nacionalidad",
            formBirthDate: "Fecha de nacimiento",
            formBiography: "Biografia",
            cancel: "Cancelar",
            saveChanges: "Guardar cambios",
            saving: "Guardando...",
            updateSuccess: "Actor actualizado correctamente.",
            deleteSuccess: "Actor eliminado correctamente.",
            photoAlt: (name: string) => `Fotografia de ${name}`,
          }
        : {
            loadErrorFallback: "could not load the actors",
            updateErrorFallback: "could not update the actor",
            deleteErrorFallback: "could not delete the actor",
            loadingTitle: "Loading actors...",
            loadingDescription: "We are retrieving the latest information.",
            errorTitle: "Could not load the actors list",
            retry: "Retry",
            emptyTitle: "There are no actors yet",
            emptyDescription: "Create the first actor to start building the catalog.",
            title: "Actors catalog",
            description: "Explore and manage the global talent database.",
            filters: "Filters",
            addActor: "Add actor",
            searchLabel: "Search actors",
            searchPlaceholder: "Search actors by name, nationality, or known works...",
            filtersRegion: "Actor filters",
            nationality: "Nationality",
            allNationalities: "All nationalities",
            onlyWithKnownWorks: "Only with known works",
            sortBy: "Sort by",
            sortNameAsc: "Name (A-Z)",
            sortNameDesc: "Name (Z-A)",
            sortMoviesDesc: "Movies (high to low)",
            sortMoviesAsc: "Movies (low to high)",
            sortBirthDateDesc: "Birth date (newest first)",
            sortBirthDateAsc: "Birth date (oldest first)",
            clearFilters: "Clear filters",
            resultsSummary: (first: number, last: number, total: number) =>
              `Showing ${first} to ${last} of ${total} results`,
            tableCaption: "List of actors with nationality, known works, and actions.",
            name: "Name",
            knownFor: "Known for",
            actions: "Actions",
            noResults: "No actors were found with the current search or filters.",
            noWorks: "No works",
            edit: "Edit",
            editAria: (name: string) => `Edit ${name}`,
            delete: "Delete",
            deleteAria: (name: string) => `Delete ${name}`,
            deleteConfirm: (name: string) => `Do you want to delete ${name}?`,
            deleting: "Deleting...",
            pagination: "Actors pagination",
            pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
            previousPage: "Go to previous page",
            nextPage: "Go to next page",
            editDialogTitle: "Edit actor",
            editDialogDescription: "Update the actor information and save the changes.",
            formName: "Name",
            formPhotoUrl: "Photo URL",
            formNationality: "Nationality",
            formBirthDate: "Birth date",
            formBiography: "Biography",
            cancel: "Cancel",
            saveChanges: "Save changes",
            saving: "Saving...",
            updateSuccess: "Actor updated successfully.",
            deleteSuccess: "Actor deleted successfully.",
            photoAlt: (name: string) => `Photo of ${name}`,
          },
    [isSpanish],
  );

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
        throw new Error(await getApiErrorMessage(response, text.loadErrorFallback));
      }

      const data: Actor[] = await response.json();
      setActors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : text.loadErrorFallback);
    } finally {
      setLoading(false);
    }
  }, [text.loadErrorFallback]);

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

  useEffect(() => {
    if (!editingActorId) {
      return;
    }

    editNameInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingEdit) {
        setEditingActorId(null);
        setIsSavingEdit(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [editingActorId, isSavingEdit]);

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
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
        throw new Error(await getApiErrorMessage(response, text.updateErrorFallback));
      }

      const updatedActor: Actor = await response.json();
      setActors((prevActors) =>
        prevActors.map((actor) => (actor.id === editingActorId ? updatedActor : actor)),
      );
      setToast({ type: "success", message: text.updateSuccess });
      closeEditForm();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : text.updateErrorFallback,
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
        throw new Error(await getApiErrorMessage(response, text.deleteErrorFallback));
      }

      setActors((prevActors) => prevActors.filter((actor) => actor.id !== actorId));
      setToast({ type: "success", message: text.deleteSuccess });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : text.deleteErrorFallback,
      });
    } finally {
      setDeletingActorId(null);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm" role="status" aria-live="polite">
        <p className="text-sm font-medium text-slate-700">{text.loadingTitle}</p>
        <p className="mt-1 text-xs text-slate-500">{text.loadingDescription}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm" role="alert">
        <h2 className="text-lg font-semibold text-red-700">{text.errorTitle}</h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadActors()}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {text.retry}
        </button>
      </section>
    );
  }

  if (actors.length === 0) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm" aria-live="polite">
        {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
        <h2 className="text-2xl font-semibold text-slate-900">{text.emptyTitle}</h2>
        <p className="text-sm text-slate-600">{text.emptyDescription}</p>
        <div className="pt-2">
          <Link
            to="/crear"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {text.addActor}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="actors-catalog-title">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="actors-catalog-title" className="text-5xl font-bold tracking-tight text-slate-900">
            {text.title}
          </h1>
          <p className="mt-2 text-lg text-slate-600">{text.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
            aria-expanded={showFilters}
            aria-controls={FILTERS_PANEL_ID}
          >
            {text.filters}
            {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
          </button>
          <Link
            to="/crear"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {text.addActor}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label htmlFor="actors-search" className="sr-only">
          {text.searchLabel}
        </label>
        <input
          id="actors-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={text.searchPlaceholder}
          className="w-full border-none bg-transparent text-sm text-slate-600 outline-none"
        />
      </div>

      {showFilters ? (
        <div
          id={FILTERS_PANEL_ID}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4"
          role="region"
          aria-label={text.filtersRegion}
        >
          <div className="sm:col-span-1">
            <label htmlFor="nationalityFilter" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              {text.nationality}
            </label>
            <select
              id="nationalityFilter"
              value={nationalityFilter}
              onChange={(event) => setNationalityFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <option value="all">{text.allNationalities}</option>
              {uniqueNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {translateNationality(nationality)}
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
              {text.onlyWithKnownWorks}
            </label>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="sortOption" className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              {text.sortBy}
            </label>
            <select
              id="sortOption"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <option value="name-asc">{text.sortNameAsc}</option>
              <option value="name-desc">{text.sortNameDesc}</option>
              <option value="movies-desc">{text.sortMoviesDesc}</option>
              <option value="movies-asc">{text.sortMoviesAsc}</option>
              <option value="birthDate-desc">{text.sortBirthDateDesc}</option>
              <option value="birthDate-asc">{text.sortBirthDateAsc}</option>
            </select>
          </div>

          <div className="flex items-end justify-start sm:col-span-1 sm:justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              {text.clearFilters}
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <p className="px-4 py-3 text-sm text-slate-500" role="status" aria-live="polite">
          {text.resultsSummary(firstResult, lastResult, sortedActors.length)}
        </p>
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{text.tableCaption}</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.name}
              </th>
              <th scope="col" className="w-1/5 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.nationality}
              </th>
              <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.knownFor}
              </th>
              <th scope="col" className="w-1/6 px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">
                {text.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleActors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {text.noResults}
                </td>
              </tr>
            ) : (
              visibleActors.map((actor) => (
                <tr key={actor.id} className="border-b border-slate-100 last:border-b-0">
                  <th scope="row" className="px-4 py-4 text-left">
                    <Link to={`/actors/${actor.id}`} className="group flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={actor.photo}
                        alt={text.photoAlt(actor.name)}
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                      />
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600">{actor.name}</span>
                    </Link>
                  </th>
                  <td className="px-4 py-4 text-sm text-slate-600">{translateNationality(actor.nationality)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {actor.movies?.[0]?.title ?? text.noWorks}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-slate-500">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(actor)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        aria-label={text.editAria(actor.name)}
                      >
                        {text.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(text.deleteConfirm(actor.name))) {
                            void handleDeleteActor(actor.id);
                          }
                        }}
                        disabled={deletingActorId === actor.id}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={text.deleteAria(actor.name)}
                      >
                        {deletingActorId === actor.id ? text.deleting : text.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <nav className="flex items-center justify-between px-4 py-3 text-sm text-slate-500" aria-label={text.pagination}>
          <span>
            {text.pageOf(currentPage, totalPages)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={text.previousPage}
            >
              {"<"}
            </button>
            <span className="rounded-md bg-blue-600 px-3 py-1 font-semibold text-white" aria-current="page">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={text.nextPage}
            >
              {">"}
            </button>
          </div>
        </nav>
      </div>

      {editingActorId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4" role="presentation">
          <div
            className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={EDIT_DIALOG_TITLE_ID}
            aria-describedby={EDIT_DIALOG_DESCRIPTION_ID}
          >
            <form onSubmit={handleSaveEdit} aria-busy={isSavingEdit}>
              <h2 id={EDIT_DIALOG_TITLE_ID} className="mb-2 text-xl font-semibold text-slate-900">
                {text.editDialogTitle}
              </h2>
              <p id={EDIT_DIALOG_DESCRIPTION_ID} className="mb-4 text-sm text-slate-600">
                {text.editDialogDescription}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">
                    {text.formName}
                  </label>
                  <input
                    id="edit-name"
                    ref={editNameInputRef}
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="edit-photo" className="mb-1 block text-sm font-medium text-slate-700">
                    {text.formPhotoUrl}
                  </label>
                  <input
                    id="edit-photo"
                    type="url"
                    value={editPhoto}
                    onChange={(event) => setEditPhoto(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    inputMode="url"
                    autoComplete="url"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-nationality" className="mb-1 block text-sm font-medium text-slate-700">
                    {text.formNationality}
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
                    {text.formBirthDate}
                  </label>
                  <input
                    id="edit-birthDate"
                    type="date"
                    value={editBirthDate}
                    onChange={(event) => setEditBirthDate(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    autoComplete="bday"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="edit-biography" className="mb-1 block text-sm font-medium text-slate-700">
                    {text.formBiography}
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
                  {text.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSavingEdit ? text.saving : text.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
