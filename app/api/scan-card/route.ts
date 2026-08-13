import { NextResponse } from "next/server";
import { DOMAINS_OF_ACTIVITY, resolveDomain } from "@/lib/domainsOfActivity";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier transmis." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Data}`;


    const domainList = DOMAINS_OF_ACTIVITY.map((d) => `${d.value} (${d.label})`).join(", ");

    const prompt = `Tu es un assistant OCR expert en cartes de visite.
Extrais les coordonnées et renvoie UNIQUEMENT un objet JSON valide :

{
  "firstName": "Prénom",
  "lastName": "Nom",
  "jobTitle": "Poste",
  "companyName": "Entreprise",
  "companyAddress": "Adresse",
  "companyWebsite": "Site web",
  "domainOfActivity": "SANTE_MEDICAL",
  "emails": ["email@exemple.com"],
  "phones": ["+33123456789"]
}

Champs vides si introuvables : "" ou [].

Pour domainOfActivity, déduis le secteur à partir du poste et de l'entreprise.
Renvoie une clé exacte parmi : ${domainList}.
Exemples : opticien → SANTE_MEDICAL, développeur → INFORMATIQUE_DIGITAL, avocat → CONSEIL_JURIDIQUE_RH.
Utilise AUTRE uniquement si aucun secteur n'est identifiable.
`;


    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        response_format: { type: "json_object" },
        plugins: [
          { id: "response-healing" }
        ],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });


    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Impossible de joindre OPEN ROUTER" },
        { status: 400 }
      );
    }

    const result = await response.json();
    const rawText = result.choices?.[0]?.message?.content;

    const cleanJson = rawText;

    const parsedData = JSON.parse(cleanJson);
    const rawDomain = parsedData.domainOfActivity ?? parsedData.domaineOfActivity;
    parsedData.domainOfActivity = resolveDomain(rawDomain);
    delete parsedData.domaineOfActivity;

    return NextResponse.json({
      success: true,
      data: parsedData,
    });

  } catch (error: any) {
    console.error("❌ ERREUR API SCAN ROUTE :", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Échec de l'analyse." },
      { status: 500 }
    );
  }
}