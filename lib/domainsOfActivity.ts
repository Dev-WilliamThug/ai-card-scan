import { DomainOfActivity } from "@prisma/client";

export const DOMAINS_OF_ACTIVITY = [
  { value: "INFORMATIQUE_DIGITAL", label: "Informatique & Digital" },
  { value: "FINANCE_BANQUE_ASSURANCE", label: "Finance, Banque & Assurance" },
  { value: "CONSEIL_JURIDIQUE_RH", label: "Conseil, Juridique & RH" },
  { value: "MARKETING_COMMUNICATION_MEDIAS", label: "Marketing, Comm & Médias" },
  { value: "COMMERCE_DISTRIBUTION", label: "Commerce & Distribution" },
  { value: "IMMOBILIER_BTP", label: "Immobilier & BTP" },
  { value: "SANTE_MEDICAL", label: "Santé & Médical" },
  { value: "INDUSTRIE_ENERGIE_LOGISTIQUE", label: "Industrie, Énergie & Logistique" },
  { value: "EDUCATION_FORMATION", label: "Éducation & Formation" },
  { value: "HOTELLERIE_RESTAURATION_TOURISME", label: "Hôtellerie & Tourisme" },
  { value: "AGROALIMENTAIRE_AGRICULTURE", label: "Agroalimentaire & Agriculture" },
  { value: "AUTRE", label: "Autre" },
] as const;

export type DomainOfActivityValue = (typeof DOMAINS_OF_ACTIVITY)[number]["value"];

export function isValidDomain(domain: string): domain is DomainOfActivity {
  return Object.values(DomainOfActivity).includes(domain as DomainOfActivity);
}

export function resolveDomain(raw: unknown): DomainOfActivity {
  if (typeof raw === "string" && isValidDomain(raw.trim())) {
    return raw.trim() as DomainOfActivity;
  }
  return DomainOfActivity.AUTRE;
}
