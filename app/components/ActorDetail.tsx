"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const API_URL = "http://localhost:3000/api/v1/actors";
const EDIT_DIALOG_TITLE_ID = "actor-detail-edit-dialog-title";
const EDIT_DIALOG_DESCRIPTION_ID = "actor-detail-edit-dialog-description";

export default function ActorDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isSpanish, formatDate, translateNationality } = useLocale();
  const editNameInputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const text = useMemo(
    () =>
      isSpanish
        ? {
            loadFallback: "no se pudo cargar el actor",
            notFound: "Actor no encontrado.",
            updateFallback: "no se pudo editar el actor",
            deleteFallback: "no se pudo eliminar el actor",
            loading: "Cargando detalle del actor...",
            errorTitle: "No se pudo cargar el actor",
            backToList: "Volver a la lista",
            breadcrumb: "Actores",
            editActor: "Editar actor",
            deleteActor: "Eliminar actor",
            deletingActor: "Eliminando...",
            deleteConfirm: (name: string) => `Deseas eliminar a ${name}? Esta accion no se puede deshacer.`,
            photoAlt: (name: string) => `Fotografia de ${name}`,
            nationality: "Nacionalidad",
            birthDate: "Fecha de nacimiento",
            biography: "Biografia",
            knownWorks: "Trabajos conocidos",
            displayModeLabel: "Modo de visualizacion de trabajos conocidos",
            paged: "Paginado",
            fullList: "Lista completa",
            pageOf: (current: number, total: number) => `Pagina ${current} de ${total}`,
            totalMovies: (total: number) => `${total} peliculas en total`,
            noWorks: "No hay trabajos registrados para este actor.",
            previousKnownWorksPage: "Ir a la pagina anterior de trabajos conocidos",
            nextKnownWorksPage: "Ir a la pagina siguiente de trabajos conocidos",
            updateSuccess: "Actor actualizado correctamente.",
            deleteSuccess: "Actor eliminado correctamente.",
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
            unexpectedError: "Ocurrio un error inesperado",
          }
        : {
            loadFallback: "could not load the actor",
            notFound: "Actor not found.",
            updateFallback: "could not update the actor",
            deleteFallback: "could not delete the actor",
            loading: "Loading actor details...",
            errorTitle: "Could not load the actor",
            backToList: "Back to list",
            breadcrumb: "Actors",
            editActor: "Edit actor",
            deleteActor: "Delete actor",
            deletingActor: "Deleting...",
            deleteConfirm: (name: string) => `Do you want to delete ${name}? This action cannot be undone.`,
            photoAlt: (name: string) => `Photo of ${name}`,
            nationality: "Nationality",
            birthDate: "Birth date",
            biography: "Biography",
            knownWorks: "Known works",
            displayModeLabel: "Known works display mode",
            paged: "Paged",
            fullList: "Full list",
            pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
            totalMovies: (total: number) => `${total} total movies`,
            noWorks: "There are no works registered for this actor.",
            previousKnownWorksPage: "Go to previous known works page",
            nextKnownWorksPage: "Go to next known works page",
            updateSuccess: "Actor updated successfully.",
            deleteSuccess: "Actor deleted successfully.",
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
            unexpectedError: "An unexpected error occurred",
          },
    [isSpanish],
  );

  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [deletingActor, setDeletingActor] = useState(false);

  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editBiography, setEditBiography] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [moviesViewMode, setMoviesViewMode] = useState<"paged" | "full">("paged");
  const [moviesPage, setMoviesPage] = useState(1);

  useEffect(() => {
    const fetchActor = async () => {
      if (!id) {
        setError(text.notFound);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(text.notFound);
          }
          throw new Error(await getApiErrorMessage(response, text.loadFallback));
        }

        const data: Actor = await response.json();
        setActor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : text.unexpectedError);
      } finally {
        setLoading(false);
      }
    };

    void fetchActor();
  }, [id, text.loadFallback, text.notFound, text.unexpectedError]);

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

  const knownWorks = useMemo(() => actor?.movies?.filter((movie) => Boolean(movie.title.trim())) ?? [], [actor]);
  const moviesPageSize = 4;
  const totalMoviesPages = Math.max(1, Math.ceil(knownWorks.length / moviesPageSize));
  const moviesStartIndex = (moviesPage - 1) * moviesPageSize;
  const pagedMovies = knownWorks.slice(moviesStartIndex, moviesStartIndex + moviesPageSize);
  const visibleMovies = moviesViewMode === "full" ? knownWorks : pagedMovies;

  useEffect(() => {
    setMoviesPage(1);
  }, [actor?.id, moviesViewMode]);

  useEffect(() => {
    if (moviesPage > totalMoviesPages) {
      setMoviesPage(totalMoviesPages);
    }
  }, [moviesPage, totalMoviesPages]);

  const openEditForm = () => {
    if (!actor) return;

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

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
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
        throw new Error(await getApiErrorMessage(response, text.updateFallback));
      }

      const updatedActor: Actor = await response.json();
      setActor(updatedActor);
      setToast({ type: "success", message: text.updateSuccess });
      closeEditForm();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : text.unexpectedError,
      });
      setIsSavingEdit(false);
    }
  };

  const handleDeleteActor = async () => {
    if (!actor) return;

    if (!window.confirm(text.deleteConfirm(actor.name))) {
      return;
    }

    setDeletingActor(true);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/${actor.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(await getApiErrorMessage(response, text.deleteFallback));
      }

      navigate("/actors", {
        state: {
          toast: {
            type: "success",
            message: text.deleteSuccess,
          },
        },
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : text.unexpectedError,
      });
    } finally {
      setDeletingActor(false);
    }
  };

  if (loading) {
    return (
      <p className="text-slate-600" role="status" aria-live="polite">
        {text.loading}
      </p>
    );
  }

  if (error || !actor) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
        <h1 className="text-xl font-semibold text-red-700">{text.errorTitle}</h1>
        <p className="text-sm text-red-600">{error || text.notFound}</p>
        <button
          type="button"
          onClick={() => navigate("/actors")}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {text.backToList}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="actor-detail-title">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
            <span>{text.breadcrumb}</span>
            <span aria-hidden="true"> / </span>
            <span>{actor.name}</span>
          </nav>
          <h1 id="actor-detail-title" className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
            {actor.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openEditForm}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {text.editActor}
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteActor()}
            disabled={deletingActor}
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingActor ? text.deletingActor : text.deleteActor}
          </button>
          <Link
            to="/actors"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {text.backToList}
          </Link>
        </div>
      </div>

      <article className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[280px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={actor.photo}
            alt={text.photoAlt(actor.name)}
            className="h-80 w-full rounded-xl border border-slate-200 object-cover"
          />
          <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-800">{text.nationality}</dt>
              <dd>{translateNationality(actor.nationality)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{text.birthDate}</dt>
              <dd>{formatDate(actor.birthDate)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.biography}</h2>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-slate-700">{actor.biography}</p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-slate-900">{text.knownWorks}</h2>
              {knownWorks.length > 0 ? (
                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 text-sm" role="group" aria-label={text.displayModeLabel}>
                  <button
                    type="button"
                    onClick={() => setMoviesViewMode("paged")}
                    className={`rounded px-3 py-1 ${
                      moviesViewMode === "paged" ? "bg-white font-semibold text-slate-800 shadow-sm" : "text-slate-600"
                    }`}
                    aria-pressed={moviesViewMode === "paged"}
                  >
                    {text.paged}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoviesViewMode("full")}
                    className={`rounded px-3 py-1 ${
                      moviesViewMode === "full" ? "bg-white font-semibold text-slate-800 shadow-sm" : "text-slate-600"
                    }`}
                    aria-pressed={moviesViewMode === "full"}
                  >
                    {text.fullList}
                  </button>
                </div>
              ) : null}
            </div>

            {knownWorks.length > 0 ? (
              <p className="mt-3 text-xs text-slate-500" role="status" aria-live="polite">
                {moviesViewMode === "paged"
                  ? text.pageOf(moviesPage, totalMoviesPages)
                  : text.totalMovies(knownWorks.length)}
              </p>
            ) : null}

            {knownWorks.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{text.noWorks}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {visibleMovies.map((movie) => (
                  <li
                    key={`${actor.id}-${movie.title}`}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {movie.title}
                  </li>
                ))}
              </ul>
            )}

            {moviesViewMode === "paged" && knownWorks.length > 0 ? (
              <nav className="mt-3 flex items-center gap-2" aria-label={text.knownWorks}>
                <button
                  type="button"
                  onClick={() => setMoviesPage((page) => Math.max(page - 1, 1))}
                  disabled={moviesPage === 1}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={text.previousKnownWorksPage}
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => setMoviesPage((page) => Math.min(page + 1, totalMoviesPages))}
                  disabled={moviesPage === totalMoviesPages}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={text.nextKnownWorksPage}
                >
                  {">"}
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </article>

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
