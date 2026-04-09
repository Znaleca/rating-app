"use client";

import { FaFacebookF, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#09090b] border-t border-white/5 mt-32">
            <div className="max-w-400 mx-auto px-8 py-20">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">BLITZ<span className="text-amber-500 ml-0.5">.</span></h2>
                        <p className="text-zinc-500 text-xs max-w-sm font-bold uppercase tracking-widest leading-loose">The definitive archive for cinematic and interactive media.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* CONFLICT FIXED: Removed 'text-white' class */}
                        <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-zinc-400">Connect with the Archive</h3>
                        <div className="flex items-center gap-4">
                            {[FaFacebookF, FaTwitter, FaYoutube, FaInstagram].map((Icon, idx) => (
                                <a key={idx} href="#" className="group bg-zinc-900 border border-white/5 p-4 rounded-2xl transition-all hover:bg-white/5 hover:-translate-y-2">
                                    <Icon className="text-zinc-500 group-hover:text-white" size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">© {currentYear} Blitz Media Group International.</p>
                    <nav className="flex gap-12">
                        {["Privacy Policy", "Terms", "Cookies"].map((item) => (
                            <a key={item} href="#" className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-amber-500 transition-colors">{item}</a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}