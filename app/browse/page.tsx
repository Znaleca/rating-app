"use client";

import { useState, useEffect, useCallback } from "react";
import { FaBolt, FaFire, FaArrowRight } from "react-icons/fa";
import Link from "next/link"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";
import { useRouter } from "next/navigation";
import BrowseSearch from "@/components/BrowseSearch";
import { getBulkRatingsSummaries } from "@/app/actions/ratings";

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

const SectionHeading = ({ title, subtitle, accentColor }: { title: string, subtitle: string, accentColor: string }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className={`h-0.5 w-12 ${accentColor.replace('bg-', 'bg-')}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400">{subtitle}</span>
      </div>
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
        {title}
      </h2>
    </div>
  </div>
);

export default function Trending() {
  const router = useRouter(); 
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blitzScores, setBlitzScores] = useState<Record<string, { criticAverage: string, audienceAverage: string }>>({});

  const fetchBlitzScores = useCallback(async (items: Review[]) => {
    const ids = items.map(r => r.id.toString());
    if (ids.length === 0) return;
    const scores = await getBulkRatingsSummaries(ids);
    setBlitzScores(prev => ({ ...prev, ...scores }));
  }, []);

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
      fetchBlitzScores(initialItems);
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
      fetchBlitzScores(nextItems);
      return unique;
    });

    setPage(nextPage);
    setLoadingMore(false);
  };

  // Sliced for 6 Spotlight items
  const featuredList = reviews.slice(0, 6);
  const trendingItems = reviews.slice(6);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans overflow-x-hidden">
      <Header />

      <main className="relative z-10 w-full px-6 md:px-12 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border-2 border-slate-800 border-t-yellow-400 animate-spin" />
            <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Database</p>
          </div>
        ) : (
          <div className="space-y-32">

            {/* ⚡ PAGE HEADER */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-8 bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Browsing</span>
                  <div className="h-px w-8 bg-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-[-0.05em] text-white uppercase leading-[0.9]">
                  EXPLORE <br className="md:hidden" />
                  <span className="text-transparent relative inline-block" style={{ WebkitTextStroke: '1.5px rgba(250, 204, 21, 0.9)' }}> MEDIA </span>
                </h1>
              </div>
            </div>

            {/* SEARCH SECTION */}
            <section className="max-w-4xl mx-auto w-full">
              <div className="relative border border-white/5 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl">
                <BrowseSearch data={reviews} onSearch={(query) => {
                  if (query) {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }
                }} />
              </div>
            </section>

            {/* 2. SPOTLIGHT (6 IMAGES) */}
            {featuredList.length > 0 && (
              <section className="relative pb-16 w-full">
                <SectionHeading title="Featured" subtitle="Blitz" accentColor="bg-yellow-400" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-10 auto-rows-[250px] md:auto-rows-[300px]">
                  {featuredList.map((rev, index) => {
                    // Logic for 6 items:
                    // Item 0: Hero (8 cols, 2 rows)
                    // Item 1: Tall side (4 cols, 2 rows)
                    // Items 2-5: Small squares (3 cols each, 1 row)
                    let gridPlacement = "";
                    if (index === 0) gridPlacement = "md:col-span-8 md:row-span-2";
                    else if (index === 1) gridPlacement = "md:col-span-4 md:row-span-2";
                    else gridPlacement = "md:col-span-3 md:row-span-1";
                    
                    return (
                      <div key={rev.id} className={`${gridPlacement} relative h-full overflow-hidden group border border-white/5 bg-zinc-900`}>
                        <Link href={`/archives/${rev.id}`} className="block h-full w-full relative">
                          {rev.imageUrl && (
                            <img 
                              src={rev.imageUrl} 
                              alt={rev.title}
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 
                                ${index === 0 ? 'opacity-80' : 'opacity-50'} group-hover:opacity-100`}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 p-6 w-full">
                            <span className="text-blue-400 text-[8px] font-black uppercase tracking-[0.3em] mb-2 block">
                              {rev.category}
                            </span>
                            <h3 className={`${index === 0 ? 'text-3xl md:text-5xl' : 'text-lg md:text-xl'} font-black uppercase tracking-tighter leading-none group-hover:text-yellow-400 transition-colors line-clamp-2`}>
                              {rev.title}
                            </h3>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* MAIN TRENDING FEED */}
            <section className="w-full">
              <div className="flex items-center gap-6 mb-16">
                <div className="bg-yellow-400 p-4">
                   <FaFire className="text-black text-2xl" />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                        Active Stream
                    </h2>
                </div>
                <div className="flex-1 h-px bg-white/10 hidden md:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-12">
                {trendingItems.map((r) => (
                  <ReviewCard 
                    key={r.id} 
                    review={r} 
                    criticScore={blitzScores[r.id.toString()]?.criticAverage}
                    audienceScore={blitzScores[r.id.toString()]?.audienceAverage}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-32">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group relative flex items-center gap-12 bg-transparent border-2 border-white text-white font-black uppercase tracking-widest text-xs px-16 py-8 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <span className="relative z-10">{loadingMore ? "UPDATING..." : "LOAD MORE RECORDS"}</span>
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