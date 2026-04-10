"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser, FaQuoteLeft } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

// Unified with the Blitz strict palette
const CATEGORY_COLORS: Record<string, string> = {
  Movies: "text-white border-white",
  Shows: "text-blue-400 border-blue-400",
  Games: "text-yellow-400 border-yellow-400",
  Books: "text-slate-400 border-slate-400",
};

export default function FeaturedCard({ review }: { review: Review }) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];
  const catColor = CATEGORY_COLORS[review.category] || "text-slate-500 border-slate-500";

  return (
    <div className="w-full h-full min-h-[350px] relative group/card">
      {/* Cyberpunk Corner Accents (Outer) */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/0 group-hover/card:border-blue-400 transition-colors duration-500 z-30 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/0 group-hover/card:border-yellow-400 transition-colors duration-500 z-30 pointer-events-none" />

      <Link 
        href={`/archives/${review.id}`} 
        className="group relative block w-full h-full bg-[#050505] border border-white/5 overflow-hidden shadow-2xl transition-all duration-700 hover:border-white/20 cursor-pointer"
      >
        
        {/* Full Color Image */}
        {review.imageUrl && (
          <Image
            src={review.imageUrl}
            alt={review.title}
            fill
            className="object-cover opacity-50 group-hover:opacity-30 group-hover:scale-105 transition-all duration-1000 ease-out"
            priority
          />
        )}

        {/* Harsh Gradients for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:via-black/70 transition-all duration-500" />

        {/* TOP LEFT: Sharp Category Badge */}
        <div className="absolute top-5 left-5 z-20">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 border-l-2 ${catColor.split(' ')[1]}`}>
            <Icon size={10} className={catColor.split(' ')[0]} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-200">
              {review.category}
            </span>
          </div>
        </div>

        {/* TOP RIGHT: Outlined Rating */}
        <div className="absolute top-5 right-6 z-20 flex flex-col items-end">
          <div 
            className="text-4xl font-black italic text-transparent leading-none tracking-tighter select-none"
            style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.2)' }}
          >
            {Math.floor(review.rating)}
          </div>
          <div className="-mt-3 text-xl font-black italic text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            {review.rating.toFixed(1)}
          </div>
        </div>

        {/* Content Area - Uses flex to prevent overlap */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-20">
          <div className="flex flex-col justify-end h-full space-y-3">
            
            <FaQuoteLeft className="text-white/5 text-2xl group-hover:text-blue-400/20 transition-colors duration-500" />

            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="text-white">{review.year}</span> 
                <span className="w-1 h-1 bg-white/20 rotate-45" /> 
                {review.genre}
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tighter transition-all duration-300 group-hover:text-yellow-400 line-clamp-2">
                {review.title}
              </h3>
            </div>

            {/* Container for Summary: Height 0 until hover prevents overlap */}
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
              <div className="overflow-hidden">
                <p className="text-slate-300 text-xs leading-relaxed font-medium pt-2 line-clamp-3">
                  {review.summary}
                </p>
              </div>
            </div>

            {/* Reviewer Badge */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="relative flex items-center justify-center w-8 h-8 bg-black border border-white/10 text-white transition-all duration-700 group-hover:border-blue-400/50">
                  <FaUser size={10} className="text-blue-400" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mb-1">Expert Review</p>
                <p className="text-xs text-white font-bold tracking-tight uppercase truncate">{review.reviewer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress Line */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-blue-400 transition-all duration-1000 ease-in-out w-0 group-hover:w-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
      </Link>
    </div>
  );
}