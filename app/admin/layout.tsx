"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartLine, FaUsers, FaUserPlus, FaStar, FaBolt, FaArrowLeft, FaShieldAlt } from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { href: "/admin/dashboard", label: "Dashboard", icon: FaChartLine },
        { href: "/admin/accounts", label: "Accounts", icon: FaUsers },
        { href: "/admin/add-account", label: "Create Account", icon: FaUserPlus },
        { href: "/admin/reviews", label: "Reviews", icon: FaStar },
    ];

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border-subtle)] bg-[#080808] flex flex-col shrink-0 hidden md:flex justify-between sticky top-0 h-screen">
                <div className="p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[var(--border-subtle)]">
                        <div className="w-8 h-8 bg-yellow-400 flex items-center justify-center">
                            <FaBolt className="text-[var(--background)] text-sm" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)]">Blitz</p>
                            <p className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] leading-none">Admin</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 px-2 py-1 bg-yellow-400/10 border border-yellow-400/20">
                            <FaShieldAlt className="text-yellow-400 text-[8px]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400">Root</span>
                        </div>
                    </div>

                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-4 px-2">Navigation</p>
                    <nav className="flex flex-col gap-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-l-2 ${
                                        isActive
                                            ? "border-yellow-400 bg-yellow-400/5 text-yellow-400"
                                            : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                                    }`}
                                >
                                    <Icon size={11} className={isActive ? "text-yellow-400" : "text-[var(--muted-foreground)]"} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-[var(--border-subtle)]">
                    <Link
                        href="/browse"
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all border-l-2 border-transparent w-full"
                    >
                        <FaArrowLeft size={10} />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden min-h-screen">
                {children}
            </main>
        </div>
    );
}
