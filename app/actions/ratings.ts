"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

const BULK_SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;
const bulkRatingsSummaryCache = new Map<string, { expiresAt: number; summaries: Record<string, { criticAverage: string; audienceAverage: string }> }>();

interface InteractionData {
    rating?: number | null;
    status?: string | null;
    review?: string | null;
    title: string;
    posterUrl: string | null;
    mediaType: string;
    genre?: string | null;
}

export async function updateInteraction(mediaId: string, data: InteractionData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to interact with archives." };
    }

    if (data.rating !== undefined && data.rating !== null && (data.rating < 0 || data.rating > 10)) {
        return { error: "Rating must be between 0 and 10." };
    }

    // Prepare upsert payload
    const payload: any = {
        media_id: mediaId,
        user_id: user.id,
        title: data.title,
        poster_url: data.posterUrl,
        media_type: data.mediaType
    };

    if (data.rating !== undefined) payload.rating = data.rating;
    if (data.status !== undefined) payload.status = data.status;
    if (data.review !== undefined) payload.review = data.review;
    if (data.genre !== undefined) payload.genre = data.genre;

    // Upsert interaction
    const { error } = await supabase
        .from("ratings")
        .upsert(payload, { onConflict: "media_id,user_id" });

    if (error) {
        return { error: "Failed to submit interaction: " + error.message };
    }

    revalidatePath(`/archives/${mediaId}`);
    return { success: true };
}

export async function getRatingsSummary(mediaId: string) {
    const supabase = await createClient();
    
    const { data: ratings, error } = await supabase
        .from("ratings")
        .select(`
            id,
            rating,
            status,
            review,
            created_at,
            user_id,
            profiles (
                full_name,
                role
            )
        `)
        .eq("media_id", mediaId)
        .order("created_at", { ascending: false }) as unknown as { 
            data: { 
                id: string, rating: number | null, status: string | null, review: string | null, created_at: string, user_id: string, profiles: { full_name: string, role: string } | null
            }[] | null, 
            error: any 
        };



    const { data: { user } } = await supabase.auth.getUser();

    let criticTotal = 0;
    let criticCount = 0;
    let audienceTotal = 0;
    let audienceCount = 0;
    let userRating = null;
    let userStatus = null;
    let userReview = null;
    const reviews: any[] = [];

    if (ratings && !error) {
        ratings.forEach((row) => {
            const role = row.profiles?.role ?? "audience";
            if (row.rating != null) {
                if (role === "critics" || role === "admin") {
                    criticTotal += row.rating;
                    criticCount++;
                } else {
                    audienceTotal += row.rating;
                    audienceCount++;
                }
            }

            if (row.review && row.review.trim() !== '') {
                reviews.push({
                    id: row.id,
                    name: row.profiles?.full_name ?? "Anonymous",
                    role: role,
                    rating: row.rating,
                    review: row.review,
                    created_at: row.created_at
                });
            }

            if (user && row.user_id === user.id) {
                userRating = row.rating;
                userStatus = row.status;
                userReview = row.review;
            }
        });
    }

    return {
        criticAverage: criticCount > 0 ? (criticTotal / criticCount).toFixed(1) : "N/A",
        audienceAverage: audienceCount > 0 ? (audienceTotal / audienceCount).toFixed(1) : "N/A",
        userRating,
        userStatus,
        userReview,
        reviews,
        error: error ? error.message : null
    };
}

export async function getUserInteractions() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { items: [], error: "Not logged in" };
    }

    const { data: interactions, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return {
        items: interactions || [],
        error: error ? error.message : null
    };
}

export async function getBulkRatingsSummaries(mediaIds: string[]) {
    const supabase = await createClient();

    const uniqueIds = Array.from(new Set((mediaIds || []).filter(Boolean)));
    const cacheKey = uniqueIds.slice().sort().join("|");
    const cached = bulkRatingsSummaryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.summaries;
    }

    // Default structure for all ids requested
    const summaries: Record<string, { criticAverage: string, audienceAverage: string }> = {};
    uniqueIds.forEach(id => summaries[id] = { criticAverage: "N/A", audienceAverage: "N/A" });

    if (uniqueIds.length === 0) return summaries;

    const { data: ratings, error } = await supabase
        .from("ratings")
        .select(`
            media_id,
            rating,
            profiles (role)
        `)
        .in("media_id", uniqueIds) as unknown as { 
            data: { media_id: string, rating: number | null, profiles: { role: string } | null }[] | null, 
            error: any 
        };

    if (ratings && !error) {
        const stats: Record<string, { criticTotal: number, criticCount: number, audTotal: number, audCount: number }> = {};
        uniqueIds.forEach(id => stats[id] = { criticTotal: 0, criticCount: 0, audTotal: 0, audCount: 0 });

        ratings.forEach((row) => {
            if (row.rating != null && stats[row.media_id]) {
                const role = row.profiles?.role ?? "audience";
                if (role === "critics" || role === "admin") {
                    stats[row.media_id].criticTotal += row.rating;
                    stats[row.media_id].criticCount++;
                } else {
                    stats[row.media_id].audTotal += row.rating;
                    stats[row.media_id].audCount++;
                }
            }
        });

        uniqueIds.forEach(id => {
            const s = stats[id];
            summaries[id] = {
                criticAverage: s.criticCount > 0 ? (s.criticTotal / s.criticCount).toFixed(1) : "N/A",
                audienceAverage: s.audCount > 0 ? (s.audTotal / s.audCount).toFixed(1) : "N/A"
            };
        });
    }

    bulkRatingsSummaryCache.set(cacheKey, {
        expiresAt: Date.now() + BULK_SUMMARY_CACHE_TTL_MS,
        summaries,
    });

    return summaries;
}

export async function searchUsers(query: string) {
    if (!query || query.trim().length < 2) return { users: [] };
    // Use service client to bypass RLS — profiles are public read
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .ilike("full_name", `%${query.trim()}%`)
        .limit(6);

    if (error) { console.error("searchUsers error:", error.message); return { users: [] }; }
    return { users: data || [] };
}

export async function getPublicUserProfile(userId: string) {
    // Use service client to bypass RLS for public profile + ratings reads
    const supabase = createServiceClient();

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .single();

    if (profileError || !profile) return { error: "User not found" };

    const { data: interactions } = await supabase
        .from("ratings")
        .select("id, media_id, rating, status, review, title, poster_url, media_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    return {
        profile,
        interactions: interactions || [],
    };
}

export async function getUserTasteProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: interactions, error } = await supabase
        .from("ratings")
        .select("media_id, rating, media_type, title, poster_url")
        .eq("user_id", user.id)
        .not("rating", "is", null)
        .order("rating", { ascending: false })
        .limit(20);

    if (error || !interactions || interactions.length === 0) return null;

    // Count category preferences
    const categoryCounts: Record<string, number> = {};
    interactions.forEach(item => {
        const cat = item.media_type || "movie";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);

    // Top rated items for "Because you rated X" sections
    const topRated = interactions.slice(0, 3);

    return {
        topRated,
        topCategories,
        totalRated: interactions.length,
    };
}
