"use client"
import { Loader2 } from "lucide-react";
import { useState, useEffect, SubmitEvent } from 'react';
import type { Company } from '@prisma/client';

interface CompanyFormProps {
    onClose: () => void;
    company?: Company | null;
    onSaved?: (company: Company) => void;
}

function FormCompany({ onClose, company, onSaved }: CompanyFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState(company?.name ?? "");
    const [address, setAddress] = useState(company?.address ?? "");
    const [website, setWebsite] = useState(company?.website ?? "");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
    interface CompanyPayload {
        name: string;
        address: string;
        website: string
    }

    useEffect(() => {
        setName(company?.name ?? "");
        setAddress(company?.address ?? "");
        setWebsite(company?.website ?? "");
        setMessage("");
        setMessageType(null);
    }, [company]);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload: CompanyPayload = {
            name,
            address,
            website
        }

        try {
            setLoading(true)
            setSubmitting(true)
            const response = await fetch(company ? `/api/company/${company.company_id}` : '/api/company',
                {
                    method: company ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            )

            if (response.ok) {
                const resultat = await response.json();
                onSaved?.(resultat.company);
                onClose();
                setMessage("Entrprise ajoutéé avec succès")
                setMessageType("success")
                onClose();
            } else {
                setMessage("Une erreur c'est produite.")
                setMessageType("error")
                console.error("Erreur lors de l'insertion");
            }
        } catch (erreur) {
            setMessage("Impossible de communiquer avec le Serveur")
            setMessageType("error")
            console.error("Erreur réseau :", erreur);
        }
        finally {
            setLoading(false)
            setSubmitting(false)
        }
    }
    return (

        <form onSubmit={handleSubmit} action="" className="flex flex-col gap-4 w-full shadow-lg bg-base-150 p-4
                 sm:w-full sm:mx-auto mt-10 sm:p-8  ">
            {message && (
                <div
                    className={`alert alert-outline ${messageType === "success"
                        ? "alert-success"
                        : "alert-error"
                        }`}
                >
                    {messageType === "success" &&
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    {messageType === "error" &&
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }

                    <span>{message}</span>
                </div>
            )}
            <h1 className="text-2xl font-bold text-center">
                {company ? "Modifier l'entreprise" : "Fiche de l'entreprise"}
            </h1>
            <fieldset className="fieldset">
                <label className="label" htmlFor="lastName">Nom de l'entreprise</label>
                <input type="text" id="lastName" className="input focus:input-primary w-full" placeholder="Kamgang"
                    value={name}
                    onChange={(e) => { setName(e.target.value) }}
                />
            </fieldset>


            <fieldset className="fieldset">
                <label className="label" htmlFor="email">Adresse</label>
                <input type="text" id="adresse" className="input focus:input-primary w-full" placeholder="kamgapascal@gmail.com"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value) }}

                />
            </fieldset>

            <fieldset className="fieldset">
                <label className="label" htmlFor="jobName">Site Web</label>
                <label className="input validator  w-full">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </g>
                    </svg>
                    <input
                        type="url"
                        required
                        className="focus:input-primary"
                        placeholder="https://"
                        pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                        title="Entrez une adresse valide"
                        value={website}
                        onChange={(e) => { setWebsite(e.target.value) }}
                    />
                </label>
                <p className="validator-hint">Entrez une url valide</p>

            </fieldset>

            <div className="flex justify-between gap-2">
                <button className="btn btn-soft btn-error w-1/2" type="button" onClick={onClose} disabled={loading}>

                    Annuler

                </button>
                <button className="btn btn-soft btn-success w-1/2" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                size={20}
                            />
                            Enregistrement...
                        </>
                    ) : (
                        company ? "Enregistrer les modifications" : "Enregistrer"
                    )}
                </button>

            </div>


        </form>


    )
}

export { FormCompany }
