"use client";

import { useState, useEffect, useCallback } from "react";
import { FaArrowRight, FaFilm, FaTv, FaHeart, FaBolt, FaUser, FaFistRaised, FaMask, FaRocket, FaTheaterMasks, FaLaughBeam, FaGhost, FaPalette } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ReviewCard from "@/components/ReviewCard";
import { Review } from "@/lib/types";
import { getBulkRatingsSummaries, getUserTasteProfile } from "@/app/actions/ratings";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  backdrop_path: string | null;
  poster_path?: string | null;
  overview: string;
  genre_ids?: number[];
}

// TMDB genre ID → name map (most common ones)
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  // Superhero-adjacent keywords: uses keyword 9715 (superhero) via discover/keyword approach
};

// Category → TMDB genre IDs for themed shelves
const GENRE_SHELVES: Record<string, { label: string; genreIds: number[]; icon: React.ReactNode; primaryGenre: string }> = {
  action: { label: "Action & Adventure", genreIds: [28, 12], icon: <FaFistRaised />, primaryGenre: "Action" },
  superhero: { label: "Superhero Films", genreIds: [28, 878], icon: <FaMask />, primaryGenre: "Action" },
  scifi: { label: "Science Fiction", genreIds: [878], icon: <FaRocket />, primaryGenre: "Sci-Fi" },
  drama: { label: "Drama", genreIds: [18], icon: <FaTheaterMasks />, primaryGenre: "Drama" },
  comedy: { label: "Comedy", genreIds: [35], icon: <FaLaughBeam />, primaryGenre: "Comedy" },
  horror: { label: "Horror & Thriller", genreIds: [27, 53], icon: <FaGhost />, primaryGenre: "Horror" },
  animation: { label: "Animation", genreIds: [16], icon: <FaPalette />, primaryGenre: "Animation" },
};

interface TasteRatedItem {
  media_id: string;
  rating: number;
  media_type: string;
  title: string;
  poster_url: string | null;
}

interface RecommendedShelf {
  label: string;
  icon: React.ReactNode;
  basedOn: string;    // e.g. "Because you rated Avengers"
  items: Review[];
  url: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shelves, setShelves] = useState<RecommendedShelf[]>([]);
  const [blitzScores, setBlitzScores] = useState<Record<string, { criticAverage: string, audienceAverage: string }>>({});
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [tasteProfile, setTasteProfile] = useState<{ topRated: TasteRatedItem[], topCategories: string[], totalRated: number } | null>(null);

  const fetchBlitzScores = useCallback(async (items: Review[]) => {
    const ids = items.map(r => r.id.toString());
    if (ids.length === 0) return;
    const scores = await getBulkRatingsSummaries(ids);
    setBlitzScores(prev => ({ ...prev, ...scores }));
  }, []);

  const fetchGenreShelf = async (genreIds: number[], mediaType: "movie" | "tv", page = 1): Promise<Review[]> => {
    const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!tmdbKey) return [];
    try {
      const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${tmdbKey}&with_genres=${genreIds.join(",")}&sort_by=popularity.desc&page=${page}`;
      const data = await fetch(url).then(r => r.json());
      return (data.results || []).slice(0, 10).map((m: TMDBItem): Review => ({
        id: mediaType === "movie" ? `movie-${m.id}` : `show-${m.id}`,
        title: m.title || m.name || "Untitled",
        category: mediaType === "movie" ? "Movies" : "Shows",
        rating: m.vote_average || 0,
        year: (m.release_date || m.first_air_date || "N/A").split('-')[0],
        genre: m.genre_ids ? (GENRE_MAP[m.genre_ids[0]] || "Film") : "Film",
        reviewer: "TMDB",
        avatar: "TM",
        imageUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        summary: m.overview || "",
      }));
    } catch { return []; }
  };

  // Determine which shelves to show — guarantees no duplicate genres
  const buildPersonalizedShelves = async (profile: { topRated: TasteRatedItem[], topCategories: string[], totalRated: number }) => {
    const builtShelves: RecommendedShelf[] = [];
    const allItems: Review[] = [];
    const usedShelfKeys = new Set<string>();

    const SHELF_PRIORITY = ["superhero", "action", "scifi", "drama", "comedy", "horror", "animation"];

    const pickShelfKey = (preferred: string): string => {
      if (!usedShelfKeys.has(preferred)) return preferred;
      for (const key of SHELF_PRIORITY) {
        if (!usedShelfKeys.has(key)) return key;
      }
      return preferred;
    };

    for (const ratedItem of profile.topRated.slice(0, 3)) {
      const mediaType = ratedItem.media_type === "tv" ? "tv" : "movie";
      const titleLower = ratedItem.title.toLowerCase();

      const isSuperhero = ["avengers", "spider", "batman", "superman", "marvel", "thor", "iron man",
        "captain america", "black panther", "guardians", "x-men", "deadpool", "aquaman",
        "wonder woman", "flash", "shazam", "dc ", "hulk", "ant-man"].some(k => titleLower.includes(k));
      const isScifi = ["star wars", "star trek", "matrix", "interstellar", "alien", "dune",
        "terminator", "blade runner", "inception", "avatar"].some(k => titleLower.includes(k));
      const isHorror = ["halloween", "conjuring", "saw", "scream", "it ", "evil dead",
        "nightmare", "paranormal", "annabelle"].some(k => titleLower.includes(k));
      const isDrama = ["forrest", "shawshank", "godfather", "schindler"].some(k => titleLower.includes(k));
      const isAnimation = ["toy story", "finding", "frozen", "lion king", "shrek", "kung fu panda",
        "minions", "despicable", "moana", "encanto", "wall-e", "cars "].some(k => titleLower.includes(k));

      let preferred = "action";
      if (isSuperhero) preferred = "superhero";
      else if (isScifi) preferred = "scifi";
      else if (isHorror) preferred = "horror";
      else if (isDrama) preferred = "drama";
      else if (isAnimation) preferred = "animation";

      const shelfKey = pickShelfKey(preferred);
      usedShelfKeys.add(shelfKey);

      const shelf = GENRE_SHELVES[shelfKey];
      const items = await fetchGenreShelf(shelf.genreIds, mediaType);
      if (items.length > 0) {
        builtShelves.push({
          label: shelf.label,
          icon: shelf.icon,
          basedOn: `Because you rated ${ratedItem.title}`,
          items,
          url: `/search?category=${mediaType === "tv" ? "Shows" : "Movies"}&genre=${encodeURIComponent(shelf.primaryGenre)}`
        });
        allItems.push(...items);
      }
    }

    // Add one more shelf based on top media category — must be a fresh genre
    const topCat = profile.topCategories[0];
    const finalKey = pickShelfKey(topCat === "tv" ? "drama" : "scifi");
    usedShelfKeys.add(finalKey);
    const finalShelf = GENRE_SHELVES[finalKey];
    const finalMediaType = topCat === "tv" ? "tv" : "movie";
    const finalItems = await fetchGenreShelf(finalShelf.genreIds, finalMediaType);
    if (finalItems.length > 0) {
      builtShelves.push({
        label: finalShelf.label,
        icon: finalShelf.icon,
        basedOn: topCat === "tv" ? "Because you watch TV shows" : "Based on your taste",
        items: finalItems,
        url: `/search?category=${finalMediaType === "tv" ? "Shows" : "Movies"}&genre=${encodeURIComponent(finalShelf.primaryGenre)}`
      });
      allItems.push(...finalItems);
    }

    await fetchBlitzScores(allItems);
    setShelves(builtShelves);
  };

  useEffect(() => {
    async function loadPersonalization() {
      setLoadingRecs(true);
      try {
        const profile = await getUserTasteProfile();
        if (profile) {
          setIsLoggedIn(true);
          setTasteProfile(profile);
          await buildPersonalizedShelves(profile);
        } else {
          setIsLoggedIn(false);
          // Show generic popular shelves for guest
          const guestShelves: RecommendedShelf[] = [];
          const actionItems = await fetchGenreShelf(GENRE_SHELVES["action"].genreIds, "movie");
          if (actionItems.length > 0) guestShelves.push({ label: "Trending in Action", icon: GENRE_SHELVES["action"].icon, basedOn: "Popular globally", items: actionItems, url: `/search?category=Movies&genre=Action` });

          const scifiItems = await fetchGenreShelf(GENRE_SHELVES["scifi"].genreIds, "tv");
          if (scifiItems.length > 0) guestShelves.push({ label: "Trending in Sci-Fi", icon: GENRE_SHELVES["scifi"].icon, basedOn: "Popular globally", items: scifiItems, url: `/search?category=Shows&genre=Sci-Fi` });
          const allGuest = [...actionItems, ...scifiItems];
          await fetchBlitzScores(allGuest);
          setShelves(guestShelves);
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingRecs(false);
    }
    loadPersonalization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-yellow-400 selection:text-[var(--background)] overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* Structural Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none"
           style={{ opacity: "var(--grid-opacity)", backgroundImage: "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      
      <Header />

      <main className="relative z-10 w-full px-6 pb-32">
        {/* ——— HERO SECTION ——— */}
        <section className="flex flex-col items-center text-center w-full max-w-7xl mx-auto pt-36 pb-20">
          <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="h-0.5 w-8 bg-blue-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.8em] text-[var(--muted-foreground)]">Welcome to</span>
            <div className="h-0.5 w-8 bg-yellow-400" />
          </div>

          <div className="relative mb-20 flex flex-col items-center w-full">
            <h1 className="text-8xl md:text-[12rem] font-black tracking-[-0.08em] text-[var(--foreground)] uppercase leading-[0.8]">
              BLI<span className="text-yellow-400">T</span>Z
            </h1>
            <div className="relative flex items-center w-full mt-4">
              <div className="flex-1 h-0.5 bg-blue-400/40" />
              <h2 className="text-5xl md:text-[6rem] font-black tracking-[0.25em] text-transparent uppercase leading-[1] px-10 relative"
                  style={{ WebkitTextStroke: '1.5px rgba(96, 165, 250, 0.6)' }}>
                CRITICS
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-400" />
              </h2>
              <div className="flex-1 h-0.5 bg-yellow-400/40" />
            </div>
          </div>

          {/* Search */}
          <div className="w-full max-w-2xl mt-4 relative z-50 group">
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400 opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
            <div className="relative border border-[var(--border-subtle)] bg-[var(--surface)] backdrop-blur-md focus-within:border-black/30 transition-all duration-500">
              <SearchBar />
            </div>
            <div className="flex justify-center gap-10 mt-10 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em]">
              <Link href="/browse?type=movie" className="hover:text-[var(--foreground)] transition-colors flex flex-col items-center group/cat">
                Movies <div className="h-0.5 w-0 group-hover/cat:w-full bg-[var(--foreground)] transition-all mt-1" />
              </Link>
              <span className="opacity-20">|</span>
              <Link href="/browse?type=tv" className="hover:text-blue-400 transition-colors flex flex-col items-center group/cat">
                TV Shows <div className="h-0.5 w-0 group-hover/cat:w-full bg-blue-400 transition-all mt-1" />
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="relative z-10 pt-16 flex flex-wrap items-center justify-center gap-6">
            <Link href="/new-and-popular"
              className="group flex items-center gap-6 bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-tighter text-sm px-12 py-6 transition-all duration-300 hover:bg-yellow-400 shadow-2xl">
              <FaBolt className="group-hover:scale-125 transition-transform" />
              <span>New & Popular</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link href="/browse"
              className="group flex items-center gap-6 border border-[var(--border-subtle)] text-[var(--foreground)] font-black uppercase tracking-tighter text-sm px-12 py-6 transition-all duration-300 hover:border-[var(--foreground)] hover:bg-[var(--surface)]">
              <FaFilm className="opacity-60 group-hover:opacity-100 transition-opacity" />
              <span>Browse All</span>
            </Link>
          </div>
        </section>

        {/* ——— PERSONALIZED SHELVES ——— */}
        <div className="max-w-7xl mx-auto w-full">

          {/* Personalization header */}
          <div className="flex items-center justify-between mb-12 border-b border-[var(--border-subtle)] pb-6">
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <FaHeart className="text-yellow-400 text-lg" />
              ) : (
                <FaBolt className="text-blue-400 text-lg" />
              )}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--muted-foreground)]">
                  {isLoggedIn ? `${tasteProfile?.totalRated || 0} ratings · Personalized` : "Popular Right Now"}
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[var(--foreground)]">
                  {isLoggedIn ? "Picked For You" : "Discover Something Great"}
                </h2>
              </div>
            </div>
            {!isLoggedIn && (
              <Link href="/login" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-yellow-400 transition-colors border border-[var(--border-subtle)] px-4 py-2">
                <FaUser className="text-xs" />
                Sign in for personalized recs
              </Link>
            )}
          </div>

          {loadingRecs ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border border-[var(--border-subtle)] border-t-yellow-400 border-l-blue-400 rounded-full animate-spin" />
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] animate-pulse">
                {isLoggedIn ? "Building your taste profile..." : "Loading recommendations..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-y-24">
              {shelves.map((shelf, i) => (
                <section key={i} className="w-full">
                  {/* Shelf header */}
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-1 flex items-center gap-2">
                        <FaHeart className="text-yellow-400 text-[8px]" />
                        {shelf.basedOn}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[var(--foreground)] flex items-center">
                        <span className="mr-4 text-blue-500 opacity-80">{shelf.icon}</span>{shelf.label}
                      </h3>
                    </div>
                    <Link href={shelf.url} className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border-b border-transparent hover:border-[var(--foreground)] pb-0.5">
                      See all →
                    </Link>
                  </div>

                  {/* Horizontal scroll row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {shelf.items.slice(0, 5).map(item => (
                      <ReviewCard
                        key={item.id}
                        review={item}
                        criticScore={blitzScores[item.id.toString()]?.criticAverage}
                        audienceScore={blitzScores[item.id.toString()]?.audienceAverage}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* Empty state if no shelves */}
              {shelves.length === 0 && (
                <div className="text-center py-20 border border-dashed border-[var(--border-subtle)]">
                  <p className="text-[var(--muted-foreground)] text-sm mb-4">Start rating movies and shows to get personalized picks!</p>
                  <Link href="/browse" className="text-yellow-400 font-black uppercase tracking-wider text-xs hover:underline">
                    Browse & Rate Now →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}