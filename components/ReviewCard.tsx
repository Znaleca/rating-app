"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser, FaQuoteLeft, FaCompass } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

// Updated to match the strict White / Blue / Yellow palette of the Blitz theme
const CATEGORY_COLORS: Record<string, string> = {
  Movies: "text-white border-white",
  Shows: "text-blue-400 border-blue-400",
  Games: "text-yellow-400 border-yellow-400",
  Books: "text-slate-400 border-slate-400",
};

export default function DiscoveryCard({ review }: { review: Review }) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];
  const catColor = CATEGORY_COLORS[review.category] || "text-slate-500 border-slate-500";

  return (
    <div className="w-full relative group/card">
      {/* Cyberpunk Corner Accents (Outer) */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/0 group-hover/card:border-blue-400 transition-colors duration-500 z-10 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/0 group-hover/card:border-yellow-400 transition-colors duration-500 z-10 pointer-events-none" />

      <Link 
        href={`/archives/${review.id}`} 
        className="relative h-[450px] w-full bg-[#050505] border border-white/5 overflow-hidden block cursor-pointer transition-all duration-700 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] group"
      >
        
        {/* BACKGROUND IMAGE - Full color, scale effect on hover */}
        {review.imageUrl ? (
          <Image
            src={review.imageUrl}
            alt={review.title}
            fill
            className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}

        {/* HARSH GRADIENT FOR TEXT LEGIBILITY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90" />
        
        {/* TOP LEFT: SHARP CATEGORY BADGE */}
        <div className="absolute top-4 left-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 border-l-2 ${catColor.split(' ')[1]}`}>
            <Icon size={10} className={catColor.split(' ')[0]} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
              {review.category}
            </span>
          </div>
        </div>

        {/* TOP RIGHT: OUTLINED RATING */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
          <div 
            className="text-4xl font-black italic text-transparent leading-none tracking-tighter select-none"
            style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.2)' }}
          >
            {Math.floor(review.rating)}
          </div>
          <div className="-mt-3 text-lg font-black italic text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            {review.rating.toFixed(1)}
          </div>
        </div>

        {/* BOTTOM CONTENT AREA */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-20 transform transition-transform duration-500 group-hover:-translate-y-2">
          <div className="space-y-4">
            
            {/* SUBTITLE LINE */}
            <div className="flex justify-between items-end border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                    <FaCompass className="text-blue-400 text-xs animate-pulse" />
                    <span className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">Discovery</span>
                </div>
                <FaQuoteLeft className="text-white/5 text-lg group-hover:text-white/20 transition-colors duration-500" />
            </div>

            {/* TITLE & META */}
            <div className="space-y-1.5">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="text-white">{review.year}</span> 
                <span className="w-1 h-1 bg-white/20 rotate-45" /> 
                {review.genre}
              </p>
              <h3 className="text-white text-2xl font-black uppercase leading-[0.9] tracking-tighter transition-all duration-300 group-hover:text-yellow-400 line-clamp-2">
                {review.title}
              </h3>
            </div>

            {/* SUMMARY (Reveals slightly on hover) */}
            <p className="text-slate-300 text-[10px] leading-relaxed line-clamp-3 font-medium opacity-70 group-hover:opacity-100 transition-all duration-700">
              {review.summary}
            </p>

            {/* REVIEWER BANNER */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="relative flex items-center justify-center w-8 h-8 bg-black border border-white/10 text-white group-hover:border-blue-400/50 transition-colors">
                  <FaUser size={10} className="text-blue-400" />
                  {/* Decorative pixel */}
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mb-1">Reviewed By</p>
                <p className="text-xs text-white font-bold tracking-tight uppercase truncate">{review.reviewer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PROGRESS LINE FX */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-blue-400 transition-all duration-700 w-0 group-hover:w-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
      </Link>
    </div>
  );
}