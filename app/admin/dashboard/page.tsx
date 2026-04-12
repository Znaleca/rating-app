import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FaUsers, FaStar, FaShieldAlt, FaFeatherAlt, FaUserCircle, FaChartLine } from "react-icons/fa";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!currentProfile || currentProfile.role !== "admin") redirect("/");

    // Fetch stats
    const [{ count: totalUsers }, { count: totalReviews }, { data: roleCounts }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("ratings").select("*", { count: "exact", head: true }).not("review", "is", null).neq("review", ""),
        supabase.from("profiles").select("role"),
    ]);

    const critics = roleCounts?.filter(p => p.role === "critics").length ?? 0;
    const admins = roleCounts?.filter(p => p.role === "admin").length ?? 0;
    const audience = roleCounts?.filter(p => p.role === "audience").length ?? 0;

    const stats = [
        { label: "Total Users", value: totalUsers ?? 0, icon: FaUsers, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
        { label: "Total Reviews", value: totalReviews ?? 0, icon: FaStar, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
        { label: "Critics", value: critics, icon: FaFeatherAlt, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
        { label: "Admins", value: admins, icon: FaShieldAlt, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
        { label: "Audience", value: audience, icon: FaUserCircle, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    ];

    return (
        <div className="p-8 xl:p-12">
            {/* Header */}
            <div className="mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FaChartLine className="text-yellow-400 text-sm" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Overview</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">Blitz platform administration console</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`border ${s.bg} p-6 relative overflow-hidden`}>
                            <Icon className={`${s.color} text-2xl mb-4`} />
                            <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                            <div className={`absolute bottom-0 left-0 h-[2px] w-full ${s.color.replace("text-", "bg-")} opacity-40`} />
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">Quick Actions</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { href: "/admin/accounts", title: "Manage Accounts", desc: "View all users, change roles", icon: FaUsers, accent: "border-blue-400/30 hover:border-blue-400" },
                        { href: "/admin/add-account", title: "Create Account", desc: "Add a new critic or admin account", icon: FaFeatherAlt, accent: "border-yellow-400/30 hover:border-yellow-400" },
                        { href: "/admin/reviews", title: "All Reviews", desc: "Browse every submitted review", icon: FaStar, accent: "border-violet-400/30 hover:border-violet-400" },
                    ].map(item => {
                        const Icon = item.icon;
                        return (
                            <a key={item.href} href={item.href} className={`block p-6 bg-white/[0.02] border ${item.accent} transition-all group`}>
                                <Icon className="text-slate-500 group-hover:text-white mb-4 text-xl transition-colors" />
                                <p className="text-sm font-black uppercase tracking-tight text-white mb-1">{item.title}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
