"use client";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { useLocale } from "@/app/lib/locale";

type Movie = {
  id: string;
  title: string;
  poster?: string;
  releaseDate: string;
  director?: {
    id: string;
    name: string;
  } | null;
  actors?: Array<{
    id: string;
    name: string;
  }>;
  prizes?: Array<{
    id: string;
    name: string;
  }>;
};

const API_URL = "http://localhost:3000/api/v1/movies";
const getMoviePrizesUrl = (movieId: string) => `${API_URL}/${movieId}/prizes`;

function formatReleaseDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

function getMoviePrizesLabel(prizes: Movie["prizes"], noPrizeLabel: string) {
  if (!prizes || prizes.length === 0) {
    return noPrizeLabel;
  }

  if (prizes.length === 1) {
    return prizes[0]?.name ?? noPrizeLabel;
  }

  return `${prizes[0]?.name ?? noPrizeLabel} +${prizes.length - 1}`;
}

function getAuthorLabel(movie: Movie, noAuthorLabel: string) {
  if (movie.actors && movie.actors.length > 0) {
    return movie.actors[0]?.name ?? noAuthorLabel;
  }

  return movie.director?.name ?? noAuthorLabel;
}

export default function MovieList() {
  const { isSpanish } = useLocale();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text = useMemo(
    () =>
      isSpanish
        ? {
            loadFallback: "no se pudieron cargar las peliculas",
            loadingTitle: "Cargando peliculas...",
            loadingDescription: "Estamos consultando el catalogo actual.",
            errorTitle: "No se pudo cargar la lista de peliculas",
            retry: "Reintentar",
            emptyTitle: "No hay peliculas aun",
            emptyDescription: "Crea la primera pelicula para comenzar a poblar el catalogo.",
            createMovie: "Crear pelicula",
            title: "Peliculas",
            description: "Consulta todas las peliculas registradas en el sistema.",
            searchLabel: "Buscar peliculas",
            searchPlaceholder: "Buscar pelicula por nombre...",
            resultsSummary: (first: number, last: number, total: number) =>
              `Mostrando ${first} a ${last} de ${total} resultados`,
            tableCaption: "Lista de peliculas con fecha de lanzamiento, autor principal y premios.",
            releaseDate: "Lanzamiento",
            author: "Autor",
            prize: "Premio",
            noResults: "No hay peliculas que coincidan con la busqueda.",
            noPrize: "Sin premio",
            noAuthor: "Sin autor",
            pagination: "Paginacion de peliculas",
            pageOf: (current: number, total: number) => `Pagina ${current} de ${total}`,
            previousPage: "Ir a la pagina anterior",
            nextPage: "Ir a la pagina siguiente",
          }
        : {
            loadFallback: "could not load the movies",
            loadingTitle: "Loading movies...",
            loadingDescription: "We are checking the current catalog.",
            errorTitle: "Could not load the movies list",
            retry: "Retry",
            emptyTitle: "There are no movies yet",
            emptyDescription: "Create the first movie to start populating the catalog.",
            createMovie: "Create movie",
            title: "Movies",
            description: "Browse all the movies registered in the system.",
            searchLabel: "Search movies",
            searchPlaceholder: "Search movie by title...",
            resultsSummary: (first: number, last: number, total: number) =>
              `Showing ${first} to ${last} of ${total} results`,
            tableCaption: "List of movies with release date, main author, and prizes.",
            releaseDate: "Release date",
            author: "Author",
            prize: "Prize",
            noResults: "There are no movies matching the search.",
            noPrize: "No prize",
            noAuthor: "No author",
            pagination: "Movies pagination",
            pageOf: (current: number, total: number) => `Page ${current} of ${total}`,
            previousPage: "Go to previous page",
            nextPage: "Go to next page",
          },
    [isSpanish],
  );

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, text.loadFallback));
      }

      const data: Movie[] = await response.json();
      const moviesWithPrizes = await Promise.all(
        data.map(async (movie) => {
          try {
            const prizesResponse = await fetch(getMoviePrizesUrl(movie.id));

            if (!prizesResponse.ok) {
              return { ...movie, prizes: [] };
            }

            const prizes = (await prizesResponse.json()) as Movie["prizes"];
            return { ...movie, prizes: prizes ?? [] };
          } catch {
            return { ...movie, prizes: [] };
          }
        }),
      );

      setMovies(moviesWithPrizes);
    } catch (err) {
      setError(err instanceof Error ? err.message : text.loadFallback);
    } finally {
      setLoading(false);
    }
  }, [text.loadFallback]);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredMovies = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return movies;
    }

    return movies.filter((movie) => movie.title.toLowerCase().includes(query));
  }, [movies, search]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleMovies = filteredMovies.slice(startIndex, startIndex + pageSize);
  const firstResult = filteredMovies.length === 0 ? 0 : startIndex + 1;
  const lastResult = startIndex + visibleMovies.length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
          onClick={() => void loadMovies()}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {text.retry}
        </button>
      </section>
    );
  }

  if (movies.length === 0) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm" aria-live="polite">
        <h2 className="text-2xl font-semibold text-slate-900">{text.emptyTitle}</h2>
        <p className="text-sm text-slate-600">{text.emptyDescription}</p>
        <div className="pt-2">
          <Link
            to="/crear-pelicula"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {text.createMovie}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="movies-list-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="movies-list-title" className="text-5xl font-bold tracking-tight text-slate-900">
            {text.title}
          </h1>
          <p className="mt-2 text-lg text-slate-600">{text.description}</p>
        </div>
        <Link
          to="/crear-pelicula"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          {text.createMovie}
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label htmlFor="movies-search" className="sr-only">
          {text.searchLabel}
        </label>
        <input
          id="movies-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={text.searchPlaceholder}
          className="w-full border-none bg-transparent text-sm text-slate-600 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <p className="px-4 py-3 text-sm text-slate-500" role="status" aria-live="polite">
          {text.resultsSummary(firstResult, lastResult, filteredMovies.length)}
        </p>
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{text.tableCaption}</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="w-[34%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                Titulo
              </th>
              <th scope="col" className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.releaseDate}
              </th>
              <th scope="col" className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.author}
              </th>
              <th scope="col" className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {text.prize}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleMovies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {text.noResults}
                </td>
              </tr>
            ) : (
              visibleMovies.map((movie) => (
                <tr key={movie.id} className="border-b border-slate-100 last:border-b-0">
                  <th scope="row" className="px-4 py-4 text-left">
                    <Link to={`/movies/${movie.id}`} className="font-semibold text-slate-800 hover:text-blue-600">
                      {movie.title}
                    </Link>
                  </th>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatReleaseDate(movie.releaseDate)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{getAuthorLabel(movie, text.noAuthor)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {getMoviePrizesLabel(movie.prizes, text.noPrize)}
                    </span>
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
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
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
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={text.nextPage}
            >
              {">"}
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
}
