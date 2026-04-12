"use server";

import { createClient } from "@/lib/supabase/server";

export async function changeUserRole(profileId: string, newRole: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!currentProfile || currentProfile.role !== "admin") {
        return { error: "Unauthorized" };
    }

    const validRoles = ["audience", "critics", "admin"];
    if (!validRoles.includes(newRole)) return { error: "Invalid role" };

    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", profileId);

    if (error) return { error: error.message };
    return { success: true };
}
