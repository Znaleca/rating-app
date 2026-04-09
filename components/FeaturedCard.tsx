"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser, FaQuoteLeft } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Movies: "bg-amber-500",
  Shows: "bg-emerald-500",
  Games: "bg-violet-500",
};

export default function FeaturedCard({ review }: { review: Review }) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];

  return (
    <div className="p-4 aspect-2/3 w-full flex items-center justify-center">
      <Link href={`/archives/${review.id}`} className="group relative h-80 aspect-2/3 rounded-4xl overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 hover:shadow-amber-500/20 block cursor-pointer">
        
        {/* Cinematic Ken Burns Image */}
        {review.imageUrl && (
          <Image
            src={review.imageUrl}
            alt={review.title}
            fill
            className="object-cover opacity-80 transition-all duration-2000 ease-out group-hover:scale-110 group-hover:opacity-60 group-hover:rotate-1"
            priority
          />
        )}

        {/* Multi-layered Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-zinc-950/10 mix-blend-overlay group-hover:bg-transparent transition-all duration-700" />

        {/* Category Tag */}
        <div className="absolute top-5 left-5 z-20">
          <div className="flex items-center gap-1.5 p-1 pr-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
            <div className={`${CATEGORY_COLORS[review.category]} p-1.5 rounded-full text-white shadow-lg`}>
              <Icon size={10} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
              {review.category}
            </span>
          </div>
        </div>

        {/* Minimalist Rating */}
        <div className="absolute top-6 right-7 z-20 flex flex-col items-center">
          <div className="text-3xl font-black italic text-white/10 leading-none select-none tracking-tighter">
              {Math.floor(review.rating)}
          </div>
          {/* Canonical -mt-3.5 fix */}
          <div className="-mt-3.5 text-xl font-black italic text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {review.rating.toFixed(1)}
          </div>
        </div>

        {/* Content Area */}
        {/* Canonical group-hover:-translate-y-1.5 fix */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-20 transform transition-transform duration-500 group-hover:-translate-y-1.5">
          <div className="space-y-3">
            
            <FaQuoteLeft className="text-amber-500/40 text-lg" />

            <div className="space-y-0.5">
              <p className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">
                {review.year} &bull; {review.genre}
              </p>
              <h3 className="text-white text-2xl font-black leading-[0.95] tracking-tighter transition-all duration-300 group-hover:text-amber-50 line-clamp-2">
                {review.title}
              </h3>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2 font-medium opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 translate-y-3 group-hover:translate-y-0">
              {review.summary}
            </p>

            {/* Reviewer Badge */}
            <div className="flex items-center gap-2.5 pt-3.5 border-t border-white/5">
              <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-white/10 text-white transition-all duration-700 group-hover:border-amber-500/50 group-hover:rotate-360">
                     <FaUser size={10} className="text-amber-400" />
                  </div>
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-none mb-0.5">Expert Review</p>
                <p className="text-xs text-white font-black tracking-tight">{review.reviewer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canonical border-0 and group-hover:border fix */}
        <div className="absolute inset-0 border-0 group-hover:border border-white/20 rounded-4xl transition-all duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent transition-all duration-1000 ease-in-out w-0 group-hover:w-full" />
      </Link>
    </div>
  );
}