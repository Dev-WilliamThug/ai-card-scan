import { Building2, UserRound, Scan } from "lucide-react"
import Link from "next/link";

function BottomBar() {
    const items = [
        { href: "/companies", icon: <Building2 className="h-6 w-6 text-gray-500" />, label: "Entreprises" },
        { href: "/scan", icon: <Scan className="h-6 w-6 text-gray-500" />, label: "Scanner" },
        { href: "/contacts", icon: <UserRound className="h-6 w-6 text-gray-500" />, label: "Contacts" },
    ];
    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t h-16 pt-2 md:hidden">
                {items.map((item) => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center  gap-1">
                        {item.icon}
                        <span className="text-xs text-gray-500">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </>
    )
}

export { BottomBar }