"use client";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { useLocale } from "@/app/lib/locale";

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

export default function MovieDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isSpanish, formatDate, translatePrizeStatus } = useLocale();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text = isSpanish
    ? {
        loadFallback: "no se pudo cargar la pelicula",
        notFound: "Pelicula no encontrada.",
        loading: "Cargando detalle de la pelicula...",
        errorTitle: "No se pudo cargar la pelicula",
        backToList: "Volver a la lista",
        breadcrumb: "Peliculas",
        posterAlt: (title: string) => `Poster de ${title}`,
        country: "Pais",
        releaseDate: "Fecha de lanzamiento",
        duration: "Duracion",
        popularity: "Popularidad",
        director: "Director",
        noDirector: "Sin director",
        genre: "Genero",
        noGenre: "Sin genero",
        actors: "Autores",
        noActors: "No hay autores asociados.",
        prizes: "Premios",
        noPrizes: "No hay premios asociados.",
        trailer: "Trailer de YouTube",
        trailerName: "Nombre",
        trailerChannel: "Canal",
        trailerDuration: "Duracion",
        viewTrailer: "Ver trailer",
        viewTrailerAria: (title: string) => `Ver trailer de ${title} en una nueva pestana`,
        noTrailer: "No hay trailer asociado.",
        platforms: "Plataformas",
        openPlatformAria: (name: string) => `Abrir ${name} en una nueva pestana`,
        noPlatforms: "No hay plataformas asociadas.",
        reviews: "Resenas",
        reviewScore: (score: number) => `Puntaje ${score}`,
        noReviews: "No hay resenas registradas.",
      }
    : {
        loadFallback: "could not load the movie",
        notFound: "Movie not found.",
        loading: "Loading movie details...",
        errorTitle: "Could not load the movie",
        backToList: "Back to list",
        breadcrumb: "Movies",
        posterAlt: (title: string) => `Poster for ${title}`,
        country: "Country",
        releaseDate: "Release date",
        duration: "Duration",
        popularity: "Popularity",
        director: "Director",
        noDirector: "No director",
        genre: "Genre",
        noGenre: "No genre",
        actors: "Authors",
        noActors: "There are no associated authors.",
        prizes: "Prizes",
        noPrizes: "There are no associated prizes.",
        trailer: "YouTube trailer",
        trailerName: "Name",
        trailerChannel: "Channel",
        trailerDuration: "Duration",
        viewTrailer: "View trailer",
        viewTrailerAria: (title: string) => `Open trailer for ${title} in a new tab`,
        noTrailer: "There is no associated trailer.",
        platforms: "Platforms",
        openPlatformAria: (name: string) => `Open ${name} in a new tab`,
        noPlatforms: "There are no associated platforms.",
        reviews: "Reviews",
        reviewScore: (score: number) => `Score ${score}`,
        noReviews: "There are no reviews registered.",
      };

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError(text.notFound);
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
            throw new Error(text.notFound);
          }

          throw new Error(await getApiErrorMessage(movieResponse, text.loadFallback));
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
        setError(err instanceof Error ? err.message : text.loadFallback);
      } finally {
        setLoading(false);
      }
    };

    void fetchMovie();
  }, [id, text.loadFallback, text.notFound]);

  if (loading) {
    return (
      <p className="text-slate-600" role="status" aria-live="polite">
        {text.loading}
      </p>
    );
  }

  if (error || !movie) {
    return (
      <section className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
        <h1 className="text-xl font-semibold text-red-700">{text.errorTitle}</h1>
        <p className="text-sm text-red-600">{error || text.notFound}</p>
        <button
          type="button"
          onClick={() => navigate("/movies")}
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {text.backToList}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="movie-detail-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
            <span>{text.breadcrumb}</span>
            <span aria-hidden="true"> / </span>
            <span>{movie.title}</span>
          </nav>
          <h1 id="movie-detail-title" className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
            {movie.title}
          </h1>
        </div>
        <Link
          to="/movies"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {text.backToList}
        </Link>
      </div>

      <article className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[280px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.poster}
            alt={text.posterAlt(movie.title)}
            className="h-80 w-full rounded-xl border border-slate-200 object-cover"
          />
          <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              <dt className="font-semibold text-slate-800">{text.country}</dt>
              <dd>{movie.country}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{text.releaseDate}</dt>
              <dd>{formatDate(movie.releaseDate)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{text.duration}</dt>
              <dd>{movie.duration}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">{text.popularity}</dt>
              <dd>{movie.popularity}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{text.director}</h2>
              <p className="mt-2 text-base text-slate-800">{movie.director?.name ?? text.noDirector}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{text.genre}</h2>
              <p className="mt-2 text-base text-slate-800">{movie.genre?.type ?? text.noGenre}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.actors}</h2>
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
              <p className="mt-2 text-sm text-slate-500">{text.noActors}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.prizes}</h2>
            {prizes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {prizes.map((prize) => (
                  <li
                    key={prize.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {`${prize.name} | ${prize.category} | ${prize.year} | ${translatePrizeStatus(prize.status)}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{text.noPrizes}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.trailer}</h2>
            {movie.youtubeTrailer ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-800">{text.trailerName}:</span> {movie.youtubeTrailer.name}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-800">{text.trailerChannel}:</span> {movie.youtubeTrailer.channel}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-800">{text.trailerDuration}:</span> {movie.youtubeTrailer.duration}
                </p>
                <a
                  href={movie.youtubeTrailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-blue-600 hover:text-blue-700"
                  aria-label={text.viewTrailerAria(movie.title)}
                >
                  {text.viewTrailer}
                </a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{text.noTrailer}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.platforms}</h2>
            {movie.platforms && movie.platforms.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {movie.platforms.map((platform) => (
                  <li
                    key={platform.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="font-semibold text-slate-800">{platform.name}</span>
                    <span aria-hidden="true"> | </span>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      aria-label={text.openPlatformAria(platform.name)}
                    >
                      {platform.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{text.noPlatforms}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{text.reviews}</h2>
            {movie.reviews && movie.reviews.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {movie.reviews.map((review) => (
                  <li key={review.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-800">{`${review.creator} | ${text.reviewScore(review.score)}`}</p>
                    <p className="mt-2 leading-relaxed">{review.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{text.noReviews}</p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
