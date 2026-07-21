import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, address, website } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Le nom de l'entreprise est obligatoire." },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { company_id: id },
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        website: website?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Erreur lors de la modification de l'entreprise :", error);

    return NextResponse.json(
      { success: false, message: "Impossible de modifier cette entreprise." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.company.delete({
      where: { company_id: id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Entreprise introuvable ou non supprimable." },
      { status: 404 }
    );
  }
}
