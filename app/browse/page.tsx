"use client";

import { useState, useEffect } from "react";
import { FaBolt, FaFilm, FaTv, FaGamepad, FaCompass } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import SearchBar from "@/components/SearchBar";

import { Category, CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";

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

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeGenre, setActiveGenre] = useState<string>("All Genres");
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [browsePage, setBrowsePage] = useState(1);

  const categories: Category[] = ["All", "Movies", "Shows", "Games"];

  const availableGenres = ["All Genres", ...Array.from(new Set(reviews.map((r) => r.genre).filter(Boolean)))];

  const fetchPage = async (pageNum: number) => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: TMDBResult): Review => ({
          id: `movie-${pageNum}-${m.id}`,
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
        })))
        .catch(err => { console.error("Movie fetch error:", err); return []; }) 
        : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${tmdbKey}&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: TMDBResult): Review => ({
          id: `show-${pageNum}-${m.id}`,
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
        })))
        .catch(err => { console.error("TV fetch error:", err); return []; })
        : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=10&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((g: RAWGResult): Review => ({
          id: `game-${pageNum}-${g.id}`,
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
        })))
        .catch(err => { console.error("Game fetch error:", err); return []; })
        : Promise.resolve([]);

      const [movies, shows, games] = await Promise.all([tmdbMoviesReq, tmdbShowsReq, rawgReq]);
      
      const all: Review[] = [...movies, ...shows, ...games];
      all.sort(() => 0.5 - Math.random());
      
      return all;
    } catch (err) {
      console.error("Failed to load discover content", err);
      return [];
    }
  };

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const initialItems = await fetchPage(1);
      setReviews(initialItems);
      setLoading(false);
    }
    loadInitial();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    const nextPage = page + 1;
    const nextItems = await fetchPage(nextPage);
    
    setReviews(prev => [...prev, ...nextItems]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // Reset browse page when filters change
  useEffect(() => {
    setBrowsePage(1);
  }, [activeCategory, activeGenre]);

  const filtered = reviews.filter((r) => {
    const catMatch = activeCategory === "All" || r.category === activeCategory;
    const genreMatch = activeGenre === "All Genres" || r.genre === activeGenre;
    return catMatch && genreMatch;
  });

  const ITEMS_PER_PAGE = 20;
  const totalBrowsePages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentBrowseStart = (browsePage - 1) * ITEMS_PER_PAGE;
  
  const displayItems = filtered.slice(currentBrowseStart, currentBrowseStart + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Header />

      <main className="max-w-400 mx-auto px-8 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
              <FaBolt className="absolute text-amber-500 animate-pulse text-2xl" />
            </div>
            <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">Initializing Blitz</p>
          </div>
        ) : (
          <div className="space-y-32">
            
            <section className="animate-in fade-in slide-in-from-top-10 duration-1000 mb-12">
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-4xl p-8 md:p-12 backdrop-blur-md flex flex-col gap-8 mx-auto max-w-5xl">
                <div className="relative w-full max-w-3xl mx-auto transform scale-110">
                  <SearchBar />
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col gap-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-2">Media Formats</span>
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICON_COMPONENTS[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                            activeCategory === cat 
                              ? "bg-amber-500 text-zinc-950 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                              : "bg-zinc-950 text-zinc-400 border border-white/5 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <Icon size={12} className={activeCategory === cat ? "text-zinc-950/80" : "text-zinc-600"} />
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-2">Genres Map</span>
                    <div className="flex flex-wrap gap-2">
                        {availableGenres.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => setActiveGenre(genre)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                              activeGenre === genre
                                ? "bg-white text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105" 
                                : "bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
                    <FaCompass className="text-zinc-700" />
                    Search Results
                  </h2>
                  <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">
                    Showing {filtered.length} curated entries
                  </p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-40 bg-zinc-900/20 rounded-4xl border border-dashed border-zinc-800">
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No entries match your search criteria</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {displayItems.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>

                  {totalBrowsePages > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-20 pb-8">
                      <button 
                        onClick={() => {
                          setBrowsePage(p => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={browsePage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:border-amber-500/50 transition-colors text-zinc-400 hover:text-amber-500"
                      >
                        &larr;
                      </button>
                      
                      <div className="flex gap-1.5 items-center">
                        {Array.from({ length: totalBrowsePages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setBrowsePage(i + 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-[10px] font-black transition-all duration-300 ${
                              browsePage === i + 1
                                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={async () => {
                          if (browsePage < totalBrowsePages) {
                            setBrowsePage(p => p + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            await handleLoadMore();
                            setBrowsePage(p => p + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        disabled={loadingMore}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 disabled:opacity-50 hover:border-amber-500/50 transition-colors text-zinc-400 hover:text-amber-500"
                      >
                        {loadingMore ? <div className="w-4 h-4 border border-zinc-500 border-t-amber-500 rounded-full animate-spin"/> : <>&rarr;</>}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
