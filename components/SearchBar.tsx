"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaSpinner, FaFilm, FaTv, FaGamepad, FaKey, FaFire } from 'react-icons/fa';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaResult {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    type: 'movie' | 'tv' | 'game';
}

interface TMDBItem {
    id: number;
    media_type: 'movie' | 'tv';
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

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MediaResult[]>([]);
    const [trendingResults, setTrendingResults] = useState<MediaResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [missingApiKey, setMissingApiKey] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch trending data (Logic remains the same)
    useEffect(() => {
        let isMounted = true;
        const fetchTrending = async () => {
            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

                const fetchTmdb = tmdbKey
                    ? fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${tmdbKey}`)
                        .then(res => res.json())
                        .then(data => {
                            if (!data.results) return [];
                            return data.results
                                .filter((item: TMDBItem) => item.media_type === 'movie' || item.media_type === 'tv')
                                .slice(0, 3)
                                .map((item: TMDBItem) => ({
                                    id: `trend-${item.media_type}-${item.id}`,
                                    title: item.title || item.name,
                                    subtitle: (item.release_date || item.first_air_date || '').split('-')[0],
                                    imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : undefined,
                                    type: item.media_type
                                }));
                        }).catch(() => [])
                    : Promise.resolve([]);

                const fetchRawg = rawgKey
                    ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=3`)
                        .then(res => res.json())
                        .then(data => {
                            if (!data.results) return [];
                            return data.results.map((game: RAWGItem) => ({
                                id: `trend-game-${game.id}`,
                                title: game.name,
                                subtitle: game.released ? game.released.split('-')[0] : '',
                                imageUrl: game.background_image || undefined,
                                type: 'game' as const
                            }));
                        }).catch(() => [])
                    : Promise.resolve([]);

                const [tmdbResults, games] = await Promise.all([fetchTmdb, fetchRawg]);

                if (isMounted) {
                    const combined = [...tmdbResults, ...games].sort(() => 0.5 - Math.random()).slice(0, 6);
                    setTrendingResults(combined);
                }
            } catch (error) {
                console.error("Error fetching trending:", error);
            }
        };

        fetchTrending();
        return () => { isMounted = false; };
    }, []);

    // Debounce search (Logic remains the same)
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setMissingApiKey(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setMissingApiKey(false);

            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

                if (!tmdbKey || !rawgKey) setMissingApiKey(true);

                const fetchTmdb = tmdbKey
                    ? fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&include_adult=false`)
                        .then(res => res.json())
                        .then(data => (data.results || [])
                            .filter((item: TMDBItem) => item.media_type === 'movie' || item.media_type === 'tv')
                            .slice(0, 4)
                            .map((item: TMDBItem) => ({
                                id: `search-${item.media_type}-${item.id}`,
                                title: item.title || item.name,
                                subtitle: (item.release_date || item.first_air_date || '').split('-')[0],
                                imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : undefined,
                                type: item.media_type
                            }))) : Promise.resolve([]);

                const fetchRawg = rawgKey
                    ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}&page_size=3`)
                        .then(res => res.json())
                        .then(data => (data.results || []).map((game: RAWGItem) => ({
                            id: `search-game-${game.id}`,
                            title: game.name,
                            subtitle: game.released ? game.released.split('-')[0] : '',
                            imageUrl: game.background_image || undefined,
                            type: 'game' as const
                        }))) : Promise.resolve([]);

                const [t, g] = await Promise.all([fetchTmdb, fetchRawg]);
                const combined = [...t, ...g].slice(0, 9);

                setResults(combined);
                if (combined.length > 0) setIsOpen(true);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full z-60" ref={searchRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {loading ? (
                        <FaSpinner className="h-3 w-3 text-amber-500 animate-spin" />
                    ) : (
                        <FaSearch className="h-3 w-3 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-full text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:bg-zinc-900 transition-all"
                    placeholder="Search the archives..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {/* Results Dropdown */}
            {isOpen && ((query.trim() ? results.length > 0 : trendingResults.length > 0) || (query.trim() && missingApiKey)) && (
                <div className="absolute top-full mt-3 w-full min-w-[320px] left-0 bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">

                    {!query.trim() && trendingResults.length > 0 && (
                        <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                            <FaFire className="text-amber-500 w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Discover Trending</span>
                        </div>
                    )}

                    <ul className="max-h-100 overflow-y-auto p-2 scrollbar-hide">
                        {(query.trim() ? results : trendingResults).map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={`/archives/${item.id}`}
                                    onClick={() => { setIsOpen(false); setQuery(''); }}
                                    className="w-full text-left flex items-center gap-4 p-2.5 hover:bg-white/5 rounded-xl transition-all group block"
                                >
                                    <div className="relative w-10 h-14 overflow-hidden rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="40px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                {item.type === 'movie' ? <FaFilm size={12}/> : item.type === 'game' ? <FaGamepad size={12}/> : <FaTv size={12}/>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-[13px] font-bold text-zinc-100 truncate group-hover:text-amber-500 transition-colors">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-500/80">
                                                {item.type}
                                            </span>
                                            {item.subtitle && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] text-zinc-500 truncate font-medium uppercase tracking-tight">
                                                        {item.subtitle}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {missingApiKey && (
                        <div className="bg-amber-500/5 px-4 py-3 text-[10px] text-zinc-500 border-t border-white/5">
                            <div className="flex items-start gap-2">
                                <FaKey className="w-3 h-3 text-amber-500/50 mt-0.5 shrink-0" />
                                <p className="leading-relaxed uppercase tracking-tight font-bold">
                                    Archive sync incomplete. Check <span className="text-amber-500/70">.env.local</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}