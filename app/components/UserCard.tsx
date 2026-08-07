import React from "react";
import { Trash2, ShieldCheck } from "lucide-react";

export interface UserItem {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface UserCardProps {
  user: UserItem;
  onToggleAdmin?: (id: string, isAdmin: boolean) => void;
  onDelete?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onToggleAdmin,
  onDelete,
}) => {
  const isAdmin = user.role?.toLowerCase() === "admin";

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-200/80 dark:border-amber-800/40 shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {user.name}
          </p>
          {user.email && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <ShieldCheck
              className={`w-4 h-4 ${
                isAdmin
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            />
            Admin
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => onToggleAdmin?.(user.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-200 after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 dark:peer-checked:bg-amber-500"></div>
          </div>
        </label>

        <button
          onClick={() => onDelete?.(user.id)}
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
          title="Supprimer l'utilisateur"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};