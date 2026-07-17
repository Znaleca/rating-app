import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/**',
      },
      {
        // Google Books API CDN — this is the actual host for book thumbnails
        protocol: 'https',
        hostname: 'books.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.ltrbxd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;