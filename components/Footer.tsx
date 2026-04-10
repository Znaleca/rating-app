"use client";

import Link from "next/link";
import { FaFacebookF, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-black border-t border-white/5 mt-32">
            <div className="max-w-[1400px] mx-auto px-8 py-20">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
                    
                    {/* Brand Section - Matches Header Logo */}
                    <div className="space-y-8">
                        <Link href="/" className="group">
                            <h2 className="text-4xl font-black tracking-tighter text-white uppercase">
                                BLI<span className="text-yellow-400">T</span>Z
                                <span className="text-blue-500 group-hover:translate-x-1 inline-block transition-transform duration-500">.</span>
                            </h2>
                        </Link>
                        <p className="text-slate-500 text-[10px] max-w-sm font-black uppercase tracking-[0.2em] leading-loose">
                            The definitive archive for <span className="text-slate-300">cinematic</span> and <span className="text-slate-300">interactive</span> media.
                        </p>
                    </div>

                    {/* Social/Connect Section - Matches Header Icon Styles */}
                    <div className="flex flex-col gap-8">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-500/80">Connect with the Archive</h3>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: FaFacebookF, href: "#" },
                                { Icon: FaTwitter, href: "#" },
                                { Icon: FaYoutube, href: "#" },
                                { Icon: FaInstagram, href: "#" }
                            ].map(({ Icon, href }, idx) => (
                                <a 
                                    key={idx} 
                                    href={href} 
                                    className="group bg-slate-900/50 border border-white/5 p-4 rounded-xl transition-all duration-500 hover:border-yellow-400/30 hover:-translate-y-2"
                                >
                                    <Icon className="text-slate-500 group-hover:text-yellow-400 transition-colors" size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Matches Header Nav Sub-text */}
                <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
                        © {currentYear} <span className="text-slate-500">Blitz Media Group International.</span>
                    </p>
                    
                    <nav className="flex gap-12">
                        {["Privacy Policy", "Terms", "Cookies"].map((item) => (
                            <a 
                                key={item} 
                                href="#" 
                                className="relative group text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] transition-colors hover:text-white"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-blue-400 transition-all duration-500 group-hover:w-full" />
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}