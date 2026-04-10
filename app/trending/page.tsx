"use client";

import { useState, useEffect } from "react";
import { FaBolt, FaFire, FaNewspaper } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";

// Types for API Results
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
          image: 'movie-placeholder', // Added to satisfy TS
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        }))) : Promise.resolve([]);

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
          summary: m.overview || 'Highly popular TV show.',
          image: 'show-placeholder', // Added to satisfy TS
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        }))) : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=12&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((g: RAWGResult): Review => ({
          id: `game-${pageNum}-${g.id}`,
          title: g.name,
          category: "Games",
          rating: g.rating ? g.rating * 2 : 0,
          year: g.released ? g.released.split('-')[0] : 'N/A',
          genre: g.genres?.[0]?.name || 'Game',
          reviewer: 'RAWG',
          avatar: 'RG',
          summary: 'Trending gaming experience.',
          image: 'game-placeholder', // Added to satisfy TS
          imageUrl: g.background_image || null,
        }))) : Promise.resolve([]);

      const [movies, shows, games] = await Promise.all([tmdbMoviesReq, tmdbShowsReq, rawgReq]);
      const all: Review[] = [...movies, ...shows, ...games].sort(() => 0.5 - Math.random());
      return all;
    } catch (err) {
      console.error("Fetch error:", err);
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

  const featured = reviews.slice(0, 4);
  const trending = reviews.slice(4);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans">
      <Header />

      <main className="relative z-10 w-full px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border-2 border-slate-800 border-t-blue-400 rounded-full animate-spin" />
            <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Syncing Blitz Feed</p>
          </div>
        ) : (
          <div className="space-y-24">
            
            {/* FEATURED / HERO SECTION */}
            <section className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-[1px] w-12 bg-blue-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-blue-400 flex items-center gap-2">
                  <FaNewspaper /> Headline Stories
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 group cursor-pointer relative overflow-hidden bg-slate-900 aspect-video lg:aspect-auto lg:h-[500px] border border-white/5">
                    {featured[0] && (
                        <>
                            <img src={featured[0].imageUrl || ''} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-10">
                                <span className="bg-blue-500 text-[10px] font-black uppercase px-3 py-1 mb-4 inline-block tracking-widest">Top Pick</span>
                                <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 leading-none">
                                    {featured[0].title}
                                </h3>
                                <p className="text-slate-400 max-w-xl text-sm line-clamp-2 uppercase font-medium tracking-tight">
                                    {featured[0].summary}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {featured.slice(1, 4).map((r) => (
                        <div key={r.id} className="bg-slate-900/50 border border-white/5 p-4 flex gap-4 hover:border-blue-400/30 transition-all group cursor-pointer">
                            <div className="w-24 h-24 shrink-0 bg-black overflow-hidden">
                                <img src={r.imageUrl || ''} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-yellow-400 text-[9px] font-black uppercase tracking-widest mb-1">{r.category}</span>
                                <h4 className="font-black text-sm uppercase leading-tight line-clamp-2">{r.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </section>

            {/* MAIN TRENDING FEED */}
            <section>
              <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
                <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 uppercase">
                  <FaFire className="text-yellow-400" /> Trending <span className="text-slate-500">Now</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                {trending.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>

              {/* LOAD MORE */}
              <div className="flex justify-center mt-20">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-12 bg-white text-black font-black uppercase tracking-tighter text-sm px-16 py-6 hover:bg-yellow-400 transition-all duration-300"
                >
                  {loadingMore ? "Updating Feed..." : "Load More Discoveries"}
                  <FaBolt className={loadingMore ? "animate-spin" : "group-hover:text-blue-500"} />
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}