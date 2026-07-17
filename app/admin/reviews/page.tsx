import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FaStar, FaShieldAlt, FaFeatherAlt, FaUserCircle, FaFilm } from "react-icons/fa";

export default async function AdminReviewsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!currentProfile || currentProfile.role !== "admin") redirect("/");

    // Fetch all ratings that have a review or rating
    const { data: reviews, error } = await supabase
        .from("ratings")
        .select(`
            id,
            media_id,
            title,
            rating,
            review,
            status,
            media_type,
            created_at,
            user_id,
            profiles (
                full_name,
                role
            )
        `)
        .order("created_at", { ascending: false }) as unknown as {
            data: {
                id: string;
                media_id: string;
                title: string;
                rating: number | null;
                review: string | null;
                status: string | null;
                media_type: string;
                created_at: string;
                user_id: string;
                profiles: { full_name: string; role: string } | null;
            }[] | null;
            error: any;
        };

    const roleIcon = (role: string) => {
        if (role === "admin") return <FaShieldAlt className="text-violet-400" size={9} />;
        if (role === "critics") return <FaFeatherAlt className="text-yellow-400" size={9} />;
        return <FaUserCircle className="text-blue-400" size={9} />;
    };

    const roleColor = (role: string) => {
        if (role === "admin") return "text-violet-400";
        if (role === "critics") return "text-yellow-400";
        return "text-blue-400";
    };

    return (
        <div className="p-8 xl:p-12">
            {/* Header */}
            <div className="mb-10 border-b border-[var(--border-subtle)] pb-8 flex items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)]">Activity</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--foreground)]">Reviews</h1>
                    <p className="text-[var(--muted-foreground)] text-sm mt-2 font-medium">All ratings and reviews submitted across the platform</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-4xl font-black text-[var(--foreground)]">{reviews?.length ?? 0}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Total Entries</p>
                </div>
            </div>

            {error ? (
                <div className="border border-red-400/30 bg-red-400/10 p-6 text-red-400 text-sm font-bold">
                    Error loading reviews: {error.message}
                </div>
            ) : !reviews || reviews.length === 0 ? (
                <div className="text-center py-24 border border-[var(--border-subtle)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-sm">
                    No reviews found
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((rev) => {
                        const role = rev.profiles?.role ?? "audience";
                        const name = rev.profiles?.full_name ?? "Anonymous";
                        return (
                            <div key={rev.id} className="border border-[var(--border-subtle)] bg-[var(--foreground)]/[0.015] p-5 hover:bg-[var(--foreground)]/[0.03] transition-colors group">
                                <div className="flex items-start gap-5">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 bg-[var(--foreground)]/5 border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-black text-[var(--muted-foreground)] shrink-0">
                                        {name.substring(0, 2).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Top row */}
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-sm font-black text-[var(--foreground)]">{name}</span>
                                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${roleColor(role)}`}>
                                                {roleIcon(role)} {role}
                                            </span>
                                            <span className="text-[var(--muted-foreground)] text-[9px]">•</span>
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted-foreground)]">
                                                <FaFilm size={8} /> {rev.title || rev.media_id}
                                            </span>
                                            <span className="text-[var(--muted-foreground)] text-[9px]">•</span>
                                            <span className="text-[9px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">{rev.media_type}</span>

                                            {rev.rating != null && (
                                                <span className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black">
                                                    <FaStar size={8} /> {rev.rating}/10
                                                </span>
                                            )}
                                        </div>

                                        {/* Review text */}
                                        {rev.review && rev.review.trim() !== "" ? (
                                            <p className="text-[var(--foreground)] text-sm leading-relaxed border-l-2 border-[var(--border-subtle)] pl-4 italic">
                                                "{rev.review}"
                                            </p>
                                        ) : (
                                            <p className="text-[var(--muted-foreground)] text-xs italic">No review text — rating only</p>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center gap-4 mt-3">
                                            {rev.status && (
                                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted-foreground)] border border-[var(--border-subtle)] px-2 py-1">
                                                    {rev.status}
                                                </span>
                                            )}
                                            <span className="text-[8px] text-[var(--muted-foreground)] font-bold ml-auto">
                                                {new Date(rev.created_at).toLocaleDateString(undefined, {
                                                    year: "numeric", month: "short", day: "numeric",
                                                    hour: "2-digit", minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
