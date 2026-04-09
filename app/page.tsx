"use client";

import { FaCompass, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-100 selection:bg-yellow-400 selection:text-blue-950 overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/5 blur-[140px] rounded-full" />
      </div>

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <section className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-1000">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/50 border border-blue-400/20 mb-10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">System Online // v2.0</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-8 max-w-5xl">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase leading-none">
                    BLI<span className="text-yellow-400">T</span>Z<span className="text-blue-400">.</span>
                </h1>
                
                <p className="max-w-2xl text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                    Access the lightning-fast archive. 
                    <span className="text-blue-400"> Filtered.</span> 
                    <span className="text-yellow-400"> Indexed.</span> 
                    <span className="text-white"> Instant.</span>
                </p>
                
                {/* Search Bar with Blue Glow */}
                <div className="w-full max-w-2xl pt-4 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative bg-slate-950 rounded-xl">
                    <SearchBar />
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-8 pt-8">
                    <Link 
                        href="/browse"
                        className="group relative flex items-center gap-4 bg-blue-400 text-blue-950 font-black uppercase tracking-widest text-sm px-12 py-5 rounded-sm hover:bg-yellow-400 transition-all duration-300 shadow-[0_0_30px_rgba(96,165,250,0.3)]"
                    >
                        <span>Start Browsing</span>
                        <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                    
                    <Link 
                        href="/about"
                        className="flex items-center gap-3 text-slate-500 hover:text-yellow-400 font-bold uppercase tracking-widest text-xs transition-colors group"
                    >
                        <FaCompass className="group-hover:rotate-90 transition-transform duration-500" />
                        The Blueprint
                    </Link>
                </div>
            </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}