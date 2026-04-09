"use client";

import { useState, useEffect } from "react";
import {
  FaBolt,
  FaFire,
  FaFilm,
  FaTv,
  FaGamepad,
  FaBook,
  FaCompass
} from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCard from "@/components/FeaturedCard";
import ReviewCard from "@/components/ReviewCard";

// ─── Types & Constants ────────────────────────────────────────────────────────

export type Category = "All" | "Movies" | "Shows" | "Games" | "Books";

export const CATEGORY_ICON_COMPONENTS: Record<Category, React.ElementType> = {
  All: FaBolt,
  Movies: FaFilm,
  Shows: FaTv,
  Games: FaGamepad,
  Books: FaBook,
};

export interface Review {
  id: string | number;
  title: string;
  category: Category;
  rating: number; 
  year: number | string;
  genre: string;
  reviewer: string;
  avatar: string;
  summary: string;
  image: string; 
  imageUrl?: string | null;
  featured?: boolean;
}

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

interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    averageRating?: number;
    publishedDate?: string;
    categories?: string[];
    description?: string;
    imageLinks?: { thumbnail: string };
  };
}

interface RAWGResult {
  id: number;
  name: string;
  rating: number;
  released: string;
  genres: { name: string }[];
  background_image: string | null;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const categories: Category[] = ["All", "Movies", "Shows", "Games", "Books"];

  useEffect(() => {
    async function fetchDiscover() {
      setLoading(true);
      try {
        const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

        const booksReq = fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=10`)
          .then(res => res.json())
          .then(data => (data.items || []).map((b: GoogleBookResult): Review => ({
            id: `book-${b.id}`,
            title: b.volumeInfo.title,
            category: "Books",
            rating: b.volumeInfo.averageRating ? b.volumeInfo.averageRating * 2 : (Math.random() * 2 + 7),
            year: b.volumeInfo.publishedDate ? b.volumeInfo.publishedDate.split('-')[0] : 'N/A',
            genre: b.volumeInfo.categories ? b.volumeInfo.categories[0] : 'Fiction',
            reviewer: 'Google Books',
            avatar: 'GB',
            summary: b.volumeInfo.description || 'A newly discovered featured book.',
            image: 'book1',
            imageUrl: b.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          }))).catch(() => []);

        const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`)
          .then(res => res.json())
          .then(data => (data.results || []).map((m: TMDBResult): Review => ({
            id: `movie-${m.id}`,
            title: m.title || "Untitled",
            category: "Movies",
            rating: m.vote_average || 0,
            year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
            genre: 'Movie',
            reviewer: 'TMDB',
            avatar: 'TM',
            summary: m.overview || 'Trending movie right now.',
            image: 'movie2',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
          }))) : Promise.resolve([]);

        const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${tmdbKey}`)
          .then(res => res.json())
          .then(data => (data.results || []).map((m: TMDBResult): Review => ({
            id: `show-${m.id}`,
            title: m.name || "Untitled",
            category: "Shows",
            rating: m.vote_average || 0,
            year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
            genre: 'TV Show',
            reviewer: 'TMDB',
            avatar: 'TM',
            summary: m.overview || 'Highly popular TV show recently discovered.',
            image: 'show1',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
          }))) : Promise.resolve([]);

        const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=10`)
          .then(res => res.json())
          .then(data => (data.results || []).map((g: RAWGResult): Review => ({
            id: `game-${g.id}`,
            title: g.name,
            category: "Games",
            rating: g.rating ? g.rating * 2 : 0,
            year: g.released ? g.released.split('-')[0] : 'N/A',
            genre: g.genres && g.genres.length > 0 ? g.genres[0].name : 'Game',
            reviewer: 'RAWG',
            avatar: 'RG',
            summary: 'A trending and highly anticipated gaming experience.',
            image: 'game1',
            imageUrl: g.background_image || null,
          }))) : Promise.resolve([]);

        const [books, movies, shows, games] = await Promise.all([booksReq, tmdbMoviesReq, tmdbShowsReq, rawgReq]);
        
        const all: Review[] = [...movies, ...shows, ...games, ...books];
        all.sort(() => 0.5 - Math.random());

        // Slice for the 5 featured cards
        const top5 = all.slice(0, 5).map(r => ({ ...r, featured: true }));
        const rest = all.slice(5, 29);

        setReviews([...top5, ...rest]);
      } catch (err) {
        console.error("Failed to load discover content", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDiscover();
  }, []);

  const featured = reviews.filter((r) => r.featured);
  const filtered =
    activeCategory === "All"
      ? reviews.filter((r) => !r.featured)
      : reviews.filter((r) => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* max-w-[1600px] handles the wider 5-column layout on large screens */}
      <main className="max-w-400 mx-auto px-8 py-16">        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
              <FaBolt className="absolute text-amber-500 animate-pulse text-2xl" />
            </div>
            <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">Initializing Blitz</p>
          </div>
        ) : (
          <div className="space-y-32">
            
            {/* FEATURED: THE ELITE FIVE */}
            {activeCategory === "All" && featured.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col items-center mb-16 text-center">
                  <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                    <FaFire className="text-amber-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">The Elite Five</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
                    Editor&apos;s <span className="text-zinc-500 italic">Picks</span>
                  </h1>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {featured.map((r) => (
                    <FeaturedCard key={r.id} review={r} />
                  ))}
                </div>
              </section>
            )}

            {/* STATS STRIP */}
            <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-4xl p-10 backdrop-blur-md">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {(["Movies", "Shows", "Games", "Books"] as const).map((cat) => {
                  const items = reviews.filter((r) => r.category === cat);
                  const Icon = CATEGORY_ICON_COMPONENTS[cat];
                  if (items.length === 0) return null;
                  const avg = items.reduce((s, r) => s + r.rating, 0) / items.length;
                  
                  return (
                    <div key={cat} className="flex flex-col items-center lg:items-start space-y-2">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Icon className="text-xs" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{cat}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{items.length}</span>
                        <span className="text-amber-500 text-[10px] font-black uppercase italic">avg {avg.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DISCOVERY GRID */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
                    <FaCompass className="text-zinc-700" />
                    {activeCategory === "All" ? "Latest Discovery" : activeCategory}
                  </h2>
                  <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">
                    Showing {filtered.length} curated entries
                  </p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-40 bg-zinc-900/20 rounded-4xl border border-dashed border-zinc-800">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No entries found in this sector</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                  {filtered.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}