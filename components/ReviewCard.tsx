"use client";

import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { Review } from "@/app/page";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="group cursor-pointer">
      {/* Canonical classes: aspect-4/5 and rounded-4xl */}
      <div className="relative aspect-4/5 rounded-4xl overflow-hidden bg-zinc-100 mb-4 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-amber-500/10 group-hover:-translate-y-1">
        {review.imageUrl ? (
          <Image 
            src={review.imageUrl} 
            alt={review.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-200" />
        )}
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
          <FaStar className="text-amber-400 w-2.5 h-2.5" />
          <span className="text-zinc-950 font-black text-[11px]">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="px-2 space-y-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight leading-tight group-hover:text-amber-500 transition-colors line-clamp-1">
            {review.title}
          </h3>
          <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap">{review.year}</span>
        </div>
        
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {review.category} &bull; {review.genre}
        </p>
        
        <p className="text-xs text-zinc-500 line-clamp-2 pt-2 leading-relaxed font-medium">
          {review.summary}
        </p>
      </div>
    </article>
  );
}