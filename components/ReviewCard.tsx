"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStarHalf, FaStar } from "react-icons/fa";
import { Review, CATEGORY_ICON_COMPONENTS } from "@/lib/types";

interface ReviewCardProps {
  review: Review;
  criticScore?: string;
  audienceScore?: string;
  portrait?: boolean;
}

export default function ReviewCard({ review, criticScore = "N/A", audienceScore = "N/A" }: ReviewCardProps) {
  const Icon = CATEGORY_ICON_COMPONENTS[review.category];
  const imgSrc = review.posterUrl || review.imageUrl;

  return (
    <div className="w-full relative group/card hover:z-50">
      <div className="relative w-full transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:scale-[1.04] group-hover/card:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)]">

        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--border-subtle)] group-hover/card:border-blue-500 transition-colors duration-500 z-20 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--border-subtle)] group-hover/card:border-yellow-400 transition-colors duration-500 z-20 pointer-events-none" />

        <Link
          href={`/archives/${review.id}`}
          className="relative flex flex-col w-full bg-[var(--surface)] overflow-hidden cursor-pointer group aspect-[2/3]"
        >
          {/* Poster image — full clean, no overlay */}
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={review.title}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 18vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]">
              <Icon size={36} className="text-[var(--border-subtle)]" />
            </div>
          )}

          {/* Hover overlay — only appears on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 gap-1.5">
            <h3 className="text-white text-[11px] font-black uppercase leading-tight tracking-tight line-clamp-2 drop-shadow-md">
              {review.title}
            </h3>
            <p className="text-white/50 text-[8px] font-bold uppercase tracking-widest">
              {review.year}{review.genre ? ` · ${review.genre}` : ""}
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-white/20 mt-0.5">
              <div className="flex items-center gap-1">
                <FaStarHalf className="text-yellow-400 text-[8px]" />
                <span className="text-[7px] font-black uppercase text-white/50">Critics</span>
              </div>
              <span className="text-[10px] font-black text-yellow-400">{criticScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <FaStar className="text-blue-400 text-[8px]" />
                <span className="text-[7px] font-black uppercase text-white/50">Audience</span>
              </div>
              <span className="text-[10px] font-black text-blue-400">{audienceScore}</span>
            </div>
          </div>

          {/* Bottom line on hover */}
          <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-500 w-0 group-hover:w-full z-30" />
        </Link>
      </div>
    </div>
  );
}