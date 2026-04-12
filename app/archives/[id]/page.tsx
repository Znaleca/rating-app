"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaStar, FaCalendar, FaClock, FaArrowLeft, FaTerminal, FaStarHalf, FaBookmark, FaCheck, FaGamepad, FaClock as FaClockReg, FaList } from "react-icons/fa";
import Header from "@/components/Header";
import { getRatingsSummary, updateInteraction } from "@/app/actions/ratings";
import { createClient } from "@/lib/supabase/client";

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
    seasons?: { name: string, season_number: number, episode_count: number }[];
}

export default function ArchiveDetails() {
    const params = useParams();
    const id = params?.id as string;
    
    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Rating State
    const [stats, setStats] = useState({ criticAverage: "N/A", audienceAverage: "N/A" });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [userReview, setUserReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showRatingPanel, setShowRatingPanel] = useState(false);

    // Target Context
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
    const [targetContext, setTargetContext] = useState({ id, title: "" });

    // When the data or dropdowns update, define the context and fetch ratings
    useEffect(() => {
        if (!data) return;
        
        let ctxId = id;
        let ctxTitle = data.title;
        
        if (data.mediaType === 'TV Show' && selectedSeason !== null) {
            ctxId += `-s${selectedSeason}`;
            ctxTitle += ` - S${selectedSeason}`;
            if (selectedEpisode !== null) {
                ctxId += `-e${selectedEpisode}`;
                ctxTitle += ` E${selectedEpisode}`;
            }
        }
        
        setTargetContext({ id: ctxId, title: ctxTitle });
        
        async function fetchContextRatings() {
            const summary = await getRatingsSummary(ctxId);
            setStats({ criticAverage: summary.criticAverage, audienceAverage: summary.audienceAverage });
            setUserRating(summary.userRating);
            setUserStatus(summary.userStatus);
            setUserReview(summary.userReview || "");
            setReviews(summary.reviews || []);
            // We do not auto-open the panel to save space and give a cleaner UI
            // The user must click "Edit Rating" to explicitly open it.
        }
        
        fetchContextRatings();
    }, [id, data, selectedSeason, selectedEpisode]);

    useEffect(() => {
        async function fetchSession() {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setIsLoggedIn(true);
        }
        fetchSession();
    }, []);

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
                            mediaType: "TV Show",
                            seasons: t.seasons ? t.seasons.map((s: any) => ({
                                name: s.name,
                                season_number: s.season_number,
                                episode_count: s.episode_count
                            })).filter((s: any) => s.season_number > 0) : []
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
                
                
                if (detail) {
                    setData(detail);
                    setTargetContext({ id, title: detail.title });
                } else {
                    setError(true);
                }
            } catch (err) { setError(true); } finally { setLoading(false); }
        }
        fetchDetails();
    }, [id]);

    const handleRate = async (score: number) => {
        if (!isLoggedIn || !data) return;
        setIsSubmitting(true);
        const res = await updateInteraction(targetContext.id, {
            rating: score,
            status: userStatus,
            review: userReview,
            title: targetContext.title,
            posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType
        });
        if (res.success) {
            setUserRating(score);
            const summary = await getRatingsSummary(targetContext.id);
            setStats({ criticAverage: summary.criticAverage, audienceAverage: summary.audienceAverage });
        }
        setIsSubmitting(false);
    };

    const handleReview = async () => {
        if (!isLoggedIn || !data) return;
        setIsSubmitting(true);
        const res = await updateInteraction(targetContext.id, {
            review: userReview,
            rating: userRating,
            status: userStatus,
            title: targetContext.title,
            posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType
        });
        if (res.success) {
            const summary = await getRatingsSummary(targetContext.id);
            setReviews(summary.reviews || []);
            setShowRatingPanel(false);
        }
        setIsSubmitting(false);
    };

    const handleStatus = async (status: string) => {
        if (!isLoggedIn || !data) return;
        setIsSubmitting(true);
        
        const targetStatus = status === userStatus ? null : status;
        const isClearingRating = targetStatus === 'watchlist' || targetStatus === 'to-play' || targetStatus === null;
        
        const res = await updateInteraction(targetContext.id, {
            status: targetStatus,
            rating: isClearingRating ? null : userRating,
            review: isClearingRating ? null : userReview,
            title: targetContext.title,
            posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType
        });
        if (res.success) {
            setUserStatus(targetStatus);
            if (isClearingRating) {
                setUserRating(null);
                setUserReview("");
                const summary = await getRatingsSummary(targetContext.id);
                setStats({ criticAverage: summary.criticAverage, audienceAverage: summary.audienceAverage });
                setReviews(summary.reviews || []);
                setShowRatingPanel(false);
            } else if (targetStatus === 'watched' || targetStatus === 'played') {
                setShowRatingPanel(true);
            }
        }
        setIsSubmitting(false);
    };

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
                {/* EXIT BUTTON — top left overlay */}
                <div className="absolute top-24 left-8 xl:left-16 z-30">
                    <Link 
                        href="/browse" 
                        className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/30 transition-all group"
                    >
                        <FaArrowLeft size={9} className="group-hover:-translate-x-1 transition-transform" /> Exit Archives
                    </Link>
                </div>
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

                    <div className="relative z-10 w-full px-8 xl:px-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
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
                                <p className="text-white text-sm md:text-xl font-medium tracking-tight border-l-2 border-yellow-400 pl-6 max-w-4xl opacity-80">
                                    {data.tagline}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTENT GRID */}
                <section className="w-full px-8 xl:px-16 py-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* LEFT: PRIMARY INFO */}
                    <div className="lg:col-span-8 space-y-16">
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 py-10 border-y border-white/10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{data.mediaType === 'Game' ? 'RAWG' : 'TMDB'} Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-400 italic leading-none">{data.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><FaStarHalf className="text-yellow-400"/> Critics</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-yellow-400 italic leading-none">{stats.criticAverage}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">/ 10</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><FaStar className="text-blue-400"/> Audience</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-blue-400 italic leading-none">{stats.audienceAverage}</span>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">/ 10</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Released</p>
                                <span className="text-2xl font-black text-white block">{data.releaseDate.split('-')[0]}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Studio</p>
                                <span className="text-xl font-black text-white block leading-tight" title={data.studio}>{data.studio || "N/A"}</span>
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

                        {/* RATING SUBMISSION */}
                        {isLoggedIn && (
                            <div className="mt-12 space-y-4">

                                {/* TV Show season/episode selector */}
                                {data.mediaType === 'TV Show' && (data.seasons || []).length > 0 && (
                                    <div className="bg-[#0a0a0a] border border-white/10 p-4 shadow-xl relative z-20 flex flex-wrap gap-4 items-center">
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Rate Specific Season</p>
                                            <select 
                                                value={selectedSeason === null ? "" : selectedSeason} 
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? null : Number(e.target.value);
                                                    setSelectedSeason(val);
                                                    setSelectedEpisode(null);
                                                }}
                                                className="w-full bg-[#050505] border border-white/10 text-white text-xs font-bold p-3 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                            >
                                                <option value="">Entire Series</option>
                                                {data.seasons?.map(s => (
                                                    <option key={s.season_number} value={s.season_number}>Season {s.season_number} {s.name && s.name !== `Season ${s.season_number}` ? `(${s.name})` : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {selectedSeason !== null && (
                                            <div className="flex-1 min-w-[200px]">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Rate Specific Episode</p>
                                                <select 
                                                    value={selectedEpisode === null ? "" : selectedEpisode} 
                                                    onChange={(e) => setSelectedEpisode(e.target.value === "" ? null : Number(e.target.value))}
                                                    className="w-full bg-[#050505] border border-white/10 text-white text-xs font-bold p-3 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                                >
                                                    <option value="">Entire Season</option>
                                                    {[...Array(data.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 0)].map((_, i) => (
                                                        <option key={i+1} value={i+1}>Episode {i+1}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STATUS BUTTONS */}
                                <div className="flex flex-wrap gap-2">
                                    {data.mediaType === 'Game' ? (
                                        <>
                                            <button 
                                                onClick={() => handleStatus('to-play')}
                                                disabled={isSubmitting}
                                                className={`flex-1 min-w-[120px] py-3 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${userStatus === 'to-play' ? 'bg-purple-400 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                            >
                                                <FaList /> To Play
                                            </button>
                                            <button 
                                                onClick={() => handleStatus('played')}
                                                disabled={isSubmitting}
                                                className={`flex-1 min-w-[120px] py-3 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${userStatus === 'played' ? 'bg-green-400 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                            >
                                                <FaGamepad /> Played
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => handleStatus('watchlist')}
                                                disabled={isSubmitting}
                                                className={`flex-1 min-w-[120px] py-3 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${userStatus === 'watchlist' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                            >
                                                <FaBookmark /> Watchlist
                                            </button>
                                            <button 
                                                onClick={() => handleStatus('watched')}
                                                disabled={isSubmitting}
                                                className={`flex-1 min-w-[120px] py-3 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${userStatus === 'watched' ? 'bg-blue-400 text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                            >
                                                <FaCheck /> Watched
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* RATING AREA — only shown when watched/played */}
                                {(userStatus === 'watched' || userStatus === 'played') && (
                                    <div className="border border-white/10 bg-[#0a0a0a]">

                                        {/* Already rated: show summary */}
                                        {userRating && !showRatingPanel ? (
                                            <div className="p-6 flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    {/* Big score display */}
                                                    <div className="flex flex-col items-center justify-center w-20 h-20 border border-yellow-400/20 bg-yellow-400/5 shrink-0">
                                                        <span className="text-3xl font-black text-yellow-400 leading-none">{userRating}</span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">/ 10</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Your Rating</p>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[...Array(10)].map((_, i) => (
                                                                <FaStar key={i} size={10} className={i < userRating ? "text-yellow-400" : "text-slate-800"} />
                                                            ))}
                                                        </div>
                                                        {userReview && (
                                                            <p className="text-slate-400 text-xs italic line-clamp-1 max-w-xs">"{userReview}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowRatingPanel(true)}
                                                    className="shrink-0 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
                                                >
                                                    <FaStar size={9} /> Edit
                                                </button>
                                            </div>
                                        ) : !userRating && !showRatingPanel ? (
                                            /* Not yet rated: show Rate This CTA */
                                            <div className="p-6 flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tighter">Rate this {data.mediaType}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">Share your take with the Blitz community</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowRatingPanel(true)}
                                                    className="shrink-0 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2"
                                                >
                                                    <FaStar size={10} /> Rate This
                                                </button>
                                            </div>
                                        ) : null}

                                        {/* Expanded rating panel */}
                                        {showRatingPanel && (
                                            <div className="border-t border-white/10 p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                                                <div className="flex items-center justify-between mb-5">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-0.5">Rating for</p>
                                                        <p className="text-sm font-black text-yellow-400 uppercase tracking-tight">{targetContext.title}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowRatingPanel(false)}
                                                        className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-white/5 hover:border-white/20"
                                                    >
                                                        ✕ Close
                                                    </button>
                                                </div>

                                                {/* Star selector */}
                                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                    {[...Array(10)].map((_, i) => {
                                                        const score = i + 1;
                                                        const isActive = hoverScore ? score <= hoverScore : userRating ? score <= userRating : false;
                                                        return (
                                                            <button 
                                                                key={score}
                                                                onMouseEnter={() => setHoverScore(score)}
                                                                onMouseLeave={() => setHoverScore(null)}
                                                                onClick={() => handleRate(score)}
                                                                disabled={isSubmitting}
                                                                className={`text-2xl md:text-3xl transition-all duration-150 ${isActive ? "text-yellow-400 scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-slate-800 hover:text-slate-500"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                            >
                                                                <FaStar />
                                                            </button>
                                                        );
                                                    })}
                                                    <span className="ml-3 text-3xl font-black text-white tabular-nums w-10">
                                                        {hoverScore || userRating || "–"}
                                                    </span>
                                                </div>
                                                {userRating && (
                                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                                        <FaStarHalf /> Rating saved
                                                    </p>
                                                )}

                                                {/* Review textarea */}
                                                <div className="mt-5 pt-5 border-t border-white/5">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Review <span className="text-slate-700">— optional</span></p>
                                                    <textarea 
                                                        value={userReview}
                                                        onChange={(e) => setUserReview(e.target.value)}
                                                        placeholder="Write your review..."
                                                        className="w-full bg-[#050505] border border-white/10 p-4 text-xs text-white placeholder-slate-700 outline-none focus:border-yellow-400 transition-colors min-h-[90px] resize-y"
                                                    />
                                                    <button 
                                                        onClick={handleReview}
                                                        disabled={isSubmitting}
                                                        className="mt-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 hover:bg-yellow-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <FaCheck /> Save Review
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: ASSET & ACTIONS */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* STICKY WRAPPER */}
                        <div className="sticky top-24 space-y-6">
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
                        </div>{/* end sticky */}
                    </div>
                </section>
            </main>

            {/* REVIEWS LOG */}
            {reviews.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 pb-24 mt-12 relative z-10">
                    <div className="border-t border-white/10 pt-16">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-2"><FaTerminal className="text-yellow-400" /> Interaction Log</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="bg-[#050505] border border-white/5 p-6 hover:border-white/20 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/10 group-hover:bg-yellow-400/50 transition-colors" />
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-wider truncate max-w-[150px]">{rev.name}</p>
                                            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-1">{rev.role}</p>
                                        </div>
                                        {rev.rating && (
                                            <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                                                <FaStar size={10} />
                                                <span className="text-[10px] font-black">{rev.rating}/10</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic border-l border-white/10 pl-4">{rev.review}</p>
                                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-6 text-right">
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}