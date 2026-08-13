"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

function Header() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await authClient.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-md transition-colors md:pl-72 flex items-center justify-between px-4 md:px-6">

      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          AI Card Scan
        </span>
      </div>


      <div className="flex items-center gap-3">
        <div className="dropdown dropdown-end">


          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar ring-2 ring-slate-200/80 dark:ring-slate-800 hover:ring-primary/40 transition-all duration-200"
          >
            <div className="w-9 rounded-full">
              <User className="w-full h-8"/>
            </div>
          </div>


          <ul
            tabIndex={-1}
            className="dropdown-content menu mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50 z-50 space-y-1"
          >
            <li>
              <button
                onClick={handleLogout}
                className="group flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700 active:scale-95 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
                  <span>Déconnexion</span>
                </div>
              </button>
            </li>
          </ul>

        </div>
      </div>
    </header>
  );
}

export { Header };