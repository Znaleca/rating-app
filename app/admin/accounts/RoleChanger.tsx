"use client";

import { useState } from "react";
import { changeUserRole } from "@/app/actions/admin";

const ROLES = ["audience", "critics", "admin"] as const;

export default function RoleChanger({ profileId, currentRole }: { profileId: string; currentRole: string }) {
    const [role, setRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleChange(newRole: string) {
        if (newRole === role) return;
        setLoading(true);
        setSaved(false);
        const res = await changeUserRole(profileId, newRole);
        if (res.success) {
            setRole(newRole);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setLoading(false);
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={role}
                onChange={(e) => handleChange(e.target.value)}
                disabled={loading}
                className="bg-[#0a0a0a] border border-white/10 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 outline-none focus:border-yellow-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
                {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            {saved && <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">✓ Saved</span>}
            {loading && <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">…</span>}
        </div>
    );
}
