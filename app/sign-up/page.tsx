"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState({
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  function validateEmail(email: string) {
    const newErrors = {
      email: "",
      password: "",
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

  function validatePassword(password: string) {
    const newErrors = {
      email: "",
      password: "",
    };

    let isValid = true;

    if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères.";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une lettre et un chiffre.";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  }

/*   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = `${name.firstName} ${name.lastName}`;

    try {
      setLoading(true);

      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role, // Transmission du rôle ("user" ou "admin")
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur d'inscription");
      }

      router.push("/sign-in");
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
    } finally {
      setLoading(false);
    }
  }
 */
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <form
/*         onSubmit={handleSubmit} */
        className="flex flex-col gap-4 w-11/12 sm:w-full sm:max-w-md mx-auto p-6 sm:p-8 shadow-xl rounded-2xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200"
      >
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          S'Inscrire
        </h1>

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
            htmlFor="password"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            className="input w-full bg-slate-50 border-slate-200 text-slate-900 focus:input-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 rounded-xl transition-all"
            placeholder="*******"
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              validatePassword(value);
            }}
            required
          />
          {errors.password && (
            <p className="text-rose-500 dark:text-rose-400 text-xs mt-1 font-medium">
              {errors.password}
            </p>
          )}
        </fieldset>

        {/* Nouveauté : Champ de sélection de rôle (Temporaire) */}
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
            onChange={(e) => setRole(e.target.value)}
            className="select w-full bg-slate-50 border-slate-200 text-slate-900 focus:select-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-xl transition-all"
          >
            <option value="USER">Utilisateur (user)</option>
            <option value="ADMIN">Administrateur (admin)</option>
          </select>
        </fieldset>

        <button
          className="btn btn-primary text-primary-content w-full mt-2 font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span>Inscription...</span>
            </div>
          ) : (
            "S'inscrire"
          )}
        </button>

        <a
          href="/sign-in"
          className="text-center text-sm font-medium text-primary hover:underline dark:text-primary/90 mt-1"
        >
          Déjà un compte ? Se connecter
        </a>
      </form>
    </div>
  );
}