"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FaBolt, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="relative min-h-screen bg-[#050505] text-slate-100 font-sans flex items-center justify-center px-4">
                <div className="relative bg-black border border-white/10 p-10 md:p-14 text-center max-w-md shadow-[20px_20px_0px_rgba(255,255,255,0.02)]">
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Verification Sent</h2>
                    <p className="text-slate-500 text-xs font-bold tracking-widest leading-relaxed mb-8">
                        Check <span className="text-white">{email}</span> to activate your account.
                    </p>
                    <Link href="/login" className="text-blue-400 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] underline underline-offset-8">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black font-sans flex items-center justify-center px-4 overflow-hidden">
            
            {/* Background Grid & Glow */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.08)_0%,_transparent_50%)]" />

            <div className="relative z-10 w-full max-w-lg">
                
                {/* Back Link */}
                <Link 
                    href="/login" 
                    className="inline-flex items-center gap-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 transition-all group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-2 transition-transform text-blue-400" />
                    Back to Login
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-6xl font-black tracking-tighter text-white uppercase">
                        RE<span className="text-yellow-400">G</span>ISTER
                    </h1>
                    <div className="h-0.5 w-24 bg-blue-400 mt-4" />
                </div>

                {/* Card Container */}
                <div className="relative group">
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-400 z-20" />

                    <div className="relative bg-black border border-white/10 p-10 md:p-14 shadow-[20px_20px_0px_rgba(255,255,255,0.02)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/5 border-l-4 border-red-500 text-red-500 font-black text-[10px] uppercase tracking-widest px-6 py-4">
                                    {error}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-3">
                                <label className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="JOHN DOE"
                                        className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-400 rounded-none py-5 pl-16 pr-6 text-white placeholder:text-slate-800 text-xs font-bold tracking-widest focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="JOHNDOE@EXAMPLE.COM"
                                        className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-400 rounded-none py-5 pl-16 pr-6 text-white placeholder:text-slate-800 text-xs font-bold tracking-widest focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <label className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/[0.03] border border-white/10 focus:border-yellow-400 rounded-none py-5 pl-16 pr-16 text-white placeholder:text-slate-800 text-xs font-bold tracking-widest focus:outline-none transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden mt-4"
                            >
                                <div className="absolute inset-0 bg-blue-400 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                <div className="relative z-10 bg-white text-black font-black py-6 flex items-center justify-center gap-4 transition-colors group-hover/btn:text-white group-hover/btn:bg-transparent">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[11px] uppercase tracking-[0.3em]">Create Account</span>
                                            <FaBolt className="text-yellow-400 group-hover/btn:text-white transition-colors" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                        Existing member?{" "}
                        <Link href="/login" className="text-blue-400 hover:text-white transition-colors ml-2 underline underline-offset-4">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}