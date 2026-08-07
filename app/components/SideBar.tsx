"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Contact, Scan, Settings, Upload, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth-client";

function SideBar() {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const isAdmin = session?.user?.role === "admin";
    const navItems = [
        { href: "/contacts", icon: Contact, label: "Contacts" },
        { href: "/scan", icon: Upload, label: "Importer une carte", isHero: true },
    ];
    {
        isAdmin && navItems.push(
            {
                href: "/users",
                icon: UserRound,
                label: "Utilisateurs",
                isHero: true,
            }
        )
    }
    const isParamActive = pathname ==="/settings";
    return (

        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-md z-40 p-4 justify-between">
            <div className="space-y-6">

                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
                        <Scan className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                            AI-Card Scan
                        </h1>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Digitalisation IA
                        </p>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Menu principal
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4 space-y-1">
                <Link
                    href="/settings"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${isParamActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`}
                >
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                </Link>
            </div>
        </aside>
    );
}

export { SideBar }