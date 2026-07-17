"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FaBolt, FaFire, FaArrowRight, FaFilm, FaTv } from "react-icons/fa";
import Link from "next/link"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import BrowseSearch from "@/components/BrowseSearch";
import { Suspense } from "react";
import { getBulkRatingsSummaries } from "@/app/actions/ratings";

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path?: string | null;
}

const SectionHeading = ({ title, subtitle, accentColor }: { title: string, subtitle: string, accentColor: string }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className={`h-0.5 w-12 ${accentColor.replace('bg-', 'bg-')}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--muted-foreground)]">{subtitle}</span>
      </div>
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
        {title}
      </h2>
    </div>
  </div>
);

export default function Browse() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--foreground)]"><div className="animate-spin w-10 h-10 border-2 border-yellow-500 border-t-transparent" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const loadedTypeRef = useRef<string | null>(null);
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

      let fetchMovies = true;
      let fetchShows = true;

      if (typeParam === 'movie') {
        fetchShows = false;
      } else if (typeParam === 'tv') {
        fetchMovies = false;
      }

      const tmdbMoviesReq = (fetchMovies && tmdbKey) ? fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}&page=${pageNum}`)
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
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = (fetchShows && tmdbKey) ? fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${tmdbKey}&page=${pageNum}`)
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
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
        }))) : Promise.resolve([]);

      const [movies, shows] = await Promise.all([tmdbMoviesReq, tmdbShowsReq]);
      const all: Review[] = [...movies, ...shows].sort(() => 0.5 - Math.random());
      return all;
    } catch (err) {
      console.error("Fetch error:", err);
      return [];
    }
  };

  useEffect(() => {
    // Use a sentinel so the very first load (typeParam === null) is not skipped
    if (loadedTypeRef.current === (typeParam ?? "__null__")) {
      return;
    }

    loadedTypeRef.current = typeParam ?? "__null__";

    async function loadInitial() {
      setLoading(true);
      setPage(1);
      const initialItems = await fetchPage(1);
      setReviews(initialItems);
      setLoading(false);
      fetchBlitzScores(initialItems);
    }

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeParam]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const nextItems = await fetchPage(nextPage);

    fetchBlitzScores(nextItems);

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

  const featuredList = reviews.slice(0, 6);
  const trendingItems = reviews.slice(6);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-yellow-400 selection:text-[var(--background)] font-sans overflow-x-hidden">
      <Header />

      <main className="relative z-10 w-full px-6 md:px-12 pt-28 pb-20">
        {loading ? (
          <div className="space-y-32">
            {/* Header skeleton */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full">
                <div className="h-4 w-24 bg-[var(--surface)] animate-pulse mb-6 rounded" />
                <div className="h-20 w-80 bg-[var(--surface)] animate-pulse mb-4 rounded" />
                <div className="flex gap-2 mt-10 border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
                  {[1,2,3].map(i => <div key={i} className="w-20 h-14 bg-[var(--background)] animate-pulse rounded" />)}
                </div>
              </div>
            </div>
            {/* Featured skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
              <div className="md:col-span-8 md:row-span-2 bg-[var(--surface)] animate-pulse" />
              <div className="md:col-span-4 md:row-span-2 bg-[var(--surface)] animate-pulse" />
              {[1,2,3,4].map(i => <div key={i} className="md:col-span-3 bg-[var(--surface)] animate-pulse" />)}
            </div>
            {/* Cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
              {Array.from({length: 15}).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] bg-[var(--surface)] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-32">

            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-8 bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.8em] text-[var(--muted-foreground)]">Browsing</span>
                  <div className="h-px w-8 bg-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-[-0.05em] text-[var(--foreground)] uppercase leading-[0.9]">
                  EXPLORE <br className="md:hidden" />
                  <span className="text-transparent relative inline-block" style={{ WebkitTextStroke: '1.5px rgba(250, 204, 21, 0.9)' }}> MEDIA </span>
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mt-10 border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
                  <Link 
                    href="/browse"
                    className={`flex flex-col items-center gap-2 group transition-all p-3 md:p-4 hover:bg-[var(--background)] border border-transparent hover:border-[var(--border-subtle)] ${!typeParam ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
                  >
                    <FaBolt size={18} className="group-hover:-translate-y-1 transition-transform group-hover:text-yellow-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">All</span>
                  </Link>
                  <Link 
                    href="/browse?type=movie"
                    className={`flex flex-col items-center gap-2 group transition-all p-3 md:p-4 hover:bg-[var(--background)] border border-transparent hover:border-[var(--border-subtle)] ${typeParam === 'movie' ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
                  >
                    <FaFilm size={18} className="group-hover:-translate-y-1 transition-transform group-hover:text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Movies</span>
                  </Link>
                  <Link 
                    href="/browse?type=tv"
                    className={`flex flex-col items-center gap-2 group transition-all p-3 md:p-4 hover:bg-[var(--background)] border border-transparent hover:border-[var(--border-subtle)] ${typeParam === 'tv' ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
                  >
                    <FaTv size={18} className="group-hover:-translate-y-1 transition-transform group-hover:text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Shows</span>
                  </Link>
                </div>
              </div>
            </div>

            <section className="max-w-4xl mx-auto w-full">
              <div className="relative border border-[var(--border-subtle)] bg-[var(--background)]/60 backdrop-blur-xl shadow-2xl rounded-2xl">
                <BrowseSearch data={reviews} onSearch={(query) => {
                  if (query) {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }
                }} />
              </div>
            </section>

            {featuredList.length > 0 && (
              <section className="relative pb-16 w-full">
                <SectionHeading title="Featured" subtitle="Blitz" accentColor="bg-yellow-400" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-10 auto-rows-[250px] md:auto-rows-[300px]">
                  {featuredList.map((rev, index) => {
                    let gridPlacement = "";
                    if (index === 0) gridPlacement = "md:col-span-8 md:row-span-2";
                    else if (index === 1) gridPlacement = "md:col-span-4 md:row-span-2";
                    else gridPlacement = "md:col-span-3 md:row-span-1";
                    
                    return (
                      <div key={rev.id} className={`${gridPlacement} relative h-full overflow-hidden group bg-black`}>
                        <Link href={`/archives/${rev.id}`} className="block h-full w-full relative">
                          {rev.imageUrl ? (
                            <img 
                              src={rev.imageUrl} 
                              alt={rev.title}
                              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[var(--surface)]" />
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                          
                          <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 z-10 transition-transform duration-500 group-hover:-translate-y-2">
                            <span className="text-yellow-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block drop-shadow-md">
                              {rev.category}
                            </span>
                            <h3 
                              className={`text-white ${index === 0 ? 'text-3xl md:text-5xl' : 'text-lg md:text-xl'} font-black uppercase tracking-tighter leading-[0.9] group-hover:text-yellow-400 transition-colors line-clamp-2`}
                              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                            >
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

            <section className="w-full">
              <div className="flex items-center gap-6 mb-16">
                <div className="bg-yellow-400 p-4">
                   <FaFire className="text-[var(--background)] text-2xl" />
                </div>
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">
                        Active Stream
                    </h2>
                </div>
                <div className="flex-1 h-px bg-[var(--foreground)]/10 hidden md:block" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
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
                  className="group relative flex items-center gap-12 bg-transparent border-2 border-[var(--foreground)] text-[var(--foreground)] font-black uppercase tracking-widest text-xs px-16 py-8 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300"
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