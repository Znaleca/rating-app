"use client";

import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaShieldAlt, FaFeatherAlt, FaUserCircle, FaUserPlus, FaCheck } from "react-icons/fa";
import { createAccountAction } from "@/app/actions/actions";

const ROLE_OPTIONS = [
    {
        value: "audience",
        label: "Audience",
        desc: "Standard user — can rate and review",
        icon: FaUserCircle,
        accent: "border-blue-400",
        bg: "bg-blue-400/5",
        text: "text-blue-400",
    },
    {
        value: "critics",
        label: "Critics",
        desc: "Verified critic — ratings count as critic score",
        icon: FaFeatherAlt,
        accent: "border-yellow-400",
        bg: "bg-yellow-400/5",
        text: "text-yellow-400",
    },
    {
        value: "admin",
        label: "Admin",
        desc: "Full platform and user management access",
        icon: FaShieldAlt,
        accent: "border-violet-400",
        bg: "bg-violet-400/5",
        text: "text-violet-400",
    },
];

export default function AddAccountPage() {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState("audience");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const result = await createAccountAction(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Account created successfully!" });
            form.reset();
            setSelectedRole("audience");
        }

        setLoading(false);
    }

    return (
        <div className="p-8 xl:p-12">
            {/* Header */}
            <div className="mb-10 border-b border-[var(--border-subtle)] pb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FaUserPlus className="text-yellow-400 text-sm" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)]">Management</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[var(--foreground)]">Create Account</h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-2 font-medium">Manually create a new user and assign their role</p>
            </div>

            <div className="max-w-2xl">
                {message && (
                    <div className={`mb-6 p-4 border text-sm font-bold flex items-center gap-3 ${
                        message.type === "success"
                            ? "bg-green-400/10 border-green-400/30 text-green-400"
                            : "bg-red-400/10 border-red-400/30 text-red-400"
                    }`}>
                        {message.type === "success" && <FaCheck size={12} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Full Name */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-3">
                            Full Name
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs" />
                            <input
                                name="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] text-[var(--foreground)] text-sm py-3.5 pl-10 pr-4 placeholder-[var(--muted-foreground)] outline-none focus:border-yellow-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-3">
                            Email
                        </label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="user@example.com"
                                className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] text-[var(--foreground)] text-sm py-3.5 pl-10 pr-4 placeholder-[var(--muted-foreground)] outline-none focus:border-yellow-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-3">
                            Password
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs" />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border-subtle)] text-[var(--foreground)] text-sm py-3.5 pl-10 pr-4 placeholder-[var(--muted-foreground)] outline-none focus:border-yellow-400 transition-colors"
                            />
                        </div>
                        <p className="text-[var(--muted-foreground)] text-[10px] mt-2 font-medium">Must be at least 6 characters</p>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-4">
                            Assign Role
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {ROLE_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = selectedRole === option.value;
                                return (
                                    <label
                                        key={option.value}
                                        className={`flex flex-col p-5 cursor-pointer border transition-all ${
                                            isSelected
                                                ? `${option.accent} ${option.bg}`
                                                : "border-[var(--border-subtle)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.05]"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={option.value}
                                            className="sr-only"
                                            checked={isSelected}
                                            onChange={() => setSelectedRole(option.value)}
                                        />
                                        <Icon className={`${isSelected ? option.text : "text-[var(--muted-foreground)]"} mb-3 text-lg transition-colors`} />
                                        <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight mb-1">{option.label}</span>
                                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium leading-relaxed">{option.desc}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creating Account...
                            </>
                        ) : (
                            <><FaUserPlus size={11} /> Create Account</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
