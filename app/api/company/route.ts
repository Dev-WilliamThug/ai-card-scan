import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {


    try {
        // 1. Récupérer les données envoyées par le client
        const body = await request.json();

        const { name, address, website } = body;

        // 2. Vérifier les données
        if (!name || !address) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le nom et l'adresse sont obligatoires."
                },
                {
                    status: 400
                }
            );
        }
        const trimmedName = name.trim();

        const existingCompany = await prisma.company.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: "insensitive", // Ignore majuscules/minuscules
                },
            },
        });

        if (existingCompany) {
            return NextResponse.json(existingCompany, { status: 200 });
        } else {
            // 3. Enregistrer dans la base de données
            const company = await prisma.company.create({
                data: {
                    name,
                    address,
                    website
                }
            });

            // 4. Retourner une réponse
            return NextResponse.json(
                {
                    success: true,
                    message: "Entreprise créée avec succès.",
                    company
                },
                {
                    status: 201
                }
            );
        }

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Une erreur est survenue lors de la création de l'entreprise."
            },
            {
                status: 500
            }
        );
    }
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') ?? ''

    try {
        const companies = await prisma.company.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' }
            }
        });

        return NextResponse.json(companies)
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Une erreur est survenue lors de la récupération des entreprises."
            },
            {
                status: 500
            }
        );
    }
}