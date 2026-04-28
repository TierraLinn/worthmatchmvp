export type WorkMode = "remote" | "local" | "hybrid";

export type IncomeSpeed = "now" | "this-month" | "flexible";

export type SourceType = "official" | "imported" | "manual" | "community";

export type OpportunityKind = "full-time" | "part-time" | "contract" | "gig";

export type ExperienceLevel = "entry" | "growing" | "mid";

export interface UserProfile {
  name: string;
  location: string;
  headline: string;
  strengths: string;
  helpRequests: string;
  experienceNotes: string;
  desiredRoles: string;
  workModes: WorkMode[];
  incomeSpeed: IncomeSpeed;
  availability: string;
}

export interface DemoPersona {
  id: string;
  label: string;
  audience: string;
  pitch: string;
  heroStat: string;
  quickWins: string[];
  profile: UserProfile;
}

export interface SkillInsight {
  positioningSummary: string;
  marketableSkills: string[];
  jobTitles: string[];
  serviceOffers: string[];
  atsKeywords: string[];
  valueProps: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  sourceId: string;
  sourceLabel: string;
  sourceType: SourceType;
  location: string;
  remotePolicy: WorkMode;
  kind: OpportunityKind;
  experienceLevel: ExperienceLevel;
  compensation: string;
  compensationValue: number;
  urgencyScore: number;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  tags: string[];
  category: string;
  link?: string;
}

export interface MatchResult extends Opportunity {
  matchScore: number;
  skillFit: number;
  preferenceFit: number;
  payPotential: number;
  urgency: number;
  experienceFit: number;
  missingQualifications: string[];
  whyItMatches: string[];
  recommendedActions: string[];
}

export interface ConnectorModule {
  id: string;
  name: string;
  status: "ready" | "planned";
  sourceType: SourceType;
  description: string;
  supportedImports: string[];
}

export interface QuickAnswer {
  question: string;
  answer: string;
}

export type ResumeDraftField = "masterResume" | "targetedResume" | "coverLetter" | "shortBio";

export interface ResumeDrafts {
  masterResume?: string;
  targetedByOpportunity: Record<
    string,
    Partial<Record<Exclude<ResumeDraftField, "masterResume">, string>>
  >;
}

export interface ResumeArtifacts {
  masterResume: string;
  targetedResume: string;
  coverLetter: string;
  shortBio: string;
  plainTextResume: string;
  quickAnswers: QuickAnswer[];
}

export interface ImportInput {
  mode: "paste" | "link" | "upload" | "manual";
  content: string;
  extra?: string;
}

export type ApplicationStage =
  | "discovered"
  | "ready"
  | "applied"
  | "interview"
  | "offer";

export interface TrackedOpportunity {
  opportunityId: string;
  stage: ApplicationStage;
  nextStep: string;
  dueLabel: string;
  notes: string;
  lastUpdated: string;
}

export interface TrackedOpportunityView extends TrackedOpportunity {
  opportunity: MatchResult;
}
