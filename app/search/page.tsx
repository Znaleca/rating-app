"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaFilm, FaTv, FaGamepad } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import BrowseSearch from "@/components/BrowseSearch";
import { Category, CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeGenre, setActiveGenre] = useState<string>("All Genres");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [browsePage, setBrowsePage] = useState(1);

  const categories: Category[] = ["All", "Movies", "Shows", "Games"];

  const fetchTrending = async () => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
      const currentYear = new Date().getFullYear();

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&primary_release_year=${currentYear}&sort_by=popularity.desc&page=1`).then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
          id: `movie-${m.id}`,
          title: m.title || "Untitled",
          category: "Movies",
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: 'Movie',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&first_air_date_year=${currentYear}&sort_by=popularity.desc&page=1`).then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
          id: `show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows",
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: 'TV Show',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=10&page=1`).then(res => res.json()).then(data => (data.results || []).map((g: any) => ({
          id: `game-${g.id}`,
          title: g.name,
          category: "Games",
          rating: g.rating ? g.rating * 2 : 0,
          year: g.released ? g.released.split('-')[0] : 'N/A',
          genre: g.genres?.[0]?.name || 'Game',
          imageUrl: g.background_image || null,
          summary: 'Trending game.',
        }))) : Promise.resolve([]);

      const [movies, shows, games] = await Promise.all([tmdbMoviesReq, tmdbShowsReq, rawgReq]);
      return [...movies, ...shows, ...games];
    } catch (err) {
      return [];
    }
  };

  const performGlobalSearch = useCallback(async (query: string) => {
    if (!query) {
      setLoading(true);
      const initial = await fetchTrending();
      setReviews(initial);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

      const movieSearch = fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
            id: `movie-${m.id}`,
            title: m.title, category: "Movies", rating: m.vote_average,
            year: m.release_date?.split('-')[0] || 'N/A', genre: 'Movie',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            summary: m.overview
        })));

      const showSearch = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
            id: `show-${m.id}`,
            title: m.name, category: "Shows", rating: m.vote_average,
            year: m.first_air_date?.split('-')[0] || 'N/A', genre: 'TV Show',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            summary: m.overview
        })));

      const gameSearch = fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((g: any) => ({
            id: `game-${g.id}`,
            title: g.name, category: "Games", rating: g.rating * 2,
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
    <div className="flex flex-col gap-y-32">
      <div className="space-y-12">
        <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Database</span>
            <div className="h-[1px] w-8 bg-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] text-white uppercase leading-[0.9]">
            SEARCH <br className="md:hidden" />
            <span className="text-transparent relative inline-block" style={{ WebkitTextStroke: '1.5px rgba(250, 204, 21, 0.9)' }}> RESULTS </span>
          </h1>
        </div>

        <section className="max-w-4xl mx-auto w-full space-y-6">
          <div className="relative border border-white/5 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl">
            <BrowseSearch initialQuery={initialQuery} data={reviews} onSearch={(query) => {
              setSearchQuery(query);
              performGlobalSearch(query);
              setBrowsePage(1);
            }} />
          </div>
          
          <div className="relative border border-white/5 bg-black/60 backdrop-blur-xl p-2 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1 w-full md:w-auto">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICON_COMPONENTS[cat];
                return (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setBrowsePage(1); }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      activeCategory === cat ? "bg-white text-black border-white" : "bg-transparent text-slate-500 border-transparent hover:text-white"
                    }`}
                  >
                    <Icon size={12} /> {cat}
                  </button>
                );
              })}
            </div>
            <select value={activeGenre} onChange={(e) => { setActiveGenre(e.target.value); setBrowsePage(1); }}
              className="w-full md:w-auto bg-[#0a0a0a] border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest px-4 py-3 focus:border-yellow-400 appearance-none"
            >
              {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </section>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-16 h-16 border border-white/10 border-t-yellow-400 border-l-blue-400 rounded-full animate-spin" />
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Scanning Global Archives...</p>
        </div>
      ) : (
        <section className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {displayItems.length > 0 ? (
              displayItems.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <p className="col-span-full text-center text-slate-500 py-20 font-black uppercase tracking-widest">No matching records found.</p>
            )}
          </div>
          {displayItems.length > 0 && (
             <div className="flex items-center justify-center gap-6 mt-20">
              <button onClick={() => setBrowsePage(p => Math.max(1, p - 1))} disabled={browsePage === 1} className="p-4 bg-black/50 border border-white/5 hover:border-blue-400 transition-all">
                <FaChevronLeft size={12} />
              </button>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Page <span className="text-white">{browsePage}</span> / {totalBrowsePages || 1}
              </span>
              <button onClick={() => setBrowsePage(p => Math.min(totalBrowsePages, p + 1))} disabled={browsePage >= totalBrowsePages} className="p-4 bg-black/50 border border-white/5 hover:border-yellow-400 transition-all">
                <FaChevronRight size={12} />
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
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-yellow-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>

      <Header />

      <main className="relative z-10 isolate w-full px-6 py-12">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border border-white/10 border-t-yellow-400 border-l-blue-400 rounded-full animate-spin" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Loading Search...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}