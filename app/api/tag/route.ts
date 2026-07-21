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