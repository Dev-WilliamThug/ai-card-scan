"use client";

import { Loader2, Mail, Pencil, Phone, Trash2, Eye } from "lucide-react";
import type { ContactDetails } from "./FormContact";
import Link from "next/link";

interface ContactCardProps {
  contact: ContactDetails;
  onEdit: (contact: ContactDetails) => void;
  onDelete: (id: string) => void;
  onView: (contact: ContactDetails) => void;
  isDeleting: boolean;
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onView,
  isDeleting,
}: ContactCardProps) {
  const initials = `${contact.firstName.charAt(0)}${contact.lastName?.charAt(0) ?? ""
    }`.toUpperCase();
  const fullName = `${contact.firstName} ${contact.lastName ?? ""}`.trim();

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="block w-full md:w-auto">
      <article className="group relative flex flex-row md:flex-col items-center gap-4 p-4 md:p-6 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:hover:shadow-slate-950/50 rounded-2xl w-full max-w-full md:max-w-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700">

        <div className="flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary font-bold text-lg md:text-xl shrink-0 ring-1 ring-primary/20 group-hover:scale-105 transition-transform duration-300">
          {initials}
        </div>

        <div className="flex-1 min-w-0 flex flex-col md:items-center w-full">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 md:text-lg truncate w-full md:text-center group-hover:text-primary transition-colors">
            {fullName}
          </h3>

          {contact.jobTitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate w-full md:text-center font-medium">
              {contact.jobTitle}
            </p>
          )}

          {contact.companyName ? (
            <p className="text-xs text-slate-400 dark:text-slate-400 font-medium truncate w-full md:text-center mt-0.5">
              {contact.companyName}
            </p>
          ) : (
            <p className="text-xs text-slate-400/70 dark:text-slate-500 italic font-normal truncate w-full md:text-center mt-0.5">
              Aucune entreprise
            </p>
          )}

          {contact.tag ? (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <span>{contact.tag.name}</span>
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: contact.tag.color }}
                aria-label={`Couleur du tag ${contact.tag.name}`}
              />
            </div>
          ) : (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40">
              <span>Aucun tag</span>
            </div>
          )}

          <div className="w-full mt-3 space-y-1">
            <p className={`text-xs truncate w-full md:text-center inline-flex items-center gap-1.5 md:justify-center ${contact.emails?.[0] ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/60 dark:text-slate-500 italic'}`}>
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              {contact.emails?.[0]?.email ?? "Aucun email"}
            </p>

            <p className={`text-xs truncate w-full md:text-center inline-flex items-center gap-1.5 md:justify-center ${contact.phones?.[0] ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/60 dark:text-slate-500 italic'}`}>
              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              {contact.phones?.[0]?.telephone ?? "Aucun numéro"}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 shrink-0 md:w-full md:justify-center md:mt-3 border-l md:border-l-0 md:border-t border-slate-100 dark:border-slate-800/80 pl-3 md:pl-0 md:pt-3">
          <button
            type="button"
            onClick={(e) => handleAction(e, () => onView(contact))}
            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-all duration-200 active:scale-90"
            title="Aperçu rapide"
            aria-label={`Aperçu de ${fullName}`}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => handleAction(e, () => onEdit(contact))}
            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xl transition-all duration-200 active:scale-90"
            title="Modifier"
            aria-label={`Modifier ${fullName}`}
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => handleAction(e, () => onDelete(contact.contact_id))}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-50"
            title="Supprimer"
            aria-label={`Supprimer ${fullName}`}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

      </article>
    </div>
  );
}