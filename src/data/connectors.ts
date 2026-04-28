import type { ConnectorModule } from "../types";

export const connectorModules: ConnectorModule[] = [
  {
    id: "manual-link-import",
    name: "Link Import",
    status: "ready",
    sourceType: "imported",
    description:
      "Create structured opportunity cards from pasted links without scraping the destination platform.",
    supportedImports: ["Direct links", "Saved listings", "Marketplace URLs"],
  },
  {
    id: "job-description-intake",
    name: "Job Description Intake",
    status: "ready",
    sourceType: "manual",
    description:
      "Turn pasted job descriptions and community board posts into ranked opportunities and targeted resume drafts.",
    supportedImports: ["Job descriptions", "Volunteer posts", "Gig listings"],
  },
  {
    id: "asset-review-pipeline",
    name: "Screenshot / PDF Review",
    status: "planned",
    sourceType: "imported",
    description:
      "Reserved parser slot for OCR and PDF extraction from uploaded listings, flyers, and community board screenshots.",
    supportedImports: ["PNG / JPG screenshots", "PDF flyers", "Camera captures"],
  },
  {
    id: "official-ats-connectors",
    name: "Official Source Connectors",
    status: "planned",
    sourceType: "official",
    description:
      "Connector registry placeholder for official APIs, partner feeds, and approved source integrations.",
    supportedImports: ["Approved job boards", "Partner marketplaces", "Organization feeds"],
  },
];
