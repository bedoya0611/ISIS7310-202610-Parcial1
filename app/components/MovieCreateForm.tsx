"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { useLocale } from "@/app/lib/locale";

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
  const { isSpanish, translateNationality } = useLocale();
  const formDescriptionId = useId();
  const catalogStatusId = useId();
  const errorId = useId();

  const text = useMemo(
    () =>
      isSpanish
        ? {
        loadGenresFallback: "no se pudieron cargar los generos",
        loadDirectorsFallback: "no se pudieron cargar los directores",
        loadCatalogsFallback: "No se pudieron cargar los catalogos",
        createTrailerFallback: "no se pudo crear el trailer de YouTube",
        createMovieFallback: "no se pudo crear la pelicula",
        createLeadActorFallback: "no se pudo crear el actor principal",
        createPrizeFallback: "no se pudo crear el premio",
        attachMovieToActorFallback: "no se pudo asociar la pelicula al actor",
        attachPrizeToMovieFallback: "no se pudo asociar el premio a la pelicula",
        unexpectedError: "Ocurrio un error inesperado",
        success: "Pelicula creada y asociada correctamente.",
        title: "Crear pelicula con actor y premio",
        description:
          "Completa todos los datos para registrar una pelicula, su actor principal, el trailer y un premio asociado.",
        baseInfo: "Informacion base de la pelicula",
        backToActors: "Volver a actores",
        movieTitle: "Titulo",
        posterUrl: "URL del poster",
        duration: "Duracion",
        popularity: "Popularidad",
        country: "Pais",
        releaseDate: "Fecha de estreno",
        genreDirector: "Genero y director",
        loadingOptions: "Cargando opciones...",
        genre: "Genero",
        selectGenre: "Selecciona un genero",
        director: "Director",
        selectDirector: "Selecciona un director",
        trailer: "Trailer de YouTube",
        trailerName: "Nombre",
        trailerChannel: "Canal",
        trailerUrl: "URL",
        leadActor: "Actor principal",
        actorName: "Nombre",
        actorPhoto: "Foto",
        actorNationality: "Nacionalidad",
        selectNationality: "Selecciona una nacionalidad",
        actorBirthDate: "Fecha de nacimiento",
        actorBiography: "Biografia",
        actorBiographyPlaceholder: "Describe el recorrido profesional del actor...",
        prize: "Premio asociado",
        prizeName: "Nombre del premio",
        prizeCategory: "Categoria",
        prizeYear: "Ano",
        prizeStatus: "Estado",
        prizeStatusWon: "ganado",
        prizeStatusNominated: "nominado",
        clear: "Limpiar",
        createMovie: "Crear pelicula",
        saving: "Guardando...",
        catalogsRequirement: "Debe existir al menos un genero y un director para completar la creacion.",
        stepCreatingTrailer: "Creando trailer...",
        stepCreatingMovie: "Creando pelicula...",
        stepCreatingLeadActor: "Creando actor principal...",
        stepCreatingPrize: "Creando premio...",
        stepAttachingLeadActor: "Asociando actor principal...",
        stepAttachingPrize: "Asociando premio a la pelicula...",
        }
        : {
        loadGenresFallback: "could not load the genres",
        loadDirectorsFallback: "could not load the directors",
        loadCatalogsFallback: "Could not load the catalogs",
        createTrailerFallback: "could not create the YouTube trailer",
        createMovieFallback: "could not create the movie",
        createLeadActorFallback: "could not create the lead actor",
        createPrizeFallback: "could not create the prize",
        attachMovieToActorFallback: "could not attach the movie to the actor",
        attachPrizeToMovieFallback: "could not attach the prize to the movie",
        unexpectedError: "An unexpected error occurred",
        success: "Movie created and linked successfully.",
        title: "Create movie with actor and prize",
        description:
          "Complete all the details to register a movie, its lead actor, trailer, and an associated prize.",
        baseInfo: "Movie base information",
        backToActors: "Back to actors",
        movieTitle: "Title",
        posterUrl: "Poster URL",
        duration: "Duration",
        popularity: "Popularity",
        country: "Country",
        releaseDate: "Release date",
        genreDirector: "Genre and director",
        loadingOptions: "Loading options...",
        genre: "Genre",
        selectGenre: "Select a genre",
        director: "Director",
        selectDirector: "Select a director",
        trailer: "YouTube trailer",
        trailerName: "Name",
        trailerChannel: "Channel",
        trailerUrl: "URL",
        leadActor: "Lead actor",
        actorName: "Name",
        actorPhoto: "Photo",
        actorNationality: "Nationality",
        selectNationality: "Select a nationality",
        actorBirthDate: "Birth date",
        actorBiography: "Biography",
        actorBiographyPlaceholder: "Describe the actor's professional background...",
        prize: "Associated prize",
        prizeName: "Prize name",
        prizeCategory: "Category",
        prizeYear: "Year",
        prizeStatus: "Status",
        prizeStatusWon: "won",
        prizeStatusNominated: "nominated",
        clear: "Clear",
        createMovie: "Create movie",
        saving: "Saving...",
        catalogsRequirement: "At least one genre and one director must exist to complete the creation.",
        stepCreatingTrailer: "Creating trailer...",
        stepCreatingMovie: "Creating movie...",
        stepCreatingLeadActor: "Creating lead actor...",
        stepCreatingPrize: "Creating prize...",
        stepAttachingLeadActor: "Attaching lead actor...",
        stepAttachingPrize: "Attaching prize to movie...",
        },
    [isSpanish],
  );

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
          fetchJson<Genre[]>(GENRES_URL, text.loadGenresFallback),
          fetchJson<Director[]>(DIRECTORS_URL, text.loadDirectorsFallback),
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

        const message = err instanceof Error ? err.message : text.loadCatalogsFallback;
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
  }, [text.loadCatalogsFallback, text.loadDirectorsFallback, text.loadGenresFallback]);

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
    setSubmissionStep(text.stepCreatingTrailer);
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
        text.createTrailerFallback,
      );

      setSubmissionStep(text.stepCreatingMovie);
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
        text.createMovieFallback,
      );

      setSubmissionStep(text.stepCreatingLeadActor);
      const actor = await postJson<CreatedResource>(
        ACTORS_URL,
        {
          name: actorName,
          photo: actorPhoto,
          nationality: actorNationality,
          birthDate: actorBirthDate,
          biography: actorBiography,
        },
        text.createLeadActorFallback,
      );

      setSubmissionStep(text.stepCreatingPrize);
      const prize = await postJson<CreatedResource>(
        PRIZES_URL,
        {
          name: prizeName,
          category: prizeCategory,
          year: Number(prizeYear),
          status: prizeStatus,
        },
        text.createPrizeFallback,
      );

      setSubmissionStep(text.stepAttachingLeadActor);
      await postJson(`${ACTORS_URL}/${actor.id}/movies/${movie.id}`, {}, text.attachMovieToActorFallback);

      setSubmissionStep(text.stepAttachingPrize);
      await postJson(`${MOVIES_URL}/${movie.id}/prizes/${prize.id}`, {}, text.attachPrizeToMovieFallback);
      setToast({ type: "success", message: text.success });
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : text.unexpectedError;
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSubmitting(false);
      setSubmissionStep("");
    }
  };

  const catalogsReady = genres.length > 0 && directors.length > 0;
  const describedByIds = [formDescriptionId];

  if (catalogError || (!loadingCatalogs && !catalogsReady)) {
    describedByIds.push(catalogStatusId);
  }

  if (error) {
    describedByIds.push(errorId);
  }

  return (
    <section className="mx-auto max-w-6xl" aria-labelledby="movie-create-title">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        aria-busy={submitting || loadingCatalogs}
        aria-describedby={describedByIds.join(" ")}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 id="movie-create-title" className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            {text.title}
          </h1>
          <p id={formDescriptionId} className="mt-2 text-base text-slate-500">
            {text.description}
          </p>
        </div>

        <div className="space-y-8 px-6 py-6">
          <section className="space-y-4" aria-labelledby="movie-base-data-title">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="movie-base-data-title" className="text-xl font-semibold text-slate-900">
                  {text.baseInfo}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/actors")}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {text.backToActors}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="movie-title" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.movieTitle}
                </label>
                <input
                  id="movie-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="e.g. Once Upon a Time in Hollywood"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="movie-poster" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.posterUrl}
                </label>
                <input
                  id="movie-poster"
                  type="url"
                  value={poster}
                  onChange={(event) => setPoster(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="https://..."
                  inputMode="url"
                  autoComplete="url"
                  required
                />
              </div>

              <div>
                <label htmlFor="movie-duration" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.duration}
                </label>
                <input
                  id="movie-duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="161"
                  inputMode="numeric"
                  required
                />
              </div>

              <div>
                <label htmlFor="movie-popularity" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.popularity}
                </label>
                <input
                  id="movie-popularity"
                  type="number"
                  min="0"
                  value={popularity}
                  onChange={(event) => setPopularity(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="85"
                  inputMode="numeric"
                  required
                />
              </div>

              <div>
                <label htmlFor="movie-country" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.country}
                </label>
                <input
                  id="movie-country"
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="United States"
                  autoComplete="country-name"
                  required
                />
              </div>

              <div>
                <label htmlFor="movie-release-date" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.releaseDate}
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

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-labelledby="movie-catalogs-title">
            <div>
              <h2 id="movie-catalogs-title" className="text-xl font-semibold text-slate-900">
                {text.genreDirector}
              </h2>
            </div>

            {loadingCatalogs ? (
              <p id={catalogStatusId} className="text-sm text-slate-500" role="status" aria-live="polite">
                {text.loadingOptions}
              </p>
            ) : null}
            {catalogError ? (
              <p id={catalogStatusId} className="text-sm text-red-600" role="alert">
                {catalogError}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="movie-genre" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.genre}
                </label>
                <select
                  id="movie-genre"
                  value={genreId}
                  onChange={(event) => setGenreId(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                  disabled={loadingCatalogs || genres.length === 0}
                >
                  <option value="">{text.selectGenre}</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="movie-director" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.director}
                </label>
                <select
                  id="movie-director"
                  value={directorId}
                  onChange={(event) => setDirectorId(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                  disabled={loadingCatalogs || directors.length === 0}
                >
                  <option value="">{text.selectDirector}</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="movie-trailer-title">
            <div>
              <h2 id="movie-trailer-title" className="text-xl font-semibold text-slate-900">
                {text.trailer}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="trailer-name" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.trailerName}
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
                  {text.trailerChannel}
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
                  {text.trailerUrl}
                </label>
                <input
                  id="trailer-url"
                  type="url"
                  value={youtubeTrailerUrl}
                  onChange={(event) => setYoutubeTrailerUrl(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="https://www.youtube.com/watch?v=..."
                  inputMode="url"
                  autoComplete="url"
                  required
                />
              </div>

              <div>
                <label htmlFor="trailer-duration" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.duration}
                </label>
                <input
                  id="trailer-duration"
                  type="number"
                  min="1"
                  value={youtubeTrailerDuration}
                  onChange={(event) => setYoutubeTrailerDuration(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="3"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="movie-actor-title">
            <div>
              <h2 id="movie-actor-title" className="text-xl font-semibold text-slate-900">
                {text.leadActor}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="actor-name" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.actorName}
                </label>
                <input
                  id="actor-name"
                  type="text"
                  value={actorName}
                  onChange={(event) => setActorName(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="e.g. Leonardo DiCaprio"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="actor-photo" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.actorPhoto}
                </label>
                <input
                  id="actor-photo"
                  type="url"
                  value={actorPhoto}
                  onChange={(event) => setActorPhoto(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="https://..."
                  inputMode="url"
                  autoComplete="url"
                  required
                />
              </div>

              <div>
                <label htmlFor="actor-nationality" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.actorNationality}
                </label>
                <select
                  id="actor-nationality"
                  value={actorNationality}
                  onChange={(event) => setActorNationality(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                >
                  <option value="">{text.selectNationality}</option>
                  {NATIONALITIES.map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {translateNationality(nationality)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="actor-birth-date" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.actorBirthDate}
                </label>
                <input
                  id="actor-birth-date"
                  type="date"
                  value={actorBirthDate}
                  onChange={(event) => setActorBirthDate(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  autoComplete="bday"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="actor-biography" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.actorBiography}
                </label>
                <textarea
                  id="actor-biography"
                  value={actorBiography}
                  onChange={(event) => setActorBiography(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-200 px-3 py-3 text-slate-700 outline-none focus:border-blue-300"
                  placeholder={text.actorBiographyPlaceholder}
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="movie-prize-title">
            <div>
              <h2 id="movie-prize-title" className="text-xl font-semibold text-slate-900">
                {text.prize}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="prize-name" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.prizeName}
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
                  {text.prizeCategory}
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
                  {text.prizeYear}
                </label>
                <input
                  id="prize-year"
                  type="number"
                  min="1900"
                  value={prizeYear}
                  onChange={(event) => setPrizeYear(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  placeholder="2026"
                  inputMode="numeric"
                  required
                />
              </div>

              <div>
                <label htmlFor="prize-status" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.prizeStatus}
                </label>
                <select
                  id="prize-status"
                  value={prizeStatus}
                  onChange={(event) => setPrizeStatus(event.target.value as "won" | "nominated")}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                >
                  <option value="won">{text.prizeStatusWon}</option>
                  <option value="nominated">{text.prizeStatusNominated}</option>
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
              {text.clear}
            </button>
            <button
              type="submit"
              disabled={submitting || loadingCatalogs || !catalogsReady}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? text.saving : text.createMovie}
            </button>
          </div>

          {submissionStep ? (
            <p className="mt-3 text-sm text-slate-500" role="status" aria-live="polite">
              {submissionStep}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {!loadingCatalogs && !catalogError && !catalogsReady ? (
            <p id={catalogStatusId} className="mt-2 text-sm text-amber-700" role="status" aria-live="polite">
              {text.catalogsRequirement}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
