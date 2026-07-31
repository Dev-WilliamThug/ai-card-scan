"use client";

import { BottomBar } from "@/app/components/BottomBar";
import { Header } from "@/app/components/Header";
import { ContactCard } from "@/app/components/ContactCard";
import { FormContact, type ContactDetails } from "@/app/components/FormContact";
import { ContactDetailModal, Contact } from "@/app/components/ContactViewModal";
import { SideBar } from "@/app/components/SideBar";
import { UserRoundPlus, UserSearch, Loader, Tag as TagIcon, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Tag } from "@prisma/client";

export default function ContactsPage() {
  const modalRef = useRef<HTMLDialogElement>(null);
  
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
 
  const [searchInput, setSearchInput] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);


  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactDetails | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  // --- Handlers Modal Aperçu Rapide ---
  const handleCardClick = (contact: ContactDetails) => {
    setSelectedContact(contact as unknown as Contact);
    setIsDetailModalOpen(true);
  };

  // --- Chargement des Tags (1 seule fois) ---
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag");
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tags :", error);
      }
    };
    fetchTags();
  }, []);

  // --- Chargement des Contacts (Recherche + Filtre Tag) ---
  const loadContacts = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSearching(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchInput) queryParams.set("query", searchInput);
      if (selectedTagId) queryParams.set("tagId", selectedTagId);

      const response = await fetch(`/api/contact?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Impossible de récupérer les contacts.");
      
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
      setIsInitialLoading(false);
    }
  }, [searchInput, selectedTagId]);

  // Déclenchement automatique de la recherche avec contrôleur d'annulation (AbortController)
  useEffect(() => {
    const controller = new AbortController();
    setIsSearching(true);

    const queryParams = new URLSearchParams();
    if (searchInput) queryParams.set("query", searchInput);
    if (selectedTagId) queryParams.set("tagId", selectedTagId);

    fetch(`/api/contact?${queryParams.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject("Erreur")))
      .then((data) => {
        setContacts(data);
        setIsSearching(false);
        setIsInitialLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setIsSearching(false);
          setIsInitialLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchInput, selectedTagId]);

  // --- Actions Modal Création / Édition ---
  const closeModal = () => modalRef.current?.close();

  const openCreateModal = () => {
    setContactToEdit(null);
    setFormKey((prev) => prev + 1);
    modalRef.current?.showModal();
  };

  const openEditModal = (contact: ContactDetails) => {
    setContactToEdit(contact);
    setFormKey((prev) => prev + 1);
    modalRef.current?.showModal();
  };

  const handleSaved = (savedContact: ContactDetails) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.contact_id === savedContact.contact_id);
      return exists
        ? prev.map((c) => (c.contact_id === savedContact.contact_id ? savedContact : c))
        : [savedContact, ...prev];
    });
    void loadContacts(true);
  };

  const deleteContact = async (id: string) => {
    const contact = contacts.find((item) => item.contact_id === id);
    if (!window.confirm(`Supprimer définitivement ${contact?.firstName ?? "ce contact"} ?`)) return;

    try {
      setDeletingContactId(id);
      const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("La suppression a échoué.");
      
      setContacts((prev) => prev.filter((c) => c.contact_id !== id));
      if (isDetailModalOpen) setIsDetailModalOpen(false);
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
      <SideBar />
      <main className="flex flex-col gap-4 py-20 px-5 md:pl-72">
        
        <div className="flex justify-between gap-1 items-center w-full">
          <label className="input input-bordered flex-1 flex items-center gap-2 rounded-xl bg-white dark:bg-base-150 shadow-xs">
            <UserSearch className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="search"
              placeholder="Rechercher par nom, email, téléphone..."
              className="grow text-sm placeholder:text-gray-400 dark:text-slate-600"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isSearching && <Loader className="h-4 w-4 animate-spin text-primary shrink-0" />}
          </label>

          <button
            className="btn btn-primary rounded-xl shrink-0 gap-2 font-medium shadow-sm hover:shadow-md transition-all"
            type="button"
            onClick={openCreateModal}
            title="Ajouter un contact"
          >
            <UserRoundPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>

       
       
        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          
            <button
              onClick={() => setSelectedTagId(null)}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedTagId === null
                  ? "bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-300 shadow-xs hover:cursor-pointer"
                  : "dark:bg-slate-900/80 text-slate-600 dark:bg-base-150 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 hover:text-slate-900 hover:cursor-pointer"
              }`}
            >
              <TagIcon className="w-3 h-3" />
              Tous
            </button>

            {tags.map((tag) => {
              const isSelected = selectedTagId === tag.tag_id;
              return (
                <button
                  key={tag.tag_id}
                  onClick={() => setSelectedTagId(isSelected ? null : tag.tag_id)}
                  className={`inline-flex items-center gap-2 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 hover:cursor-pointer"
                      : "bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-300 shadow-xs hover:bg-slate-100 hover:text-slate-900 hover:cursor-pointer"
                  }`}
                >
                  <span>{tag.name}</span>
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {isSelected && <X className="w-3 h-3 ml-0.5 opacity-60" />}
                </button>
              );
            })}
          </div>
        )}

        {isInitialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Chargement de vos contacts...</p>
          </div>
        ) : (
          <>
            
            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.contact_id}
                    contact={contact}
                    onEdit={openEditModal}
                    onDelete={deleteContact}
                    onView={handleCardClick}
                    isDeleting={deletingContactId === contact.contact_id}
                  />
                ))}
              </div>
            ) : (
              /* --- État vide (Aucun contact trouvé) --- */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-base-150 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Aucun contact trouvé
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  {searchInput || selectedTagId
                    ? "Essayez de modifier vos critères de recherche ou vos filtres."
                    : "Commencez par ajouter votre premier contact à l'aide du bouton ci-dessus."}
                </p>
              </div>
            )}
          </>
        )}

        {/* --- Modale d'Aperçu Rapide (Détails) --- */}
        <ContactDetailModal
          contact={selectedContact}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={(id) => {
            setIsDetailModalOpen(false);
            const contactToEdit = contacts.find((c) => c.contact_id === id);
            if (contactToEdit) openEditModal(contactToEdit);
          }}
          onDelete={(id) => deleteContact(id)}
        />

        {/* --- Modale Formulaire (Création / Édition) --- */}
        <dialog ref={modalRef} className="modal">
          <div className="modal-box p-0 max-w-2xl rounded-2xl">
            <FormContact
              key={formKey}
              contact={contactToEdit}
              onClose={closeModal}
              onSaved={handleSaved}
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Fermer</button>
          </form>
        </dialog>
      </main>

      <BottomBar />
    </>
  );
}