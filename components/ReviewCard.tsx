"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser, FaQuoteLeft, FaCompass } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Movies: "bg-amber-500",
  Shows: "bg-emerald-500",
  Games: "bg-violet-500",
  Books: "bg-blue-500",
};

export default function DiscoveryCard({ review }: { review: Review }) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];

  return (
    <div className="p-2 w-full">
      {/* Updated h-[450px] to h-112.5 per Tailwind recommendation */}
      <Link href={`/archives/${review.id}`} className="group relative h-112.5 w-full rounded-4xl overflow-hidden bg-zinc-950 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-2 hover:shadow-amber-500/10 block cursor-pointer">
        
        {review.imageUrl ? (
          <Image
            src={review.imageUrl}
            alt={review.title}
            fill
            className="object-cover opacity-70 transition-all duration-2000 ease-out group-hover:scale-110 group-hover:opacity-50 group-hover:rotate-1"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-5 left-5 z-20">
          <div className="flex items-center gap-1.5 p-1 pr-3 bg-zinc-950/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
            <div className={`${CATEGORY_COLORS[review.category] || 'bg-zinc-500'} p-1.5 rounded-full text-white shadow-lg`}>
              <Icon size={10} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
              {review.category}
            </span>
          </div>
        </div>

        <div className="absolute top-6 right-7 z-20 flex flex-col items-center">
          <div className="text-3xl font-black italic text-white/10 leading-none select-none tracking-tighter">
              {Math.floor(review.rating)}
          </div>
          <div className="-mt-3.5 text-xl font-black italic text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {review.rating.toFixed(1)}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 z-20 transform transition-transform duration-500 group-hover:-translate-y-1">
          <div className="space-y-3">
            
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                    <FaCompass className="text-amber-500/60 text-xs animate-pulse" />
                    <span className="text-amber-500/80 text-[8px] font-black uppercase tracking-[0.4em]">Discovery</span>
                </div>
                {/* Now using FaQuoteLeft to resolve ESLint error */}
                <FaQuoteLeft className="text-white/10 text-lg group-hover:text-amber-500/20 transition-colors duration-500" />
            </div>

            <div className="space-y-1">
              <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                {review.year} &bull; {review.genre}
              </p>
              <h3 className="text-white text-2xl font-black leading-none tracking-tighter transition-all duration-300 group-hover:text-amber-200 line-clamp-2">
                {review.title}
              </h3>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-all duration-700">
              {review.summary}
            </p>

            <div className="flex items-center gap-2.5 pt-4 border-t border-white/10">
              <div className="relative">
                  <div className="absolute inset-0 bg-amber-500 blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 border border-white/10 text-white group-hover:border-amber-500/50 transition-colors">
                     <FaUser size={9} className="text-amber-400" />
                  </div>
              </div>
              <div className="overflow-hidden">
                <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-none mb-0.5">Reviewed By</p>
                <p className="text-xs text-white font-black tracking-tight truncate">{review.reviewer}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 border-0 group-hover:border border-white/10 rounded-4xl transition-all duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent transition-all duration-1000 w-0 group-hover:w-full opacity-60" />
      </Link>
    </div>
  );
}