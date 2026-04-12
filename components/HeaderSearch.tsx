"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaSearch, FaSpinner, FaFilm, FaTv, FaGamepad,
    FaFire, FaChevronRight, FaTimes, FaUser,
    FaShieldAlt, FaFeatherAlt, FaUserCircle
} from "react-icons/fa";
import { searchUsers } from "@/app/actions/ratings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaResult {
    id: string;
    title: string;
    year?: string;
    imageUrl?: string;
    type: "movie" | "tv" | "game";
}

interface UserResult {
    id: string;
    full_name: string;
    role: string;
}

interface TMDBItem {
    id: number;
    media_type: "movie" | "tv";
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
}

interface RAWGItem {
    id: number;
    name: string;
    released?: string;
    background_image?: string;
}

type SearchTab = "media" | "users";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildArchiveId(item: MediaResult): string {
    if (item.type === "game")  return `game-${item.id.replace("search-game-", "").replace("trend-game-", "")}`;
    if (item.type === "movie") return `movie-${item.id.replace("search-movie-", "").replace("trend-movie-", "")}`;
    return `show-${item.id.replace("search-tv-", "").replace("trend-tv-", "")}`;
}

const TYPE_ICON = { movie: FaFilm, tv: FaTv, game: FaGamepad };

const TYPE_COLOR: Record<string, string> = {
    movie: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    tv:    "text-green-400 border-green-400/30 bg-green-400/5",
    game:  "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
};

const ROLE_UI: Record<string, { label: string; icon: React.ElementType; color: string; dot: string }> = {
    admin:    { label: "Admin",    icon: FaShieldAlt,  color: "text-violet-400", dot: "bg-violet-400" },
    critics:  { label: "Critic",   icon: FaFeatherAlt, color: "text-yellow-400", dot: "bg-yellow-400" },
    audience: { label: "Audience", icon: FaUserCircle, color: "text-blue-400",   dot: "bg-blue-400"   },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeaderSearch() {
    const router     = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef   = useRef<HTMLInputElement>(null);

    const [query,       setQuery]       = useState("");
    const [activeTab,   setActiveTab]   = useState<SearchTab>("media");
    const [results,     setResults]     = useState<MediaResult[]>([]);
    const [userResults, setUserResults] = useState<UserResult[]>([]);
    const [trending,    setTrending]    = useState<MediaResult[]>([]);
    const [loading,     setLoading]     = useState(false);
    const [open,        setOpen]        = useState(false);

    // ── Fetch trending media on mount ────────────────────────────────────────
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

                const [tmdb, rawg] = await Promise.all([
                    tmdbKey
                        ? fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${tmdbKey}`)
                            .then(r => r.json())
                            .then(d => (d.results || [])
                                .filter((i: TMDBItem) => i.media_type === "movie" || i.media_type === "tv")
                                .slice(0, 5)
                                .map((i: TMDBItem) => ({
                                    id: `trend-${i.media_type}-${i.id}`,
                                    title: i.title || i.name || "",
                                    year: (i.release_date || i.first_air_date || "").split("-")[0],
                                    imageUrl: i.poster_path ? `https://image.tmdb.org/t/p/w92${i.poster_path}` : undefined,
                                    type: i.media_type,
                                }))
                            ).catch(() => [])
                        : [],
                    rawgKey
                        ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=3`)
                            .then(r => r.json())
                            .then(d => (d.results || []).map((g: RAWGItem) => ({
                                id: `trend-game-${g.id}`,
                                title: g.name,
                                year: g.released?.split("-")[0],
                                imageUrl: g.background_image || undefined,
                                type: "game" as const,
                            })))
                            .catch(() => [])
                        : [],
                ]);

                if (alive) setTrending([...tmdb, ...rawg].sort(() => 0.5 - Math.random()).slice(0, 7));
            } catch {}
        })();
        return () => { alive = false; };
    }, []);

    // ── Live media search ────────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab !== "media") return;
        if (!query.trim()) { setResults([]); return; }

        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
                const q = encodeURIComponent(query);

                const [tmdb, rawg] = await Promise.all([
                    tmdbKey
                        ? fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${q}`)
                            .then(r => r.json())
                            .then(d => (d.results || [])
                                .filter((i: TMDBItem) => i.media_type === "movie" || i.media_type === "tv")
                                .slice(0, 5)
                                .map((i: TMDBItem) => ({
                                    id: `search-${i.media_type}-${i.id}`,
                                    title: i.title || i.name || "",
                                    year: (i.release_date || i.first_air_date || "").split("-")[0],
                                    imageUrl: i.poster_path ? `https://image.tmdb.org/t/p/w92${i.poster_path}` : undefined,
                                    type: i.media_type,
                                })))
                            .catch(() => [])
                        : [],
                    rawgKey
                        ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${q}&page_size=4`)
                            .then(r => r.json())
                            .then(d => (d.results || []).map((g: RAWGItem) => ({
                                id: `search-game-${g.id}`,
                                title: g.name,
                                year: g.released?.split("-")[0],
                                imageUrl: g.background_image || undefined,
                                type: "game" as const,
                            })))
                            .catch(() => [])
                        : [],
                ]);

                setResults([...tmdb, ...rawg].slice(0, 9));
            } catch {}
            finally { setLoading(false); }
        }, 280);

        return () => clearTimeout(t);
    }, [query, activeTab]);

    // ── Live user search ─────────────────────────────────────────────────────
    useEffect(() => {
        if (activeTab !== "users") return;
        if (!query.trim()) { setUserResults([]); return; }

        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchUsers(query);
                setUserResults((res.users || []) as UserResult[]);
            } catch {}
            finally { setLoading(false); }
        }, 280);

        return () => clearTimeout(t);
    }, [query, activeTab]);

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        if (activeTab === "media") {
            router.push(`/search?q=${encodeURIComponent(q)}`);
        }
        setQuery("");
        setOpen(false);
    }

    // Switch tab resets results but keeps query
    function switchTab(tab: SearchTab) {
        setActiveTab(tab);
        setResults([]);
        setUserResults([]);
    }

    const mediaDisplay = query.trim() ? results : trending;

    return (
        <div ref={wrapperRef} className="relative hidden lg:block">

            {/* ── Input ──────────────────────────────────────────────────── */}
            <form
                onSubmit={handleSubmit}
                className={`flex items-center gap-2 px-3 py-2 border transition-all duration-200 ${
                    open
                        ? activeTab === "users"
                            ? "border-blue-400/40 bg-white/[0.05] w-72"
                            : "border-yellow-400/40 bg-white/[0.05] w-72"
                        : "border-white/5 bg-white/[0.02] w-52"
                }`}
            >
                {loading
                    ? <FaSpinner size={10} className="text-yellow-400 animate-spin shrink-0" />
                    : activeTab === "users"
                        ? <FaUser size={10} className={`shrink-0 transition-colors ${open ? "text-blue-400" : "text-slate-600"}`} />
                        : <FaSearch size={10} className={`shrink-0 transition-colors ${open ? "text-yellow-400" : "text-slate-600"}`} />
                }
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder={activeTab === "users" ? "Search users…" : "Search archives…"}
                    className="flex-1 bg-transparent text-[11px] font-medium text-white placeholder-slate-600 outline-none min-w-0"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                        className="text-slate-600 hover:text-white transition-colors shrink-0"
                    >
                        <FaTimes size={9} />
                    </button>
                )}
            </form>

            {/* ── Dropdown ──────────────────────────────────────────────── */}
            {open && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-[#090909] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] z-[100] overflow-hidden">

                    {/* Tab switcher */}
                    <div className="flex border-b border-white/5">
                        <button
                            type="button"
                            onClick={() => switchTab("media")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
                                activeTab === "media"
                                    ? "text-yellow-400 bg-yellow-400/5 border-b-2 border-yellow-400"
                                    : "text-slate-600 hover:text-slate-400"
                            }`}
                        >
                            <FaFilm size={8} /> Media
                        </button>
                        <button
                            type="button"
                            onClick={() => switchTab("users")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
                                activeTab === "users"
                                    ? "text-blue-400 bg-blue-400/5 border-b-2 border-blue-400"
                                    : "text-slate-600 hover:text-slate-400"
                            }`}
                        >
                            <FaUser size={8} /> Users
                        </button>
                    </div>

                    {/* Status bar */}
                    <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 bg-white/[0.02]">
                        {activeTab === "media" ? (
                            query.trim() ? (
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse inline-block" />
                                    Live Results
                                </span>
                            ) : (
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-1.5">
                                    <FaFire size={8} className="text-yellow-400" /> Trending
                                </span>
                            )
                        ) : (
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-1.5">
                                <FaUser size={8} className="text-blue-400" />
                                {query.trim() ? "User Search" : "Type a name…"}
                            </span>
                        )}
                        <span className="text-[8px] font-bold text-slate-700">
                            {activeTab === "media" ? `${mediaDisplay.length} results` : `${userResults.length} users`}
                        </span>
                    </div>

                    {/* ── Media results ──────────────────────────────────── */}
                    {activeTab === "media" && (
                        <ul className="max-h-[400px] overflow-y-auto">
                            {mediaDisplay.length > 0 ? mediaDisplay.map(item => {
                                const Icon      = TYPE_ICON[item.type];
                                const archiveId = buildArchiveId(item);
                                return (
                                    <li key={item.id} className="border-b border-white/[0.03] last:border-0">
                                        <Link
                                            href={`/archives/${archiveId}`}
                                            onClick={() => { setOpen(false); setQuery(""); }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors group"
                                        >
                                            <div className="relative w-9 h-14 shrink-0 bg-white/5 border border-white/5 overflow-hidden">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        sizes="36px"
                                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Icon size={12} className="text-slate-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-200 group-hover:text-white truncate uppercase tracking-tight transition-colors">
                                                    {item.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${TYPE_COLOR[item.type]}`}>
                                                        {item.type === "tv" ? "TV Show" : item.type}
                                                    </span>
                                                    {item.year && (
                                                        <span className="text-[9px] text-slate-600 font-bold">{item.year}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <FaChevronRight size={8} className="text-slate-700 group-hover:text-yellow-400 transition-colors shrink-0" />
                                        </Link>
                                    </li>
                                );
                            }) : (
                                <div className="py-10 text-center">
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">No results found</p>
                                </div>
                            )}
                        </ul>
                    )}

                    {/* ── User results ───────────────────────────────────── */}
                    {activeTab === "users" && (
                        <ul className="max-h-[400px] overflow-y-auto">
                            {!query.trim() ? (
                                <div className="py-10 text-center">
                                    <FaUser size={20} className="mx-auto text-slate-800 mb-3" />
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Type a name to find users</p>
                                </div>
                            ) : userResults.length > 0 ? userResults.map(user => {
                                const cfg      = ROLE_UI[user.role] ?? ROLE_UI["audience"];
                                const RoleIcon = cfg.icon;
                                const initials = (user.full_name || "U").substring(0, 2).toUpperCase();
                                return (
                                    <li key={user.id} className="border-b border-white/[0.03] last:border-0">
                                        <Link
                                            href={`/user/${user.id}`}
                                            onClick={() => { setOpen(false); setQuery(""); }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors group"
                                        >
                                            {/* Avatar */}
                                            <div className="relative w-9 h-9 shrink-0 bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 select-none">
                                                {initials}
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center ${cfg.dot}`}>
                                                    <RoleIcon size={6} className="text-black" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-200 group-hover:text-white truncate uppercase tracking-tight transition-colors">
                                                    {user.full_name}
                                                </p>
                                                <span className={`text-[7px] font-black uppercase tracking-widest ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            <FaChevronRight size={8} className="text-slate-700 group-hover:text-blue-400 transition-colors shrink-0" />
                                        </Link>
                                    </li>
                                );
                            }) : (
                                <div className="py-10 text-center">
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">No users found</p>
                                </div>
                            )}
                        </ul>
                    )}

                    {/* Footer */}
                    {activeTab === "media" && query.trim() && (
                        <button
                            onClick={handleSubmit as any}
                            className="w-full px-4 py-3 bg-white/[0.02] border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                        >
                            <FaSearch size={8} /> See all results for "{query}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
