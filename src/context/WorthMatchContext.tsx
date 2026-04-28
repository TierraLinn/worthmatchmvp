import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { connectorModules } from "../data/connectors";
import {
  demoOpportunities,
  demoPersonas,
  findDemoPersona,
} from "../data/demo";
import { createImportedOpportunity } from "../lib/importer";
import { rankOpportunities } from "../lib/matcher";
import { buildResumeArtifacts } from "../lib/resume";
import {
  loadPersistedState,
  parsePersistedStateSnapshot,
  savePersistedState,
  type PersistedWorthMatchState,
} from "../lib/storage";
import {
  createTrackedOpportunity,
  formatDateStamp,
  seededTrackedOpportunities,
  sortTrackedOpportunities,
} from "../lib/tracker";
import { translateProfile } from "../lib/translator";
import type {
  DemoPersona,
  ImportInput,
  MatchResult,
  Opportunity,
  ResumeArtifacts,
  ResumeDraftField,
  ResumeDrafts,
  SkillInsight,
  TrackedOpportunity,
  TrackedOpportunityView,
  UserProfile,
} from "../types";

interface WorthMatchState {
  profile: UserProfile;
  insight: SkillInsight;
  matches: MatchResult[];
  importedOpportunities: Opportunity[];
  importedMatches: MatchResult[];
  selectedOpportunityId: string;
  artifacts: ResumeArtifacts;
  savedOpportunityIds: string[];
  hasCompletedOnboarding: boolean;
  trackedOpportunities: TrackedOpportunityView[];
  demoPersonas: DemoPersona[];
  activePresetId: string | null;
}

interface WorthMatchContextValue extends WorthMatchState {
  completeOnboarding: (profile: UserProfile) => void;
  selectOpportunity: (opportunityId: string) => void;
  importOpportunity: (input: ImportInput) => void;
  addImportedOpportunity: (opportunity: Opportunity) => void;
  toggleSavedOpportunity: (opportunityId: string) => void;
  trackOpportunity: (opportunityId: string) => void;
  updateTrackedOpportunity: (
    opportunityId: string,
    patch: Partial<Omit<TrackedOpportunity, "opportunityId">>,
  ) => void;
  updateResumeDraft: (field: ResumeDraftField, value: string) => void;
  resetResumeDraft: (field: ResumeDraftField) => void;
  removeImportedOpportunity: (opportunityId: string) => void;
  removeTrackedOpportunity: (opportunityId: string) => void;
  exportWorkspace: () => string;
  restoreWorkspace: (snapshot: string) => boolean;
  applyDemoPersona: (personaId: string, completeOnboarding?: boolean) => void;
  startFreshWorkspace: () => void;
  resetWorkspace: () => void;
}

function deriveMatchData(
  profile: UserProfile,
  importedOpportunities: PersistedWorthMatchState["importedOpportunities"],
  selectedOpportunityId?: string,
) {
  const insight = translateProfile(profile);
  const matches = rankOpportunities(profile, insight, [
    ...demoOpportunities,
    ...importedOpportunities,
  ]);
  const resolvedSelectedId =
    matches.find((match) => match.id === selectedOpportunityId)?.id ??
    matches[0]?.id ??
    "";

  return { insight, matches, selectedOpportunityId: resolvedSelectedId };
}

function createPersonaState(
  personaId: string,
  hasCompletedOnboarding = false,
): PersistedWorthMatchState {
  const persona = findDemoPersona(personaId) ?? demoPersonas[0];
  const derived = deriveMatchData(persona.profile, []);

  return {
    profile: persona.profile,
    activePresetId: persona.id,
    importedOpportunities: [],
    selectedOpportunityId: derived.selectedOpportunityId,
    savedOpportunityIds: [],
    hasCompletedOnboarding,
    trackedOpportunities: seededTrackedOpportunities,
    resumeDrafts: {
      targetedByOpportunity: {},
    },
  };
}

function createDefaultPersistedState(): PersistedWorthMatchState {
  return createPersonaState(demoPersonas[0].id, false);
}

function createBlankProfile(): UserProfile {
  return {
    name: "",
    location: "",
    headline: "",
    strengths: "",
    helpRequests: "",
    experienceNotes: "",
    desiredRoles: "",
    workModes: ["remote"],
    incomeSpeed: "this-month",
    availability: "",
  };
}

function createBlankPersistedState(): PersistedWorthMatchState {
  return {
    profile: createBlankProfile(),
    activePresetId: null,
    importedOpportunities: [],
    selectedOpportunityId: "",
    savedOpportunityIds: [],
    hasCompletedOnboarding: false,
    trackedOpportunities: [],
    resumeDrafts: {
      targetedByOpportunity: {},
    },
  };
}

function getInitialPersistedState(): PersistedWorthMatchState {
  const persisted = loadPersistedState();

  if (!persisted) {
    return createDefaultPersistedState();
  }

  const derived = deriveMatchData(
    persisted.profile,
    persisted.importedOpportunities,
    persisted.selectedOpportunityId,
  );

  return {
    ...persisted,
    activePresetId: persisted.activePresetId,
    selectedOpportunityId: derived.selectedOpportunityId,
    trackedOpportunities: persisted.trackedOpportunities,
    resumeDrafts: persisted.resumeDrafts ?? {
      targetedByOpportunity: {},
    },
  };
}

function removeOpportunityDrafts(
  resumeDrafts: ResumeDrafts,
  opportunityId: string,
): ResumeDrafts {
  const nextTargetedDrafts = { ...resumeDrafts.targetedByOpportunity };
  delete nextTargetedDrafts[opportunityId];

  return {
    ...resumeDrafts,
    targetedByOpportunity: nextTargetedDrafts,
  };
}

function normalizePersistedState(
  state: PersistedWorthMatchState,
): PersistedWorthMatchState {
  const derived = deriveMatchData(
    state.profile,
    state.importedOpportunities,
    state.selectedOpportunityId,
  );

  return {
    ...state,
    activePresetId: state.activePresetId ?? null,
    selectedOpportunityId: derived.selectedOpportunityId,
    trackedOpportunities: state.trackedOpportunities,
    resumeDrafts: state.resumeDrafts ?? {
      targetedByOpportunity: {},
    },
  };
}

function mergeArtifacts(
  generatedArtifacts: ResumeArtifacts,
  resumeDrafts: ResumeDrafts,
  selectedOpportunityId: string,
): ResumeArtifacts {
  const targetedDraft =
    resumeDrafts.targetedByOpportunity[selectedOpportunityId] ?? {};

  return {
    ...generatedArtifacts,
    masterResume: resumeDrafts.masterResume ?? generatedArtifacts.masterResume,
    targetedResume:
      targetedDraft.targetedResume ?? generatedArtifacts.targetedResume,
    coverLetter: targetedDraft.coverLetter ?? generatedArtifacts.coverLetter,
    shortBio: targetedDraft.shortBio ?? generatedArtifacts.shortBio,
    plainTextResume:
      targetedDraft.targetedResume ?? generatedArtifacts.targetedResume,
  };
}

const WorthMatchContext = createContext<WorthMatchContextValue | null>(null);

export function WorthMatchProvider({ children }: PropsWithChildren) {
  const [persistedState, setPersistedState] = useState<PersistedWorthMatchState>(
    getInitialPersistedState,
  );

  useEffect(() => {
    savePersistedState(persistedState);
  }, [persistedState]);

  const derived = useMemo(
    () =>
      deriveMatchData(
        persistedState.profile,
        persistedState.importedOpportunities,
        persistedState.selectedOpportunityId,
      ),
    [
      persistedState.profile,
      persistedState.importedOpportunities,
      persistedState.selectedOpportunityId,
    ],
  );

  const selectedMatch = useMemo(
    () =>
      derived.matches.find(
        (match) => match.id === derived.selectedOpportunityId,
      ),
    [derived.matches, derived.selectedOpportunityId],
  );

  const generatedArtifacts = useMemo(
    () =>
      buildResumeArtifacts(
        persistedState.profile,
        derived.insight,
        selectedMatch,
      ),
    [persistedState.profile, derived.insight, selectedMatch],
  );

  const artifacts = useMemo(
    () =>
      mergeArtifacts(
        generatedArtifacts,
        persistedState.resumeDrafts,
        derived.selectedOpportunityId,
      ),
    [
      generatedArtifacts,
      persistedState.resumeDrafts,
      derived.selectedOpportunityId,
    ],
  );

  const trackedOpportunities = useMemo(
    () =>
      sortTrackedOpportunities(
        persistedState.trackedOpportunities.flatMap((trackedOpportunity) => {
          const match = derived.matches.find(
            (item) => item.id === trackedOpportunity.opportunityId,
          );

          if (!match) {
            return [];
          }

          return [
            {
              ...trackedOpportunity,
              opportunity: match,
            },
          ];
        }),
      ),
    [persistedState.trackedOpportunities, derived.matches],
  );

  const importedMatches = useMemo(() => {
    const importedIds = new Set(
      persistedState.importedOpportunities.map((opportunity) => opportunity.id),
    );

    return derived.matches.filter((match) => importedIds.has(match.id));
  }, [persistedState.importedOpportunities, derived.matches]);

  function completeOnboarding(profile: UserProfile) {
    setPersistedState((current) => {
      const nextSelectedId = deriveMatchData(
        profile,
        current.importedOpportunities,
        current.selectedOpportunityId,
      ).selectedOpportunityId;

      return {
        ...current,
        profile,
        hasCompletedOnboarding: true,
        selectedOpportunityId: nextSelectedId,
        activePresetId: null,
      };
    });
  }

  function selectOpportunity(opportunityId: string) {
    setPersistedState((current) => ({
      ...current,
      selectedOpportunityId: opportunityId,
    }));
  }

  function importOpportunity(input: ImportInput) {
    setPersistedState((current) => {
      const currentInsight = translateProfile(current.profile);
      const importedOpportunity = createImportedOpportunity(
        input,
        current.profile,
        currentInsight,
      );

      return {
        ...current,
        importedOpportunities: [
          importedOpportunity,
          ...current.importedOpportunities,
        ],
        selectedOpportunityId: importedOpportunity.id,
      };
    });
  }

  function addImportedOpportunity(opportunity: Opportunity) {
    setPersistedState((current) => {
      const existing = current.importedOpportunities.find(
        (item) => item.id === opportunity.id,
      );

      const importedOpportunities = existing
        ? current.importedOpportunities.map((item) =>
            item.id === opportunity.id ? opportunity : item,
          )
        : [opportunity, ...current.importedOpportunities];

      return {
        ...current,
        importedOpportunities,
        selectedOpportunityId: opportunity.id,
      };
    });
  }

  function toggleSavedOpportunity(opportunityId: string) {
    setPersistedState((current) => ({
      ...current,
      savedOpportunityIds: current.savedOpportunityIds.includes(opportunityId)
        ? current.savedOpportunityIds.filter(
            (savedId) => savedId !== opportunityId,
          )
        : [opportunityId, ...current.savedOpportunityIds],
    }));
  }

  function trackOpportunity(opportunityId: string) {
    setPersistedState((current) => {
      if (
        current.trackedOpportunities.some(
          (trackedOpportunity) =>
            trackedOpportunity.opportunityId === opportunityId,
        )
      ) {
        return current;
      }

      return {
        ...current,
        trackedOpportunities: [
          createTrackedOpportunity(opportunityId),
          ...current.trackedOpportunities,
        ],
      };
    });
  }

  function updateTrackedOpportunity(
    opportunityId: string,
    patch: Partial<Omit<TrackedOpportunity, "opportunityId">>,
  ) {
    setPersistedState((current) => ({
      ...current,
      trackedOpportunities: current.trackedOpportunities.map(
        (trackedOpportunity) =>
          trackedOpportunity.opportunityId === opportunityId
            ? {
                ...trackedOpportunity,
                ...patch,
                lastUpdated: patch.lastUpdated ?? formatDateStamp(),
              }
            : trackedOpportunity,
      ),
    }));
  }

  function updateResumeDraft(field: ResumeDraftField, value: string) {
    setPersistedState((current) => {
      if (field === "masterResume") {
        return {
          ...current,
          resumeDrafts: {
            ...current.resumeDrafts,
            masterResume: value,
          },
        };
      }

      const opportunityId = deriveMatchData(
        current.profile,
        current.importedOpportunities,
        current.selectedOpportunityId,
      ).selectedOpportunityId;

      return {
        ...current,
        resumeDrafts: {
          ...current.resumeDrafts,
          targetedByOpportunity: {
            ...current.resumeDrafts.targetedByOpportunity,
            [opportunityId]: {
              ...current.resumeDrafts.targetedByOpportunity[opportunityId],
              [field]: value,
            },
          },
        },
      };
    });
  }

  function resetResumeDraft(field: ResumeDraftField) {
    setPersistedState((current) => {
      if (field === "masterResume") {
        return {
          ...current,
          resumeDrafts: {
            ...current.resumeDrafts,
            masterResume: undefined,
          },
        };
      }

      const opportunityId = deriveMatchData(
        current.profile,
        current.importedOpportunities,
        current.selectedOpportunityId,
      ).selectedOpportunityId;
      const currentTargetedDraft =
        current.resumeDrafts.targetedByOpportunity[opportunityId] ?? {};
      const nextTargetedDraft = { ...currentTargetedDraft };
      delete nextTargetedDraft[field];

      return {
        ...current,
        resumeDrafts: {
          ...current.resumeDrafts,
          targetedByOpportunity: {
            ...current.resumeDrafts.targetedByOpportunity,
            [opportunityId]: nextTargetedDraft,
          },
        },
      };
    });
  }

  function removeImportedOpportunity(opportunityId: string) {
    setPersistedState((current) => {
      const importedOpportunities = current.importedOpportunities.filter(
        (opportunity) => opportunity.id !== opportunityId,
      );
      const selectedOpportunityId =
        current.selectedOpportunityId === opportunityId
          ? ""
          : current.selectedOpportunityId;

      return normalizePersistedState({
        ...current,
        importedOpportunities,
        selectedOpportunityId,
        savedOpportunityIds: current.savedOpportunityIds.filter(
          (savedId) => savedId !== opportunityId,
        ),
        trackedOpportunities: current.trackedOpportunities.filter(
          (trackedOpportunity) =>
            trackedOpportunity.opportunityId !== opportunityId,
        ),
        resumeDrafts: removeOpportunityDrafts(
          current.resumeDrafts,
          opportunityId,
        ),
      });
    });
  }

  function removeTrackedOpportunity(opportunityId: string) {
    setPersistedState((current) => ({
      ...current,
      trackedOpportunities: current.trackedOpportunities.filter(
        (trackedOpportunity) => trackedOpportunity.opportunityId !== opportunityId,
      ),
    }));
  }

  function exportWorkspace() {
    return JSON.stringify(persistedState, null, 2);
  }

  function restoreWorkspace(snapshot: string) {
    const parsed = parsePersistedStateSnapshot(snapshot);

    if (!parsed) {
      return false;
    }

    setPersistedState(normalizePersistedState(parsed));
    return true;
  }

  function applyDemoPersona(personaId: string, completeDemoFlow = true) {
    setPersistedState(createPersonaState(personaId, completeDemoFlow));
  }

  function startFreshWorkspace() {
    setPersistedState(normalizePersistedState(createBlankPersistedState()));
  }

  function resetWorkspace() {
    setPersistedState(createDefaultPersistedState());
  }

  return (
    <WorthMatchContext.Provider
      value={{
        profile: persistedState.profile,
        insight: derived.insight,
        matches: derived.matches,
        importedOpportunities: persistedState.importedOpportunities,
        importedMatches,
        selectedOpportunityId: derived.selectedOpportunityId,
        artifacts,
        savedOpportunityIds: persistedState.savedOpportunityIds,
        hasCompletedOnboarding: persistedState.hasCompletedOnboarding,
        trackedOpportunities,
        demoPersonas,
        activePresetId: persistedState.activePresetId,
        completeOnboarding,
        selectOpportunity,
        importOpportunity,
        addImportedOpportunity,
        toggleSavedOpportunity,
        trackOpportunity,
        updateTrackedOpportunity,
        updateResumeDraft,
        resetResumeDraft,
        removeImportedOpportunity,
        removeTrackedOpportunity,
        exportWorkspace,
        restoreWorkspace,
        applyDemoPersona,
        startFreshWorkspace,
        resetWorkspace,
      }}
    >
      {children}
    </WorthMatchContext.Provider>
  );
}

export function useWorthMatch() {
  const context = useContext(WorthMatchContext);

  if (!context) {
    throw new Error("useWorthMatch must be used within WorthMatchProvider.");
  }

  return context;
}

export { connectorModules };
