"use client";

import { useState, useEffect } from "react";
import { FaBolt, FaFire, FaArrowRight } from "react-icons/fa";
import Link from "next/link"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";
import { useRouter } from "next/navigation";
import BrowseSearch from "@/components/BrowseSearch";

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
  // Initializing the router instance
  const router = useRouter(); 
  
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
          id: `trending-movie-${m.id}`, 
          title: m.title || "Untitled",
          category: "Movies",
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: 'Movie',
          reviewer: 'TMDB',
          avatar: 'TM',
          summary: m.overview || 'Trending movie right now.',
          image: 'movie-placeholder',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${tmdbKey}&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: TMDBResult): Review => ({
          id: `trending-show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows",
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: 'TV Show',
          reviewer: 'TMDB',
          avatar: 'TM',
          summary: m.overview || 'Highly popular TV show.',
          image: 'show-placeholder',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
        }))) : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=12&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((g: RAWGResult): Review => ({
          id: `trending-game-${g.id}`,
          title: g.name,
          category: "Games",
          rating: g.rating ? g.rating * 2 : 0,
          year: g.released ? g.released.split('-')[0] : 'N/A',
          genre: g.genres?.[0]?.name || 'Game',
          reviewer: 'RAWG',
          avatar: 'RG',
          summary: 'Trending gaming experience.',
          image: 'game-placeholder',
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

    setReviews(prev => {
      const combined = [...prev, ...nextItems];
      const unique = combined.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
      return unique;
    });

    setPage(nextPage);
    setLoadingMore(false);
  };

  const featured = reviews.slice(0, 4);
  const trendingItems = reviews.slice(4);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans">
      <Header />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border-2 border-slate-800 border-t-yellow-400 animate-spin" />
            <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Updating Live Feed</p>
          </div>
        ) : (
          <div className="space-y-32">

            {/* ⚡ SEARCH & PAGE HEADER */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[1px] w-8 bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Browse</span>
                  <div className="h-[1px] w-8 bg-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] text-white uppercase leading-[0.9]">
                  EXPLORE <br className="md:hidden" />
                  <span className="text-transparent relative inline-block" style={{ WebkitTextStroke: '1.5px rgba(250, 204, 21, 0.9)' }}> MEDIA </span>
                </h1>
              </div>

              <section className="max-w-4xl mx-auto w-full space-y-6">
                <div className="relative border border-white/5 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl">
                  <BrowseSearch data={reviews} onSearch={(query) => {
                    if (query) {
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }
                  }} />
                </div>
              </section>
            </div>
            
            {/* FEATURED / HERO SECTION */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-12 bg-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400">Headlines</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
                    Featured <br />
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 bg-white/5 p-2">
                <div className="lg:col-span-8 group relative aspect-video lg:h-[600px] overflow-hidden bg-black">
                    {featured[0] && (
                        <Link href={`/archives/${featured[0].id}`} className="block h-full w-full">
                            <img src={featured[0].imageUrl || ''} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" alt={featured[0].title} />
                            <div className="absolute inset-0 border-r-4 border-blue-400/20" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-gradient-to-t from-black via-black/40 to-transparent">
                                <div className="inline-block bg-yellow-400 text-black text-[9px] font-black uppercase px-4 py-1 mb-6 tracking-[0.2em]">
                                    Must Watch
                                </div>
                                <h3 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none max-w-3xl group-hover:text-blue-400 transition-colors">
                                    {featured[0].title}
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="bg-white text-black text-[10px] font-black uppercase px-8 py-4 flex items-center gap-4 group-hover:bg-blue-400 transition-colors">
                                        Read Analysis <FaArrowRight />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                <div className="lg:col-span-4 flex flex-col gap-2">
                    {featured.slice(1, 4).map((r) => (
                        <Link key={r.id} href={`/archives/${r.id}`} className="flex-1 bg-black p-6 border border-white/5 hover:border-yellow-400/50 transition-all group relative overflow-hidden">
                            <img src={r.imageUrl || ''} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" alt={r.title} />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em]">{r.category}</span>
                                <h4 className="font-black text-xl uppercase leading-tight line-clamp-2 mt-4 group-hover:text-yellow-400 transition-colors">{r.title}</h4>
                            </div>
                        </Link>
                    ))}
                </div>
              </div>
            </section>

            {/* MAIN TRENDING FEED */}
            <section>
              <div className="flex items-center gap-6 mb-16">
                <div className="bg-yellow-400 p-4">
                   <FaFire className="text-black text-2xl" />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                        Active Stream
                    </h2>
                </div>
                <div className="flex-1 h-0.5 bg-white/5 hidden md:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {trendingItems.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>

              <div className="flex justify-center mt-32">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-12 bg-transparent border-2 border-white text-white font-black uppercase tracking-widest text-xs px-16 py-8 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <span className="relative z-10">{loadingMore ? "Accessing Database..." : "Load More Records"}</span>
                  <FaBolt className={loadingMore ? "animate-spin" : "group-hover:text-yellow-400 relative z-10"} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400" />
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