import type {
  Opportunity,
  ResumeDrafts,
  TrackedOpportunity,
  UserProfile,
} from "../types";

const STORAGE_KEY = "worthmatch.m1.state";

export interface PersistedWorthMatchState {
  profile: UserProfile;
  activePresetId: string | null;
  importedOpportunities: Opportunity[];
  selectedOpportunityId: string;
  savedOpportunityIds: string[];
  hasCompletedOnboarding: boolean;
  trackedOpportunities: TrackedOpportunity[];
  resumeDrafts: ResumeDrafts;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.location === "string" &&
    typeof value.headline === "string" &&
    typeof value.strengths === "string" &&
    typeof value.helpRequests === "string" &&
    typeof value.experienceNotes === "string" &&
    typeof value.desiredRoles === "string" &&
    Array.isArray(value.workModes) &&
    typeof value.incomeSpeed === "string" &&
    typeof value.availability === "string"
  );
}

function isOpportunity(value: unknown): value is Opportunity {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.organization === "string" &&
    typeof value.sourceId === "string" &&
    typeof value.sourceLabel === "string" &&
    typeof value.sourceType === "string" &&
    typeof value.location === "string" &&
    typeof value.remotePolicy === "string" &&
    typeof value.kind === "string" &&
    typeof value.experienceLevel === "string" &&
    typeof value.compensation === "string" &&
    typeof value.compensationValue === "number" &&
    typeof value.urgencyScore === "number" &&
    typeof value.summary === "string" &&
    Array.isArray(value.responsibilities) &&
    Array.isArray(value.qualifications) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.tags) &&
    typeof value.category === "string"
  );
}

function isTrackedOpportunity(value: unknown): value is TrackedOpportunity {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.opportunityId === "string" &&
    typeof value.stage === "string" &&
    typeof value.nextStep === "string" &&
    typeof value.dueLabel === "string" &&
    typeof value.notes === "string" &&
    typeof value.lastUpdated === "string"
  );
}

function isResumeDrafts(value: unknown): value is ResumeDrafts {
  if (!isRecord(value) || !isRecord(value.targetedByOpportunity)) {
    return false;
  }

  return value.masterResume === undefined || typeof value.masterResume === "string";
}

export function parsePersistedStateSnapshot(rawValue: string) {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      !isUserProfile(parsed.profile) ||
      !Array.isArray(parsed.importedOpportunities) ||
      !parsed.importedOpportunities.every(isOpportunity) ||
      typeof parsed.selectedOpportunityId !== "string" ||
      !Array.isArray(parsed.savedOpportunityIds) ||
      !parsed.savedOpportunityIds.every((value) => typeof value === "string") ||
      typeof parsed.hasCompletedOnboarding !== "boolean" ||
      !Array.isArray(parsed.trackedOpportunities) ||
      !parsed.trackedOpportunities.every(isTrackedOpportunity) ||
      !isResumeDrafts(parsed.resumeDrafts)
    ) {
      return null;
    }

    return {
      profile: parsed.profile,
      activePresetId:
        parsed.activePresetId === null || typeof parsed.activePresetId === "string"
          ? parsed.activePresetId
          : null,
      importedOpportunities: parsed.importedOpportunities,
      selectedOpportunityId: parsed.selectedOpportunityId,
      savedOpportunityIds: parsed.savedOpportunityIds,
      hasCompletedOnboarding: parsed.hasCompletedOnboarding,
      trackedOpportunities: parsed.trackedOpportunities,
      resumeDrafts: parsed.resumeDrafts,
    } satisfies PersistedWorthMatchState;
  } catch {
    return null;
  }
}

export function loadPersistedState() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return parsePersistedStateSnapshot(rawValue);
}

export function savePersistedState(state: PersistedWorthMatchState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
