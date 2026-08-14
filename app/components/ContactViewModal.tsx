"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  Globe, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  MessageCircle,
  Briefcase,
  Share2
} from "lucide-react";

export interface Tag {
  tag_id: string;
  name?: string;
  label?: string;
  color: string;
}

export interface EmailItem {
  email_id?: string;
  email: string;
}

export interface PhoneItem {
  phone_id?: string;
  telephone: string;
}

export interface SocialLinkItem {
  social_id?: string;
  platform?: string;
  url: string;
}

// Interface alignée avec le nouveau schéma Prisma
export interface Contact {
  contact_id?: string;
  id?: string; // Fallback pour compatibilité
  firstName: string;
  lastName?: string;
  jobTitle?: string;

  companyName?: string;
  companyAddress?: string;
  companyWebsite?: string;
  domainOfActivity?: string;

  tag_id?: string;
  tag?: Tag;
  tags?: Tag[]; // Fallback si reçu sous forme de tableau

  emails?: EmailItem[];
  email?: string; // Fallback

  phones?: PhoneItem[];
  phone?: string; // Fallback

  socialLinks?: SocialLinkItem[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ContactDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !contact) return null;


  const contactId = contact.contact_id || contact.id || "";
  const jobTitle = contact.jobTitle || "";
  

  const companyName = contact.companyName || "";
  const companyAddress = contact.companyAddress || "";
  const companyWebsite = contact.companyWebsite || "";
  const domainOfActivity = contact.domainOfActivity || "";

  
  const allPhones: string[] = contact.phones?.length
    ? contact.phones.map((p) => p.telephone).filter(Boolean)
    : contact.phone
      ? [contact.phone]
      : [];


  const allEmails: string[] = contact.emails?.length
    ? contact.emails.map((e) => e.email).filter(Boolean)
    : contact.email
      ? [contact.email]
      : [];


  const socialLinks = contact.socialLinks || [];


  const primaryPhone = allPhones[0] || "";
  const primaryEmail = allEmails[0] || "";

  const normalizedTags: Tag[] = contact.tag 
    ? [contact.tag] 
    : contact.tags?.length 
      ? contact.tags 
      : [];

  const cleanPhoneForWhatsApp = primaryPhone ? primaryPhone.replace(/[^0-9]/g, "") : "";
  const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >

      <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Fiche Contact
          </span>
          
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(contactId)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors active:scale-95"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(contactId)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors active:scale-95"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors active:scale-95"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden">


          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary/10 text-xl sm:text-2xl font-bold text-primary shadow-inner">
              {initials || "??"}
            </div>

            <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 max-w-full truncate px-2">
              {contact.firstName} {contact.lastName ?? ""}
            </h2>

            {(jobTitle || companyName) && (
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-full truncate px-2">
                {jobTitle} {jobTitle && companyName && "•"}{" "}
                <span className="text-primary">{companyName}</span>
              </p>
            )}


            <div className="mt-3 flex flex-wrap justify-center items-center gap-1.5">
              {domainOfActivity && domainOfActivity !== "AUTRE" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                  <Briefcase className="h-3 w-3" />
                  {domainOfActivity}
                </span>
              )}

              {normalizedTags.map((t) => (
                <span
                  key={t.tag_id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                >
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                  {t.name || t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {primaryPhone ? (
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-emerald-50 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-100 active:scale-95 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
              >
                <div className="rounded-full bg-emerald-500 p-1.5 sm:p-2 text-white shadow-sm">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                </div>
                <span>WhatsApp</span>
              </a>
            ) : (
              <div className="opacity-40 flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800/60 py-2.5 sm:py-3 text-[11px] sm:text-xs text-slate-400">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>WhatsApp</span>
              </div>
            )}

            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-blue-50 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100 active:scale-95 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
              >
                <div className="rounded-full bg-blue-500 p-1.5 sm:p-2 text-white shadow-sm">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                </div>
                <span>Appeler</span>
              </a>
            ) : (
              <div className="opacity-40 flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800/60 py-2.5 sm:py-3 text-[11px] sm:text-xs text-slate-400">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Appeler</span>
              </div>
            )}

            {primaryEmail ? (
              <a
                href={`mailto:${primaryEmail}`}
                className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-indigo-50 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
              >
                <div className="rounded-full bg-indigo-500 p-1.5 sm:p-2 text-white shadow-sm">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span>E-mail</span>
              </a>
            ) : (
              <div className="opacity-40 flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800/60 py-2.5 sm:py-3 text-[11px] sm:text-xs text-slate-400">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>E-mail</span>
              </div>
            )}
          </div>


          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 sm:p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Coordonnées & Informations
            </h3>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
             
              {/* Téléphones */}
              {allPhones.map((phone, index) => {
                const fieldKey = `phone-${index}`;
                return (
                  <div key={fieldKey} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400">
                          Téléphone {allPhones.length > 1 ? `${index + 1}` : ""}
                        </p>
                        <p className="text-xs sm:text-sm font-medium truncate block">{phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(phone, fieldKey)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                      title="Copier"
                    >
                      {copiedField === fieldKey ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Emails */}
              {allEmails.map((email, index) => {
                const fieldKey = `email-${index}`;
                return (
                  <div key={fieldKey} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400">
                          E-mail {allEmails.length > 1 ? `${index + 1}` : ""}
                        </p>
                        <p className="text-xs sm:text-sm font-medium truncate block">{email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(email, fieldKey)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                      title="Copier"
                    >
                      {copiedField === fieldKey ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}

              {companyName && (
                <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 min-w-0">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Entreprise</p>
                    <p className="text-xs sm:text-sm font-medium truncate block">{companyName}</p>
                  </div>
                </div>
              )}

              {/* Domaine d'activité */}
              {domainOfActivity && (
                <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 min-w-0">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Secteur d'activité</p>
                    <p className="text-xs sm:text-sm font-medium truncate block">{domainOfActivity}</p>
                  </div>
                </div>
              )}

              {companyAddress && (
                <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 min-w-0">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Adresse de l'entreprise</p>
                    <p className="text-xs sm:text-sm font-medium wrap-break-words">{companyAddress}</p>
                  </div>
                </div>
              )}

              {companyWebsite && (
                <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 min-w-0">
                  <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">Site Web</p>
                    <a 
                      href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs sm:text-sm font-medium text-primary hover:underline truncate block"
                    >
                      {companyWebsite}
                    </a>
                  </div>
                </div>
              )}


              {socialLinks.map((social, idx) => (
                <div key={social.social_id || idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 min-w-0">
                  <Share2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">
                      Réseau Social {social.platform ? `(${social.platform})` : ""}
                    </p>
                    <a 
                      href={social.url.startsWith("http") ? social.url : `https://${social.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs sm:text-sm font-medium text-primary hover:underline truncate block"
                    >
                      {social.url}
                    </a>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}