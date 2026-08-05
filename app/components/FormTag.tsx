import React, { useState } from "react";
import { X, Check, Tag as TagIcon, Loader2 } from "lucide-react";

const PRESET_COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4",
    "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#64748B",
];

interface FormTagProps {
    isOpen: boolean;
    onClose: () => void;
    onTagCreated: () => void;
}

export function FormTag({
    isOpen,
    onClose,
    onTagCreated,
}: FormTagProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[5]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/tag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    color,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Une erreur s'est produite.");
            }

            await onTagCreated();

            setName("");
            setColor(PRESET_COLORS[5]);
            onClose();
        } catch (error: any) {
            setErrorMessage(error.message || "Erreur de connexion au serveur.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <TagIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Créer un nouveau tag
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message d'erreur éventuel */}
                {errorMessage && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        {errorMessage}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                            Nom du tag
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: VIP, Client..."
                            disabled={isSubmitting}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Sélection de la couleur */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            Couleur du tag
                        </label>
                        <div className="grid grid-cols-5 gap-2.5">
                            {PRESET_COLORS.map((presetColor) => {
                                const isSelected = color === presetColor;
                                return (
                                    <button
                                        key={presetColor}
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => setColor(presetColor)}
                                        style={{ backgroundColor: presetColor }}
                                        className={`h-9 w-full rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSelected
                                                ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105"
                                                : "hover:scale-105 opacity-85 hover:opacity-100"
                                            }`}
                                    >
                                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-primary-content bg-primary hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isSubmitting ? "Création..." : "Créer le tag"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormTag;