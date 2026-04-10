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

interface RAWGResult {
  id: number;
  name: string;
  rating: number;
  released: string;
  genres: { name: string }[];
  background_image: string | null;
}

export async function fetchAllMedia(): Promise<Review[]> {
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

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

  const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-metacritic&page_size=30`).then(res => res.json()).then(data => (data.results || []).map((g: RAWGResult): Review => ({
    id: `game-${g.id}`,
    title: g.name,
    category: "Games",
    rating: g.rating ? g.rating * 2 : 0,
    year: g.released ? g.released.split('-')[0] : 'N/A',
    genre: g.genres && g.genres.length > 0 ? g.genres[0].name : 'Game',
    reviewer: 'RAWG',
    avatar: 'RG',
    summary: 'Highly rated gaming experience.',
    image: 'game1',
    imageUrl: g.background_image || null,
  }))).catch(() => []) : Promise.resolve([]);

  const [movies, shows, games] = await Promise.all([tmdbMoviesReq, tmdbShowsReq, rawgReq]);
  const all: Review[] = [...movies, ...shows, ...games];
  
  all.sort(() => 0.5 - Math.random());
  return all;
}
