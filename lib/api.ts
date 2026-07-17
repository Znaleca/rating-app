import { Review } from "@/lib/types";

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  backdrop_path: string | null;
}

export async function fetchAllMedia(): Promise<Review[]> {
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbKey}`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBResult): Review => ({
    id: `movie-${m.id}`,
    title: m.title || "Untitled",
    category: "Movies",
    rating: m.vote_average || 0,
    year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
    genre: 'Movie',
    reviewer: 'TMDB',
    avatar: 'TM',
    summary: m.overview || 'Trending movie.',
    image: 'movie2',
    imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
  }))).catch(() => []) : Promise.resolve([]);

  const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbKey}`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBResult): Review => ({
    id: `show-${m.id}`,
    title: m.name || "Untitled",
    category: "Shows",
    rating: m.vote_average || 0,
    year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
    genre: 'TV Show',
    reviewer: 'TMDB',
    avatar: 'TM',
    summary: m.overview || 'Popular TV show.',
    image: 'show1',
    imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
  }))).catch(() => []) : Promise.resolve([]);

  const [movies, shows] = await Promise.all([tmdbMoviesReq, tmdbShowsReq]);
  const all: Review[] = [...movies, ...shows];
  
  all.sort(() => 0.5 - Math.random());
  return all;
}
