"use client";

import { useState, useEffect } from "react";
import { FaBolt, FaFire } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedCard from "@/components/FeaturedCard";
import ReviewCard from "@/components/ReviewCard";
import { CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";

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

export default function Trending() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

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
      
      // Slice for the 5 featured cards
      const top5 = initialItems.slice(0, 5).map(r => ({ ...r, featured: true }));
      const rest = initialItems.slice(5);

      setReviews([...top5, ...rest]);
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

  const featured = reviews.filter((r) => r.featured);
  const filtered = reviews.filter((r) => !r.featured);

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
            
            {featured.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col items-center mb-16 text-center">
                  <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <FaFire className="text-amber-500 text-xs animate-pulse" />
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

            <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-4xl p-10 backdrop-blur-md">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {(["Movies", "Shows", "Games"] as const).map((cat) => {
                  const items = reviews.filter((r) => r.category === cat);
                  if (items.length === 0) return null;
                  const Icon = CATEGORY_ICON_COMPONENTS[cat];
                  const avg = items.reduce((s, r) => s + r.rating, 0) / items.length;
                  
                  return (
                    <div key={cat} className="flex flex-col items-center lg:items-start space-y-2">
                      <div className="flex items-center gap-3 text-zinc-500 group-hover:text-amber-500 transition-colors">
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

            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-end justify-between mb-12 border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-4">
                    <FaFire className="text-amber-500" />
                    Trending Worldwide
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
                    {filtered.map((r) => (
                      <ReviewCard key={r.id} review={r} />
                    ))}
                  </div>

                  <div className="flex justify-center mt-20 pb-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="group relative flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-[10px] px-8 py-4 rounded-full overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-3 h-3 border border-white/20 border-t-amber-500 rounded-full animate-spin" />
                          <span className="text-zinc-500">Decrypting Archives...</span>
                        </>
                      ) : (
                        <>
                          <FaBolt className="text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                          <span>Load More Discoveries</span>
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </>
                      )}
                    </button>
                  </div>
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
