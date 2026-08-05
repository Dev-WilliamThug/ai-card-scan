"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Une erreur est survenue.");
        return;
      }

      setSuccess("Connexion réussie.");
      router.push("/contacts");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-11/12 sm:w-full sm:max-w-md mx-auto p-6 sm:p-8 shadow-xl rounded-2xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200"
      >
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Se Connecter
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>

        {error && (
          <div className="alert alert-error text-xs rounded-xl border dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success text-xs rounded-xl border dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <span>{success}</span>
          </div>
        )}

        <button
          className="btn btn-primary text-primary-content w-full mt-2 font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span>Connexion...</span>
            </div>
          ) : (
            "Se connecter"
          )}
        </button>

        <a
          href="/sign-up"
          className="text-center text-sm font-medium text-primary hover:underline dark:text-primary/90 mt-1"
        >
          Pas de compte ? S'inscrire
        </a>
      </form>
    </div>
  );
}