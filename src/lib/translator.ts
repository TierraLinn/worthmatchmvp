import type { SkillInsight, UserProfile } from "../types";

interface TranslationRule {
  triggers: string[];
  skills: string[];
  jobTitles: string[];
  serviceOffers: string[];
  atsKeywords: string[];
}

const translationRules: TranslationRule[] = [
  {
    triggers: ["tutor", "homework", "student", "teach", "babysit"],
    skills: [
      "learning support",
      "lesson breakdown",
      "student communication",
      "family coordination",
    ],
    jobTitles: [
      "Student Success Associate",
      "Tutor",
      "Program Coordinator",
      "Academic Support Assistant",
    ],
    serviceOffers: [
      "Homework help sessions",
      "Family study-planning support",
      "After-school tutoring",
    ],
    atsKeywords: [
      "student support",
      "curriculum support",
      "mentoring",
      "progress tracking",
    ],
  },
  {
    triggers: ["organize", "schedule", "calendar", "forms", "admin", "assistant"],
    skills: [
      "administrative support",
      "calendar coordination",
      "detail management",
      "documentation",
    ],
    jobTitles: [
      "Operations Coordinator",
      "Administrative Assistant",
      "Executive Assistant",
      "Project Support Specialist",
    ],
    serviceOffers: [
      "Inbox and calendar cleanup",
      "Family admin support",
      "Virtual assistant services",
    ],
    atsKeywords: [
      "calendar management",
      "administrative support",
      "documentation",
      "workflow coordination",
    ],
  },
  {
    triggers: ["social", "post", "flyer", "event", "canva", "community"],
    skills: [
      "event coordination",
      "content planning",
      "community outreach",
      "light design support",
    ],
    jobTitles: [
      "Community Coordinator",
      "Marketing Assistant",
      "Events Assistant",
      "Program Associate",
    ],
    serviceOffers: [
      "Event support for local organizations",
      "Social content setup for small businesses",
      "Neighborhood flyer and outreach help",
    ],
    atsKeywords: [
      "event operations",
      "community outreach",
      "content calendar",
      "stakeholder communication",
    ],
  },
  {
    triggers: ["retail", "customer", "help", "support", "people"],
    skills: [
      "customer support",
      "service recovery",
      "professional communication",
      "conflict de-escalation",
    ],
    jobTitles: [
      "Customer Support Specialist",
      "Client Success Coordinator",
      "Member Support Associate",
    ],
    serviceOffers: [
      "Customer inbox support",
      "Client follow-up management",
      "Front-desk overflow help",
    ],
    atsKeywords: [
      "customer success",
      "service operations",
      "ticket management",
      "client communication",
    ],
  },
  {
    triggers: ["tech", "device", "portal", "setup", "troubleshoot"],
    skills: [
      "technical guidance",
      "device onboarding",
      "step-by-step instruction",
      "light troubleshooting",
    ],
    jobTitles: [
      "Tech Support Assistant",
      "Digital Literacy Coach",
      "Implementation Associate",
    ],
    serviceOffers: [
      "Device setup for households",
      "Portal and account walkthroughs",
      "Senior tech coaching",
    ],
    atsKeywords: [
      "technical onboarding",
      "troubleshooting",
      "client training",
      "knowledge sharing",
    ],
  },
];

function dedupe(values: string[], limit = 8) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, limit);
}

function toSentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function translateProfile(profile: UserProfile): SkillInsight {
  const corpus = [
    profile.headline,
    profile.strengths,
    profile.helpRequests,
    profile.experienceNotes,
    profile.desiredRoles,
  ]
    .join(" ")
    .toLowerCase();

  const matchedRules = translationRules.filter((rule) =>
    rule.triggers.some((trigger) => corpus.includes(trigger)),
  );

  const marketableSkills = dedupe([
    "communication",
    "reliability",
    "problem solving",
    "time management",
    ...matchedRules.flatMap((rule) => rule.skills),
  ], 10);

  const jobTitles = dedupe([
    ...matchedRules.flatMap((rule) => rule.jobTitles),
    "Operations Coordinator",
    "Client Support Associate",
    "Community Programs Assistant",
  ], 8);

  const serviceOffers = dedupe([
    ...matchedRules.flatMap((rule) => rule.serviceOffers),
    "Personal organization support",
    "Quick-turn admin help",
  ], 8);

  const atsKeywords = dedupe([
    ...matchedRules.flatMap((rule) => rule.atsKeywords),
    ...marketableSkills,
    ...jobTitles,
  ], 12);

  const valueProps = dedupe([
    `Turns ${profile.helpRequests.split(",")[0]?.trim() ?? "everyday support"} into paid, dependable results.`,
    `Combines calm communication with hands-on follow-through for ${profile.workModes.join("/")} work.`,
    `Can move between people-facing tasks, scheduling, and polished written updates without losing momentum.`,
  ], 3);

  const positioningSummary = toSentenceCase(
    `${profile.name || "This candidate"} is best positioned for organized support, student-facing, and community operations work that values reliability, empathy, and clear communication.`,
  );

  return {
    positioningSummary,
    marketableSkills,
    jobTitles,
    serviceOffers,
    atsKeywords,
    valueProps,
  };
}
