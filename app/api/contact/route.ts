import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidDomain, resolveDomain } from "@/lib/domainsOfActivity";

const includeRelations = {
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() ?? "";
    const tagId = searchParams.get("tagId")?.trim() ?? "";
    const domain = searchParams.get("domain")?.trim() ?? "";

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
        { emails: { some: { email: { contains: query, mode: "insensitive" } } } },
        { phones: { some: { telephone: { contains: query, mode: "insensitive" } } } },
      ];
    }

    if (tagId) {
      whereClause.tag_id = tagId;
    }

    if (domain && isValidDomain(domain)) {
      whereClause.domainOfActivity = domain;
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: includeRelations,
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts :", error);
    return NextResponse.json(
      { success: false, message: "Impossible de récupérer les contacts." },
      { status: 500 }
    );
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

    const rawDomain = typeof body.domainOfActivity === "string" ? body.domainOfActivity.trim() : "";
    const domainOfActivity = resolveDomain(rawDomain);

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName: typeof body.lastName === "string" ? body.lastName.trim() || null : null,
        jobTitle: typeof body.jobTitle === "string" ? body.jobTitle.trim() || null : null,
        companyName: typeof body.companyName === "string" ? body.companyName.trim() || null : null,
        companyAddress: typeof body.companyAddress === "string" ? body.companyAddress.trim() || null : null,
        companyWebsite: typeof body.companyWebsite === "string" ? body.companyWebsite.trim() || null : null,
        domainOfActivity,
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