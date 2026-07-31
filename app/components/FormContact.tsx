"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { Company, Contact, Email, Phone, Tag } from "@prisma/client";

export type ContactDetails = Contact & {
    company: Company | null;
    tag: Tag | null;
    emails: Email[];
    phones: Phone[];
};

export interface ScannedData {
    firstName: string;
    lastName?: string;
    jobTitle?: string;
    companyName?: string;
    companyAddress?: string;
    companyWebsite?: string;
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
    const [companies, setCompanies] = useState<Company[]>([]);
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
    const [companyId, setCompanyId] = useState(contact?.company_id ?? "");
    const [tagId, setTagId] = useState(contact?.tag_id ?? "");
    const [message, setMessage] = useState("");

    async function loadData() {
        try {
            const [companiesResponse, tagsResponse] = await Promise.all([
                fetch("/api/company"),
                fetch("/api/tag")
            ]);

            if (!companiesResponse.ok || !tagsResponse.ok) throw new Error("Chargement impossible");

            const fetchedCompanies: Company[] = await companiesResponse.json();
            const fetchedTags: Tag[] = await tagsResponse.json();

            setCompanies(fetchedCompanies);
            setTags(fetchedTags);

            if (scannedData?.companyName) {
                const companyNameTrimmed = scannedData.companyName.trim().toLowerCase();

                const matchedCompany = fetchedCompanies.find(
                    (c) => c.name.trim().toLowerCase() === companyNameTrimmed
                );

                if (matchedCompany) {
                    setCompanyId(matchedCompany.company_id);
                } else {
                    try {
                        const response = await fetch("/api/company", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: scannedData.companyName.trim(),
                                address: scannedData.companyAddress || null,
                                website: scannedData.companyWebsite || null,
                            }),
                        });

                        if (response.ok) {
                            const createdCompany: Company = await response.json();
                            setCompanies((prev) => [...prev, createdCompany]);
                            setCompanyId(createdCompany.company_id);
                        } else {
                            console.error("Impossible d'ajouter cette nouvelle entreprise");
                        }
                    } catch (err) {
                        console.error("Erreur création entreprise :", err);
                    }
                }
            }
        } catch (err) {
            console.error("Erreur chargement des données :", err);
        }
    }

    useEffect(() => {
        loadData();
    }, [contact, scannedData]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        try {
            setLoading(true);
            const response = await fetch(contact ? `/api/contact/${contact.contact_id}` : "/api/contact", {
                method: contact ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, jobTitle, companyId, tagId, emails, phones }),
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl transition-colors">
            
            {/* En-tête */}
            <h1 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-slate-100 tracking-tight">
                {contact ? "Modifier le contact" : scannedData ? "Valider le contact scanné" : "Nouveau contact"}
            </h1>

            {message && (
                <div className="alert alert-error text-sm rounded-xl py-2 px-4 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                    {message}
                </div>
            )}

            {/* Nom */}
            <fieldset className="fieldset space-y-1.5">
                <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="lastName">
                    Nom
                </label>
                <input 
                    type="text" 
                    id="lastName" 
                    className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={lastName} 
                    onChange={(event) => setLastName(event.target.value)} 
                />
            </fieldset>

            {/* Prénom */}
            <fieldset className="fieldset space-y-1.5">
                <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="firstName">
                    Prénom *
                </label>
                <input 
                    required 
                    type="text" 
                    id="firstName" 
                    className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={firstName} 
                    onChange={(event) => setFirstName(event.target.value)} 
                />
            </fieldset>

            {/* E-mails */}
            <fieldset className="fieldset space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        E-mail
                    </label>
                    <button 
                        type="button" 
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg gap-1" 
                        onClick={() => setEmails((values) => [...values, ""])} 
                        aria-label="Ajouter une adresse e-mail"
                    >
                        <Plus size={14} /> Ajouter
                    </button>
                </div>
                {emails.map((email, index) => (
                    <div key={`email-${index}`} className="flex gap-2 mb-2 items-center">
                        <input 
                            type="email" 
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl" 
                            value={email} 
                            onChange={(event) => setEmails((values) => values.map((value, i) => i === index ? event.target.value : value))} 
                        />
                        {emails.length > 1 && (
                            <button 
                                type="button" 
                                className="btn btn-ghost btn-square text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl" 
                                onClick={() => setEmails((values) => removeAt(values, index))} 
                                aria-label="Supprimer cet e-mail"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </fieldset>

            {/* Numéros de téléphone */}
            <fieldset className="fieldset space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Numéro de téléphone
                    </label>
                    <button 
                        type="button" 
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg gap-1" 
                        onClick={() => setPhones((values) => [...values, ""])} 
                        aria-label="Ajouter un numéro"
                    >
                        <Plus size={14} /> Ajouter
                    </button>
                </div>
                {phones.map((phone, index) => (
                    <div key={`phone-${index}`} className="flex gap-2 mb-2 items-center">
                        <input 
                            type="tel" 
                            className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl" 
                            value={phone} 
                            onChange={(event) => setPhones((values) => values.map((value, i) => i === index ? event.target.value : value))} 
                        />
                        {phones.length > 1 && (
                            <button 
                                type="button" 
                                className="btn btn-ghost btn-square text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl" 
                                onClick={() => setPhones((values) => removeAt(values, index))} 
                                aria-label="Supprimer ce numéro"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </fieldset>

            {/* Poste */}
            <fieldset className="fieldset space-y-1.5">
                <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="jobTitle">
                    Poste
                </label>
                <input 
                    type="text" 
                    id="jobTitle" 
                    className="input input-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl" 
                    value={jobTitle} 
                    onChange={(event) => setJobTitle(event.target.value)} 
                />
            </fieldset>

            {/* Entreprise */}
            <fieldset className="fieldset space-y-1.5">
                <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="company">
                    Entreprise
                </label>
                <select 
                    id="company" 
                    className="select select-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl" 
                    value={companyId} 
                    onChange={(event) => setCompanyId(event.target.value)}
                >
                    <option value="" key="undefined">Aucune entreprise</option>
                    {companies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* Tag */}
            <fieldset className="fieldset space-y-1.5">
                <label className="label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="tag">
                    Tag
                </label>
                <select 
                    id="tag" 
                    className="select select-bordered w-full bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl" 
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

            {/* Boutons d'action */}
            <div className="flex justify-between gap-3 pt-2">
                <button 
                    className="btn btn-soft btn-error w-1/2 rounded-xl border border-red-200 dark:border-red-900/50" 
                    type="button" 
                    onClick={onClose} 
                    disabled={loading}
                >
                    Annuler
                </button>
                <button 
                    className="btn btn-primary w-1/2 rounded-xl shadow-md shadow-primary/20" 
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