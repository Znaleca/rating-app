"use client";

import { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Review } from "@/lib/types";

interface BrowseSearchProps {
  onSearch: (query: string) => void;
  data: Review[]; 
  initialQuery?: string;
}

export default function BrowseSearch({ onSearch, initialQuery = "" }: BrowseSearchProps) {
  const [text, setText] = useState(initialQuery);

  const handleManualSearch = () => {
    onSearch(text.trim());
  };

  const handleClear = () => {
    setText("");
    onSearch("");
  };

  return (
    <div className="flex w-full gap-0 relative z-50 group">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-zinc-500 group-focus-within:text-yellow-400 transition-colors" />
        </div>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
          placeholder="SEARCH THE ARCHIVES..."
          className="w-full bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-800 py-6 pl-14 pr-14 text-sm font-black tracking-[0.2em] text-white placeholder:text-zinc-700 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all uppercase rounded-l-2xl"
        />

        {text && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-6 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        onClick={handleManualSearch}
        className="px-8 md:px-12 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] tracking-[0.2em] uppercase transition-all flex-shrink-0 rounded-r-2xl border-2 border-yellow-400"
      >
        Search
      </button>
    </div>
  );
}