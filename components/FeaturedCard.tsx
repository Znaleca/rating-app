"use client";

import Image from "next/image";
import Link from "next/link";
import { FaQuoteLeft, FaStar, FaStarHalf, FaCompass } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

// Unified with the Blitz strict palette
const CATEGORY_COLORS: Record<string, string> = {
  Movies: "text-[var(--foreground)] border-[var(--foreground)]",
  Shows: "text-blue-500 border-blue-500",
  Books: "text-[var(--muted-foreground)] border-[var(--muted-foreground)]",
};

interface FeaturedCardProps {
  review: Review;
  criticScore?: string;
  audienceScore?: string;
}

export default function FeaturedCard({ review, criticScore = "N/A", audienceScore = "N/A" }: FeaturedCardProps) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];
  const catColor = CATEGORY_COLORS[review.category] || "text-[var(--muted-foreground)] border-slate-500";
  const [textCol, borderCol] = catColor.split(' ');

  return (
    <div className="w-full h-full min-h-[400px] relative group/card flex flex-col">
      {/* Cyberpunk Corner Accents (Outer) */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--border-subtle)] group-hover/card:border-blue-500 transition-colors duration-500 z-30 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--border-subtle)] group-hover/card:border-yellow-400 transition-colors duration-500 z-30 pointer-events-none" />

      <Link 
        href={`/archives/${review.id}`} 
        className="group relative flex flex-col w-full h-full bg-[var(--surface)] border border-[var(--border-subtle)] overflow-hidden shadow-2xl transition-all duration-700 hover:border-[var(--foreground)]/30 hover:-translate-y-2 cursor-pointer"
      >
        
        {/* TOP HALF: IMAGE & BADGE (NO SHADE) */}
        <div className="relative h-[250px] w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--background)] shrink-0">
          {review.imageUrl ? (
            <Image
              src={review.imageUrl}
              alt={review.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--background)] flex items-center justify-center">
               <Icon size={64} className="text-[var(--border-subtle)]" />
            </div>
          )}

          {/* SHARP CATEGORY BADGE */}
          <div className="absolute top-5 left-5 z-20">
            <div className={`flex items-center gap-2 px-3 py-1.5 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border-subtle)] border-l-2 ${borderCol} shadow-sm group-hover:bg-[var(--background)] transition-colors`}>
              <Icon size={12} className={textCol} />
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${textCol}`}>
                {review.category}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: SOLID BACKGROUND CONTENT */}
        <div className="relative p-6 flex flex-col flex-1 bg-[var(--surface)] justify-between">
          
          <div>
            <FaQuoteLeft className="text-[var(--muted-foreground)]/20 text-2xl group-hover:text-blue-500/30 transition-colors duration-500 mb-4" />

            <div className="space-y-2 mb-4">
              <p className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="text-[var(--foreground)] bg-[var(--foreground)]/5 px-1.5 py-0.5 rounded-sm border border-[var(--border-subtle)]">{review.year}</span> 
                <span className="w-1 h-1 bg-[var(--border-subtle)] rotate-45" /> 
                {review.genre}
              </p>
              <h3 className="text-[var(--foreground)] text-2xl md:text-3xl font-black uppercase leading-[1.0] tracking-tighter transition-all duration-300 group-hover:text-yellow-500 line-clamp-2">
                {review.title}
              </h3>
            </div>

            {/* Container for Summary: Height 0 until hover */}
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out mb-2">
              <div className="overflow-hidden">
                <p className="text-[var(--foreground)] text-xs leading-relaxed font-medium pt-2 line-clamp-3 opacity-80">
                  {review.summary}
                </p>
              </div>
            </div>
          </div>

          {/* BLITZ RATINGS BANNER */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border-subtle)] mt-4 bg-[var(--background)]/30 p-4 rounded-sm">
            <div className="flex items-center justify-between transition-transform duration-300">
               <div className="flex items-center gap-2">
                  <FaStarHalf className="text-yellow-500 text-[12px]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Blitz Critics</span>
               </div>
               <span className="text-sm font-black text-yellow-500 tracking-tighter">{criticScore}</span>
            </div>
            <div className="flex items-center justify-between mt-1 transition-transform duration-300 delay-75">
               <div className="flex items-center gap-2">
                  <FaStar className="text-blue-500 text-[12px]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Blitz Audience</span>
               </div>
               <span className="text-sm font-black text-blue-500 tracking-tighter">{audienceScore}</span>
            </div>
          </div>

        </div>

        {/* Bottom Progress Line */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-1000 ease-in-out w-0 group-hover:w-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
      </Link>
    </div>
  );
}