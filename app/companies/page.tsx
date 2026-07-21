"use client"
import { Header } from "@/app/components/Header";
import { BottomBar } from "@/app/components/BottomBar";
import { UserSearch, Plus } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import type { Company } from '@prisma/client';
import { FormCompany } from "../components/FormCompany";
import CompanyCard from "../components/CompanyCard";

export default function CompanyPage() {
    const modalRef = useRef<HTMLDialogElement>(null)
    const [companies, setCompanies] = useState<Company[]>([])
    const [searchInput, setSearchInput] = useState("")
    const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null)
    const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null)

    function closeModal() {
        (
            document.getElementById("my_modal_1") as HTMLDialogElement
        )?.close();
    }

    function openCreateModal() {
        setCompanyToEdit(null)
        modalRef.current?.showModal()
    }

    function openEditModal(company: Company) {
        setCompanyToEdit(company)
        modalRef.current?.showModal()
    }

    function handleCompanySaved(savedCompany: Company) {
        setCompanies((previous) => previous.map((company) =>
            company.company_id === savedCompany.company_id ? savedCompany : company
        ))
        void loadCompany()
    }

    const loadCompany = async () => {
        try {
            const response = await fetch(`/api/company?query=${encodeURIComponent(searchInput)}`,
                {
                    method: 'GET'
                }
            )
            const loadedCompanies = await response.json()

            setCompanies(loadedCompanies)
        } catch (error) {
            console.log(error)
        }

    }

    const deleteCompany = async (id: string) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette entreprise ?"
        );

        if (!confirmed) return;

        try {
            setDeletingCompanyId(id);
            const response = await fetch(`/api/company/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Échec de la suppression");
            }

            setCompanies((previous) =>
                previous.filter((company) => company.company_id !== id)
            );

            // Recharge la liste depuis la base pour synchroniser l'interface.
            await loadCompany();
        } catch (error) {
            console.error(error);
            alert("Impossible de supprimer l'entreprise.");
        } finally {
            setDeletingCompanyId(null);
        }
    };

    useEffect(() => {
        loadCompany()
    }
        , [searchInput])

    return (
        <>
            <Header />
            <main className="flex flex-col gap-4 py-20 px-5">
                <div className="flex justify-between gap-1 items-center w-full">
                    <label className="input flex-1">
                        <UserSearch className="h-[1em] opacity-50 shrink-0" />
                        <input type="search" required placeholder="Search" className="w-full" onChange={(e) => setSearchInput(e.target.value)} />
                    </label>

                    <button className="btn btn-ghost shrink-0" onClick={openCreateModal}>
                        <Plus className="h-[2em] opacity-50" />
                    </button>
                </div>
                <div className="flex flex-col gap-1 md:justify-between">
                    {companies.map((company) => (
                        <CompanyCard
                            key={company.company_id}
                            company={company} 
                            onEdit={openEditModal}
                            onDelete={deleteCompany}
                            isDeleting={deletingCompanyId === company.company_id}/>

                    ))
                    }
                </div>


                <dialog ref={modalRef} id="my_modal_1" className="modal">
                    <div className="modal-box">
                        <div className="modal-action mt-0">
                            <FormCompany
                                company={companyToEdit}
                                onClose={closeModal}
                                onSaved={handleCompanySaved}
                            />
                        </div>
                    </div>
                </dialog>
            </main>
            <BottomBar />
        </>
    )
}
