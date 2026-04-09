"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaSignOutAlt, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";
import { Category, CATEGORY_ICON_COMPONENTS } from "../app/page";
import SearchBar from "./SearchBar";

interface HeaderProps {
    categories: Category[];
    activeCategory: Category;
    setActiveCategory: (category: Category) => void;
}

export default function Header({ categories, activeCategory, setActiveCategory }: HeaderProps) {
    const supabase = useMemo(() => createClient(), []);
    
    const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { 
                setLoading(false); 
                return; 
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, role")
                .eq("id", session.user.id)
                .single();
                
            setUser({
                id: session.user.id,
                name: profile?.full_name || session.user.user_metadata.full_name || "User",
                role: profile?.role || "audience",
            });
            setLoading(false);
        }
        
        fetchUser();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") setUser(null);
            else if (event === "SIGNED_IN") fetchUser();
        });
        
        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        /* Dark Glassmorphism Header */
        <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all">
            <div className="max-w-400 mx-auto px-8 h-24 flex items-center justify-between gap-8">

                {/* Editorial Logo */}
                <Link href="/" className="flex items-center group cursor-pointer no-underline z-50">
                    <div className="flex items-baseline overflow-hidden">
                        <h1 className="text-3xl font-black tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-500">
                            BLITZ
                        </h1>
                        <span className="text-amber-500 text-3xl font-black ml-0.5 group-hover:translate-x-1 transition-transform duration-500 ease-out">.</span>
                    </div>
                </Link>

                {/* Refined Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10">
                    {categories.map((cat) => {
                        const Icon = CATEGORY_ICON_COMPONENTS[cat];
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`group relative flex items-center gap-2.5 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                                    isActive 
                                    ? "text-white" 
                                    : "text-zinc-500 hover:text-zinc-200"
                                }`}
                            >
                                <Icon size={14} className={`${isActive ? "text-amber-500" : "text-zinc-600 group-hover:text-amber-400"} transition-colors duration-500`} />
                                {cat}
                                
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-500 ease-out ${
                                    isActive ? "w-full" : "w-0 group-hover:w-full"
                                }`} />
                            </button>
                        );
                    })}
                </nav>

                {/* Right Side Controls */}
                <div className="flex items-center gap-6">
                    {/* Search bar integration - ensure SearchBar.tsx also handles dark mode! */}
                    <div className="hidden md:block w-48 xl:w-64 transition-all duration-700 focus-within:w-80">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="flex items-center gap-3 animate-pulse">
                                <div className="hidden sm:flex flex-col gap-1.5 items-end">
                                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full"></div>
                                    <div className="w-10 h-1.5 bg-zinc-900 rounded-full"></div>
                                </div>
                                <div className="w-10 h-10 bg-zinc-900 rounded-full" />
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-5 pl-6 border-l border-white/10">
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-1">{user.name}</p>
                                        <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest">{user.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner group cursor-pointer hover:border-amber-500/50 transition-colors duration-500">
                                        <FaUser size={14} className="group-hover:text-amber-500 transition-colors" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => supabase.auth.signOut()} 
                                    className="p-2 text-zinc-500 hover:text-white transition-colors duration-300"
                                    title="Sign Out"
                                >
                                    <FaSignOutAlt size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-white text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 ease-out">
                                Login
                            </Link>
                        )}

                        {/* Mobile Trigger */}
                        <button 
                            onClick={() => setIsMenuOpen(true)} 
                            className="p-2 lg:hidden text-white hover:text-amber-500 transition-colors duration-300"
                        >
                            <FaBars size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Takeover remains dark/glassy */}
            <div className={`fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isMenuOpen 
                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 -translate-y-8 pointer-events-none'
            }`}>
                <div className="flex flex-col h-full p-8 md:p-12 relative max-w-7xl mx-auto">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsMenuOpen(false)} 
                            className="text-zinc-500 hover:text-white hover:rotate-90 transition-all duration-500 p-2"
                        >
                            <FaTimes size={28} />
                        </button>
                    </div>

                    <nav className="mt-20 flex flex-col gap-6">
                        {categories.map((cat, index) => (
                            <button
                                key={`mob-${cat}`}
                                onClick={() => { setActiveCategory(cat); setIsMenuOpen(false); }}
                                style={{ transitionDelay: `${index * 75}ms` }}
                                className={`group flex items-center justify-between text-5xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-500 ${
                                    activeCategory === cat 
                                    ? 'text-white' 
                                    : 'text-zinc-800 hover:text-zinc-400'
                                } ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
                            >
                                <span className="flex items-center gap-6">
                                    <span className="text-amber-500 text-sm align-middle opacity-50">{String(index + 1).padStart(2, '0')}</span>
                                    {cat}
                                </span>
                                <span className={`text-2xl md:text-4xl text-amber-500 transition-all duration-500 ${activeCategory === cat ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    &rarr;
                                </span>
                            </button>
                        ))}
                    </nav>

                    <div className={`mt-auto transition-all duration-700 delay-500 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="border-t border-white/5 pt-8 pb-4 flex justify-between items-end">
                            <div className="text-zinc-700 text-xs font-black tracking-[0.4em] uppercase">
                                BLITZ.
                            </div>
                            <Link 
                                href="/login" 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-amber-500 text-lg md:text-xl font-black uppercase tracking-widest hover:text-white transition-colors duration-300"
                            >
                                {user ? 'Dashboard' : 'Sign In'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}