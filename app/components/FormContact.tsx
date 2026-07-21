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

interface ContactFormProps {
    onClose: () => void;
    contact?: ContactDetails | null;
    onSaved: (contact: ContactDetails) => void;
}

function removeAt(values: string[], index: number) {
    return values.filter((_, valueIndex) => valueIndex !== index);
}

function FormContact({ onClose, contact, onSaved }: ContactFormProps) {
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [firstName, setFirstName] = useState(contact?.firstName ?? "");
    const [lastName, setLastName] = useState(contact?.lastName ?? "");
    const [emails, setEmails] = useState(contact?.emails.map(({ email }) => email) ?? [""]);
    const [phones, setPhones] = useState(contact?.phones.map(({ telephone }) => telephone) ?? [""]);
    const [jobTitle, setJobTitle] = useState(contact?.jobTitle ?? "");
    const [companyId, setCompanyId] = useState(contact?.company_id ?? "");
    const [tagId, setTagId] = useState(contact?.tag_id ?? "");
    const [message, setMessage] = useState("");

    useEffect(() => {
        void Promise.all([fetch("/api/company"), fetch("/api/tag")])
            .then(async ([companiesResponse, tagsResponse]) => {
                if (!companiesResponse.ok || !tagsResponse.ok) throw new Error("Chargement impossible");
                setCompanies(await companiesResponse.json());
                setTags(await tagsResponse.json());
            })
            .catch(() => setMessage("Impossible de charger les entreprises et les tags."));
    }, []);

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full bg-base-100 p-2 sm:p-4">
            <h1 className="text-2xl font-bold text-center">{contact ? "Modifier le contact" : "Nouveau contact"}</h1>
            {message && <p className="alert alert-error text-sm">{message}</p>}
            <fieldset className="fieldset"><label className="label" htmlFor="lastName">Nom</label><input type="text" id="lastName" className="input w-full" value={lastName} onChange={(event) => setLastName(event.target.value)} /></fieldset>
            <fieldset className="fieldset"><label className="label" htmlFor="firstName">Prénom *</label><input required type="text" id="firstName" className="input w-full" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></fieldset>
            <fieldset className="fieldset">
                <div className="flex items-center justify-between"><label className="label">E-mail</label><button type="button" className="btn btn-ghost btn-xs" onClick={() => setEmails((values) => [...values, ""])} aria-label="Ajouter une adresse e-mail"><Plus size={16} /></button></div>
                {emails.map((email, index) => <div key={`email-${index}`} className="flex gap-2 mb-2"><input type="email" className="input w-full" value={email} onChange={(event) => setEmails((values) => values.map((value, i) => i === index ? event.target.value : value))} />{emails.length > 1 && <button type="button" className="btn btn-ghost btn-error" onClick={() => setEmails((values) => removeAt(values, index))} aria-label="Supprimer cet e-mail"><Trash2 size={16} /></button>}</div>)}
            </fieldset>
            <fieldset className="fieldset">
                <div className="flex items-center justify-between"><label className="label">Numéro de téléphone</label><button type="button" className="btn btn-ghost btn-xs" onClick={() => setPhones((values) => [...values, ""])} aria-label="Ajouter un numéro"><Plus size={16} /></button></div>
                {phones.map((phone, index) => <div key={`phone-${index}`} className="flex gap-2 mb-2"><input type="tel" className="input w-full" value={phone} onChange={(event) => setPhones((values) => values.map((value, i) => i === index ? event.target.value : value))} />{phones.length > 1 && <button type="button" className="btn btn-ghost btn-error" onClick={() => setPhones((values) => removeAt(values, index))} aria-label="Supprimer ce numéro"><Trash2 size={16} /></button>}</div>)}
            </fieldset>
            <fieldset className="fieldset"><label className="label" htmlFor="jobTitle">Poste</label><input type="text" id="jobTitle" className="input w-full" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} /></fieldset>
            <fieldset className="fieldset"><label className="label" htmlFor="company">Entreprise</label><select id="company" className="select w-full" value={companyId} onChange={(event) => setCompanyId(event.target.value)}><option value="">Aucune entreprise</option>{companies.map((company) => <option key={company.company_id} value={company.company_id}>{company.name}</option>)}</select></fieldset>
            <fieldset className="fieldset"><label className="label" htmlFor="tag">Tag</label><select id="tag" className="select w-full" value={tagId} onChange={(event) => setTagId(event.target.value)}><option value="">Aucun tag</option>{tags.map((tag) => <option key={tag.tag_id} value={tag.tag_id}>{tag.name}</option>)}</select></fieldset>
            <div className="flex justify-between gap-2"><button className="btn btn-soft btn-error w-1/2" type="button" onClick={onClose} disabled={loading}>Annuler</button><button className="btn btn-soft btn-success w-1/2" type="submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" size={20} /> Enregistrement...</> : "Enregistrer"}</button></div>
        </form>
    );
}

export { FormContact };
