"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Header } from "@/app/components/Header";
import { SideBar } from "@/app/components/SideBar";
import { authClient } from "@/lib/auth-client";
import {
    User,
    Palette,
    Shield,
    Save,
    Moon,
    Sun,
    Globe,
    Key,
    Check,
    AlertCircle,
    Loader2,
    EyeOff,
    Eye,
    ShieldAlert
} from "lucide-react";

export default function SettingsPage() {
    const { data: session, isPending: isSessionLoading } = authClient.useSession();

    const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "security">("profile");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { theme, setTheme } = useTheme();

    const navItems = [
        { id: "profile", label: "Profil & Compte", icon: User },
        { id: "appearance", label: "Apparence & Thème", icon: Palette },
        { id: "security", label: "Sécurité", icon: Shield },
    ] as const;

    const [showNew, setShowNew] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (session?.user) {
            setEmail(session.user.email || "");

            const nameParts = (session.user.name || "").trim().split(" ");
            if (nameParts.length > 1) {
                setFirstName(nameParts[0]);
                setLastName(nameParts.slice(1).join(" "));
            } else {
                setFirstName(session.user.name || "");
                setLastName("");
            }
        }
    }, [session]);

    const userInitials = session?.user?.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

            const { error: updateError } = await authClient.updateUser({
                name: fullName,
            });

            if (updateError) {
                throw new Error(updateError.message || "Échec de la mise à jour du profil");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (newPassword.length < 8) {
            setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les nouveaux mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const { error: changeError } = await authClient.changePassword({
                currentPassword,
                newPassword,
            });

            if (changeError) {
                throw new Error(
                    changeError.message || "Impossible de modifier le mot de passe."
                );
            }

            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => setSuccess(false), 4000);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors du changement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <Header />
            <SideBar />

            {/* Zone de contenu principal avec marge adaptative pour la sidebar */}
            <main className="md:ml-64 pt-16 min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* En-tête de la page */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Paramètres
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Gérez vos préférences personnelles et la sécurité.
                    </p>
                </div>

                {/* Layout principal : Tabs à gauche (desktop) / Contenu à droite */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Menu des Onglets */}
                    <div className="lg:col-span-3">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0 w-full text-left ${isActive
                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-4 h-4 ${isActive
                                                ? "text-amber-500 dark:text-amber-400"
                                                : "text-slate-400 dark:text-slate-500"
                                                }`}
                                        />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Formulaire & Panneaux de réglages */}
                    <div className="lg:col-span-9">
                        {/* --- ONGLET 1: PROFIL & COMPTE --- */}
                        {activeTab === "profile" && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Informations Personnelles
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mettez à jour vos données de compte et votre identité.
                                        </p>
                                    </div>
                                    {error && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xl flex items-center justify-center border border-amber-500/20 shrink-0">
                                            {isSessionLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                userInitials
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {session?.user?.name || "Utilisateur"}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Rôle : <span className="font-semibold uppercase">{session?.user?.role || "USER"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                Prénom
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={firstName || ""}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Votre prénom"
                                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                Nom
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName || ""}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Votre nom"
                                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Adresse Email
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            value={email || ""}
                                            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        />
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                            L'adresse email ne peut pas être modifiée.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        {success && (
                                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-200">
                                                <Check className="w-4 h-4" /> Modifications enregistrées !
                                            </span>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading || isSessionLoading}
                                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Enregistrement...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Enregistrer</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* --- ONGLET 3: APPARENCE & THÈME --- */}
                        {activeTab === "appearance" && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Thème de l'interface
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Personnalisez le visuel selon votre environnement de travail.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTheme("light")}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === "light"
                                            ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-medium"
                                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                            }`}
                                    >
                                        <Sun className="w-5 h-5" />
                                        <span className="text-xs">Clair</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTheme("dark")}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === "dark"
                                            ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-medium"
                                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                            }`}
                                    >
                                        <Moon className="w-5 h-5" />
                                        <span className="text-xs">Sombre</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTheme("system")}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === "system"
                                            ? "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-medium"
                                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                            }`}
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span className="text-xs">Système</span>
                                    </button>
                                </div>
                            </div>

                        )}

                        {/* --- ONGLET 4: SÉCURITÉ --- */}
                        {activeTab === "security" && (
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Key className="w-5 h-5 text-amber-500" />
                                            Modifier le mot de passe
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Assurez-vous d'utiliser un mot de passe fort contenant au moins 8 caractères.
                                        </p>
                                    </div>
                             
                                    {error && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                                            <Check className="w-4 h-4 shrink-0" />
                                            <span>Votre mot de passe a été modifié avec succès !</span>
                                        </div>
                                    )}

                                    <div className="space-y-4 max-w-md">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                Mot de passe actuel
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrent ? "text" : "password"}
                                                    required
                                                    value={currentPassword || ""}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrent(!showCurrent)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                >
                                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                Nouveau mot de passe
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    required
                                                    value={newPassword || ""}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Au moins 8 caractères"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(!showNew)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                >
                                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                Confirmer le nouveau mot de passe
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword || ""}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Répétez le nouveau mot de passe"
                                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Mise à jour...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Changer le mot de passe</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                        )}
                    </div>
                </div >
            </main >
        </div>
    );
}