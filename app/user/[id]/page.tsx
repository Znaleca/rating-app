"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    FaStar, FaBookmark, FaCheck, FaGamepad, FaList,
    FaFilm, FaTv, FaShieldAlt, FaFeatherAlt, FaUserCircle,
    FaBolt, FaArrowRight, FaArrowLeft
} from "react-icons/fa";
import Header from "@/components/Header";
import { getPublicUserProfile } from "@/app/actions/ratings";

interface Interaction {
    id: string;
    media_id: string;
    rating: number | null;
    status: string | null;
    review: string | null;
    title: string | null;
    poster_url: string | null;
    media_type: string | null;
    created_at: string;
}

interface Profile {
    id: string;
    full_name: string;
    role: string;
}

type TabType = "all" | "rated" | "reviewed" | "watchlist" | "watched" | "to-play" | "played";

const STATUS_COLOR: Record<string, string> = {
    watchlist: "bg-yellow-400 text-black",
    watched:   "bg-blue-400 text-black",
    played:    "bg-green-400 text-black",
    "to-play": "bg-purple-400 text-black",
};

const MEDIA_ICON: Record<string, React.ElementType> = {
    Movie:    FaFilm,
    "TV Show": FaTv,
    Game:     FaGamepad,
};

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    admin:    { label: "Admin",    icon: FaShieldAlt,  color: "text-violet-400",  bg: "bg-violet-400" },
    critics:  { label: "Critic",   icon: FaFeatherAlt, color: "text-yellow-400",  bg: "bg-yellow-400" },
    audience: { label: "Audience", icon: FaUserCircle, color: "text-blue-400",    bg: "bg-blue-400" },
};

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "all",       label: "All",       icon: FaBolt },
    { id: "rated",     label: "Rated",     icon: FaStar },
    { id: "reviewed",  label: "Reviews",   icon: FaFeatherAlt },
    { id: "watched",   label: "Watched",   icon: FaCheck },
    { id: "watchlist", label: "Watchlist", icon: FaBookmark },
    { id: "to-play",   label: "To Play",   icon: FaList },
    { id: "played",    label: "Played",    icon: FaGamepad },
];

export default function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("all");

    useEffect(() => {
        async function load() {
            const res = await getPublicUserProfile(id);
            if ("error" in res) {
                setNotFound(true);
            } else {
                setProfile(res.profile as Profile);
                setInteractions(res.interactions as Interaction[]);
            }
            setLoading(false);
        }
        load();
    }, [id]);

    const counts = useMemo(() => ({
        all:       interactions.length,
        rated:     interactions.filter(i => i.rating !== null).length,
        reviewed:  interactions.filter(i => i.review && i.review.trim() !== "").length,
        watchlist: interactions.filter(i => i.status === "watchlist").length,
        watched:   interactions.filter(i => i.status === "watched").length,
        "to-play": interactions.filter(i => i.status === "to-play").length,
        played:    interactions.filter(i => i.status === "played").length,
    }), [interactions]);

    const avgRating = useMemo(() => {
        const rated = interactions.filter(i => i.rating !== null);
        if (!rated.length) return null;
        return (rated.reduce((sum, i) => sum + (i.rating ?? 0), 0) / rated.length).toFixed(1);
    }, [interactions]);

    const filteredItems = useMemo(() => {
        return interactions.filter(item => {
            if (activeTab === "all")       return true;
            if (activeTab === "rated")     return item.rating !== null;
            if (activeTab === "reviewed")  return item.review && item.review.trim() !== "";
            if (activeTab === "watchlist") return item.status === "watchlist";
            if (activeTab === "watched")   return item.status === "watched";
            if (activeTab === "to-play")   return item.status === "to-play";
            if (activeTab === "played")    return item.status === "played";
            return false;
        });
    }, [interactions, activeTab]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
            <div className="w-10 h-10 border-2 border-white/5 border-t-yellow-400 animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-600">Loading Profile</p>
        </div>
    );

    if (notFound) return (
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
            <Header />
            <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
                <FaUserCircle size={48} className="text-slate-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">User not found</p>
                <Link href="/search" className="text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-colors flex items-center gap-2">
                    <FaArrowLeft size={8} /> Back to Search
                </Link>
            </div>
        </div>
    );

    const roleCfg = ROLE_CONFIG[profile?.role ?? "audience"];
    const RoleIcon = roleCfg.icon;
    const initials = (profile?.full_name || "U").substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-yellow-400 selection:text-black">
            <Header />

            <main className="w-full px-6 xl:px-16 py-16 pt-28">

                {/* Back link */}
                <Link href="/search" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-yellow-400 transition-colors mb-12">
                    <FaArrowLeft size={8} /> Back to Search
                </Link>

                {/* ─── PROFILE HERO ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 pb-16 border-b border-white/5">

                    {/* Left: Identity */}
                    <div className="lg:col-span-7 flex items-start gap-8">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-slate-400 select-none">
                                {initials}
                            </div>
                            {/* Role badge */}
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center ${roleCfg.bg}`}>
                                <RoleIcon size={10} className="text-black" />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">Public Archive</p>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none mb-3">
                                {profile?.full_name}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] ${roleCfg.color}`}>
                                    <RoleIcon size={9} /> {roleCfg.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { label: "Total",    value: counts.all,    color: "text-white" },
                            { label: "Rated",    value: counts.rated,  color: "text-yellow-400" },
                            { label: "Watched",  value: counts.watched + counts.played, color: "text-green-400" },
                            { label: "Avg Score",value: avgRating ?? "—", color: "text-blue-400" },
                        ].map(s => (
                            <div key={s.label} className="border border-white/5 bg-white/[0.02] p-5">
                                <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── TABS ─── */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? "bg-yellow-400 text-black"
                                    : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5"
                            }`}
                        >
                            <tab.icon size={10} />
                            {tab.label}
                            <span className={`ml-1 text-[8px] font-black tabular-nums ${activeTab === tab.id ? "text-black/60" : "text-slate-700"}`}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ─── CONTENT ─── */}
                {filteredItems.length === 0 ? (
                    <div className="py-32 text-center border border-dashed border-white/5">
                        <FaBolt className="mx-auto text-3xl text-slate-800 mb-4" />
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">No Records Found</p>
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
                                    className="group flex items-start gap-5 border border-white/5 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                                >
                                    <div className="relative w-14 h-20 shrink-0 overflow-hidden bg-white/5 border border-white/10">
                                        {item.poster_url ? (
                                            <Image src={item.poster_url} alt={item.title || ""} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <MediaIcon size={14} className="text-slate-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{item.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <MediaIcon size={8} className="text-slate-600" />
                                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{item.media_type}</span>
                                                    {item.status && (
                                                        <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${STATUS_COLOR[item.status] ?? "bg-white/10 text-white"}`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {item.rating !== null && (
                                                <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 border border-yellow-400/20 bg-yellow-400/5">
                                                    <span className="text-xl font-black text-yellow-400 leading-none">{item.rating}</span>
                                                    <span className="text-[7px] text-slate-600 font-bold">/10</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-l-2 border-yellow-400/20 pl-4 mt-3">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1.5 flex items-center gap-2">
                                                <FaFeatherAlt size={7} className="text-yellow-400" /> Their Review
                                            </p>
                                            <p className="text-slate-300 text-sm leading-relaxed italic">"{item.review}"</p>
                                        </div>
                                        <p className="text-[8px] text-slate-700 font-bold mt-3 text-right">
                                            {new Date(item.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <FaArrowRight size={10} className="text-slate-700 group-hover:text-yellow-400 transition-colors shrink-0 mt-1" />
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
                                    className="group relative aspect-[2/3] block overflow-hidden bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                                >
                                    {item.poster_url ? (
                                        <Image src={item.poster_url} alt={item.title || "Unknown"} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                                            <span className="text-slate-700 font-black uppercase text-[10px] leading-tight">{item.title}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    {item.rating !== null && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 border border-yellow-400/30">
                                            <FaStar size={7} className="text-yellow-400" />
                                            <span className="text-[9px] font-black text-yellow-400">{item.rating}</span>
                                        </div>
                                    )}
                                    {item.status && item.status !== "watchlist" && (
                                        <div className={`absolute top-2 left-2 px-2 py-1 text-[7px] font-black uppercase tracking-widest ${STATUS_COLOR[item.status] ?? "bg-white/10 text-white"}`}>
                                            {item.status}
                                        </div>
                                    )}
                                    {item.status === "watchlist" && (
                                        <div className="absolute top-2 left-2">
                                            <FaBookmark size={10} className="text-yellow-400 drop-shadow-lg" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-[9px] font-black text-white uppercase leading-tight line-clamp-2 mb-1">{item.title}</p>
                                        <div className="flex items-center gap-1.5">
                                            <MediaIcon size={7} className="text-slate-500" />
                                            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{item.media_type}</span>
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
