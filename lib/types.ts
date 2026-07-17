import { FaBolt, FaFilm, FaTv } from "react-icons/fa";

export type Category = "All" | "Movies" | "Shows";

export const CATEGORY_ICON_COMPONENTS: Record<Category, React.ElementType> = {
  All: FaBolt,
  Movies: FaFilm,
  Shows: FaTv,
};

export interface Review {
  id: string | number;
  title: string;
  category: Category;
  rating: number; 
  year: number | string;
  genre: string;
  reviewer: string;
  avatar: string;
  summary: string;
  image?: string; 
  imageUrl?: string | null;
  posterUrl?: string | null;
  featured?: boolean;
}
