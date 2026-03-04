"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const API_URL = "http://localhost:3000/api/v1/actors";

function formatBirthDate(birthDate: string): string {
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return birthDate;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(parsed);
}

export default function ActorDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
        setError("No se encontro el identificador del actor.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Actor no encontrado.");
          }
          throw new Error(await getApiErrorMessage(response, "no se pudo cargar el actor"));
        }

        const data: Actor = await response.json();
        setActor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrio un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    void fetchActor();
  }, [id]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

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
        throw new Error(await getApiErrorMessage(response, "no se pudo editar el actor"));
      }

      const updatedActor: Actor = await response.json();
      setActor(updatedActor);
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

  const handleDeleteActor = async () => {
    if (!actor) return;

    if (!window.confirm("Deseas eliminar este actor? Esta accion no se puede deshacer.")) {
      return;
    }

    setDeletingActor(true);
    setToast(null);

    try {
      const response = await fetch(`${API_URL}/${actor.id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(await getApiErrorMessage(response, "no se pudo eliminar el actor"));
      }

      navigate("/actors", {
        state: {
          toast: {
            type: "success",
            message: "Actor eliminado correctamente.",
          },
        },
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Ocurrio un error inesperado al eliminar",
      });
    } finally {
      setDeletingActor(false);
    }
  };

  if (loading) {
    return <p className="text-slate-600">Loading actor details...</p>;
  }

  if (error || !actor) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <h1 className="text-xl font-semibold text-red-700">No se pudo cargar el actor</h1>
        <p className="text-sm text-red-600">{error || "Actor no encontrado."}</p>
        <button
          type="button"
          onClick={() => navigate("/actors")}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Volver a la lista
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Actors / {actor.name}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{actor.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openEditForm}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit actor
          </button>
          <button
            type="button"
            onClick={() => void handleDeleteActor()}
            disabled={deletingActor}
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingActor ? "Deleting..." : "Delete actor"}
          </button>
          <Link
            to="/actors"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to list
          </Link>
        </div>
      </div>

      <article className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[280px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={actor.photo}
            alt={actor.name}
            className="h-80 w-full rounded-xl border border-slate-200 object-cover"
          />
          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Nationality:</span> {actor.nationality}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Birth date:</span>{" "}
              {formatBirthDate(actor.birthDate)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Biography</h2>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-slate-700">
              {actor.biography}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Known works</h2>
            {knownWorks.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1 text-sm">
                  <button
                    type="button"
                    onClick={() => setMoviesViewMode("paged")}
                    className={`rounded px-3 py-1 ${
                      moviesViewMode === "paged" ? "bg-white font-semibold text-slate-800 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Paged
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoviesViewMode("full")}
                    className={`rounded px-3 py-1 ${
                      moviesViewMode === "full" ? "bg-white font-semibold text-slate-800 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Full list
                  </button>
                </div>

                {moviesViewMode === "paged" ? (
                  <span className="text-xs text-slate-500">
                    Page {moviesPage} of {totalMoviesPages}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">{knownWorks.length} total movies</span>
                )}
              </div>
            ) : null}

            {knownWorks.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No works registered for this actor.</p>
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
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMoviesPage((page) => Math.max(page - 1, 1))}
                  disabled={moviesPage === 1}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => setMoviesPage((page) => Math.min(page + 1, totalMoviesPages))}
                  disabled={moviesPage === totalMoviesPages}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {">"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </article>

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
