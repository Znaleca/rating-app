"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import BrowseSearch from "@/components/BrowseSearch";
import { Category, CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";

// --- API Interfaces to fix type errors ---
interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path: string | null;
  overview: string;
}

interface RAWGItem {
  id: number;
  name: string;
  rating: number;
  released: string;
  genres: { name: string }[];
  background_image: string | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeGenre, setActiveGenre] = useState<string>("All Genres");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [browsePage, setBrowsePage] = useState(1);

  const categories: Category[] = ["All", "Movies", "Shows", "Games"];

  const fetchTrending = async (): Promise<Review[]> => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
      const currentYear = new Date().getFullYear();

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&primary_release_year=${currentYear}&sort_by=popularity.desc&page=1`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `movie-${m.id}`,
          title: m.title || "Untitled",
          category: "Movies" as Category,
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: 'Movie',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&first_air_date_year=${currentYear}&sort_by=popularity.desc&page=1`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows" as Category,
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: 'TV Show',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=10&page=1`).then(res => res.json()).then(data => (data.results || []).map((g: RAWGItem) => ({
          id: `game-${g.id}`,
          title: g.name,
          category: "Games" as Category,
          rating: g.rating ? g.rating * 2 : 0,
          year: g.released ? g.released.split('-')[0] : 'N/A',
          genre: g.genres?.[0]?.name || 'Game',
          imageUrl: g.background_image || null,
          summary: 'Trending game.',
        }))) : Promise.resolve([]);

      const [movies, shows, games] = await Promise.all([tmdbMoviesReq, tmdbShowsReq, rawgReq]);
      return [...movies, ...shows, ...games];
    } catch {
      return [];
    }
  };

  const performGlobalSearch = useCallback(async (query: string) => {
    setLoading(true);
    if (!query) {
      const initial = await fetchTrending();
      setReviews(initial);
      setLoading(false);
      return;
    }

    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

      const movieSearch = fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
            id: `movie-${m.id}`,
            title: m.title || "Untitled", category: "Movies" as Category, rating: m.vote_average,
            year: m.release_date?.split('-')[0] || 'N/A', genre: 'Movie',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            summary: m.overview
        })));

      const showSearch = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
            id: `show-${m.id}`,
            title: m.name || "Untitled", category: "Shows" as Category, rating: m.vote_average,
            year: m.first_air_date?.split('-')[0] || 'N/A', genre: 'TV Show',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            summary: m.overview
        })));

      const gameSearch = fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((g: RAWGItem) => ({
            id: `game-${g.id}`,
            title: g.name, category: "Games" as Category, rating: g.rating * 2,
            year: g.released?.split('-')[0] || 'N/A', genre: g.genres?.[0]?.name || 'Game',
            imageUrl: g.background_image, summary: 'Search result.'
        })));

      const results = await Promise.all([movieSearch, showSearch, gameSearch]);
      setReviews(results.flat());
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performGlobalSearch(initialQuery);
  }, [initialQuery, performGlobalSearch]);

  const availableGenres = ["All Genres", ...Array.from(new Set(reviews.map((r) => r.genre).filter(Boolean)))];

  const filtered = reviews.filter((r) => {
    const catMatch = activeCategory === "All" || r.category === activeCategory;
    const genreMatch = activeGenre === "All Genres" || r.genre === activeGenre;
    return catMatch && genreMatch;
  });

  const ITEMS_PER_PAGE = 16;
  const totalBrowsePages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayItems = filtered.slice((browsePage - 1) * ITEMS_PER_PAGE, browsePage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-y-20">
      <div className="space-y-16">
        {/* Updated Title for Deep Dark Theme */}
        <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-0.5 w-12 bg-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Database Search</span>
            <div className="h-0.5 w-12 bg-yellow-400" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
            {activeCategory === "All" ? "GLOBAL" : activeCategory.toUpperCase()} <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #facc15' }}>INDEX</span>
          </h1>
        </div>

        <section className="max-w-6xl mx-auto w-full space-y-4">
          <div className="relative border-2 border-white/5 bg-black p-1 focus-within:border-blue-400 transition-colors">
            <BrowseSearch initialQuery={initialQuery} data={reviews} onSearch={(query) => {
              performGlobalSearch(query);
              setBrowsePage(1);
            }} />
          </div>
          
          {/* Filtering Dock - Updated to Deep Dark */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/10 bg-white/5 overflow-hidden">
            <div className="lg:col-span-8 flex flex-wrap bg-black/40">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICON_COMPONENTS[cat];
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setBrowsePage(1); }}
                    className={`flex-1 min-w-25 flex flex-col items-center justify-center gap-3 py-6 transition-all border-r border-white/5 relative group ${
                      isActive ? "text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400" />}
                    <Icon size={isActive ? 20 : 16} className={isActive ? "text-blue-400" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-4 bg-black/60 p-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10">
              <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Filter by Genre</label>
              <div className="relative">
                <select value={activeGenre} onChange={(e) => { setActiveGenre(e.target.value); setBrowsePage(1); }}
                  className="w-full bg-transparent text-white text-xs font-black uppercase tracking-widest py-2 focus:outline-none appearance-none cursor-pointer"
                >
                  {availableGenres.map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                </select>
                <FaChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 rotate-90" size={10} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-2">
            <div className="h-2 w-2 bg-yellow-400" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Found <span className="text-white">{filtered.length}</span> Records in {activeCategory}
            </p>
          </div>
        </section>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-12 h-12 border-2 border-white/10 border-t-yellow-400 border-l-blue-400 animate-spin" />
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Querying Archive...</p>
        </div>
      ) : (
        <section className="animate-in fade-in duration-500 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayItems.length > 0 ? (
              displayItems.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <p className="col-span-full text-center text-slate-500 py-20 font-black uppercase tracking-widest border-2 border-dashed border-white/5">No matching records found.</p>
            )}
          </div>
          
          {displayItems.length > 0 && (
             <div className="flex items-center justify-center gap-4 mt-20">
              <button onClick={() => setBrowsePage(p => Math.max(1, p - 1))} disabled={browsePage === 1} 
                className="p-4 border border-white/10 hover:border-blue-400 hover:text-blue-400 disabled:opacity-20 transition-all bg-black/20">
                <FaChevronLeft size={14} />
              </button>
              <div className="bg-white/5 px-8 py-4 border border-white/10">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  PAGE {browsePage} <span className="text-slate-500 mx-2">/</span> {totalBrowsePages || 1}
                </span>
              </div>
              <button onClick={() => setBrowsePage(p => Math.min(totalBrowsePages, p + 1))} disabled={browsePage >= totalBrowsePages}
                className="p-4 border border-white/10 hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-20 transition-all bg-black/20">
                <FaChevronRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function Search() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans">
      {/* Structural Grid - Deep Dark */}
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

      <Header />

      <main className="relative z-10 isolate max-w-7xl mx-auto px-6 py-12 pt-24">
        <Suspense fallback={<div className="py-60 text-center uppercase tracking-widest font-black text-slate-500">Initializing Archive...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}