"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaSpinner, FaFilm, FaTv, FaGamepad, FaKey, FaFire, FaChevronRight } from 'react-icons/fa';

// --- Types ---
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

    // Initial fetch for Trending Data (Intelligence)
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
                                .slice(0, 4)
                                .map((item: TMDBItem) => ({
                                    id: `trend-${item.media_type}-${item.id}`,
                                    title: item.title || item.name,
                                    subtitle: (item.release_date || item.first_air_date || '').split('-')[0],
                                    imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : undefined,
                                    type: item.media_type
                                }));
                        }).catch(() => [])
                    : Promise.resolve([]);

                const fetchRawg = rawgKey
                    ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&ordering=-added&page_size=4`)
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
                    const combined = [...tmdbResults, ...games].sort(() => 0.5 - Math.random());
                    setTrendingResults(combined);
                }
            } catch (error) {
                console.error("Error fetching trending:", error);
            }
        };

        fetchTrending();
        return () => { isMounted = false; };
    }, []);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
                const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

                const fetchTmdb = tmdbKey
                    ? fetch(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`)
                        .then(res => res.json())
                        .then(data => (data.results || [])
                            .filter((item: TMDBItem) => item.media_type === 'movie' || item.media_type === 'tv')
                            .map((item: TMDBItem) => ({
                                id: `search-${item.media_type}-${item.id}`,
                                title: item.title || item.name,
                                subtitle: (item.release_date || item.first_air_date || '').split('-')[0],
                                imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : undefined,
                                type: item.media_type
                            }))) : Promise.resolve([]);

                const fetchRawg = rawgKey
                    ? fetch(`https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}&page_size=5`)
                        .then(res => res.json())
                        .then(data => (data.results || []).map((game: RAWGItem) => ({
                            id: `search-game-${game.id}`,
                            title: game.name,
                            subtitle: game.released ? game.released.split('-')[0] : '',
                            imageUrl: game.background_image || undefined,
                            type: 'game' as const
                        }))) : Promise.resolve([]);

                const [t, g] = await Promise.all([fetchTmdb, fetchRawg]);
                setResults([...t, ...g].slice(0, 10));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle clicks outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayItems = query.trim() ? results : trendingResults;

    return (
        <div className="relative w-full z-50 font-sans" ref={searchRef}>
            <div className="relative group">
                <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-yellow-400 scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300" />
                
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {loading ? (
                        <FaSpinner className="h-3 w-3 text-yellow-400 animate-spin" />
                    ) : (
                        <FaSearch className="h-3 w-3 text-slate-500 group-focus-within:text-white transition-colors" />
                    )}
                </div>
                
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 bg-black/60 border border-slate-800 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-slate-500 focus:bg-black transition-all tracking-wide uppercase"
                    placeholder="SEARCH ARCHIVES..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />

                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none hidden md:flex">
                    <span className="text-[9px] font-black px-1.5 py-0.5 border border-slate-800 text-slate-600 uppercase">Input Active</span>
                </div>
            </div>

            {/* Always show the dropdown if open, regardless of search query */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-0 bg-[#0a0a0a] border-x border-b border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-slate-800/50">
                        <div className="flex items-center gap-2">
                            {query.trim() ? (
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 animate-pulse">Syncing Results</span>
                            ) : (
                                <>
                                    <FaFire className="text-yellow-400 w-2.5 h-2.5" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Trending Intelligence</span>
                                </>
                            )}
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                            {displayItems.length} Data Points
                        </span>
                    </div>

                    <ul className="max-h-[480px] overflow-y-auto scrollbar-none">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <li key={item.id} className="border-b border-slate-900 last:border-0">
                                    <Link
                                        href={`/archives/${item.id}`}
                                        onClick={() => { setIsOpen(false); setQuery(''); }}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-900/50 transition-all group"
                                    >
                                        <div className="relative w-12 h-16 shrink-0 bg-slate-900 border border-slate-800 overflow-hidden">
                                            {item.imageUrl ? (
                                                <Image 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    fill 
                                                    className="object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110" 
                                                    sizes="48px" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                    {item.type === 'movie' ? <FaFilm size={14}/> : item.type === 'game' ? <FaGamepad size={14}/> : <FaTv size={14}/>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-black text-slate-300 truncate uppercase tracking-tight group-hover:text-white transition-colors">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 border transition-all ${
                                                    item.type === 'game' 
                                                        ? 'border-yellow-900 text-yellow-700 bg-yellow-400/5 group-hover:border-yellow-400 group-hover:text-yellow-400' 
                                                        : 'border-blue-900 text-blue-700 bg-blue-400/5 group-hover:border-blue-400 group-hover:text-blue-400'
                                                }`}>
                                                    {item.type}
                                                </span>
                                                {item.subtitle && (
                                                    <span className="text-[10px] text-slate-600 font-mono group-hover:text-slate-400 transition-colors">
                                                        // {item.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <FaChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400 w-2.5 h-2.5" />
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No Intelligence Found</p>
                            </div>
                        )}
                    </ul>

                    {/* Quick Action Footer */}
                    <div className="bg-black p-3 border-t border-slate-800 flex justify-center">
                        <p className="text-[7px] font-bold text-slate-700 uppercase tracking-[0.4em]">Secure Archive Connection Established</p>
                    </div>
                </div>
            )}
        </div>
    );
}