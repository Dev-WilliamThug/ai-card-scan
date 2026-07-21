"use client"

import { Building2, UserRound, Scan } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function BottomBar() {
    const pathname = usePathname();

    const items = [
        { href: "/companies", icon: Building2, label: "Entreprises" },
        { href: "/scan", icon: Scan, label: "Scanner", isHero: true },
        { href: "/contacts", icon: UserRound, label: "Contacts" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
            {/* Effet Blur Glassmorphism avec bordure subtile */}
            <div className="mx-auto flex h-16 max-w-md items-center justify-around border-t border-slate-200/60 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

    
                    if (item.isHero) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-3 flex flex-col items-center gap-1 group"
                            >
                                <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 group-active:scale-90 ${
                                    isActive 
                                        ? "bg-primary text-primary-foreground shadow-primary/30 ring-4 ring-primary/20" 
                                        : "bg-primary/90 text-primary-foreground shadow-primary/20 hover:bg-primary"
                                }`}>
                                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <span className={`text-[10px] font-medium transition-colors ${
                                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                                }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 active:scale-95 ${
                                isActive 
                                    ? "text-primary font-medium" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {/* Pilule lumineuse d'indication d'activation */}
                            {isActive && (
                                <span className="absolute -top-1 h-1 w-8 rounded-full bg-primary transition-all duration-300" />
                            )}

                            <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                            <span className="text-[11px] tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export { BottomBar }