import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FaUsers, FaShieldAlt, FaFeatherAlt, FaUserCircle } from "react-icons/fa";
import RoleChanger from "./RoleChanger";

export default async function AdminAccountsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!currentProfile || currentProfile.role !== "admin") redirect("/");

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false });

    const roleConfig: Record<string, { label: string; icon: typeof FaShieldAlt; color: string; bg: string }> = {
        admin:    { label: "Admin",    icon: FaShieldAlt,   color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/30" },
        critics:  { label: "Critics",  icon: FaFeatherAlt,  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
        audience: { label: "Audience", icon: FaUserCircle,  color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30" },
    };

    return (
        <div className="p-8 xl:p-12">
            {/* Header */}
            <div className="mb-10 border-b border-white/5 pb-8 flex items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <FaUsers className="text-blue-400 text-sm" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Management</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">Accounts</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Manage user roles and permissions</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-4xl font-black text-white">{profiles?.length ?? 0}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Users</p>
                </div>
            </div>

            {error ? (
                <div className="border border-red-400/30 bg-red-400/10 p-6 text-red-400 text-sm font-bold">
                    Error loading profiles. Ensure you have added the Admin RLS policy in Supabase.
                </div>
            ) : !profiles || profiles.length === 0 ? (
                <div className="text-center py-24 border border-white/5 text-slate-600 font-black uppercase tracking-widest text-sm">
                    No users found
                </div>
            ) : (
                <div className="border border-white/5 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 bg-white/[0.02] border-b border-white/5 px-6 py-3">
                        <div className="col-span-5 text-[9px] font-black uppercase tracking-widest text-slate-500">User</div>
                        <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Role</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Joined</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Change Role</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/5">
                        {profiles.map((profile) => {
                            const cfg = roleConfig[profile.role] ?? roleConfig.audience;
                            const Icon = cfg.icon;
                            return (
                                <div key={profile.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                                    {/* User */}
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="w-9 h-9 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                            {(profile.full_name || "U").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{profile.full_name || "Unknown User"}</p>
                                            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">{profile.id.substring(0, 8)}…</p>
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
                                            <Icon size={9} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Joined */}
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-slate-500">
                                            {new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>

                                    {/* Role Changer */}
                                    <div className="col-span-2">
                                        <RoleChanger profileId={profile.id} currentRole={profile.role} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
