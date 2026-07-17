"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaBolt } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import BrowseSearch from "@/components/BrowseSearch";
import { Category, CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";
import { getBulkRatingsSummaries } from "@/app/actions/ratings";

// --- TMDB Genre Map ---
const TMDB_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path: string | null;
  poster_path?: string | null;
  overview: string;
  genre_ids?: number[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") || "All Genres";
  const initialCategory = (searchParams.get("category") as Category) || "All";

  const categories: Category[] = ["All", "Movies", "Shows"];

  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const [activeGenre, setActiveGenre] = useState<string>(initialGenre);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [browsePage, setBrowsePage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [blitzScores, setBlitzScores] = useState<Record<string, { criticAverage: string, audienceAverage: string }>>({});

  const fetchBlitzScores = useCallback(async (items: Review[]) => {
    const ids = items.map(r => r.id.toString());
    if (ids.length === 0) return;
    const scores = await getBulkRatingsSummaries(ids);
    setBlitzScores(prev => ({ ...prev, ...scores }));
  }, []);



  const fetchTrending = async (page: number): Promise<Review[]> => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const currentYear = new Date().getFullYear();

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&primary_release_year=${currentYear}&sort_by=popularity.desc&page=${page}`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `movie-${m.id}`,
          title: m.title || "Untitled",
          category: "Movies" as Category,
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: m.genre_ids && m.genre_ids.length > 0 ? TMDB_GENRES[m.genre_ids[0]] : 'Movie',
          reviewer: 'TMDB',
          avatar: 'TM',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&first_air_date_year=${currentYear}&sort_by=popularity.desc&page=${page}`).then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows" as Category,
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: m.genre_ids && m.genre_ids.length > 0 ? TMDB_GENRES[m.genre_ids[0]] : 'TV Show',
          reviewer: 'TMDB',
          avatar: 'TM',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const [movies, shows] = await Promise.all([tmdbMoviesReq, tmdbShowsReq]);
      return [...movies, ...shows];
    } catch {
      return [];
    }
  };

  const performGlobalSearch = useCallback(async (query: string) => {
    setLoading(true);
    if (!query) {
      setIsSearching(false);
      setTrendingPage(1);
      const initial = await fetchTrending(1);
      // Deduplicate in case of duplicate results
      const uniqueMap = new Map();
      initial.forEach(item => uniqueMap.set(item.id, item));
      setReviews(Array.from(uniqueMap.values()));
      setLoading(false);
      fetchBlitzScores(Array.from(uniqueMap.values()));
      return;
    }

    setIsSearching(true);
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;


      const movieSearch = fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
            id: `movie-${m.id}`,
            title: m.title || "Untitled", category: "Movies" as Category, rating: m.vote_average,
            year: m.release_date?.split('-')[0] || 'N/A', 
            genre: m.genre_ids && m.genre_ids.length > 0 ? TMDB_GENRES[m.genre_ids[0]] : 'Movie',
            reviewer: 'TMDB', avatar: 'TM',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            summary: m.overview
        })));

      const showSearch = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
        .then(res => res.json()).then(data => (data.results || []).map((m: TMDBItem) => ({
            id: `show-${m.id}`,
            title: m.name || "Untitled", category: "Shows" as Category, rating: m.vote_average,
            year: m.first_air_date?.split('-')[0] || 'N/A', 
            genre: m.genre_ids && m.genre_ids.length > 0 ? TMDB_GENRES[m.genre_ids[0]] : 'TV Show',
            reviewer: 'TMDB', avatar: 'TM',
            imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            summary: m.overview
        })));

      const [movies, shows] = await Promise.all([movieSearch, showSearch]);
      let combined = [...movies, ...shows];
      // Deduplicate by ID
      const uniqueMap = new Map();
      combined.forEach(item => uniqueMap.set(item.id, item));
      const finalItems = Array.from(uniqueMap.values());
      setReviews(finalItems);
      fetchBlitzScores(finalItems);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = trendingPage + 1;
    const moreData = await fetchTrending(nextPage);

    setReviews(prev => {
      const combined = [...prev, ...moreData];
      // FIX: Use a Map to ensure unique IDs
      const uniqueMap = new Map();
      combined.forEach(item => uniqueMap.set(item.id, item));
      return Array.from(uniqueMap.values());
    });

    setTrendingPage(nextPage);
    setLoadingMore(false);
  };

  useEffect(() => {
    performGlobalSearch(initialQuery);
  }, [initialQuery, performGlobalSearch]);

  const availableGenres = [
    "All Genres", 
    ...Array.from(new Set([
        ...Object.values(TMDB_GENRES),
        ...reviews.map(r => r.genre)
    ])).filter(Boolean).sort()
  ];

  const filtered = reviews.filter((r) => {
    const catMatch = activeCategory === "All" || r.category === activeCategory;
    const genreMatch = activeGenre === "All Genres" || r.genre === activeGenre;
    return catMatch && genreMatch;
  });

  const ITEMS_PER_PAGE = 20;
  const totalBrowsePages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayItems = isSearching 
    ? filtered.slice((browsePage - 1) * ITEMS_PER_PAGE, browsePage * ITEMS_PER_PAGE)
    : filtered;

  return (
    <div className="flex flex-col gap-y-24 w-full">
      <div className="space-y-16">
        <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-0.5 w-16 bg-blue-400" />
            <span className="text-[12px] font-black uppercase tracking-[0.8em] text-[var(--muted-foreground)]">Database Search</span>
            <div className="h-0.5 w-16 bg-yellow-400" />
          </div>
          <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter text-[var(--foreground)] uppercase leading-[0.8]">
            {activeCategory === "All" ? "GLOBAL" : activeCategory.toUpperCase()} <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #facc15' }}>INDEX</span>
          </h1>
        </div>

        <section className="max-w-7xl mx-auto w-full space-y-8 px-4">
          <div className="relative border-2 border-[var(--border-subtle)] bg-[var(--background)] p-1 focus-within:border-blue-400 transition-colors shadow-2xl">
            <BrowseSearch initialQuery={initialQuery} data={reviews} onSearch={(query) => {
              performGlobalSearch(query);
              setBrowsePage(1);
            }} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-subtle)] bg-[var(--background)]/40 backdrop-blur-md overflow-hidden">
            <div className="lg:col-span-8 flex flex-wrap">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICON_COMPONENTS[cat];
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setBrowsePage(1); }}
                    className={`flex-1 min-w-[120px] flex flex-col items-center justify-center gap-4 py-8 transition-all border-r border-[var(--border-subtle)] relative group ${
                      isActive ? "text-[var(--foreground)] bg-[var(--foreground)]/5" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400" />}
                    <Icon size={isActive ? 24 : 20} className={isActive ? "text-blue-400" : ""} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-4 bg-[var(--background)]/60 p-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)]">
              <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Filter by Genre</label>
              <div className="relative">
                <select value={activeGenre} onChange={(e) => { setActiveGenre(e.target.value); setBrowsePage(1); }}
                  className="w-full bg-transparent text-[var(--foreground)] text-sm font-black uppercase tracking-widest py-2 focus:outline-none appearance-none cursor-pointer"
                >
                  {availableGenres.map(g => <option key={g} value={g} className="bg-[var(--background)]">{g}</option>)}
                </select>
                <FaChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 rotate-90" size={12} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-60">
          <div className="w-16 h-16 border-2 border-[var(--border-subtle)] border-t-yellow-400 border-l-blue-400 animate-spin" />
          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.6em] text-[var(--muted-foreground)]">Querying Archive Data...</p>
        </div>
      ) : (
        <section className="animate-in fade-in duration-700 pb-32 w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
            {displayItems.length > 0 ? (
              displayItems.map((r) => (
                <ReviewCard 
                  key={r.id} 
                  review={r} 
                  criticScore={blitzScores[r.id.toString()]?.criticAverage}
                  audienceScore={blitzScores[r.id.toString()]?.audienceAverage}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-40 border-2 border-dashed border-[var(--border-subtle)] bg-[var(--foreground)]/[0.01]">
                 <p className="text-[var(--muted-foreground)] font-black uppercase tracking-[0.5em] text-sm">Zero results found in database</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center mt-32">
            {!isSearching ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group relative flex items-center gap-8 bg-transparent border-2 border-white text-[var(--foreground)] font-black uppercase tracking-widest text-xs px-12 py-6 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 disabled:opacity-50"
              >
                <span className="relative z-10">{loadingMore ? "RETRIEVING DATA..." : "LOAD MORE RECORDS"}</span>
                <FaBolt className={loadingMore ? "animate-spin text-yellow-400" : "group-hover:text-yellow-400 relative z-10"} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400" />
              </button>
            ) : (
              displayItems.length > 0 && (
                <div className="flex items-center gap-6">
                  <button onClick={() => { setBrowsePage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={browsePage === 1} 
                    className="p-6 border border-[var(--border-subtle)] hover:border-blue-400 hover:text-blue-400 disabled:opacity-10 transition-all bg-[var(--background)] group relative">
                    <FaChevronLeft size={16} />
                  </button>

                  <div className="bg-[var(--foreground)]/5 px-12 py-5 border border-[var(--border-subtle)] backdrop-blur-sm">
                    <span className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.5em]">
                      PAGE {browsePage} <span className="text-[var(--muted-foreground)] mx-4 opacity-30">|</span> {totalBrowsePages || 1}
                    </span>
                  </div>

                  <button onClick={() => { setBrowsePage(p => Math.min(totalBrowsePages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }} disabled={browsePage >= totalBrowsePages}
                    className="p-6 border border-[var(--border-subtle)] hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-10 transition-all bg-[var(--background)] group relative">
                    <FaChevronRight size={16} />
                  </button>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function Search() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-yellow-400 selection:text-[var(--background)] font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_rgba(30,58,138,0.05)_0%,_transparent_50%)]" />

      <Header />
      <main className="relative z-10 isolate w-full px-6 pt-28 pb-12 lg:px-20">
        <Suspense fallback={<div className="py-60 text-center uppercase tracking-widest font-black text-[var(--muted-foreground)]">Loading Index...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}