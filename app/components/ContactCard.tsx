"use client";

import { Loader2, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import type { ContactDetails } from "./FormContact";

interface ContactCardProps {
    contact: ContactDetails;
    onEdit: (contact: ContactDetails) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export function ContactCard({ contact, onEdit, onDelete, isDeleting }: ContactCardProps) {
    const initials = `${contact.firstName.charAt(0)}${contact.lastName?.charAt(0) ?? ""}`.toUpperCase();
    const fullName = `${contact.firstName} ${contact.lastName ?? ""}`.trim();

    return (
        <article className="flex flex-row md:flex-col items-center gap-4 p-4 md:p-6 bg-white dark:bg-base-150 border border-gray-100 dark:border-gray-800 shadow-md rounded-2xl w-full max-w-full md:max-w-xs transition-all hover:shadow-lg">
            <div className="flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full bg-primary/10 text-primary font-bold text-lg md:text-xl shrink-0">{initials}</div>
            <div className="flex-1 min-w-0 flex flex-col md:items-center w-full">
                <h3 className="font-bold text-gray-900 md:text-lg truncate">{fullName}</h3>
                {contact.jobTitle && <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full md:text-center">{contact.jobTitle}</p>}
                {contact.company && <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate w-full md:text-center mt-0.5">{contact.company.name}</p>}
                {contact.emails[0] && <p className="text-xs text-gray-500 truncate w-full md:text-center mt-2 inline-flex gap-1 md:justify-center"><Mail className="w-3 h-3 shrink-0" />{contact.emails[0].email}</p>}
                {contact.phones[0] && <p className="text-xs text-gray-500 truncate w-full md:text-center inline-flex gap-1 md:justify-center"><Phone className="w-3 h-3 shrink-0" />{contact.phones[0].telephone}</p>}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2 shrink-0 md:w-full md:justify-center md:mt-4">
                <button type="button" onClick={() => onEdit(contact)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Modifier" aria-label={`Modifier ${fullName}`}><Pencil className="w-4 h-4" /></button>
                <button type="button" onClick={() => onDelete(contact.contact_id)} disabled={isDeleting} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer" aria-label={`Supprimer ${fullName}`}>{isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button>
            </div>
        </article>
    );
}
