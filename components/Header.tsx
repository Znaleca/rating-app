"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaSignOutAlt, FaBars, FaTimes, FaUser, FaBolt, FaSearch, FaFire, FaShieldAlt, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import HeaderSearch from "@/components/HeaderSearch";

const ROUTES = [
    { name: "Home", path: "/", icon: FaBolt },
    { name: "Browse", path: "/browse", icon: FaSearch },
    { name: "New & Popular", path: "/new-and-popular", icon: FaFire },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    
    const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // For scroll behavior
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", user.id)
                    .single();

                setUser({
                    id: user.id,
                    name: profile?.full_name || user.user_metadata.full_name || "User",
                    role: profile?.role || "audience",
                });
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
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

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Hide if scrolling down, show if scrolling up
            // Added 50px threshold to prevent jittering at the very top
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`fixed w-full top-0 z-50 bg-[var(--header-bg)] border-b border-[var(--border-subtle)] transition-transform duration-500 backdrop-blur-xl ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
            <div className="w-full px-6 h-20 flex items-center justify-between">

                {/* Blitz Logo with New Theme Accents */}
                <Link href="/" className="flex items-center group z-50">
                    <h1 className="text-2xl font-black tracking-tighter text-[var(--foreground)] uppercase">
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
                                    isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                }`}
                            >
                                <Icon size={12} className={`${isActive ? "text-blue-400" : "text-[var(--muted-foreground)] group-hover:text-yellow-400"} transition-colors`} />
                                {route.name}
                                
                                {/* Active Indicator Line */}
                                <span className={`absolute -bottom-1 left-0 h-[2px] transition-all duration-500 ${
                                    isActive ? "w-full bg-blue-400" : "w-0 group-hover:w-full bg-yellow-400"
                                }`} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Live Search Dropdown */}
                <HeaderSearch />

                {/* Right Side Controls */}
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:border-yellow-400/50 hover:text-yellow-400 transition-all duration-500 relative z-50"
                        aria-label="Toggle theme"
                    >
                        {mounted && (resolvedTheme === "dark" ? <FaSun size={12} className="text-[var(--foreground)] group-hover:text-yellow-400 transition-colors" /> : <FaMoon size={12} className="text-[var(--foreground)] group-hover:text-blue-400 transition-colors" />)}
                    </button>

                    {loading ? (
                        <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] animate-pulse bg-[var(--surface)]" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-tight leading-none mb-1">{user.name}</p>
                                <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">{user.role}</p>
                            </div>
                            
                            {/* Profile Dropdown Container */}
                            <div className="relative group">
                                <div className="w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--muted-foreground)] cursor-pointer hover:border-yellow-400/50 transition-all duration-500 relative z-50">
                                    <FaUser size={12} className="group-hover:text-yellow-400 transition-colors" />
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                                    <div className="bg-[var(--header-bg)] border border-[var(--border-subtle)] shadow-2xl p-2 min-w-[200px] flex flex-col gap-1">
                                        <div className="px-4 py-3 border-b border-[var(--border-subtle)] mb-1 sm:hidden">
                                            <p className="text-xs font-black text-[var(--foreground)] uppercase truncate">{user.name}</p>
                                            <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-1">{user.role}</p>
                                        </div>
                                        <Link href="/profile" className="px-4 py-3 text-[10px] text-[var(--foreground)] hover:text-[var(--background)] hover:bg-yellow-400 font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                                            <FaUser size={10} /> My Archives
                                        </Link>
                                        {(user.role === 'admin') && (
                                            <>
                                                <div className="my-1 h-px bg-[var(--border-subtle)]" />
                                                <Link href="/admin/dashboard" className="px-4 py-3 text-[10px] text-yellow-400 hover:text-[var(--background)] hover:bg-yellow-400 font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                                                    <FaShieldAlt size={10} /> Admin Panel
                                                </Link>
                                            </>
                                        )}
                                        <div className="my-1 h-px bg-[var(--border-subtle)]" />
                                        <button onClick={() => supabase.auth.signOut()} className="px-4 py-3 text-[10px] text-[var(--foreground)] hover:text-[var(--foreground)] hover:bg-red-500 font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 w-full text-left">
                                            <FaSignOutAlt size={10} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="relative group overflow-hidden bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 transition-all">
                            <span className="relative z-10">Login</span>
                            <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                    )}

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMenuOpen(true)} 
                        className="p-2 lg:hidden text-[var(--foreground)] hover:text-blue-400 transition-colors"
                    >
                        <FaBars size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Takeover Overlay */}
            <div className={`fixed inset-0 z-[60] bg-[var(--background)]/95 backdrop-blur-2xl transition-all duration-700 ${
                isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}>
                <div className="flex flex-col h-full p-8">
                    <div className="flex justify-end">
                        <button onClick={() => setIsMenuOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-2">
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <nav className="mt-12 flex flex-col gap-4">
                        {ROUTES.map((route, i) => (
                            <Link
                                key={`mob-${route.name}`}
                                href={route.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="group flex items-center justify-between text-5xl font-black uppercase tracking-tighter text-[var(--foreground)] hover:text-[var(--foreground)] transition-all duration-300"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="text-blue-500 text-xs tracking-normal">{String(i + 1).padStart(2, '0')}</span>
                                    {route.name}
                                </span>
                                <span className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Search */}
                    <MobileSearch onSearch={() => setIsMenuOpen(false)} />

                    <div className="mt-auto border-t border-[var(--border-subtle)] pt-8 space-y-4">
                        <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em] mb-4">Blitz Critics Archive</p>
                        {user ? (
                            <div className="flex flex-col gap-3">
                                {user.role === 'admin' && (
                                    <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-yellow-400 font-black uppercase tracking-widest text-sm">
                                        <FaShieldAlt size={12} /> Admin Panel
                                    </Link>
                                )}
                                <button onClick={() => supabase.auth.signOut()} className="text-red-500 font-black uppercase tracking-widest text-sm text-left">Sign Out</button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-blue-400 font-black uppercase tracking-widest text-sm">Sign In</Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

function MobileSearch({ onSearch }: { onSearch: () => void }) {
    const router = useRouter();
    const [q, setQ] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = q.trim();
        if (!trimmed) return;
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        setQ("");
        onSearch();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-10 flex items-center gap-3 border border-[var(--border-subtle)] px-5 py-4 focus-within:border-yellow-400/50 transition-colors"
        >
            <FaSearch size={12} className="text-[var(--muted-foreground)] shrink-0" />
            <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search movies, shows…"
                className="flex-1 bg-transparent text-sm font-medium text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none"
            />
            <button type="submit" className="text-[9px] font-black uppercase tracking-widest text-yellow-400 shrink-0">Go →</button>
        </form>
    );
}