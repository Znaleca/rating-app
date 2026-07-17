"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import React from "react";
import { FaFilm, FaTv, FaStar, FaFire } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";
import { getBulkRatingsSummaries } from "@/app/actions/ratings";

// --- Types for API Responses ---
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
}

export default function Browse() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [blitzScores, setBlitzScores] = useState<Record<string, { criticAverage: string, audienceAverage: string }>>({});
  const [upcomingItems, setUpcomingItems] = useState<Review[]>([]);
  const didLoadRef = useRef(false);

  const fetchBlitzScores = useCallback(async (items: Review[]) => {
    const ids = items.map(r => r.id.toString());
    if (ids.length === 0) return;
    const scores = await getBulkRatingsSummaries(ids);
    setBlitzScores(scores);
  }, []);

  const fetchPage = async (pageNum: number): Promise<Review[]> => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const currentYear = new Date().getFullYear();

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&primary_release_year=${currentYear}&sort_by=popularity.desc&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `movie-${m.id}`,
          title: m.title || "Untitled",
          category: "Movies",
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: 'Movie',
          reviewer: 'TMDB',
          avatar: 'TM',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&first_air_date_year=${currentYear}&sort_by=popularity.desc&page=${pageNum}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: TMDBItem) => ({
          id: `show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows",
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: 'TV Show',
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

  const fetchUpcoming = async () => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      const upMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${tmdbKey}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: any) => ({
          id: `movie-${m.id}`, title: m.title || "Untitled", category: "Movies", rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A', genre: 'Movie', reviewer: 'TMDB', avatar: 'TM',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null, summary: m.overview,
        }))) : Promise.resolve([]);

      const upShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${tmdbKey}`)
        .then(res => res.json())
        .then(data => (data.results || []).map((m: any) => ({
          id: `show-${m.id}`, title: m.name || "Untitled", category: "Shows", rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A', genre: 'TV Show', reviewer: 'TMDB', avatar: 'TM',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null, summary: m.overview,
        }))) : Promise.resolve([]);

      const [movies, shows] = await Promise.all([upMoviesReq, upShowsReq]);
      // Interleave them so it's a mixed list
      const mixed = [];
      const maxLength = Math.max(movies.length, shows.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < movies.length) mixed.push(movies[i]);
        if (i < shows.length) mixed.push(shows[i]);
      }
      return mixed.slice(0, 10); // Take top 10 mixed upcoming
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;

    async function loadInitial() {
      setLoading(true);
      const [initialItems, upcoming] = await Promise.all([
        fetchPage(1),
        fetchUpcoming()
      ]);
      const shuffled = [...initialItems].sort(() => 0.5 - Math.random());
      setReviews(shuffled);
      setUpcomingItems(upcoming);
      setLoading(false);
      fetchBlitzScores([...shuffled, ...upcoming]);
    }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredList = useMemo(() => {
    if (reviews.length === 0) return [];
    return reviews.slice(0, 3);
  }, [reviews]);

  const getTopTen = (cat: string) => reviews.filter(r => r.category === cat).slice(0, 10);
  const upcomingForTop = upcomingItems.slice(0, 10);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-yellow-400 selection:text-[var(--background)] font-sans">
      
      {/* 🌌 Background Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-yellow-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>

      <Header />

      <main className="relative z-10 isolate w-full px-6 pt-28 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border border-[var(--border-subtle)] border-t-yellow-400 border-l-blue-400 rounded-full animate-spin" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">Scanning Global Archives...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-32">
            
            {/* ⚡ PAGE HEADER */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-8 bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.8em] text-[var(--muted-foreground)]">NEW & POPULAR</span>
                  <div className="h-px w-8 bg-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] text-[var(--foreground)] uppercase leading-[0.9]">
                  FRESH <br className="md:hidden" />
                  <span className="text-transparent relative inline-block" style={{ WebkitTextStroke: '1.5px rgba(250, 204, 21, 0.9)' }}> RELEASES </span>
                </h1>
              </div>
            </div>

            {/* 2. SPOTLIGHT */}
            {featuredList.length > 0 && (
              <section className="relative pb-16">
                <SectionHeading title="Spotlight" subtitle="Highlights" accentColor="bg-yellow-400" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 md:auto-rows-[minmax(350px,auto)]">
                  {featuredList.map((rev, index) => {
                    const gridPlacement = index === 0 ? "md:col-span-8 md:row-span-2" : "md:col-span-4 md:row-span-1";
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
            {/* TOP 10 LISTS */}
            <div className="flex flex-col gap-y-32">
              <TopTenSection title="Anticipated Upcoming" icon={<FaFire />} items={upcomingForTop} accentColor="text-purple-400" borderAccent="border-purple-400" blitzScores={blitzScores} />
              <TopTenSection title="Top 10 Movies" icon={<FaFilm />} items={getTopTen("Movies")} accentColor="text-[var(--foreground)]" borderAccent="border-[var(--border-subtle)]" blitzScores={blitzScores} />
              <TopTenSection title="Top 10 Shows" icon={<FaTv />} items={getTopTen("Shows")} accentColor="text-blue-400" borderAccent="border-blue-400" blitzScores={blitzScores} />

            </div>

            {/* GRID OF REMAINING ITEMS */}
            {reviews.length > 3 && (
              <section className="relative pt-4">
                <SectionHeading title="More Discoveries" subtitle="Explore" accentColor="bg-blue-500" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                  {reviews.slice(3).map((item) => (
                    <ReviewCard 
                      key={item.id}
                      review={item} 
                      criticScore={blitzScores[item.id.toString()]?.criticAverage}
                      audienceScore={blitzScores[item.id.toString()]?.audienceAverage}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function SectionHeading({ title, subtitle, accentColor }: { title: string, subtitle: string, accentColor: string }) {
  return (
    <div className="relative flex items-center w-full mb-6">
      <div className="flex-1 h-px bg-linear-to-r from-transparent to-white/10" />
      <div className="flex flex-col items-center px-8 relative z-10 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)] mb-2">{subtitle}</span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-[var(--foreground)]">{title}</h2>
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-0.5 ${accentColor}`} />
      </div>
      <div className="flex-1 h-px bg-linear-to-l from-transparent to-white/10" />
    </div>
  );
}

function TopTenSection({ title, icon, items, accentColor, borderAccent, blitzScores }: { title: string, icon: React.ReactNode, items: Review[], accentColor: string, borderAccent: string, blitzScores: Record<string, { criticAverage: string, audienceAverage: string }> }) {
  if (items.length === 0) return null;
  return (
    <section className="relative pt-4">
      <div className="flex items-center justify-between mb-10 border-b border-[var(--border-subtle)] pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <span className={`${accentColor}`}>{icon}</span> {title}
        </h2>
        <FaStar className={`${accentColor} opacity-50 text-xs`} />
      </div>

      {/* Horizontal scroll Netflix-style */}
      <div className="overflow-x-auto pb-8 pt-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-0" style={{ minWidth: 'max-content' }}>
          {items.map((item, idx) => (
            <div key={item.id} className="relative flex flex-row items-end group flex-shrink-0 snap-start mr-4 md:mr-8 pb-4">
              {/* Big Number Container (Left side) */}
              <div className="flex justify-end items-end w-[90px] md:w-[130px] overflow-visible z-10 shrink-0 pb-2">
                <span
                  className={`select-none font-black leading-[0.75] ${accentColor} tracking-tighter`}
                  style={{
                    fontSize: 'clamp(150px, 20vw, 240px)',
                    WebkitTextStroke: '4px currentColor',
                    WebkitTextFillColor: 'var(--background)',
                    opacity: 0.9,
                    fontFamily: 'Arial Black, Impact, sans-serif',
                  }}
                >
                  {idx + 1}
                </span>
              </div>
              {/* Landscape card (Right side, overlapping left) */}
              <div className="relative z-20 shrink-0 group-hover:-translate-y-2 transition-transform duration-500 w-[240px] md:w-[320px] -ml-[50px] md:-ml-[70px]">
                <ReviewCard
                  review={item}
                  criticScore={blitzScores[item.id.toString()]?.criticAverage}
                  audienceScore={blitzScores[item.id.toString()]?.audienceAverage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}