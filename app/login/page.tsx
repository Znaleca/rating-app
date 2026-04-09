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
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center px-4 relative overflow-hidden">
            
            {/* Massive Cinematic Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                
                {/* Back Link */}
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-12 transition-all group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Archives
                </Link>

                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            <FaBolt className="text-zinc-950 text-xl" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
                            Blitz<span className="text-zinc-600 italic">.</span>
                        </h1>
                    </div>
                    <h2 className="text-zinc-400 text-sm font-medium tracking-tight">
                        Enter your credentials to access the editorial dashboard.
                    </h2>
                </div>

                {/* Premium Card */}
                <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden">
                    {/* Subtle Top Shine */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-[11px] uppercase tracking-widest px-4 py-3 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-zinc-500 text-[10px] font-black mb-3 uppercase tracking-[0.2em]">
                                Archive Identifier (Email)
                            </label>
                            <div className="relative group">
                                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors duration-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@agency.com"
                                    className="w-full bg-zinc-950/50 border border-white/5 focus:border-amber-500/50 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-700 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    Security Key
                                </label>
                            </div>
                            <div className="relative group">
                                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors duration-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950/50 border border-white/5 focus:border-amber-500/50 rounded-2xl py-4 pl-14 pr-14 text-white placeholder:text-zinc-700 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all duration-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-2"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button - Fixed with bg-linear-to-r */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-zinc-950 disabled:opacity-20 disabled:cursor-not-allowed font-black py-5 rounded-2xl transition-all duration-500 text-[11px] uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-amber-500/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Initialize Session"
                            )}
                        </button>
                    </form>
                </div>

                {/* Registration Link */}
                <div className="mt-10 text-center">
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                        New to the Archives?{" "}
                        <Link href="/register" className="text-amber-500 hover:text-white transition-colors ml-2">
                            Request Access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}