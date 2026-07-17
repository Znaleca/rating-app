"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    FaUser, FaStar, FaBookmark, FaCheck,
    FaFilm, FaTv, FaShieldAlt, FaFeatherAlt, FaUserCircle,
    FaBolt, FaArrowRight
} from "react-icons/fa";
import Header from "@/components/Header";
import { getUserInteractions } from "@/app/actions/ratings";
import { createClient } from "@/lib/supabase/client";

interface Interaction {
    id: string;
    media_id: string;
    rating: number | null;
    status: string | null;
    review: string | null;
    title: string | null;
    poster_url: string | null;
    media_type: string | null;
    genre: string | null;
    created_at: string;
}

type TabType = "all" | "rated" | "reviewed" | "watchlist" | "watched";

const STATUS_COLOR: Record<string, string> = {
    watchlist: "bg-yellow-400 text-black",
    watched:   "bg-blue-400 text-black",
};

const MEDIA_ICON: Record<string, React.ElementType> = {
    Movie:    FaFilm,
    "TV Show": FaTv,
};

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    admin:    { label: "Admin",    icon: FaShieldAlt,  color: "text-violet-400" },
    critics:  { label: "Critics",  icon: FaFeatherAlt, color: "text-yellow-400" },
    audience: { label: "Audience", icon: FaUserCircle, color: "text-blue-400" },
};

export default function ProfilePage() {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("All");
    const [genreFilter, setGenreFilter] = useState<string>("All Genres");
    const [profile, setProfile] = useState<{ name: string; role: string; email: string } | null>(null);

    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        async function fetchData() {
            // Fetch user profile info
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: prof } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", session.user.id)
                    .single();
                setProfile({
                    name: prof?.full_name || session.user.email?.split("@")[0] || "User",
                    role: prof?.role || "audience",
                    email: session.user.email || "",
                });
            }

            // Fetch all interactions
            const res = await getUserInteractions();
            if (res.items) setInteractions(res.items as Interaction[]);
            setLoading(false);
        }
        fetchData();
    }, [supabase]);

    const counts = useMemo(() => ({
        all:       interactions.length,
        rated:     interactions.filter(i => i.rating !== null).length,
        reviewed:  interactions.filter(i => i.review && i.review.trim() !== "").length,
        watchlist: interactions.filter(i => i.status === "watchlist").length,
        watched:   interactions.filter(i => i.status === "watched").length,
    }), [interactions]);

    const avgRating = useMemo(() => {
        const rated = interactions.filter(i => i.rating !== null);
        if (!rated.length) return null;
        return (rated.reduce((sum, i) => sum + (i.rating ?? 0), 0) / rated.length).toFixed(1);
    }, [interactions]);

    const availableGenres = useMemo(() => {
        const genres = Array.from(new Set(
            interactions
                .filter(i => mediaTypeFilter === "All" || i.media_type === mediaTypeFilter)
                .map(i => i.genre)
                .filter(Boolean)
        )).sort();
        return genres as string[];
    }, [interactions, mediaTypeFilter]);

    const filteredItems = useMemo(() => {
        let items = interactions;
        
        // Filter by media type
        if (mediaTypeFilter !== "All") {
            items = items.filter(item => item.media_type === mediaTypeFilter);
        }

        // Filter by genre
        if (genreFilter !== "All Genres") {
            items = items.filter(item => item.genre === genreFilter);
        }

        // Filter by tab
        return items.filter(item => {
            if (activeTab === "all")       return true;
            if (activeTab === "rated")     return item.rating !== null;
            if (activeTab === "reviewed")  return item.review && item.review.trim() !== "";
            if (activeTab === "watchlist") return item.status === "watchlist";
            if (activeTab === "watched")   return item.status === "watched";
            return false;
        });
    }, [interactions, activeTab, mediaTypeFilter, genreFilter]);

    // Import FaPencilAlt inline since we already have FaFeatherAlt
    const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: "all",       label: "All",       icon: FaBolt },
        { id: "rated",     label: "Rated",     icon: FaStar },
        { id: "reviewed",  label: "Reviews",   icon: FaFeatherAlt },
        { id: "watched",   label: "Watched",   icon: FaCheck },
        { id: "watchlist", label: "Watchlist", icon: FaBookmark },
    ];

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6">
            <div className="w-10 h-10 border-2 border-[var(--border-subtle)] border-t-yellow-400 animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">Loading Profile</p>
        </div>
    );

    const roleCfg = ROLE_CONFIG[profile?.role ?? "audience"];
    const RoleIcon = roleCfg.icon;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-yellow-400 selection:text-[var(--background)]">
            <Header />

            <main className="w-full px-6 xl:px-16 pt-28 pb-12 max-w-7xl mx-auto">

                {/* ─── PROFILE HERO ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 pb-16 border-b border-[var(--border-subtle)]">

                    {/* Left: Identity */}
                    <div className="lg:col-span-7 flex items-start gap-8">
                        {/* Avatar  */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 bg-[var(--foreground)]/5 border border-[var(--border-subtle)] flex items-center justify-center text-3xl font-black text-[var(--muted-foreground)] select-none">
                                {(profile?.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                            {/* Role dot */}
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center ${
                                profile?.role === "admin" ? "bg-violet-400" : profile?.role === "critics" ? "bg-yellow-400" : "bg-blue-400"
                            }`}>
                                <RoleIcon size={10} className="text-[var(--background)]" />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)] mb-2">Personal Archive</p>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[var(--foreground)] leading-none mb-3">
                                {profile?.name}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] ${roleCfg.color}`}>
                                    <RoleIcon size={9} /> {roleCfg.label}
                                </span>
                                {profile?.email && (
                                    <>
                                        <span className="text-[var(--muted-foreground)]">·</span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium">{profile?.email}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { label: "Total",    value: counts.all,    color: "text-[var(--foreground)]" },
                            { label: "Rated",    value: counts.rated,  color: "text-yellow-400" },
                            { label: "Watched",  value: counts.watched, color: "text-green-400" },
                            { label: "Avg Score",value: avgRating ?? "—", color: "text-blue-400" },
                        ].map(s => (
                            <div key={s.label} className="border border-[var(--border-subtle)] bg-[var(--foreground)]/[0.02] p-5">
                                <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── TABS & FILTERS ─── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id
                                        ? "bg-yellow-400 text-black"
                                        : "bg-[var(--foreground)]/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 border border-[var(--border-subtle)]"
                                }`}
                            >
                                <tab.icon size={10} />
                                {tab.label}
                                <span className={`ml-1 text-[8px] font-black tabular-nums ${activeTab === tab.id ? "text-[var(--background)]/60" : "text-[var(--muted-foreground)]"}`}>
                                    {counts[tab.id]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center shrink-0 border border-[var(--border-subtle)] bg-[var(--foreground)]/[0.02]">
                        <span className="px-4 text-[9px] font-black uppercase tracking-widest text-blue-400">Type</span>
                        <select 
                            value={mediaTypeFilter} 
                            onChange={(e) => { setMediaTypeFilter(e.target.value); setGenreFilter("All Genres"); }}
                            className="bg-transparent text-[var(--foreground)] text-xs font-black uppercase tracking-widest py-3 px-4 focus:outline-none appearance-none cursor-pointer border-l border-[var(--border-subtle)]"
                        >
                            <option value="All" className="bg-[var(--background)]">All</option>
                            <option value="Movie" className="bg-[var(--background)]">Movies</option>
                            <option value="TV Show" className="bg-[var(--background)]">TV Shows</option>
                        </select>
                    </div>

                    {availableGenres.length > 0 && (
                        <div className="flex items-center shrink-0 border border-[var(--border-subtle)] bg-[var(--foreground)]/[0.02]">
                            <span className="px-4 text-[9px] font-black uppercase tracking-widest text-yellow-400">Genre</span>
                            <select 
                                value={genreFilter} 
                                onChange={(e) => setGenreFilter(e.target.value)}
                                className="bg-transparent text-[var(--foreground)] text-xs font-black uppercase tracking-widest py-3 px-4 focus:outline-none appearance-none cursor-pointer border-l border-[var(--border-subtle)]"
                            >
                                <option value="All Genres" className="bg-[var(--background)]">All Genres</option>
                                {availableGenres.map(g => (
                                    <option key={g} value={g} className="bg-[var(--background)]">{g}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* ─── CONTENT ─── */}
                {filteredItems.length === 0 ? (
                    <div className="py-32 text-center border border-dashed border-[var(--border-subtle)]">
                        <FaBolt className="mx-auto text-3xl text-[var(--foreground)] mb-4" />
                        <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.5em]">No Records Found</p>
                        <Link href="/browse" className="mt-6 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-[var(--foreground)] transition-colors">
                            Browse Media <FaArrowRight size={8} />
                        </Link>
                    </div>
                ) : activeTab === "reviewed" ? (
                    /* ── REVIEW LIST VIEW ── */
                    <div className="flex flex-col gap-4">
                        {filteredItems.map(item => {
                            const MediaIcon = MEDIA_ICON[item.media_type ?? ""] ?? FaFilm;
                            return (
                                <Link
                                    href={`/archives/${item.media_id}`}
                                    key={item.id}
                                    className="group flex items-start gap-5 border border-[var(--border-subtle)] bg-[var(--foreground)]/[0.02] p-5 hover:border-[var(--border-subtle)] hover:bg-[var(--foreground)]/[0.04] transition-all duration-300"
                                >
                                    {/* Poster thumbnail */}
                                    <div className="relative w-14 h-20 shrink-0 overflow-hidden bg-[var(--foreground)]/5 border border-[var(--border-subtle)]">
                                        {item.poster_url ? (
                                            <Image
                                                src={item.poster_url}
                                                alt={item.title || ""}
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <MediaIcon size={14} className="text-[var(--muted-foreground)]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight leading-none mb-1">{item.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <MediaIcon size={8} className="text-[var(--muted-foreground)]" />
                                                    <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{item.media_type}</span>
                                                    {item.status && (
                                                        <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${STATUS_COLOR[item.status] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)]"}`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {item.rating !== null && (
                                                <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 border border-yellow-400/20 bg-yellow-400/5">
                                                    <span className="text-xl font-black text-yellow-400 leading-none">{item.rating}</span>
                                                    <span className="text-[7px] text-[var(--muted-foreground)] font-bold">/10</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Review text */}
                                        <div className="border-l-2 border-yellow-400/20 pl-4 mt-3">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1.5 flex items-center gap-2">
                                                <FaFeatherAlt size={7} className="text-yellow-400" /> Your Review
                                            </p>
                                            <p className="text-[var(--foreground)] text-sm leading-relaxed italic">"{item.review}"</p>
                                        </div>

                                        <p className="text-[8px] text-[var(--muted-foreground)] font-bold mt-3 text-right">
                                            {new Date(item.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <FaArrowRight size={10} className="text-[var(--muted-foreground)] group-hover:text-yellow-400 transition-colors shrink-0 mt-1" />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* ── POSTER GRID VIEW ── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                        {filteredItems.map(item => {
                            const MediaIcon = MEDIA_ICON[item.media_type ?? ""] ?? FaFilm;
                            return (
                                <Link
                                    href={`/archives/${item.media_id}`}
                                    key={item.id}
                                    className="group relative aspect-[2/3] block overflow-hidden bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all duration-500 hover:-translate-y-1"
                                >
                                    {/* Poster */}
                                    {item.poster_url ? (
                                        <Image
                                            src={item.poster_url}
                                            alt={item.title || "Unknown"}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                                            <span className="text-[var(--muted-foreground)] font-black uppercase text-[10px] leading-tight">{item.title}</span>
                                        </div>
                                    )}
                                    {/* Gradient — only on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {item.rating !== null && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 border border-yellow-400/30">
                                            <FaStar size={7} className="text-yellow-400" />
                                            <span className="text-[9px] font-black text-yellow-400">{item.rating}</span>
                                        </div>
                                    )}
                                    {item.status && item.status !== "watchlist" && (
                                        <div className={`absolute top-2 left-2 px-2 py-1 text-[7px] font-black uppercase tracking-widest ${STATUS_COLOR[item.status] ?? "bg-[var(--foreground)]/10 text-[var(--foreground)]"}`}>
                                            {item.status}
                                        </div>
                                    )}
                                    {item.status === "watchlist" && (
                                        <div className="absolute top-2 left-2">
                                            <FaBookmark size={10} className="text-yellow-400 drop-shadow-lg" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <p className="text-[9px] font-black text-white uppercase leading-tight line-clamp-2 mb-1">{item.title}</p>
                                        <div className="flex items-center gap-1.5">
                                            <MediaIcon size={7} className="text-white/60" />
                                            <span className="text-[7px] font-bold text-white/60 uppercase tracking-widest">{item.media_type}</span>
                                            {item.review && item.review.trim() !== "" && (
                                                <>
                                                    <span className="text-white/40">·</span>
                                                    <span className="text-[7px] font-bold text-yellow-400 uppercase tracking-widest">Reviewed</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-yellow-400 transition-all duration-500" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
