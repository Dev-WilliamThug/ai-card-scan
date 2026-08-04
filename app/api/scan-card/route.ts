import { NextResponse } from "next/server";

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


    const prompt = `Tu es un assistant OCR expert en cartes de visite.
                    Extrais les coordonnées et renvoie UNIQUEMENT un objet JSON valide avec cette structure exacte 
                    Pour les mails et le numéro de téléphone récupère tout ce que tu trouveras et classe les dans un tableau:
                    {
                      "firstName": "Prénom principal",
                      "lastName": "Nom de famille",
                      "jobTitle": "Poste",
                      "companyName": "Nom de l'entreprise",
                      "companyAddress": "Adresse",
                      "companyWebsite": "Site web",
                      "emails": ["email@exemple.com","email2@exemple.com"],
                      "phones": ["+33123456789","+237609647289"]
                    }
                    Si un champ n'est pas trouvé ou bien tu n'arrives pas facilement à le lire, laisse une chaîne vide "" ou un tableau vide [].`;


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

    const parsedData = JSON.parse(cleanJson); //Convertit la réponse de OpenRouter en Objet Javascript

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