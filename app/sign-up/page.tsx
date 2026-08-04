"use client"
import { useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";


export default function signUp_page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(
        {
            firstName: '',
            lastName: ''
        }
    );
    const [errors, setErrors] = useState(
        {
            email: '',
            password: ''
        }
    );

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


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fullName = `${name.firstName} ${name.lastName}`;


        try {

            setLoading(true);
            const result = await authClient.signUp.email({
                name: fullName,
                email,
                password
            });

            router.push("/sign-in");

        } catch (error) {
            console.error("Erreur lors de l'inscription :", error)
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <form onSubmit={handleSubmit} action="" className="flex flex-col gap-4 w-11/12 sm:w-full sm:max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 shadow-lg rounded-lg bg-base-150">
                <h1 className="text-2xl font-bold text-center">S'Inscrire</h1>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="email">Email</label>
                    <input type="email" id="email" className="input focus:input-primary w-full" placeholder="kamgapascal@gmail.com"
                        onChange={(e) => {
                            const value = e.target.value;
                            setEmail(value);
                            validateEmail(value);
                        }}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="firstName">Prénom</label>
                    <input type="text" id="firstName" className="input focus:input-primary w-full" placeholder="Pascal" required
                        onChange={(e) => {
                            const value = e.target.value;
                            setName(prev => ({ ...prev, firstName: value }));
                        }} />
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="lastName">Nom</label>
                    <input type="text" id="lastName" className="input focus:input-primary w-full" placeholder="Kamgang" required
                        onChange={(e) => {
                            const value = e.target.value;
                            setName(prev => ({ ...prev, lastName: value }));
                        }} />
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label" htmlFor="password">Password</label>
                    <input type="password" id="password" className="input focus:input-primary w-full" placeholder="*******"
                        onChange={(e) => {
                            const value = e.target.value;
                            setPassword(value);
                            validatePassword(value);
                        }}
                        required
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </fieldset>

                <button className="btn btn-soft btn-primary w-full mt-2" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2
                                className="animate-spin"
                                size={20}
                            />
                            Inscription...
                        </>
                    ) : (
                        "S'inscrire"
                    )}
                </button>
                <a href="/sign-in" className="text-center text-sm text-primary hover:underline">
                    Déjà un compte ? Se connecter
                </a>
            </form>
        </div>
    )
}