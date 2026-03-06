"use client";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/apiError";

type Person = {
  id: string;
  name: string;
};

type Genre = {
  id: string;
  type: string;
};

type Platform = {
  id: string;
  name: string;
  url: string;
};

type Review = {
  id: string;
  text: string;
  score: number;
  creator: string;
};

type YoutubeTrailer = {
  id: string;
  name: string;
  url: string;
  duration: number;
  channel: string;
};

type Prize = {
  id: string;
  name: string;
  category: string;
  year: number;
  status: string;
};

type Movie = {
  id: string;
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string;
  popularity: number;
  director?: Person | null;
  actors?: Person[];
  genre?: Genre | null;
  platforms?: Platform[];
  reviews?: Review[];
  youtubeTrailer?: YoutubeTrailer | null;
};

const API_URL = "http://localhost:3000/api/v1/movies";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(parsed);
}

export default function MovieDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError("No se encontro el identificador de la pelicula.");
        setLoading(false);
        return;
      }

      try {
        const [movieResponse, prizesResponse] = await Promise.all([
          fetch(`${API_URL}/${id}`),
          fetch(`${API_URL}/${id}/prizes`),
        ]);

        if (!movieResponse.ok) {
          if (movieResponse.status === 404) {
            throw new Error("Pelicula no encontrada.");
          }

          throw new Error(await getApiErrorMessage(movieResponse, "no se pudo cargar la pelicula"));
        }

        const movieData: Movie = await movieResponse.json();
        setMovie(movieData);

        if (prizesResponse.ok) {
          const prizesData: Prize[] = await prizesResponse.json();
          setPrizes(prizesData);
        } else {
          setPrizes([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrio un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    void fetchMovie();
  }, [id]);

  if (loading) {
    return <p className="text-slate-600">Cargando detalle de la pelicula...</p>;
  }

  if (error || !movie) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <h1 className="text-xl font-semibold text-red-700">No se pudo cargar la pelicula</h1>
        <p className="text-sm text-red-600">{error || "Pelicula no encontrada."}</p>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Volver a la lista
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Peliculas / {movie.title}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{movie.title}</h1>
        </div>
        <Link
          to="/movies"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Volver a la lista
        </Link>
      </div>

      <article className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[280px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-80 w-full rounded-xl border border-slate-200 object-cover"
          />
          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Pais:</span> {movie.country}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Fecha de lanzamiento:</span>{" "}
              {formatDate(movie.releaseDate)}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Duracion:</span> {movie.duration}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Popularidad:</span> {movie.popularity}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Director</h2>
              <p className="mt-2 text-base text-slate-800">{movie.director?.name ?? "Sin director"}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Genero</h2>
              <p className="mt-2 text-base text-slate-800">{movie.genre?.type ?? "Sin genero"}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Autores</h2>
            {movie.actors && movie.actors.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {movie.actors.map((actor) => (
                  <li
                    key={actor.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {actor.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hay autores asociados.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Premios</h2>
            {prizes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {prizes.map((prize) => (
                  <li
                    key={prize.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {prize.name} · {prize.category} · {prize.year} · {prize.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hay premios asociados.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">YouTube trailer</h2>
            {movie.youtubeTrailer ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-800">Nombre:</span> {movie.youtubeTrailer.name}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-800">Canal:</span> {movie.youtubeTrailer.channel}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-800">Duracion:</span> {movie.youtubeTrailer.duration}
                </p>
                <a
                  href={movie.youtubeTrailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-blue-600 hover:text-blue-700"
                >
                  Ver trailer
                </a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hay trailer asociado.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Plataformas</h2>
            {movie.platforms && movie.platforms.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {movie.platforms.map((platform) => (
                  <li
                    key={platform.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-semibold text-slate-800">{platform.name}</span>
                    {" · "}
                    <a href={platform.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                      {platform.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hay plataformas asociadas.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            {movie.reviews && movie.reviews.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {movie.reviews.map((review) => (
                  <li key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">
                      {review.creator} · Score {review.score}
                    </p>
                    <p className="mt-2 leading-relaxed">{review.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hay reviews registradas.</p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
