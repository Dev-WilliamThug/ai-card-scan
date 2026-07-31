"use client"

import { useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

export default function signIn_page() {
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
                password
            });


            if (result.error) {

                setError(result.error.message ?? "Une erreur est survenue.");
                return;
            }

            setSuccess("Connexion réussie.");
            router.push("/contacts");


        } catch (error) {

            console.error(
                "Erreur lors de la connexion :",
                error
            );

        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-11/12 sm:w-full sm:max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 shadow-lg rounded-lg bg-base-150">
                <h1 className="text-2xl font-bold text-center">Se Connecter</h1>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="input focus:input-primary w-full"
                        placeholder="kamgapascal@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="input focus:input-primary w-full"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </fieldset>
                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span>{success}</span>
                    </div>
                )}
                <button className="btn btn-soft btn-primary w-full mt-2" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                size={20}
                            />
                            Connexion...
                        </>
                    ) : (
                        "Se connecter"
                    )}
                </button>
                <a href="/sign-up" className="text-center text-sm text-primary hover:underline">
                    Pas de compte ? S'inscrire
                </a>
            </form>
        </div>
    )
}