"use client";

import { BottomBar } from "@/app/components/BottomBar";
import { Header } from "@/app/components/Header";
import { ContactCard } from "@/app/components/ContactCard";
import { FormContact, type ContactDetails } from "@/app/components/FormContact";
import { UserRoundPlus, UserSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ContactsPage() {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [contacts, setContacts] = useState<ContactDetails[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [contactToEdit, setContactToEdit] = useState<ContactDetails | null>(null);
    const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
    const [formKey, setFormKey] = useState(0);

    const loadContacts = async () => {
        try {
            const response = await fetch(`/api/contact?query=${encodeURIComponent(searchInput)}`);
            if (!response.ok) throw new Error("Impossible de récupérer les contacts.");
            setContacts(await response.json());
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        void fetch(`/api/contact?query=${encodeURIComponent(searchInput)}`, { signal: controller.signal })
            .then((response) => response.ok ? response.json() : Promise.reject(new Error("Impossible de récupérer les contacts.")))
            .then((loadedContacts) => setContacts(loadedContacts))
            .catch((error: unknown) => {
                if (error instanceof Error && error.name !== "AbortError") console.error(error);
            });

        return () => controller.abort();
    }, [searchInput]);

    const closeModal = () => modalRef.current?.close();

    const openCreateModal = () => {
        setContactToEdit(null);
        setFormKey((previous) => previous + 1);
        modalRef.current?.showModal();
    };

    const openEditModal = (contact: ContactDetails) => {
        setContactToEdit(contact);
        setFormKey((previous) => previous + 1);
        modalRef.current?.showModal();
    };

    const handleSaved = (savedContact: ContactDetails) => {
        setContacts((previous) => {
            const exists = previous.some((contact) => contact.contact_id === savedContact.contact_id);
            return exists
                ? previous.map((contact) => contact.contact_id === savedContact.contact_id ? savedContact : contact)
                : [savedContact, ...previous];
        });
        void loadContacts();
    };

    const deleteContact = async (id: string) => {
        const contact = contacts.find((item) => item.contact_id === id);
        if (!window.confirm(`Supprimer définitivement ${contact?.firstName ?? "ce contact"} ?`)) return;

        try {
            setDeletingContactId(id);
            const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("La suppression a échoué.");
            setContacts((previous) => previous.filter((contact) => contact.contact_id !== id));
            await loadContacts();
        } catch (error) {
            console.error(error);
            alert("Impossible de supprimer ce contact.");
        } finally {
            setDeletingContactId(null);
        }
    };

    return (
        <>
            <Header />
            <main className="flex flex-col gap-4 py-20 px-5">
                <div className="flex items-center gap-2 w-full">
                    <label className="input flex-1">
                        <UserSearch className="h-[1em] opacity-50 shrink-0" />
                        <input type="search" placeholder="Rechercher..." className="w-full" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
                    </label>
                    <button className="btn btn-ghost btn-square shrink-0" type="button" onClick={openCreateModal} title="Ajouter un contact" aria-label="Ajouter un contact"><UserRoundPlus className="h-6 w-6" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {contacts.map((contact) => <ContactCard key={contact.contact_id} contact={contact} onEdit={openEditModal} onDelete={deleteContact} isDeleting={deletingContactId === contact.contact_id} />)}
                </div>
                {!contacts.length && <p className="text-center text-sm text-gray-500 py-10">Aucun contact trouvé.</p>}

                <dialog ref={modalRef} className="modal">
                    <div className="modal-box"><div className="modal-action mt-0"><FormContact key={formKey} contact={contactToEdit} onClose={closeModal} onSaved={handleSaved} /></div></div>
                </dialog>
            </main>
            <BottomBar />
        </>
    );
}
