"use client";

import Image from "next/image";
import Link from "next/link";
import { FaQuoteLeft, FaStar, FaStarHalf } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

// Unified with the Blitz strict palette
const CATEGORY_COLORS: Record<string, string> = {
  Movies: "text-white border-white",
  Shows: "text-blue-400 border-blue-400",
  Games: "text-yellow-400 border-yellow-400",
  Books: "text-slate-400 border-slate-400",
};

interface FeaturedCardProps {
  review: Review;
  criticScore?: string;
  audienceScore?: string;
}

export default function FeaturedCard({ review, criticScore = "N/A", audienceScore = "N/A" }: FeaturedCardProps) {
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

            {/* BLITZ RATINGS BANNER */}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-2">
              <div className="flex items-center justify-between group-hover:pl-1 transition-all duration-300">
                 <div className="flex items-center gap-2">
                    <FaStarHalf className="text-yellow-400 text-[10px]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Blitz Critics</span>
                 </div>
                 <span className="text-sm font-black text-white">{criticScore}</span>
              </div>
              <div className="flex items-center justify-between group-hover:pl-1 transition-all duration-300 delay-75">
                 <div className="flex items-center gap-2">
                    <FaStar className="text-blue-400 text-[10px]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Blitz Audience</span>
                 </div>
                 <span className="text-sm font-black text-white">{audienceScore}</span>
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