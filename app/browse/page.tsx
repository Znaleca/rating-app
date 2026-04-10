"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaFilm, FaTv, FaGamepad, FaStar } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import BrowseSearch from "@/components/BrowseSearch";
import FeaturedCard from "@/components/FeaturedCard"; 
import { Category, CATEGORY_ICON_COMPONENTS, Review } from "@/lib/types";

export default function Browse() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch standard trending items
  const fetchPage = async (pageNum: number) => {
    try {
      const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
      const currentYear = new Date().getFullYear();

      const tmdbMoviesReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&primary_release_year=${currentYear}&sort_by=popularity.desc&page=${pageNum}`).then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
          id: `movie-${m.id}`,
          title: m.title || "Untitled",
          category: "Movies",
          rating: m.vote_average || 0,
          year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
          genre: 'Movie',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const tmdbShowsReq = tmdbKey ? fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&first_air_date_year=${currentYear}&sort_by=popularity.desc&page=${pageNum}`).then(res => res.json()).then(data => (data.results || []).map((m: any) => ({
          id: `show-${m.id}`,
          title: m.name || "Untitled",
          category: "Shows",
          rating: m.vote_average || 0,
          year: m.first_air_date ? m.first_air_date.split('-')[0] : 'N/A',
          genre: 'TV Show',
          imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          summary: m.overview,
        }))) : Promise.resolve([]);

      const rawgReq = rawgKey ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-added&page_size=10&page=${pageNum}`).then(res => res.json()).then(data => (data.results || []).map((g: any) => ({
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

  // GLOBAL SEARCH LOGIC: Hits the actual search endpoints


  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const initialItems = await fetchPage(1);
      setReviews(initialItems);
      setLoading(false);
    }
    loadInitial();
  }, []);

  const featuredList = useMemo(() => {
    if (reviews.length === 0) return [];
    return [...reviews].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [reviews.length]);



  const getTopTen = (cat: string) => reviews.filter(r => r.category === cat).slice(0, 10);

  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans">
      
      {/* 🌌 Background Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-yellow-400/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>

      <Header />

      <main className="relative z-10 isolate w-full px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="w-16 h-16 border border-white/10 border-t-yellow-400 border-l-blue-400 rounded-full animate-spin" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Scanning Global Archives...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-32">
            
            {/* ⚡ SEARCH & PAGE HEADER */}
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[1px] w-8 bg-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Database</span>
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

            {/* 2. SPOTLIGHT (Only if not searching) */}
            {featuredList.length > 0 && (
              <section className="relative pb-16">
                <SectionHeading title="Spotlight" subtitle="Curated" accentColor="bg-yellow-400" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 md:auto-rows-[minmax(350px,auto)]">
                  {featuredList.map((rev, index) => {
                    const gridPlacement = index === 0 ? "md:col-span-8 md:row-span-2" : "md:col-span-4 md:row-span-1";
                    return (
                      <div key={rev.id} className={`${gridPlacement} relative h-full`}><FeaturedCard review={rev} /></div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. TOP 10 LISTS */}
            <div className="flex flex-col gap-y-32">
              <TopTenSection title="Top 10 Movies" icon={<FaFilm />} items={getTopTen("Movies")} accentColor="text-white" borderAccent="border-white" />
              <TopTenSection title="Top 10 Shows" icon={<FaTv />} items={getTopTen("Shows")} accentColor="text-blue-400" borderAccent="border-blue-400" />
              <TopTenSection title="Top 10 Games" icon={<FaGamepad />} items={getTopTen("Games")} accentColor="text-yellow-400" borderAccent="border-yellow-400" />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Subcomponents for Headings and Sections to keep it clean
function SectionHeading({ title, subtitle, accentColor }: { title: string, subtitle: string, accentColor: string }) {
  return (
    <div className="relative flex items-center w-full mb-6">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
      <div className="flex flex-col items-center px-8 relative z-10 text-center">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">{subtitle}</span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-white">{title}</h2>
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-[2px] ${accentColor}`} />
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
    </div>
  );
}

function TopTenSection({ title, icon, items, accentColor, borderAccent }: { title: string, icon: any, items: Review[], accentColor: string, borderAccent: string }) {
  if (items.length === 0) return null;
  return (
    <section className="relative pt-4">
      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
          <span className={`${accentColor}`}>{icon}</span> {title}
        </h2>
        <FaStar className={`${accentColor} opacity-50 text-xs`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-16 pt-8">
        {items.map((item, idx) => (
          <div key={item.id} className="relative group">
            <div className={`absolute -top-6 -left-3 z-30 w-10 h-10 bg-black border ${borderAccent} text-white flex items-center justify-center font-black text-sm shadow-2xl`}>
              {idx + 1}
              <div className={`absolute top-0 right-0 w-2 h-2 ${accentColor.replace('text-', 'bg-')}`} />
            </div>
            <ReviewCard review={item} />
          </div>
        ))}
      </div>
    </section>
  );
}