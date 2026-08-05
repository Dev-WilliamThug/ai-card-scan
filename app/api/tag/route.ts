import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {

    try {
        const tag = await prisma.tag.findMany();

        return NextResponse.json(tag)
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Une erreur est survenue lors de la récupération des tags."
            },
            {
                status: 500
            }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, color } = body;

        if (!name || !color) {
            return NextResponse.json(
                { error: "Le nom et la couleur du tag sont requis." },
                { status: 400 }
            );
        }

        const newTag = await prisma.tag.create({
            data: {
                name: name.trim(),
                color: color.trim(),
            },
        });

        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création du tag :", error);
        return NextResponse.json(
            { error: "Impossible de créer le tag pour le moment." },
            { status: 500 }
        );
    }
}