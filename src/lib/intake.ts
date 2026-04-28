import type { ConnectorModule, MatchResult } from "../types";

export type IntakeLaneId = "paste" | "link" | "upload" | "manual";

export interface IntakeLaneSummary {
  id: IntakeLaneId;
  label: string;
  description: string;
  count: number;
  connectorStatus: "ready" | "planned";
  supportedImports: string[];
}

export interface IntakeDeskSummary {
  totalImported: number;
  highFitCount: number;
  quickActionCount: number;
  serviceLeadCount: number;
  laneSummaries: IntakeLaneSummary[];
  recommendedActions: string[];
}

const laneConfig: Record<
  IntakeLaneId,
  { label: string; description: string; connectorId?: string; fallbackImports: string[] }
> = {
  paste: {
    label: "Paste text",
    description:
      "Turn copied job descriptions, classifieds, and community posts into ranked cards.",
    connectorId: "job-description-intake",
    fallbackImports: ["Job descriptions", "Community board text", "Copied listings"],
  },
  link: {
    label: "Import link",
    description:
      "Create a structured card from a user-supplied URL without scraping the source.",
    connectorId: "manual-link-import",
    fallbackImports: ["Marketplace URLs", "Saved job links", "Partner listing links"],
  },
  upload: {
    label: "Upload asset",
    description:
      "Stage screenshots and PDFs now, with room for OCR and parser upgrades later.",
    connectorId: "asset-review-pipeline",
    fallbackImports: ["PNG / JPG screenshots", "PDF flyers", "Camera captures"],
  },
  manual: {
    label: "Save card",
    description:
      "Capture direct leads, service requests, and community referrals as opportunity cards.",
    fallbackImports: ["Manual leads", "Service requests", "Warm-intro opportunities"],
  },
};

export function getIntakeLane(match: Pick<MatchResult, "sourceId" | "sourceType">): IntakeLaneId {
  if (match.sourceId.startsWith("paste-")) {
    return "paste";
  }

  if (match.sourceId.startsWith("link-")) {
    return "link";
  }

  if (match.sourceId.startsWith("upload-")) {
    return "upload";
  }

  if (match.sourceId.startsWith("manual-") || match.sourceType === "manual") {
    return "manual";
  }

  return "link";
}

export function buildIntakeDeskSummary(
  importedMatches: MatchResult[],
  connectors: ConnectorModule[],
): IntakeDeskSummary {
  const counts = importedMatches.reduce<Record<IntakeLaneId, number>>(
    (totals, match) => {
      totals[getIntakeLane(match)] += 1;
      return totals;
    },
    {
      paste: 0,
      link: 0,
      upload: 0,
      manual: 0,
    },
  );

  const laneSummaries = (Object.keys(laneConfig) as IntakeLaneId[]).map((laneId) => {
    const config = laneConfig[laneId];
    const connector = config.connectorId
      ? connectors.find((item) => item.id === config.connectorId)
      : undefined;

    return {
      id: laneId,
      label: config.label,
      description: config.description,
      count: counts[laneId],
      connectorStatus: connector?.status ?? "ready",
      supportedImports: connector?.supportedImports ?? config.fallbackImports,
    };
  });

  const highFitCount = importedMatches.filter((match) => match.matchScore >= 78).length;
  const quickActionCount = importedMatches.filter(
    (match) => match.urgency >= 82 || match.compensationValue >= 78,
  ).length;
  const serviceLeadCount = importedMatches.filter(
    (match) =>
      match.category === "Freelance Services" ||
      match.sourceType === "manual" ||
      getIntakeLane(match) === "manual",
  ).length;

  const recommendedActions = [
    highFitCount > 0
      ? `Prioritize the ${highFitCount} imported leads already scoring 78 or above.`
      : "Paste or import a stronger lead to create a high-fit opportunity card.",
    counts.upload > 0
      ? "Use uploaded assets as placeholders now, then swap in OCR once a parser connector is added."
      : "Upload one screenshot or PDF to demonstrate the safe asset intake path.",
    serviceLeadCount > 0
      ? `You already have ${serviceLeadCount} direct-service lead${serviceLeadCount === 1 ? "" : "s"} in the mix.`
      : "Save at least one manual local-service card to show the direct-income path.",
  ];

  return {
    totalImported: importedMatches.length,
    highFitCount,
    quickActionCount,
    serviceLeadCount,
    laneSummaries,
    recommendedActions,
  };
}
