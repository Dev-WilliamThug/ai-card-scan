"use client";

import { 
  Loader2, 
  Plus, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  MapPin, 
  Globe, 
  Tag as TagIcon 
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { DOMAINS_OF_ACTIVITY } from "@/lib/domainsOfActivity";

type Tag = { tag_id: string; name: string; color: string };
type Email = { email_id: string; email: string; isPrimary: boolean; contact_id: string };
type PhoneType = { phone_id: string; telephone: string; isPrimary: boolean; contact_id: string };
type Contact = {
    contact_id: string;
    firstName: string;
    lastName: string | null;
    jobTitle: string | null;
    companyName: string | null;
    companyAddress: string | null;
    companyWebsite: string | null;
    domainOfActivity: string | null;
    tag_id: string | null;
};

export { DOMAINS_OF_ACTIVITY };

export type ContactDetails = Contact & {
    tag: Tag | null;
    emails: Email[];
    phones: PhoneType[];
};

export interface ScannedData {
    firstName: string;
    lastName?: string;
    jobTitle?: string;
    companyName?: string;
    companyAddress?: string;
    companyWebsite?: string;
    domainOfActivity?: string;
    emails: string[];
    phones: string[];
}

interface ContactFormProps {
    onClose: () => void;
    contact?: ContactDetails | null;
    scannedData?: ScannedData | null;
    onSaved: (contact: ContactDetails) => void;
}

function removeAt(values: string[], index: number) {
    return values.filter((_, valueIndex) => valueIndex !== index);
}

function FormContact({ onClose, contact, scannedData, onSaved }: ContactFormProps) {
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const [firstName, setFirstName] = useState(contact?.firstName ?? scannedData?.firstName ?? "");
    const [lastName, setLastName] = useState(contact?.lastName ?? scannedData?.lastName ?? "");
    const [emails, setEmails] = useState(
        contact?.emails.map(({ email }) => email) ?? (scannedData?.emails?.length ? scannedData.emails : [""])
    );
    const [phones, setPhones] = useState(
        contact?.phones.map(({ telephone }) => telephone) ?? (scannedData?.phones?.length ? scannedData.phones : [""])
    );
    const [jobTitle, setJobTitle] = useState(contact?.jobTitle ?? scannedData?.jobTitle ?? "");

    const [companyName, setCompanyName] = useState(contact?.companyName ?? scannedData?.companyName ?? "");
    const [companyAddress, setCompanyAddress] = useState(contact?.companyAddress ?? scannedData?.companyAddress ?? "");
    const [companyWebsite, setCompanyWebsite] = useState(contact?.companyWebsite ?? scannedData?.companyWebsite ?? "");

    const [tagId, setTagId] = useState(contact?.tag_id ?? "");
    const [domainOfActivity, setDomainOfActivity] = useState(
        contact?.domainOfActivity ?? scannedData?.domainOfActivity ?? ""
    );
    const [message, setMessage] = useState("");

    async function loadData() {
        try {
            const tagsResponse = await fetch("/api/tag");
            if (!tagsResponse.ok) throw new Error("Chargement des tags impossible");

            const fetchedTags: Tag[] = await tagsResponse.json();
            setTags(fetchedTags);
        } catch (err) {
            console.error("Erreur chargement des tags :", err);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        try {
            setLoading(true);
            const response = await fetch(contact ? `/api/contact/${contact.contact_id}` : "/api/contact", {
                method: contact ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    jobTitle,
                    companyName,
                    companyAddress,
                    companyWebsite,
                    tagId,
                    domainOfActivity,
                    emails,
                    phones
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message ?? "Une erreur est survenue.");
            onSaved(result.contact);
            onClose();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Impossible de communiquer avec le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="flex flex-col w-full max-h-[85vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden"
        >
          
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <User size={18} />
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {contact ? "Modifier le contact" : scannedData ? "Valider le contact scanné" : "Nouveau contact"}
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors active:scale-95"
                    title="Fermer"
                >
                    <X size={20} />
                </button>
            </div>

            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {message && (
                    <div className="alert alert-error text-sm rounded-xl py-2.5 px-4 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                        {message}
                    </div>
                )}

               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="firstName">
                            <User size={13} className="text-primary" /> Prénom *
                        </label>
                        <input
                            required
                            type="text"
                            id="firstName"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: Jhon"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                        />
                    </fieldset>

                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="lastName">
                            Nom
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: Doe"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                        />
                    </fieldset>
                </div>

                
                <fieldset className="space-y-2 p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <Mail size={13} className="text-primary" /> E-mail
                        </label>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg gap-1 font-semibold active:scale-95 transition-all"
                            onClick={() => setEmails((values) => [...values, ""])}
                        >
                            <Plus size={14} /> Ajouter
                        </button>
                    </div>
                    {emails.map((email, index) => (
                        <div key={`email-${index}`} className="flex gap-2 items-center">
                            <input
                                type="email"
                                className="input input-bordered w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: contact@exemple.com"
                                value={email}
                                onChange={(event) => setEmails((values) => values.map((value, i) => i === index ? event.target.value : value))}
                            />
                            {emails.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-square text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl shrink-0 transition-colors"
                                    onClick={() => setEmails((values) => removeAt(values, index))}
                                    title="Supprimer cet e-mail"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </fieldset>

                
                <fieldset className="space-y-2 p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <Phone size={13} className="text-primary" /> Numéro de téléphone
                        </label>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg gap-1 font-semibold active:scale-95 transition-all"
                            onClick={() => setPhones((values) => [...values, ""])}
                        >
                            <Plus size={14} /> Ajouter
                        </button>
                    </div>
                    {phones.map((phone, index) => (
                        <div key={`phone-${index}`} className="flex gap-2 items-center">
                            <input
                                type="tel"
                                className="input input-bordered w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: +237 6xx xx xx xx"
                                value={phone}
                                onChange={(event) => setPhones((values) => values.map((value, i) => i === index ? event.target.value : value))}
                            />
                            {phones.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-square text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl shrink-0 transition-colors"
                                    onClick={() => setPhones((values) => removeAt(values, index))}
                                    title="Supprimer ce numéro"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </fieldset>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="jobTitle">
                            <Briefcase size={13} /> Poste / Fonction
                        </label>
                        <input
                            type="text"
                            id="jobTitle"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: Développeur Full-Stack"
                            value={jobTitle}
                            onChange={(event) => setJobTitle(event.target.value)}
                        />
                    </fieldset>

                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="companyName">
                            <Building2 size={13} /> Nom de l'entreprise
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: Mayem Solutions"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                        />
                    </fieldset>
                </div>

               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="companyAddress">
                            <MapPin size={13} /> Adresse
                        </label>
                        <input
                            type="text"
                            id="companyAddress"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: Yaoundé, Cameroun"
                            value={companyAddress}
                            onChange={(event) => setCompanyAddress(event.target.value)}
                        />
                    </fieldset>

                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="companyWebsite">
                            <Globe size={13} /> Site web
                        </label>
                        <input
                            type="text"
                            id="companyWebsite"
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Ex: https://entreprise.com"
                            value={companyWebsite}
                            onChange={(event) => setCompanyWebsite(event.target.value)}
                        />
                    </fieldset>
                </div>

               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="domainOfActivity">
                            <Briefcase size={13} /> Domaine d'activité
                        </label>
                        <select
                            id="domainOfActivity"
                            className="select select-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={domainOfActivity}
                            onChange={(event) => setDomainOfActivity(event.target.value)}
                        >
                            <option value="" key="undefined">Aucun domaine d'activité</option>
                            {DOMAINS_OF_ACTIVITY.map((domain) => (
                                <option key={domain.value} value={domain.value}>
                                    {domain.label}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="tag">
                            <TagIcon size={13} /> Tag
                        </label>
                        <select
                            id="tag"
                            className="select select-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={tagId}
                            onChange={(event) => setTagId(event.target.value)}
                        >
                            <option value="" key="undefined">Aucun tag</option>
                            {tags.map((tag) => (
                                <option key={tag.tag_id} value={tag.tag_id}>
                                    {tag.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
            </div>

   
            <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 px-5 py-4">
                <button
                    className="btn btn-ghost hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-medium transition-all active:scale-95"
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                >
                    Annuler
                </button>
                <button
                    className="btn btn-primary rounded-xl px-6 shadow-md shadow-primary/25 active:scale-95 transition-all font-semibold"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} /> Enregistrement...
                        </>
                    ) : (
                        "Enregistrer"
                    )}
                </button>
            </div>
        </form>
    );
}

export { FormContact };
