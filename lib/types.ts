import { FaBolt, FaFilm, FaTv, FaGamepad } from "react-icons/fa";

export type Category = "All" | "Movies" | "Shows" | "Games";

export const CATEGORY_ICON_COMPONENTS: Record<Category, React.ElementType> = {
  All: FaBolt,
  Movies: FaFilm,
  Shows: FaTv,
  Games: FaGamepad,
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
  image: string; 
  imageUrl?: string | null;
  featured?: boolean;
}
