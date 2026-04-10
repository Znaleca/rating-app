"use client";

import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 selection:bg-yellow-400 selection:text-black overflow-x-hidden font-sans">
      
      {/* Structural Grid - Subtle 1px lines */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      
      <Header />

      <main className="relative z-10 w-full px-6 flex flex-col items-center justify-center min-h-screen">
        <section className="w-full max-w-7xl pt-20 pb-32">
          
          <div className="flex flex-col items-center text-center w-full">
            
            {/* Welcome Tag */}
            <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="h-0.5 w-8 bg-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-400">
                Welcome to
              </span>
              <div className="h-0.5 w-8 bg-yellow-400" />
            </div>

            {/* Restored Original Branding Design */}
            <div className="relative mb-20 flex flex-col items-center w-full">
              {/* Main Brand */}
              <h1 className="text-8xl md:text-[12rem] font-black tracking-[-0.08em] text-white uppercase leading-[0.8]">
                BLI<span className="text-yellow-400">T</span>Z
              </h1>
              
              {/* Connecting Frame Sub-brand */}
              <div className="relative flex items-center w-full mt-4">
                {/* Fixed: Solid lines instead of gradients */}
                <div className="flex-1 h-0.5 bg-blue-400/40" />
                
                <h2 className="text-5xl md:text-[6rem] font-black tracking-[0.25em] text-transparent uppercase leading-[1] px-10 relative"
                    style={{ WebkitTextStroke: '1.5px rgba(96, 165, 250, 0.6)' }}>
                  CRITICS
                  {/* Yellow Accent Underline */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-400" />
                </h2>
                
                <div className="flex-1 h-0.5 bg-yellow-400/40" />
              </div>
            </div>
            
            {/* Search Interface - Set to z-50 to overlap result-dropdowns over lower content */}
            <div className="w-full max-w-2xl mt-4 relative z-50 group">
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              
              <div className="relative border border-white/10 bg-black/80 backdrop-blur-md focus-within:border-white/30 transition-all duration-500">
                <SearchBar />
              </div>
              
              {/* Media Categories */}
              <div className="flex justify-center gap-10 mt-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                <Link href="/browse?type=movie" className="hover:text-white transition-colors flex flex-col items-center group/cat">
                  Movies
                  <div className="h-0.5 w-0 group-hover/cat:w-full bg-white transition-all mt-1" />
                </Link>
                <span className="opacity-20">|</span>
                <Link href="/browse?type=tv" className="hover:text-blue-400 transition-colors flex flex-col items-center group/cat">
                  TV Shows
                  <div className="h-0.5 w-0 group-hover/cat:w-full bg-blue-400 transition-all mt-1" />
                </Link>
                <span className="opacity-20">|</span>
                <Link href="/browse?type=game" className="hover:text-yellow-400 transition-colors flex flex-col items-center group/cat">
                  Games
                  <div className="h-0.5 w-0 group-hover/cat:w-full bg-yellow-400 transition-all mt-1" />
                </Link>
              </div>
            </div>

            {/* Browse Button - Lower Z-Index and significant margin to prevent preview overlap */}
            <div className="relative z-10 pt-48 flex items-center justify-center">
              <Link 
                href="/browse"
                className="group relative flex items-center gap-16 bg-white text-black font-black uppercase tracking-tighter text-sm px-20 py-8 transition-all duration-300 hover:bg-yellow-400 overflow-hidden"
              >
                <span className="relative z-10">Browse</span>
                <FaArrowRight className="relative z-10 group-hover:translate-x-3 transition-transform duration-300" />
              </Link>
            </div>

          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}