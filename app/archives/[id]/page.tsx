"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    FaStar, FaArrowLeft, FaTerminal, FaStarHalf,
    FaBookmark, FaCheck,
    FaFilm, FaTv, FaCalendarAlt, FaClock, FaBuilding,
    FaLayerGroup, FaQuoteLeft
} from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    mediaType: "Movie" | "TV Show";
    seasons?: { name: string, season_number: number, episode_count: number }[];
    cast?: { id: number, name: string, character: string, profilePath: string | null }[];
    directors?: { id: number, name: string }[];
}

interface SimilarItem {
    id: string;
    title: string;
    imageUrl: string | null;
    year: string;
    genre: string;
}

export default function ArchiveDetails() {
    const params = useParams();
    const id = params?.id as string;

    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);

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

                let type = "";
                let apiId = id.split("-").pop();

                if (id.includes("movie")) type = "movie";
                else if (id.includes("show") || id.includes("tv")) type = "tv";
                else if (id.includes("show") || id.includes("tv")) type = "tv";

                if (!apiId || !type) { setError(true); return; }

                let detail: DetailData | null = null;

                if (type === "movie" && tmdbKey) {
                    const res = await fetch(`https://api.themoviedb.org/3/movie/${apiId}?api_key=${tmdbKey}&append_to_response=credits`);
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
                            mediaType: "Movie",
                            cast: m.credits?.cast?.slice(0, 10).map((c: any) => ({
                                id: c.id, name: c.name, character: c.character, profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            directors: m.credits?.crew?.filter((c: any) => c.job === "Director").map((d: any) => ({
                                id: d.id, name: d.name
                            })),
                        };
                        // Fetch similar items: prioritize Franchise/Collection, then fall back to Recommendations
                        let similarRaw: any[] = [];
                        if (m.belongs_to_collection?.id) {
                            const collRes = await fetch(`https://api.themoviedb.org/3/collection/${m.belongs_to_collection.id}?api_key=${tmdbKey}`);
                            const collData = await collRes.json();
                            if (collData.parts) {
                                // Add all other movies in the same collection (e.g. all Avengers movies)
                                similarRaw = collData.parts.filter((p: any) => p.id !== m.id);
                            }
                        }

                        // If not enough franchise movies, pad with high-accuracy recommendations
                        if (similarRaw.length < 8) {
                            const recRes = await fetch(`https://api.themoviedb.org/3/movie/${apiId}/recommendations?api_key=${tmdbKey}`);
                            const recData = await recRes.json();
                            const recs = (recData.results || []).filter((r: any) => r.id !== m.id);
                            
                            const existingIds = new Set(similarRaw.map(s => s.id));
                            for (const rec of recs) {
                                if (!existingIds.has(rec.id)) {
                                    similarRaw.push(rec);
                                    existingIds.add(rec.id);
                                }
                            }
                        }

                        setSimilarItems(similarRaw.slice(0, 8).map((s: any) => ({
                            id: `trending-movie-${s.id}`,
                            title: s.title || s.name || "Untitled",
                            imageUrl: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
                            year: (s.release_date || "").split("-")[0],
                            genre: "Movie",
                        })));
                    }
                } else if (type === "tv" && tmdbKey) {
                    const res = await fetch(`https://api.themoviedb.org/3/tv/${apiId}?api_key=${tmdbKey}&append_to_response=credits`);
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
                            mediaType: "TV Show",
                            seasons: t.seasons ? t.seasons.map((s: any) => ({
                                name: s.name,
                                season_number: s.season_number,
                                episode_count: s.episode_count
                            })).filter((s: any) => s.season_number > 0) : [],
                            cast: t.credits?.cast?.slice(0, 10).map((c: any) => ({
                                id: c.id, name: c.name, character: c.character, profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            directors: t.credits?.crew?.filter((c: any) => c.job === "Executive Producer" || c.job === "Director").slice(0, 3).map((d: any) => ({
                                id: d.id, name: d.name
                            })),
                        };
                        // Recommendations usually return spin-offs/same franchise for TV better than 'similar'
                        const simRes = await fetch(`https://api.themoviedb.org/3/tv/${apiId}/recommendations?api_key=${tmdbKey}`);
                        const simData = await simRes.json();
                        setSimilarItems((simData.results || []).slice(0, 8).map((s: any) => ({
                            id: `trending-show-${s.id}`,
                            title: s.name || s.title || "Untitled",
                            imageUrl: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
                            year: (s.first_air_date || "").split("-")[0],
                            genre: "TV Show",
                        })));
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
            rating: score, status: userStatus, review: userReview,
            title: targetContext.title, posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType,
            genre: data.genres?.[0] ?? null
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
            review: userReview, rating: userRating, status: userStatus,
            title: targetContext.title, posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType,
            genre: data.genres?.[0] ?? null
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
        const isClearingRating = targetStatus === 'watchlist' || targetStatus === null;
        const res = await updateInteraction(targetContext.id, {
            status: targetStatus, rating: isClearingRating ? null : userRating,
            review: isClearingRating ? null : userReview, title: targetContext.title,
            posterUrl: data.posterUrl,
            mediaType: data.mediaType === 'TV Show' && targetContext.id !== id ? 'Episode' : data.mediaType,
            genre: data.genres?.[0] ?? null
        });
        if (res.success) {
            setUserStatus(targetStatus);
            if (isClearingRating) {
                setUserRating(null); setUserReview("");
                const summary = await getRatingsSummary(targetContext.id);
                setStats({ criticAverage: summary.criticAverage, audienceAverage: summary.audienceAverage });
                setReviews(summary.reviews || []);
                setShowRatingPanel(false);
            } else if (targetStatus === 'watched') {
                setShowRatingPanel(true);
            }
        }
        setIsSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-2 border-[var(--border-subtle)] border-t-yellow-400 animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">Decrypting Archive Data</p>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center gap-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--foreground)]">404: Archive Not Found</h1>
            <Link href="/browse" className="text-blue-500 font-black uppercase tracking-widest text-[10px] border-b border-blue-500 pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-all">
                Return to Browse
            </Link>
        </div>
    );

    const mediaIcon = data.mediaType === 'TV Show' ? <FaTv className="text-blue-500" /> : <FaFilm className="text-[var(--foreground)]" />;

    const isUnreleased = data.releaseDate && data.releaseDate !== "Unknown" ? new Date(data.releaseDate) > new Date() : false;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-yellow-400 selection:text-[var(--background)]">
            <Header />

            <main className="relative pt-24">

                {/* ═══════════════════════════════════════════════════
                    HERO — Uncut image, no overlays, content below
                ════════════════════════════════════════════════════ */}
                <section className="relative w-full max-w-[1920px] mx-auto border-b border-[var(--border-subtle)]">
                    
                    {/* Back button */}
                    <div className="absolute top-6 left-6 xl:left-12 z-20">
                        <Link
                            href="/browse"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--background)]/70 backdrop-blur-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all group shadow-xl"
                        >
                            <FaArrowLeft size={9} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Browse
                        </Link>
                    </div>

                    <div className="relative w-full aspect-video md:aspect-[21/9] max-h-[600px] bg-black overflow-hidden">
                        {data.backdropUrl ? (
                            <Image
                                src={data.backdropUrl}
                                alt={data.title}
                                fill
                                sizes="100vw"
                                className="object-contain"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center font-black uppercase tracking-widest text-[var(--muted-foreground)] bg-[var(--surface)]">No Image</div>
                        )}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════
                    TITLE SECTION
                ════════════════════════════════════════════════════ */}
                <section className="w-full px-6 xl:px-16 pt-12 max-w-[1920px] mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">
                            {mediaIcon} {data.mediaType}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400">Active Record</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-[-0.04em] uppercase leading-[0.88] text-[var(--foreground)] max-w-5xl">
                        {data.title}
                    </h1>
                    {data.tagline && (
                        <p className="mt-6 text-sm md:text-lg font-medium text-[var(--muted-foreground)] border-l-2 border-yellow-400 pl-4 max-w-2xl italic">
                            {data.tagline}
                        </p>
                    )}
                </section>

                {/* ═══════════════════════════════════════════════════
                    MAIN CONTENT GRID
                ════════════════════════════════════════════════════ */}
                <section className="w-full px-6 xl:px-16 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-8 space-y-14">

                        {/* SCORE STRIP */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
                            {[
                                { label: "Blitz Critics", value: stats.criticAverage, color: "text-yellow-500", icon: <FaStarHalf className="text-yellow-500" /> },
                                { label: "Blitz Audience", value: stats.audienceAverage, color: "text-blue-500", icon: <FaStar className="text-blue-500" /> },
                                { label: "Released", value: data.releaseDate.split("-")[0], color: "text-[var(--foreground)]", icon: <FaCalendarAlt className="text-[var(--muted-foreground)]" /> },
                                { label: "Runtime", value: data.runtime || "N/A", color: "text-[var(--foreground)]", icon: <FaClock className="text-[var(--muted-foreground)]" /> },
                            ].map(({ label, value, color, icon }) => (
                                <div key={label} className="bg-[var(--surface)] px-5 py-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                        {icon} {label}
                                    </div>
                                    <span className={`text-3xl font-black ${color} leading-none tracking-tighter`}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* OVERVIEW */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaTerminal className="text-blue-500 text-xs" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">Overview</h2>
                            </div>
                            <p className="text-base md:text-lg text-[var(--foreground)] leading-relaxed font-medium opacity-90">
                                {data.overview || "No summary available for this entry."}
                            </p>
                        </div>

                        {/* DETAILS ROW */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-[var(--border-subtle)]">
                            {data.studio && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                        <FaBuilding size={9} /> Studio
                                    </div>
                                    <p className="text-sm font-black text-[var(--foreground)]">{data.studio}</p>
                                </div>
                            )}
                            {data.seasons && data.seasons.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                        <FaLayerGroup size={9} /> Seasons
                                    </div>
                                    <p className="text-sm font-black text-[var(--foreground)]">{data.seasons.length} Seasons</p>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                    <FaLayerGroup size={9} /> Genres
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.genres.slice(0, 4).map(g => (
                                        <span key={g} className="px-2.5 py-1 bg-[var(--foreground)]/5 border border-[var(--border-subtle)] text-[9px] font-black uppercase tracking-wider text-[var(--foreground)]">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CREW & CAST SECTION */}
                        {(data.directors?.length || data.cast?.length) ? (
                            <div className="space-y-8 pt-8 border-t border-[var(--border-subtle)]">
                                {data.directors && data.directors.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)] flex items-center gap-2">
                                            <FaBuilding size={10} />
                                            {data.mediaType === "TV Show" ? "Creators / Exec Producers" : "Director"}
                                        </h2>
                                        <div className="flex flex-wrap gap-4">
                                            {data.directors.map(d => (
                                                <span key={d.id} className="text-sm font-black text-[var(--foreground)]">{d.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {data.cast && data.cast.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)] flex items-center gap-2">
                                            <FaLayerGroup size={10} /> Top Cast
                                        </h2>
                                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                                            {data.cast.map(c => (
                                                <div key={c.id} className="min-w-[100px] max-w-[100px] flex flex-col gap-2 snap-start group">
                                                    <div className="relative w-full aspect-[2/3] bg-[var(--surface)] overflow-hidden border border-[var(--border-subtle)]">
                                                        {c.profilePath ? (
                                                            <Image
                                                                src={c.profilePath}
                                                                alt={c.name}
                                                                fill
                                                                sizes="100px"
                                                                className="object-cover transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
                                                                <FaLayerGroup size={24} opacity={0.2} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black text-[var(--foreground)] leading-tight">{c.name}</p>
                                                        <p className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase line-clamp-2">{c.character}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* TV SHOW SEASON/EPISODE SELECTOR */}
                        {isLoggedIn && data.mediaType === 'TV Show' && (data.seasons || []).length > 0 && (
                            <div className="bg-[var(--surface)] border border-[var(--border-subtle)] p-5 flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[180px] space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Rate a Specific Season</p>
                                    <select
                                        value={selectedSeason === null ? "" : selectedSeason}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? null : Number(e.target.value);
                                            setSelectedSeason(val);
                                            setSelectedEpisode(null);
                                        }}
                                        className="w-full bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--foreground)] text-xs font-bold p-3 outline-none focus:border-yellow-500"
                                    >
                                        <option value="">Entire Series</option>
                                        {data.seasons?.map(s => (
                                            <option key={s.season_number} value={s.season_number}>
                                                Season {s.season_number} {s.name && s.name !== `Season ${s.season_number}` ? `(${s.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedSeason !== null && (
                                    <div className="flex-1 min-w-[180px] space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Rate a Specific Episode</p>
                                        <select
                                            value={selectedEpisode === null ? "" : selectedEpisode}
                                            onChange={(e) => setSelectedEpisode(e.target.value === "" ? null : Number(e.target.value))}
                                            className="w-full bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--foreground)] text-xs font-bold p-3 outline-none focus:border-yellow-500"
                                        >
                                            <option value="">Entire Season</option>
                                            {[...Array(data.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 0)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STATUS + RATING PANEL */}
                        {isLoggedIn && (
                            <div className="space-y-3">
                                {isUnreleased ? (
                                    <div className="p-5 border border-yellow-400/20 bg-yellow-400/5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-1">
                                            Not Yet Released
                                        </p>
                                        <p className="text-sm font-medium text-[var(--foreground)] mb-5">
                                            Releases on {new Date(data.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <button onClick={() => handleStatus('watchlist')} disabled={isSubmitting}
                                            className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${userStatus === 'watchlist' ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-transparent border-[var(--border-subtle)] text-[var(--foreground)] hover:border-yellow-400 hover:text-yellow-400'}`}>
                                            <FaBookmark size={10} />
                                            Watchlist
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Status buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => handleStatus('watchlist')} disabled={isSubmitting}
                                                className={`flex-1 min-w-[130px] py-3.5 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${userStatus === 'watchlist' ? 'bg-yellow-500 border-yellow-500 text-[var(--background)]' : 'bg-transparent border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:border-yellow-500 hover:text-yellow-500'}`}>
                                                <FaBookmark size={10} /> Watchlist
                                            </button>
                                            <button onClick={() => handleStatus('watched')} disabled={isSubmitting}
                                                className={`flex-1 min-w-[130px] py-3.5 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-all ${userStatus === 'watched' ? 'bg-blue-500 border-blue-500 text-[var(--background)]' : 'bg-transparent border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:border-blue-500 hover:text-blue-500'}`}>
                                                <FaCheck size={10} /> Watched
                                            </button>
                                        </div>

                                        {/* Rating panel - only when watched */}
                                        {userStatus === 'watched' && (
                                            <div className="border border-[var(--border-subtle)] bg-[var(--surface)]">
                                                {userRating && !showRatingPanel ? (
                                                    <div className="p-5 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-5">
                                                            <div className="flex flex-col items-center justify-center w-16 h-16 border border-yellow-500/30 bg-yellow-500/5 shrink-0">
                                                                <span className="text-2xl font-black text-yellow-500 leading-none">{userRating}</span>
                                                                <span className="text-[8px] font-black text-[var(--muted-foreground)] uppercase mt-1">/ 10</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-2">Your Rating</p>
                                                                <p className="text-sm font-medium text-[var(--foreground)] pr-4 break-words">
                                                                    {userReview ? `"${userReview.length > 60 ? userReview.substring(0, 60) + '...' : userReview}"` : "No review text provided."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => setShowRatingPanel(true)} className="w-10 h-10 flex shrink-0 items-center justify-center border border-[var(--border-subtle)] text-[var(--muted-foreground)] hover:text-yellow-500 hover:border-yellow-500 transition-colors">
                                                            <FaStar size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-6">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                                                                {userRating ? "Edit Your Rating" : "Score this"}
                                                            </h3>
                                                            {userRating && (
                                                                <button onClick={() => setShowRatingPanel(false)} className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-center gap-1 md:gap-2 mb-8 bg-[var(--background)] p-4 border border-[var(--border-subtle)]">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                                                const isActive = hoverScore ? score <= hoverScore : userRating ? score <= userRating : false;
                                                                return (
                                                                    <button
                                                                        key={score}
                                                                        onMouseEnter={() => setHoverScore(score)}
                                                                        onMouseLeave={() => setHoverScore(null)}
                                                                        onClick={() => handleRate(score)}
                                                                        disabled={isSubmitting}
                                                                        className={`text-2xl md:text-3xl transition-all duration-150 ${isActive ? "text-yellow-500 scale-110" : "text-[var(--border-subtle)] hover:text-[var(--muted-foreground)]"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                                                        <FaStar />
                                                                    </button>
                                                                );
                                                            })}
                                                            <span className="ml-2 text-3xl font-black text-[var(--foreground)] tabular-nums w-10">
                                                                {hoverScore || userRating || "–"}
                                                            </span>
                                                        </div>

                                                        {userRating && (
                                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
                                                                <FaStarHalf /> Rating saved
                                                            </p>
                                                        )}

                                                        <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] space-y-3">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                                                Write a Review <span className="opacity-50">— optional</span>
                                                            </p>
                                                            <textarea
                                                                value={userReview}
                                                                onChange={(e) => setUserReview(e.target.value)}
                                                                placeholder="Share your thoughts..."
                                                                className="w-full bg-[var(--background)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-yellow-500 transition-colors min-h-[100px] resize-y"
                                                            />
                                                            <button onClick={handleReview} disabled={isSubmitting}
                                                                className="bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 hover:bg-yellow-500 transition-colors flex items-center gap-2 disabled:opacity-50">
                                                                <FaCheck size={10} /> Save Review
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* COMMUNITY REVIEWS */}
                        {reviews.length > 0 && (
                            <div className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
                                <div className="flex items-center gap-3">
                                    <FaQuoteLeft className="text-yellow-500 text-xs" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">Community Reviews</h2>
                                    <span className="ml-1 text-[10px] font-black text-[var(--muted-foreground)] bg-[var(--foreground)]/5 border border-[var(--border-subtle)] px-2 py-0.5">{reviews.length}</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="bg-[var(--surface)] border border-[var(--border-subtle)] p-5 group relative overflow-hidden hover:border-[var(--foreground)]/20 transition-colors">
                                            <div className="absolute top-0 left-0 w-0.5 h-full bg-yellow-500/30 group-hover:bg-yellow-500/70 transition-colors" />
                                            <div className="flex items-start justify-between mb-3 gap-3">
                                                <div>
                                                    <p className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider truncate max-w-[150px]">{rev.name}</p>
                                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{rev.role}</p>
                                                </div>
                                                {rev.rating && (
                                                    <div className="flex items-center gap-1 shrink-0 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1">
                                                        <FaStar size={9} className="text-yellow-500" />
                                                        <span className="text-[10px] font-black text-yellow-500">{rev.rating}/10</span>
                                                    </div>
                                                )}
                                            </div>
                                            {rev.review && (
                                                <p className="text-[12px] text-[var(--foreground)] leading-relaxed border-l-2 border-[var(--border-subtle)] pl-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    "{rev.review}"
                                                </p>
                                            )}
                                            <p className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest mt-4 text-right">
                                                {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN: POSTER + META ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            {/* Poster */}
                            <div className="relative group">
                                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500 z-20" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-yellow-500 z-20" />
                                {data.posterUrl ? (
                                    <div className="relative aspect-[2/3] w-full overflow-hidden border border-[var(--border-subtle)]">
                                        <Image
                                            src={data.posterUrl}
                                            alt={data.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[2/3] w-full bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                                        <span className="text-[var(--muted-foreground)] font-black uppercase tracking-widest text-xs">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Meta Card */}
                            <div className="bg-[var(--surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                                {[
                                    { label: "Type", value: data.mediaType },
                                    { label: "Released", value: data.releaseDate },
                                    { label: "Runtime", value: data.runtime || "N/A" },
                                    { label: "Studio", value: data.studio || "N/A" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="px-4 py-3 flex justify-between items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] shrink-0">{label}</span>
                                        <span className="text-[11px] font-bold text-[var(--foreground)] text-right truncate">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </section>

                {/* ═══════════════════════════════════════════════════
                    YOU MAY ALSO LIKE
                ════════════════════════════════════════════════════ */}
                {similarItems.length > 0 && (
                    <section className="px-6 xl:px-16 pb-24 border-t border-[var(--border-subtle)]">
                        <div className="flex items-end justify-between mb-10 pt-14">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-10 bg-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--muted-foreground)]">Discover More</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-[var(--foreground)]">
                                    You May <span className="text-yellow-500">Also Like</span>
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {similarItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/archives/${item.id}`}
                                    className="group relative flex flex-col border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--foreground)]/30 hover:-translate-y-1 transition-all duration-300 bg-[var(--surface)]"
                                >
                                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--background)]">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 12vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[var(--background)] flex items-center justify-center">
                                                <span className="text-[var(--border-subtle)] text-xs font-black uppercase">N/A</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-[var(--border-subtle)] flex-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1">{item.year}</p>
                                        <h3 className="text-[11px] font-black uppercase leading-tight text-[var(--foreground)] group-hover:text-yellow-500 transition-colors line-clamp-2">{item.title}</h3>
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-yellow-500 transition-all duration-500" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}