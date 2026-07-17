"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FaBolt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-yellow-400 selection:text-[var(--background)] font-sans flex items-center justify-center px-4 overflow-hidden">
            
            {/* Background Grid & Glow */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.08)_0%,_transparent_50%)]" />

            <div className="relative z-10 w-full max-w-lg">
                
                {/* Back Link */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[10px] font-black uppercase tracking-[0.5em] mb-12 transition-all group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-2 transition-transform text-blue-400" />
                    Back
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter text-[var(--foreground)] uppercase">
                        LO<span className="text-yellow-400">G</span>IN
                    </h1>
                    <div className="h-0.5 w-24 bg-blue-400 mt-4" />
                </div>

                {/* Login Container */}
                <div className="relative group">
                    {/* Corner Accents */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-400 z-20" />

                    <div className="relative bg-[var(--background)] border border-[var(--border-subtle)] p-10 md:p-14 shadow-[20px_20px_0px_rgba(255,255,255,0.02)]">
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="bg-red-500/5 border-l-4 border-red-500 text-red-500 font-black text-[10px] uppercase tracking-widest px-6 py-4">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.4em]">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={14} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="JOHNDOE@EXAMPLE.COM"
                                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] focus:border-blue-400 rounded-none py-5 pl-16 pr-6 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-xs font-bold tracking-widest focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <label className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.4em]">Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={14} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] focus:border-yellow-400 rounded-none py-5 pl-16 pr-16 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-xs font-bold tracking-widest focus:outline-none transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-blue-400 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                <div className="relative z-10 bg-[var(--foreground)] text-[var(--background)] font-black py-6 flex items-center justify-center gap-4 transition-colors group-hover/btn:text-[var(--foreground)] group-hover/btn:bg-transparent">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[11px] uppercase tracking-[0.3em]">Confirm</span>
                                            <FaBolt className="text-yellow-400 group-hover/btn:text-[var(--foreground)] transition-colors" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-12 text-center">
                    <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.4em]">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-400 hover:text-[var(--foreground)] transition-colors ml-2 underline underline-offset-4">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}