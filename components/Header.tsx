"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSignOutAlt, FaBars, FaTimes, FaUser, FaBolt, FaSearch, FaFire } from "react-icons/fa";
import { createClient } from "@/lib/supabase/client";

const ROUTES = [
    { name: "Home", path: "/", icon: FaBolt },
    { name: "Browse", path: "/browse", icon: FaSearch },
    { name: "Trending", path: "/trending", icon: FaFire },
];

export default function Header() {
    const pathname = usePathname();
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
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    return (
        <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all duration-500">
            <div className="w-full px-6 h-20 flex items-center justify-between">

                {/* Blitz Logo with New Theme Accents */}
                <Link href="/" className="flex items-center group z-50">
                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
                        BLI<span className="text-yellow-400">T</span>Z
                        <span className="text-blue-500 group-hover:translate-x-1 inline-block transition-transform duration-500">.</span>
                    </h1>
                </Link>

                {/* Desktop Nav with Blue/Yellow indicators */}
                <nav className="hidden lg:flex items-center gap-8">
                    {ROUTES.map((route) => {
                        const Icon = route.icon;
                        const isActive = pathname === route.path || (route.path !== "/" && pathname.startsWith(route.path));
                        return (
                            <Link
                                key={route.name}
                                href={route.path}
                                className={`group relative flex items-center gap-2.5 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-200"
                                }`}
                            >
                                <Icon size={12} className={`${isActive ? "text-blue-400" : "text-slate-600 group-hover:text-yellow-400"} transition-colors`} />
                                {route.name}
                                
                                {/* Active Indicator Line */}
                                <span className={`absolute -bottom-1 left-0 h-[2px] transition-all duration-500 ${
                                    isActive ? "w-full bg-blue-400" : "w-0 group-hover:w-full bg-yellow-400"
                                }`} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side Controls */}
                <div className="flex items-center gap-6">
                    {loading ? (
                        <div className="w-8 h-8 rounded-full border border-white/5 animate-pulse bg-slate-900" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{user.name}</p>
                                <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">{user.role}</p>
                            </div>
                            
                            <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 group cursor-pointer hover:border-yellow-400/50 transition-all duration-500">
                                <FaUser size={12} className="group-hover:text-yellow-400 transition-colors" />
                            </div>

                            <button 
                                onClick={() => supabase.auth.signOut()} 
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <FaSignOutAlt size={14} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="relative group overflow-hidden bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 transition-all">
                            <span className="relative z-10">Login</span>
                            <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                    )}

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMenuOpen(true)} 
                        className="p-2 lg:hidden text-white hover:text-blue-400 transition-colors"
                    >
                        <FaBars size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Takeover Overlay */}
            <div className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl transition-all duration-700 ${
                isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex justify-end">
                        <button onClick={() => setIsMenuOpen(false)} className="text-slate-500 hover:text-white p-2">
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <nav className="mt-12 flex flex-col gap-4">
                        {ROUTES.map((route, i) => (
                            <Link
                                key={`mob-${route.name}`}
                                href={route.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center justify-between text-5xl font-black uppercase tracking-tighter text-slate-800 hover:text-white transition-all duration-300"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="text-blue-500 text-xs tracking-normal">{String(i + 1).padStart(2, '0')}</span>
                                    {route.name}
                                </span>
                                <span className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-white/5 pt-8">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Blitz Critics Archive</p>
                        {user ? (
                            <button onClick={() => supabase.auth.signOut()} className="text-red-500 font-black uppercase tracking-widest text-sm">Sign Out</button>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-blue-400 font-black uppercase tracking-widest text-sm">Sign In</Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}