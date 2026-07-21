"use client";

import React from 'react';
import { Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Company } from '@prisma/client'

interface CompanyCardProps {
  company: Company
  onEdit: (company: Company) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}
export default function CompanyCard({ company, onEdit, onDelete, isDeleting }: CompanyCardProps) {

  // Génère les deux premières lettres de l'entreprise
  const words = company.name ? company.name.trim().split(/\s+/) : [];
  const initials = words.length > 1
    ? `${words[0].charAt(0)}${words[1].charAt(0)}`
    : `${company.name?.substring(0, 2) || ''}`;
  const finalInitials = initials.toUpperCase();

  return (
    <div className="flex flex-row md:flex-col items-center gap-4 p-4 md:p-6 bg-white dark:bg-base-150 border border-gray-100 dark:border-gray-800 shadow-md rounded-2xl w-full max-w-full md:max-w-xs transition-all hover:shadow-lg relative">

      <div className="flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-full bg-secondary/10 text-secondary font-bold text-lg md:text-xl shrink-0">
        {finalInitials}
      </div>

      <div className="flex-1 min-w-0 flex flex-col md:items-center w-full">
        <div className="flex items-center gap-2 md:justify-center w-full">
          <h3 className="font-bold text-base md:text-lg text-gray-900 truncate">
            {company.name}
          </h3>

        </div>

        {company.website && (
          <a
            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 max-w-full md:justify-center mt-0.5"
          >

            <span className="truncate">
              {company.website.replace(/(^\w+:|^)\/\//, '').replace('www.', '')}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        )}


        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-full md:text-center mt-1">
          {company.address}
        </p>


      </div>


      <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-2 shrink-0 md:w-full md:justify-center md:mt-4">
        <button
          type="button"
          onClick={() => onEdit(company)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all duration-150 active:scale-90 active:bg-blue-100 dark:active:bg-blue-900/50"
          title="Modifier l'entreprise"
          aria-label={`Modifier ${company.name}`}
        >
          <Pencil className="w-4 h-4 transition-transform active:rotate-12" />
        </button>

        <button
          onClick={() => onDelete(company.company_id)}
          type="button"
          disabled={isDeleting}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-150 active:scale-90 active:bg-red-100 dark:active:bg-red-900/50"
          title="Supprimer l'entreprise"
          aria-label={`Supprimer ${company.name}`}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 transition-transform active:scale-110" />
          )}
        </button>
      </div>

    </div>
  );
}
