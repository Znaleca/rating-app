"use client";

import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black overflow-hidden font-sans">
      
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {/* Blue Ambient Glow (Top Left) */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full opacity-50" />
        {/* Yellow Ambient Glow (Bottom Right) */}
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-yellow-400/10 blur-[120px] rounded-full opacity-50" />
        
        {/* Structural Grid with updated lines */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>
      
      <Header />

      <main className="relative z-10 w-full px-6">
        <section className="flex flex-col items-center justify-center min-h-[90vh] py-20">
          
          <div className="flex flex-col items-center text-center w-full">
            
            {/* Minimal Welcome Tag */}
            <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="h-[1px] w-8 bg-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-400">
                Welcome to
              </span>
              <div className="h-[1px] w-8 bg-yellow-400" />
            </div>

            {/* Locked-In Branding Design */}
            <div className="relative mb-20 flex flex-col items-center group">
              {/* Main Brand */}
              <h1 className="text-8xl md:text-[12rem] font-black tracking-[-0.08em] text-white uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                BLI<span className="text-yellow-400">T</span>Z
              </h1>
              
              {/* Outline sub-brand with connecting frame */}
              <div className="relative flex items-center w-full mt-4">
                <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-blue-400/40" />
                
                <h2 className="text-5xl md:text-[6rem] font-black tracking-[0.25em] text-transparent uppercase leading-[1] px-10 relative"
                    style={{ WebkitTextStroke: '1.5px rgba(96, 165, 250, 0.5)' }}>
                  CRITICS
                  {/* Subtle underline accent */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-yellow-400" />
                </h2>
                
                <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-yellow-400/40" />
              </div>
            </div>
            
            {/* Search Interface - Cyberpunk Frame */}
            <div className="w-full max-w-2xl mt-4 relative group">
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              
              <div className="relative border border-white/5 bg-black/60 backdrop-blur-xl focus-within:border-white/20 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <SearchBar />
              </div>
              
              {/* Media Categories */}
              <div className="flex justify-center gap-10 mt-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                <Link href="/browse?type=movie" className="hover:text-white transition-all duration-300 flex flex-col items-center group/cat">
                  Movies
                  <div className="h-[2px] w-0 group-hover/cat:w-full bg-white transition-all mt-1" />
                </Link>
                <span className="opacity-20">|</span>
                <Link href="/browse?type=tv" className="hover:text-blue-400 transition-all duration-300 flex flex-col items-center group/cat">
                  TV Shows
                  <div className="h-[2px] w-0 group-hover/cat:w-full bg-blue-400 transition-all mt-1" />
                </Link>
                <span className="opacity-20">|</span>
                <Link href="/browse?type=game" className="hover:text-yellow-400 transition-all duration-300 flex flex-col items-center group/cat">
                  Games
                  <div className="h-[2px] w-0 group-hover/cat:w-full bg-yellow-400 transition-all mt-1" />
                </Link>
              </div>
            </div>

            {/* Primary Action - The "Power" Button */}
            <div className="flex items-center justify-center pt-24">
              <Link 
                href="/browse"
                className="group relative flex items-center gap-16 bg-white text-black font-black uppercase tracking-tighter text-sm px-20 py-8 hover:pr-12 transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10">Browse</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-3 transition-transform duration-500" />
                
                {/* Hover Slide Effect */}
                <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
            </div>

          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}