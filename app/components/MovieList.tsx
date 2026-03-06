"use client";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/apiError";

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

function getPrizeLabel(prizes: Movie["prizes"]) {
  if (!prizes || prizes.length === 0) {
    return "Sin premio";
  }

  if (prizes.length === 1) {
    return prizes[0]?.name ?? "Sin premio";
  }

  return `${prizes[0]?.name ?? "Sin premio"} +${prizes.length - 1}`;
}

function getAuthorLabel(movie: Movie) {
  if (movie.actors && movie.actors.length > 0) {
    return movie.actors[0]?.name ?? "Sin autor";
  }

  return movie.director?.name ?? "Sin autor";
}

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "no se pudieron cargar las peliculas"));
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
      setError(err instanceof Error ? err.message : "Ocurrio un error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

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
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">Cargando peliculas...</p>
        <p className="mt-1 text-xs text-slate-500">Estamos consultando el catalogo actual.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">No se pudo cargar la lista de peliculas</h2>
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => void loadMovies()}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      </section>
    );
  }

  if (movies.length === 0) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">No hay peliculas aun</h2>
        <p className="text-sm text-slate-600">Crea la primera pelicula para comenzar a poblar el catalogo.</p>
        <div className="pt-2">
          <Link
            to="/crear-pelicula"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Crear pelicula
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Peliculas</h1>
          <p className="mt-2 text-lg text-slate-600">Consulta todas las peliculas registradas en el sistema.</p>
        </div>
        <Link
          to="/crear-pelicula"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Crear pelicula
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <input
          aria-label="Buscar peliculas"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pelicula por nombre..."
          className="w-full border-none bg-transparent text-sm text-slate-600 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-[34%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Titulo</th>
              <th className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                Lanzamiento
              </th>
              <th className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Autor</th>
              <th className="w-[22%] px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Premio</th>
            </tr>
          </thead>
          <tbody>
            {visibleMovies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No hay peliculas que coincidan con la busqueda.
                </td>
              </tr>
            ) : (
              visibleMovies.map((movie) => (
                <tr key={movie.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-4">
                    <Link to={`/movies/${movie.id}`} className="font-semibold text-slate-800 hover:text-blue-600">
                      {movie.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{formatReleaseDate(movie.releaseDate)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{getAuthorLabel(movie)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {getPrizeLabel(movie.prizes)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
          <span>
            Mostrando {firstResult} a {lastResult} de {filteredMovies.length} resultados
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {"<"}
            </button>
            <span className="rounded-md bg-blue-600 px-3 py-1 font-semibold text-white">{currentPage}</span>
            <span className="text-xs text-slate-400">de {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
