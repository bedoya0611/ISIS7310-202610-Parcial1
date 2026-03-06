"use client";

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";

const API_BASE_URL = "http://localhost:3000/api/v1";
const MOVIES_URL = `${API_BASE_URL}/movies`;
const ACTORS_URL = `${API_BASE_URL}/actors`;
const PRIZES_URL = `${API_BASE_URL}/prizes`;
const DIRECTORS_URL = `${API_BASE_URL}/directors`;
const GENRES_URL = `${API_BASE_URL}/genres`;
const YOUTUBE_TRAILERS_URL = `${API_BASE_URL}/youtube-trailers`;

const NATIONALITIES = [
  "American",
  "Spanish",
  "Danish",
  "Colombian",
  "French",
  "Mexican",
  "Argentinian",
];

type Genre = {
  id: string;
  type: string;
};

type Director = {
  id: string;
  name: string;
};

type CreatedResource = {
  id: string;
};

async function postJson<TResponse>(url: string, body: unknown, fallbackMessage: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, fallbackMessage));
  }

  return (await response.json()) as TResponse;
}

async function fetchJson<TResponse>(url: string, fallbackMessage: string): Promise<TResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, fallbackMessage));
  }

  return (await response.json()) as TResponse;
}

export default function MovieCreateForm() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [duration, setDuration] = useState("");
  const [country, setCountry] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [popularity, setPopularity] = useState("");
  const [genreId, setGenreId] = useState("");
  const [directorId, setDirectorId] = useState("");
  const [youtubeTrailerName, setYoutubeTrailerName] = useState("");
  const [youtubeTrailerUrl, setYoutubeTrailerUrl] = useState("");
  const [youtubeTrailerDuration, setYoutubeTrailerDuration] = useState("");
  const [youtubeTrailerChannel, setYoutubeTrailerChannel] = useState("");

  const [actorName, setActorName] = useState("");
  const [actorPhoto, setActorPhoto] = useState("");
  const [actorNationality, setActorNationality] = useState("");
  const [actorBirthDate, setActorBirthDate] = useState("");
  const [actorBiography, setActorBiography] = useState("");

  const [prizeName, setPrizeName] = useState("");
  const [prizeCategory, setPrizeCategory] = useState("");
  const [prizeYear, setPrizeYear] = useState("");
  const [prizeStatus, setPrizeStatus] = useState<"won" | "nominated">("won");

  const [genres, setGenres] = useState<Genre[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCatalogs() {
      setLoadingCatalogs(true);
      setCatalogError("");

      try {
        const [genresData, directorsData] = await Promise.all([
          fetchJson<Genre[]>(GENRES_URL, "no se pudieron cargar los generos"),
          fetchJson<Director[]>(DIRECTORS_URL, "no se pudieron cargar los directores"),
        ]);

        if (!active) {
          return;
        }

        setGenres(genresData);
        setDirectors(directorsData);
      } catch (err) {
        if (!active) {
          return;
        }

        const message = err instanceof Error ? err.message : "No se pudieron cargar los catalogos";
        setCatalogError(message);
      } finally {
        if (active) {
          setLoadingCatalogs(false);
        }
      }
    }

    void loadCatalogs();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setPoster("");
    setDuration("");
    setCountry("");
    setReleaseDate("");
    setPopularity("");
    setGenreId("");
    setDirectorId("");
    setYoutubeTrailerName("");
    setYoutubeTrailerUrl("");
    setYoutubeTrailerDuration("");
    setYoutubeTrailerChannel("");
    setActorName("");
    setActorPhoto("");
    setActorNationality("");
    setActorBirthDate("");
    setActorBiography("");
    setPrizeName("");
    setPrizeCategory("");
    setPrizeYear("");
    setPrizeStatus("won");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmissionStep("Creando trailer...");
    setError("");
    setToast(null);

    try {
      const youtubeTrailer = await postJson<CreatedResource>(
        YOUTUBE_TRAILERS_URL,
        {
          name: youtubeTrailerName,
          url: youtubeTrailerUrl,
          duration: Number(youtubeTrailerDuration),
          channel: youtubeTrailerChannel,
        },
        "no se pudo crear el trailer de YouTube",
      );

      setSubmissionStep("Creando pelicula...");
      const movie = await postJson<CreatedResource>(
        MOVIES_URL,
        {
          title,
          poster,
          duration: Number(duration),
          country,
          releaseDate,
          popularity: Number(popularity),
          genre: { id: genreId },
          director: { id: directorId },
          youtubeTrailer: { id: youtubeTrailer.id },
        },
        "no se pudo crear la pelicula",
      );

      setSubmissionStep("Creando actor principal...");
      const actor = await postJson<CreatedResource>(
        ACTORS_URL,
        {
          name: actorName,
          photo: actorPhoto,
          nationality: actorNationality,
          birthDate: actorBirthDate,
          biography: actorBiography,
        },
        "no se pudo crear el actor principal",
      );

      setSubmissionStep("Creando premio...");
      const prize = await postJson<CreatedResource>(
        PRIZES_URL,
        {
          name: prizeName,
          category: prizeCategory,
          year: Number(prizeYear),
          status: prizeStatus,
        },
        "no se pudo crear el premio",
      );

      setSubmissionStep("Asociando actor principal...");
      await postJson(`${ACTORS_URL}/${actor.id}/movies/${movie.id}`, {}, "no se pudo asociar la pelicula al actor");

      setSubmissionStep("Asociando premio a la pelicula...");
      await postJson(`${MOVIES_URL}/${movie.id}/prizes/${prize.id}`, {}, "no se pudo asociar el premio a la pelicula");
      setToast({ type: "success", message: "Pelicula creada y asociada correctamente." });
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrio un error inesperado";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSubmitting(false);
      setSubmissionStep("");
    }
  };

  const catalogsReady = genres.length > 0 && directors.length > 0;

  return (
    <section className="mx-auto max-w-6xl">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Crear pelicula con actor y premio</h1>
          </div>

          <div className="space-y-8 px-6 py-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Informacion base de la pelicula</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/actors")}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Volver a actores
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="movie-title" className="mb-1 block text-sm font-semibold text-slate-700">
                    Titulo
                  </label>
                  <input
                    id="movie-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="e.g. Once Upon a Time in Hollywood"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="movie-poster" className="mb-1 block text-sm font-semibold text-slate-700">
                    Poster URL
                  </label>
                  <input
                    id="movie-poster"
                    type="url"
                    value={poster}
                    onChange={(event) => setPoster(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="movie-duration" className="mb-1 block text-sm font-semibold text-slate-700">
                    Duracion
                  </label>
                  <input
                    id="movie-duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="161"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="movie-popularity" className="mb-1 block text-sm font-semibold text-slate-700">
                    Popularidad
                  </label>
                  <input
                    id="movie-popularity"
                    type="number"
                    min="0"
                    value={popularity}
                    onChange={(event) => setPopularity(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="85"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="movie-country" className="mb-1 block text-sm font-semibold text-slate-700">
                    Pais
                  </label>
                  <input
                    id="movie-country"
                    type="text"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="United States"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="movie-release-date" className="mb-1 block text-sm font-semibold text-slate-700">
                    Fecha de estreno
                  </label>
                  <input
                    id="movie-release-date"
                    type="date"
                    value={releaseDate}
                    onChange={(event) => setReleaseDate(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Genero y director</h2>
              </div>

              {loadingCatalogs ? <p className="text-sm text-slate-500">Cargando opciones...</p> : null}
              {catalogError ? <p className="text-sm text-red-600">{catalogError}</p> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="movie-genre" className="mb-1 block text-sm font-semibold text-slate-700">
                    Genero
                  </label>
                  <select
                    id="movie-genre"
                    value={genreId}
                    onChange={(event) => setGenreId(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                    disabled={loadingCatalogs || genres.length === 0}
                  >
                    <option value="">Selecciona un genero</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="movie-director" className="mb-1 block text-sm font-semibold text-slate-700">
                    Director
                  </label>
                  <select
                    id="movie-director"
                    value={directorId}
                    onChange={(event) => setDirectorId(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                    disabled={loadingCatalogs || directors.length === 0}
                  >
                    <option value="">Selecciona un director</option>
                    {directors.map((director) => (
                      <option key={director.id} value={director.id}>
                        {director.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">YouTube trailer</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="trailer-name" className="mb-1 block text-sm font-semibold text-slate-700">
                    Nombre
                  </label>
                  <input
                    id="trailer-name"
                    type="text"
                    value={youtubeTrailerName}
                    onChange={(event) => setYoutubeTrailerName(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="Official Trailer (HD)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trailer-channel" className="mb-1 block text-sm font-semibold text-slate-700">
                    Canal
                  </label>
                  <input
                    id="trailer-channel"
                    type="text"
                    value={youtubeTrailerChannel}
                    onChange={(event) => setYoutubeTrailerChannel(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="Sony Pictures Entertainment"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="trailer-url" className="mb-1 block text-sm font-semibold text-slate-700">
                    URL
                  </label>
                  <input
                    id="trailer-url"
                    type="url"
                    value={youtubeTrailerUrl}
                    onChange={(event) => setYoutubeTrailerUrl(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trailer-duration" className="mb-1 block text-sm font-semibold text-slate-700">
                    Duracion
                  </label>
                  <input
                    id="trailer-duration"
                    type="number"
                    min="1"
                    value={youtubeTrailerDuration}
                    onChange={(event) => setYoutubeTrailerDuration(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="3"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Actor principal</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="actor-name" className="mb-1 block text-sm font-semibold text-slate-700">
                    Nombre
                  </label>
                  <input
                    id="actor-name"
                    type="text"
                    value={actorName}
                    onChange={(event) => setActorName(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="e.g. Leonardo DiCaprio"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="actor-photo" className="mb-1 block text-sm font-semibold text-slate-700">
                    Foto
                  </label>
                  <input
                    id="actor-photo"
                    type="url"
                    value={actorPhoto}
                    onChange={(event) => setActorPhoto(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="actor-nationality" className="mb-1 block text-sm font-semibold text-slate-700">
                    Nacionalidad
                  </label>
                  <select
                    id="actor-nationality"
                    value={actorNationality}
                    onChange={(event) => setActorNationality(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                  >
                    <option value="">Selecciona una nacionalidad</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="actor-birth-date" className="mb-1 block text-sm font-semibold text-slate-700">
                    Fecha de nacimiento
                  </label>
                  <input
                    id="actor-birth-date"
                    type="date"
                    value={actorBirthDate}
                    onChange={(event) => setActorBirthDate(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="actor-biography" className="mb-1 block text-sm font-semibold text-slate-700">
                    Biografia
                  </label>
                  <textarea
                    id="actor-biography"
                    value={actorBiography}
                    onChange={(event) => setActorBiography(event.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-slate-200 px-3 py-3 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="Describe el recorrido profesional del actor..."
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Premio asociado</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="prize-name" className="mb-1 block text-sm font-semibold text-slate-700">
                    Nombre del premio
                  </label>
                  <input
                    id="prize-name"
                    type="text"
                    value={prizeName}
                    onChange={(event) => setPrizeName(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="Academy Awards"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prize-category" className="mb-1 block text-sm font-semibold text-slate-700">
                    Categoria
                  </label>
                  <input
                    id="prize-category"
                    type="text"
                    value={prizeCategory}
                    onChange={(event) => setPrizeCategory(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="Best Picture"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prize-year" className="mb-1 block text-sm font-semibold text-slate-700">
                    Ano
                  </label>
                  <input
                    id="prize-year"
                    type="number"
                    min="1900"
                    value={prizeYear}
                    onChange={(event) => setPrizeYear(event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    placeholder="2026"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prize-status" className="mb-1 block text-sm font-semibold text-slate-700">
                    Estado
                  </label>
                  <select
                    id="prize-status"
                    value={prizeStatus}
                    onChange={(event) => setPrizeStatus(event.target.value as "won" | "nominated")}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                    required
                  >
                    <option value="won">won</option>
                    <option value="nominated">nominated</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={submitting || loadingCatalogs || !catalogsReady}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando..." : "Crear pelicula"}
              </button>
            </div>

            {submissionStep ? <p className="mt-3 text-sm text-slate-500">{submissionStep}</p> : null}
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            {!loadingCatalogs && !catalogError && !catalogsReady ? (
              <p className="mt-2 text-sm text-amber-700">
                Debe existir al menos un genero y un director para completar la creacion.
              </p>
            ) : null}
          </div>
        </form>
    </section>
  );
}
