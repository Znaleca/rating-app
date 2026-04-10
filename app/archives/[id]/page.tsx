"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaStar, FaCalendar, FaClock, FaArrowLeft, FaTerminal } from "react-icons/fa";
import Header from "@/components/Header";

interface DetailData {
    title: string;
    backdropUrl: string | null;
    posterUrl: string | null;
    releaseDate: string;
    rating: number;
    genres: string[];
    overview: string;
    tagline?: string;
    runtime?: string;
    studio?: string;
    mediaType: "Movie" | "TV Show" | "Game";
}

export default function ArchiveDetails() {
    const params = useParams();
    const id = params?.id as string;
    
    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;
        async function fetchDetails() {
            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
                let type = "";
                let apiId = id.split("-").pop();
                
                if (id.includes("movie")) type = "movie";
                else if (id.includes("show") || id.includes("tv")) type = "tv";
                else if (id.includes("game") || id.includes("rawg")) type = "game";
                
                if (!apiId || !type) { setError(true); return; }

                let detail: DetailData | null = null;

                if (type === "movie" && tmdbKey) {
                    const res = await fetch(`https://api.themoviedb.org/3/movie/${apiId}?api_key=${tmdbKey}`);
                    const m = await res.json();
                    if (m.id) {
                        detail = {
                            title: m.title,
                            backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
                            posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
                            releaseDate: m.release_date || "Unknown",
                            rating: m.vote_average || 0,
                            genres: (m.genres || []).map((g: any) => g.name),
                            overview: m.overview,
                            tagline: m.tagline,
                            runtime: m.runtime ? `${m.runtime} MIN` : undefined,
                            studio: m.production_companies?.[0]?.name,
                            mediaType: "Movie"
                        };
                    }
                } else if (type === "tv" && tmdbKey) {
                    const res = await fetch(`https://api.themoviedb.org/3/tv/${apiId}?api_key=${tmdbKey}`);
                    const t = await res.json();
                    if (t.id) {
                        detail = {
                            title: t.name,
                            backdropUrl: t.backdrop_path ? `https://image.tmdb.org/t/p/original${t.backdrop_path}` : null,
                            posterUrl: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
                            releaseDate: t.first_air_date || "Unknown",
                            rating: t.vote_average || 0,
                            genres: (t.genres || []).map((g: any) => g.name),
                            overview: t.overview,
                            tagline: t.tagline,
                            runtime: t.episode_run_time?.[0] ? `${t.episode_run_time[0]} MIN` : undefined,
                            studio: t.networks?.[0]?.name,
                            mediaType: "TV Show"
                        };
                    }
                } else if (type === "game" && rawgKey) {
                    const res = await fetch(`https://api.rawg.io/api/games/${apiId}?key=${rawgKey}`);
                    const g = await res.json();
                    if (g.id) {
                        detail = {
                            title: g.name,
                            backdropUrl: g.background_image_additional || g.background_image || null,
                            posterUrl: g.background_image || null,
                            releaseDate: g.released || "Unknown",
                            rating: g.rating ? g.rating * 2 : 0,
                            genres: (g.genres || []).map((gen: any) => gen.name),
                            overview: g.description_raw,
                            runtime: g.playtime ? `${g.playtime} HRS` : undefined,
                            studio: g.developers?.[0]?.name || g.publishers?.[0]?.name,
                            mediaType: "Game"
                        };
                    }
                }
                detail ? setData(detail) : setError(true);
            } catch (err) { setError(true); } finally { setLoading(false); }
        }
        fetchDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/5 border-t-yellow-400 animate-spin" />
            <p className="mt-6 text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypting Archive Data</p>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">404: Link Severed</h1>
            <Link href="/browse" className="text-blue-400 font-black uppercase tracking-widest text-[10px] border-b border-blue-400 pb-1 hover:text-white hover:border-white transition-all">Return to Command Center</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-yellow-400 selection:text-black">
            <Header />
            
            <main className="relative">
                {/* HERO SECTION */}
                <section className="relative h-[80vh] w-full flex items-end">
                    <div className="absolute inset-0 z-0">
                        {data.backdropUrl && (
                            <Image 
                                src={data.backdropUrl} 
                                alt={data.title} 
                                fill 
                                className="object-cover opacity-60 transition-transform duration-[10s] ease-linear scale-110" 
                                priority 
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400">{data.mediaType}</span>
                                <div className="h-[1px] w-12 bg-blue-400/30" />
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-yellow-400">Status: Active</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-9xl font-black tracking-[-0.05em] uppercase leading-[0.85] text-white">
                                {data.title}
                            </h1>

                            {data.tagline && (
                                <p className="text-white text-sm md:text-xl font-medium tracking-tight border-l-2 border-yellow-400 pl-6 max-w-3xl opacity-80">
                                    {data.tagline}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTENT GRID */}
                <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
                    
                    {/* LEFT: PRIMARY INFO */}
                    <div className="lg:col-span-8 space-y-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-2">
                                <FaTerminal className="text-blue-400 text-xs" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">File Briefing</h3>
                            </div>
                            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-semibold">
                                {data.overview || "Data transmission incomplete. Archives contain no summary for this entry."}
                            </p>
                        </div>

                        {/* KEY METRICS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-12 border-y border-white/10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-yellow-400 italic leading-none">{data.rating.toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">/ 10</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Release Cycle</p>
                                <span className="text-2xl font-black text-white block">{data.releaseDate.split('-')[0]}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Unit Duration</p>
                                <span className="text-2xl font-black text-white block">{data.runtime || "UNK"}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Entity Studio</p>
                                <span className="text-2xl font-black text-white block truncate">{data.studio || "Independent"}</span>
                            </div>
                        </div>

                        {/* CLASSIFICATIONS */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Asset Classifications</h3>
                            <div className="flex flex-wrap gap-3">
                                {data.genres.map(g => (
                                    <span key={g} className="px-6 py-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-blue-400 hover:text-black transition-all cursor-crosshair">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ASSET & ACTIONS */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* ASSET CONTAINER */}
                        <div className="relative group">
                            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-blue-400 z-20" />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-yellow-400 z-20" />
                            
                            {data.posterUrl ? (
                                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                                    <Image 
                                        src={data.posterUrl} 
                                        alt={data.title} 
                                        fill 
                                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                                </div>
                            ) : (
                                <div className="aspect-[2/3] w-full bg-white/5 flex items-center justify-center font-black uppercase tracking-widest text-slate-700">No Asset Signal</div>
                            )}
                        </div>

                        {/* NAVIGATION STACK */}
                        <Link href="/browse" className="w-full py-6 border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all group">
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Exit Archives
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}