"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaStar, FaCalendar, FaClock, FaArrowLeft, FaBolt } from "react-icons/fa";
import Header from "@/components/Header";

// Define the shape
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
    // In some Next.js versions params is a promise, but in standard client components useParams() unwraps it
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
                
                if (!apiId || !type) {
                    setError(true);
                    return;
                }

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
                            runtime: m.runtime ? `${m.runtime} min` : undefined,
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
                            runtime: t.episode_run_time?.[0] ? `${t.episode_run_time[0]} min / ep` : undefined,
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
                            rating: g.rating ? g.rating * 2 : 0, // RAWG is out of 5
                            genres: (g.genres || []).map((gen: any) => gen.name),
                            overview: g.description_raw,
                            tagline: undefined,
                            runtime: g.playtime ? `~${g.playtime} Hours` : undefined,
                            studio: g.developers?.[0]?.name || g.publishers?.[0]?.name,
                            mediaType: "Game"
                        };
                    }
                }

                if (detail) {
                    setData(detail);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center pt-32">
                <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
                    <FaBolt className="absolute text-amber-500 animate-pulse text-2xl" />
                </div>
                <p className="mt-8 text-zinc-500 font-black uppercase tracking-[0.5em] text-[10px]">Accessing Secure Archives</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-8 fixed inset-0 z-50">
                <h1 className="text-4xl text-white font-black uppercase tracking-tighter mb-4">Archive Corrupted</h1>
                <p className="text-zinc-500 text-sm mb-8">We couldn't locate this specific file in the mainframe.</p>
                <Link href="/" className="px-8 py-3 bg-amber-500 text-zinc-950 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-colors">
                    Return to Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500/30">
            <Header />
            <main>
            {/* HEROSCAPE */}
            <section className="relative h-[65vh] w-full overflow-hidden">
                {data.backdropUrl ? (
                    <Image src={data.backdropUrl} alt={data.title} fill className="object-cover opacity-60" priority />
                ) : (
                    <div className="absolute inset-0 bg-zinc-900" />
                )}
                
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/40 to-transparent" />

                <div className="absolute top-10 left-10 z-50">
                    <Link href="/" className="flex items-center gap-3 px-5 py-2.5 bg-zinc-950/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-zinc-950 transition-all text-zinc-300 font-black uppercase tracking-widest text-[9px] group">
                        <FaArrowLeft className="text-amber-500 group-hover:text-zinc-950 transition-colors" /> Back to Archives
                    </Link>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-10 md:p-20 z-20 flex flex-col items-start w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {data.mediaType}
                        </span>
                        {data.studio && (
                            <span className="px-3 py-1 bg-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                                {data.studio}
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-4 text-white drop-shadow-2xl">
                        {data.title}
                    </h1>

                    {data.tagline && (
                        <p className="text-amber-500 text-sm md:text-lg font-bold uppercase tracking-[0.2em] italic max-w-3xl">
                            &ldquo;{data.tagline}&rdquo;
                        </p>
                    )}
                </div>
            </section>

            {/* DETAILS BODY */}
            <section className="w-full px-10 md:px-20 py-16 grid grid-cols-1 md:grid-cols-3 gap-16 pb-32">
                
                <div className="md:col-span-2 space-y-12">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <FaStar className="text-amber-500" />
                                <span className="font-black text-xl text-white">{data.rating.toFixed(1)}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">/ 10</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex items-center gap-2 text-zinc-400">
                                <FaCalendar className="text-zinc-500" />
                                <span className="font-bold text-sm tracking-wider">{data.releaseDate.split('-')[0]}</span>
                            </div>
                            {data.runtime && (
                                <>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <FaClock className="text-zinc-500" />
                                        <span className="font-bold text-sm tracking-wider">{data.runtime}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Synopsis</h3>
                            <p className="text-zinc-300 text-lg leading-relaxed font-medium">
                                {data.overview || "No transmission data found in the archive concerning this subject."}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Classifications</h3>
                        <div className="flex flex-wrap gap-3">
                            {data.genres.map(g => (
                                <span key={g} className="px-4 py-2 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest rounded-full bg-zinc-900 max-w-fit pointer-events-none hover:bg-white/10 transition-colors">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-white/5 pt-10 md:pt-0 md:pl-10">
                    <div className="sticky top-32 space-y-8">
                        {data.posterUrl && (
                            <div className="relative aspect-[2/3] w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 mx-auto">
                                <Image src={data.posterUrl} alt={data.title} fill className="object-cover" />
                            </div>
                        )}
                        <button className="w-full py-5 bg-amber-500 hover:bg-white text-zinc-950 font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-colors shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            Track Entity
                        </button>
                    </div>
                </div>

            </section>
            </main>
        </div>
    );
}
