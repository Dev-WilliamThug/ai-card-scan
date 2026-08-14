"use client";

import { Header } from "@/app/components/Header";
import { ContactCard } from "@/app/components/ContactCard";
import { FormContact, type ContactDetails, DOMAINS_OF_ACTIVITY } from "@/app/components/FormContact";
import { FormTag } from "@/app/components/FormTag";
import { ContactDetailModal, Contact } from "@/app/components/ContactViewModal";
import { SideBar } from "@/app/components/SideBar";
import { UserRoundPlus, UserSearch, Loader, Tag as TagIcon, X, Plus } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Tag } from "@prisma/client";

export default function ContactsPage() {
  const modalRef = useRef<HTMLDialogElement>(null);

  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);


  const [searchInput, setSearchInput] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("");


  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactDetails | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleCardClick = (contact: ContactDetails) => {
    setSelectedContact(contact as unknown as Contact);
    setIsDetailModalOpen(true);
  };

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch("/api/tag");
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tags :", error);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const loadContacts = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsSearching(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchInput) queryParams.set("query", searchInput);
      if (selectedTagId) queryParams.set("tagId", selectedTagId);
      if (selectedDomain) queryParams.set("domain", selectedDomain);

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
  }, [searchInput, selectedTagId, selectedDomain]);


  useEffect(() => {
    const controller = new AbortController();
    setIsSearching(true);

    const queryParams = new URLSearchParams();
    if (searchInput) queryParams.set("query", searchInput);
    if (selectedTagId) queryParams.set("tagId", selectedTagId);
    if (selectedDomain) queryParams.set("domain", selectedDomain);

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
  }, [searchInput, selectedTagId, selectedDomain]);


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

        <div className="flex items-center gap-2">
          <label htmlFor="domain-filter" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
            Domaine
          </label>
          <select
            id="domain-filter"
            className="select select-bordered select-sm rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 min-w-55 flex-1 sm:flex-none sm:max-w-xs"
            value={selectedDomain}
            onChange={(event) => setSelectedDomain(event.target.value)}
          >
            <option value="">Tous les domaines</option>
            {DOMAINS_OF_ACTIVITY.map((domain) => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none [&::-webkit-scrollbar]:hidden">

          <button
            onClick={() => setSelectedTagId(null)}
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${selectedTagId === null
              ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900"
              : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                className={`inline-flex items-center gap-2 shrink-0 rounded-full px-3.5 py-1.5 text-xs transition-all cursor-pointer ${isSelected
                  ? "border border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 dark:bg-primary/20 dark:text-primary"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 font-medium"
                  }`}
              >
                <span>{tag.name}</span>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {isSelected && <X className="w-3 h-3 ml-0.5 opacity-70" />}
              </button>
            );
          })}

          <button
            onClick={() => setIsTagModalOpen(true)}
            className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-dashed border-slate-300 bg-slate-50/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-primary dark:hover:text-primary cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Créer un tag
          </button>
          <FormTag
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
            onTagCreated={fetchTags}
          />
        </div>
        {isInitialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Chargement de vos contacts...</p>
          </div>
        ) : (
          <>

            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 w-full">
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
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-base-150 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Aucun contact trouvé
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  {searchInput || selectedTagId || selectedDomain
                    ? "Essayez de modifier vos critères de recherche ou vos filtres."
                    : "Commencez par ajouter votre premier contact à l'aide du bouton ci-dessus."}
                </p>
              </div>
            )}
          </>
        )}


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

        <dialog ref={modalRef} className="modal">
          <div className="modal-box overflow-hidden p-0 max-w-2xl rounded-2xl">
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
    </>
  );
}