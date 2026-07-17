"use client";

import Link from "next/link";
import { FaFacebookF, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[var(--background)] border-t border-[var(--border-subtle)] mt-32 relative overflow-hidden">
            {/* Background Decorative Element - Matches Search Page Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
            
            <div className="w-full px-6 md:px-12 lg:px-20 py-24 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16">
                    
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="group inline-block">
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">
                                BLI<span className="text-yellow-400">T</span>Z
                                <span className="text-blue-500 group-hover:translate-x-2 inline-block transition-transform duration-500">.</span>
                            </h2>
                        </Link>
                        <div className="space-y-4">
                            <p className="text-[var(--muted-foreground)] text-[11px] max-w-md font-black uppercase tracking-[0.3em] leading-relaxed">
                                The definitive global archive for <span className="text-[var(--foreground)]">cinematic</span> and <span className="text-[var(--foreground)]">interactive</span> media indexes. 
                                Distributed globally via <span className="text-blue-400">Blitz Network.</span>
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] w-8 bg-blue-500" />
                                <span className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.5em]">System Status: Operational</span>
                            </div>
                        </div>
                    </div>

                    {/* Social/Connect Section */}
                    <div className="flex flex-col items-start lg:items-end gap-8 w-full lg:w-auto">
                        <h3 className="font-black text-[11px] uppercase tracking-[0.5em] text-blue-500/80">Connect / Social Index</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            {[
                                { Icon: FaFacebookF, href: "#" },
                                { Icon: FaTwitter, href: "#" },
                                { Icon: FaYoutube, href: "#" },
                                { Icon: FaInstagram, href: "#" }
                            ].map(({ Icon, href }, idx) => (
                                <a 
                                    key={idx} 
                                    href={href} 
                                    className="group bg-[var(--foreground)]/[0.02] border border-[var(--border-subtle)] p-5 rounded-none transition-all duration-500 hover:border-yellow-400/40 hover:-translate-y-2 relative"
                                >
                                    {/* Corner Accents for Icons */}
                                    <div className="absolute top-0 right-0 w-1 h-1 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Icon className="text-[var(--muted-foreground)] group-hover:text-yellow-400 transition-colors" size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full Width Bottom Bar */}
                <div className="mt-32 pt-12 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.4em]">
                            © {currentYear} <span className="text-[var(--muted-foreground)]">Blitz Media Group International Ltd.</span>
                        </p>
                        <div className="hidden md:block h-4 w-[1px] bg-[var(--foreground)]/10" />
                        <span className="text-[var(--muted-foreground)] text-[9px] font-black uppercase tracking-[0.2em]">Build v3.4.0_Stable</span>
                    </div>
                    
                    <nav className="flex flex-wrap justify-center gap-10">
                        {["Privacy Policy", "Terms of Service", "Cookie Archive", "Data Rights"].map((item) => (
                            <a 
                                key={item} 
                                href="#" 
                                className="relative group text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] transition-colors hover:text-[var(--foreground)]"
                            >
                                {item}
                                <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-yellow-400 transition-all duration-500 group-hover:w-full" />
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom Edge Scanning Line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
        </footer>
    );
}