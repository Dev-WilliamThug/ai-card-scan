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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
        if (!firstName) return NextResponse.json({ success: false, message: "Le prénom est obligatoire." }, { status: 400 });

        const emails = cleanValues(body.emails);
        const phones = cleanValues(body.phones);
        const contact = await prisma.contact.update({
            where: { contact_id: id },
            data: {
                firstName,
                lastName: typeof body.lastName === "string" ? body.lastName.trim() || null : null,
                jobTitle: typeof body.jobTitle === "string" ? body.jobTitle.trim() || null : null,
                company_id: typeof body.companyId === "string" && body.companyId ? body.companyId : null,
                tag_id: typeof body.tagId === "string" && body.tagId ? body.tagId : null,
                emails: { deleteMany: {}, create: emails.map((email, index) => ({ email, isPrimary: index === 0 })) },
                phones: { deleteMany: {}, create: phones.map((telephone, index) => ({ telephone, isPrimary: index === 0 })) },
            },
            include: includeRelations,
        });
        return NextResponse.json({ success: true, contact });
    } catch (error) {
        console.error("Erreur lors de la modification du contact :", error);
        return NextResponse.json({ success: false, message: "Impossible de modifier ce contact." }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.$transaction([
            prisma.email.deleteMany({ where: { contact_id: id } }),
            prisma.phone.deleteMany({ where: { contact_id: id } }),
            prisma.socialLink.deleteMany({ where: { contact_id: id } }),
            prisma.contact.delete({ where: { contact_id: id } }),
        ]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du contact :", error);
        return NextResponse.json({ success: false, message: "Impossible de supprimer ce contact." }, { status: 500 });
    }
}
