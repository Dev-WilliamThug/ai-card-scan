import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const includeRelations = {
    company: true,
    tag: true,
    emails: { orderBy: { createdAt: "asc" } },
    phones: { orderBy: { createdAt: "asc" } },
} as const;

function cleanValues(values: unknown): string[] {
    return Array.isArray(values)
        ? values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean)
        : [];
}

export async function GET(request: Request) {
    try {
        const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
        const contacts = await prisma.contact.findMany({
            where: query ? {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { company: { is: { name: { contains: query, mode: "insensitive" } } } },
                    { tag: { is: { name: { contains: query, mode: "insensitive" } } } },
                    { emails: { some: { email: { contains: query, mode: "insensitive" } } } },
                    { phones: { some: { telephone: { contains: query, mode: "insensitive" } } } },
                ],
            } : undefined,
            include: includeRelations,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Erreur lors de la récupération des contacts :", error);
        return NextResponse.json({ success: false, message: "Impossible de récupérer les contacts." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";

        if (!firstName) {
            return NextResponse.json({ success: false, message: "Le prénom est obligatoire." }, { status: 400 });
        }

        const emails = cleanValues(body.emails);
        const phones = cleanValues(body.phones);
        const contact = await prisma.contact.create({
            data: {
                firstName,
                lastName: typeof body.lastName === "string" ? body.lastName.trim() || null : null,
                jobTitle: typeof body.jobTitle === "string" ? body.jobTitle.trim() || null : null,
                company_id: typeof body.companyId === "string" && body.companyId ? body.companyId : null,
                tag_id: typeof body.tagId === "string" && body.tagId ? body.tagId : null,
                emails: { create: emails.map((email, index) => ({ email, isPrimary: index === 0 })) },
                phones: { create: phones.map((telephone, index) => ({ telephone, isPrimary: index === 0 })) },
            },
            include: includeRelations,
        });

        return NextResponse.json({ success: true, contact }, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création du contact :", error);
        return NextResponse.json({ success: false, message: "Impossible de créer ce contact." }, { status: 500 });
    }
}
