"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/app/components/Header";
import { SideBar } from "@/app/components/SideBar";
import { UserCard, UserItem } from "@/app/components/UserCard";
import { authClient } from "@/lib/auth-client";
import { UserSearch, UserRoundPlus, Loader, Loader2, X, UserRoundIcon } from "lucide-react";

export default function UsersListPage() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [name, setName] = useState({
    firstName: "",
    lastName: "",
  });
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    other: "",
  });

  function validateEmail(email: string) {
    const newErrors = {
      email: "",
      password: "",
      other:""
    };

    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Veuillez entrer une adresse email valide.";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  }

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await authClient.admin.listUsers({
        query: {
          limit: 100, // Récupération directe sans pagination
        },
      });

      if (fetchError) {
        setError(fetchError.message || "Erreur lors du chargement des utilisateurs");
      } else if (data?.users) {
        setUsers(data.users as UserItem[]);
      }

      setLoading(false);
    }

    fetchUsers();
  }, []);


  async function createUser() {
    setIsSubmitting(true);
    try {
      const { data: newUser, error } = await authClient.admin.createUser({
        email: email, 
        password: "password1234", 
        name: `${name.firstName} ${name.lastName}`, 
        role: role,
        data: { customField: "customValue" },
      });

      if (error) {
        setErrors({
          email: "",
          password: "",
          other: error.message || "Erreur lors de la création de l'utilisateur",
        });
      }


      if (newUser) {
        setIsSubmitting(false);
        setEmail("");
        setName({ firstName: "", lastName: "" });
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      setErrors({
        email: "",
        password: "",
        other: "Erreur lors de la création de l'utilisateur",
      });
    } finally {
      setIsSubmitting(false);
    }

  }

  const handleToggleAdmin = async (userId: string, shouldBeAdmin: boolean) => {
    const newRole = shouldBeAdmin ? "admin" : "user";

    const { error } = await authClient.admin.setRole({
      userId,
      role: newRole,
    });

    if (!error) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } else {
      console.error("Erreur lors de la modification du rôle :", error.message);
    }
  };

 
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

  
    const { error } = await authClient.admin.removeUser({ userId });

    if (!error) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } else {
      console.error("Erreur lors de la suppression :", error.message);
    }
  };

 
  const filteredUsers = users.filter((user) => {
    const query = searchInput.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

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
              placeholder="Rechercher par nom, email..."
              className="grow text-sm placeholder:text-gray-400 dark:text-slate-600"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary rounded-xl shrink-0 gap-2 font-medium shadow-sm hover:shadow-md transition-all"
            type="button"
            onClick={() => { modalRef.current?.showModal(); }}
            title="Ajouter un utilisateur"
          >
            <UserRoundPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>


        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">
              Chargement des utilisateurs...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        ) : (
          <>

            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onToggleAdmin={handleToggleAdmin}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-base-150 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  Aucun utilisateur trouvé
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  {searchInput
                    ? "Essayez de modifier vos critères de recherche."
                    : "Aucun utilisateur enregistré pour le moment."}
                </p>
              </div>
            )}
          </>
        )}

        <dialog ref={modalRef} className="modal">
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <UserRoundIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Créer un nouveau utilisateur
                  </h3>
                </div>
                <button
                  onClick={() => { modalRef.current?.close() }}
                  disabled={isSubmitting} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errors.other && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {errors.other}
                </div>
              )}

              <form onSubmit={createUser} className="mt-4 space-y-5">
                <fieldset className="fieldset flex flex-col gap-1">
                  <label
                    className="label text-xs font-semibold text-slate-600 dark:text-slate-300"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input w-full bg-slate-50 border-slate-200 text-slate-900 focus:input-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl transition-all"
                    placeholder="kamgapascal@gmail.com"
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);
                      validateEmail(value);
                    }}
                    required
                  />
                  {errors.email && (
                    <p className="text-rose-500 dark:text-rose-400 text-xs mt-1 font-medium">
                      {errors.email}
                    </p>
                  )}
                </fieldset>

                <fieldset className="fieldset flex flex-col gap-1">
                  <label
                    className="label text-xs font-semibold text-slate-600 dark:text-slate-300"
                    htmlFor="firstName"
                  >
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="input w-full bg-slate-50 border-slate-200 text-slate-900 focus:input-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl transition-all"
                    placeholder="Pascal"
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      setName((prev) => ({ ...prev, firstName: value }));
                    }}
                  />
                </fieldset>

                <fieldset className="fieldset flex flex-col gap-1">
                  <label
                    className="label text-xs font-semibold text-slate-600 dark:text-slate-300"
                    htmlFor="lastName"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="input w-full bg-slate-50 border-slate-200 text-slate-900 focus:input-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl transition-all"
                    placeholder="Kamgang"
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      setName((prev) => ({ ...prev, lastName: value }));
                    }}
                  />
                </fieldset>


                <fieldset className="fieldset flex flex-col gap-1">
                  <label
                    className="label text-xs font-semibold text-slate-600 dark:text-slate-300"
                    htmlFor="role"
                  >
                    Rôle
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    className="select w-full bg-slate-50 border-slate-200 text-slate-900 focus:select-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl transition-all"
                  >
                    <option value="user">Utilisateur (user)</option>
                    <option value="admin">Administrateur (admin)</option>
                  </select>
                </fieldset>

                <button
                  className="btn btn-primary text-primary-content w-full mt-2 font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Enregistrement...</span>
                    </div>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </main>
    </>
  );
}