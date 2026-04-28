import type {
  MatchResult,
  SkillInsight,
  TrackedOpportunityView,
  UserProfile,
} from "../types";

export interface InterviewPrompt {
  question: string;
  answer: string;
}

export interface InterviewKit {
  intro: string;
  strongestAngles: string[];
  bridgeStatements: string[];
  likelyQuestions: InterviewPrompt[];
  salaryScript: string;
  followUpEmail: string;
  checklist: string[];
  prepBrief: string;
}

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

export function buildInterviewKit(
  profile: UserProfile,
  insight: SkillInsight,
  match: MatchResult,
  trackedOpportunity?: TrackedOpportunityView,
): InterviewKit {
  const topSkills = insight.marketableSkills.slice(0, 3).join(", ");
  const intro = `${profile.name} is a strong fit for ${match.title} because of hands-on experience with ${profile.helpRequests.toLowerCase()} and a track record of ${topSkills}. I bring calm communication, practical follow-through, and the ability to turn messy real-world needs into reliable support.`;

  const strongestAngles = [
    `The role needs ${match.skills.slice(0, 2).join(" and ")}, and I already do versions of that through ${profile.helpRequests.toLowerCase()}.`,
    `My background in ${profile.experienceNotes.toLowerCase()} shows that I can keep details moving without losing the human side of the work.`,
    `I am especially ready to help with ${match.responsibilities[0].toLowerCase()} and ${match.responsibilities[1]?.toLowerCase() ?? "clear communication and follow-through"}.`,
  ];

  const bridgeStatements = match.missingQualifications.length > 0
    ? match.missingQualifications.slice(0, 3).map((gap) =>
        `If asked about ${gap.toLowerCase()}, explain the closest real example from ${profile.experienceNotes.toLowerCase()} and show how quickly you learned similar workflows.`,
      )
    : [
        "No major qualification gap is flagged, so focus on specificity and outcomes instead of defensiveness.",
      ];

  const likelyQuestions: InterviewPrompt[] = [
    {
      question: `Why are you interested in ${match.title}?`,
      answer: `This role fits the work I already do well: ${topSkills}. I like work where I can support people, keep details moving, and create calm structure, and that is exactly what stands out in this opportunity.`,
    },
    {
      question: "Tell me about a time you handled competing priorities.",
      answer: `I would talk about managing ${profile.helpRequests.toLowerCase()} while staying organized and responsive. My approach is to clarify what is urgent, communicate early, and keep a simple system so nothing important gets dropped.`,
    },
    {
      question: "What makes you a strong fit even if your experience is unconventional?",
      answer: `A lot of my experience came from real responsibilities instead of formal titles, but the work is directly relevant: organizing people, communicating clearly, solving practical problems, and following through under pressure.`,
    },
    {
      question: `How would you approach ${match.responsibilities[0].toLowerCase()} here?`,
      answer: `I would start by learning the team workflow, mirroring the communication style, and creating a reliable repeatable process. Once the basics are solid, I would look for simple ways to make the work clearer or faster.`,
    },
  ];

  const salaryScript = `Based on the scope of ${match.title}, the fit with my background, and the value I can add quickly, I would be excited about compensation aligned with ${match.compensation}. I am open to discussing the total package and growth path as well.`;

  const followUpEmail = `Hi ${match.organization},\n\nThank you for the conversation about the ${match.title} role. I left even more excited about the opportunity because it matches the work I do best: ${topSkills}. I would be glad to bring that energy to ${match.organization}, especially around ${match.responsibilities[0].toLowerCase()}.\n\nBest,\n${profile.name}`;

  const checklist = [
    `Review the top three reasons WorthMatch matched you to ${match.title}.`,
    `Practice the 30-second intro out loud at least three times.`,
    `Prepare one example for ${match.skills[0]}, ${match.skills[1] ?? "communication"}, and follow-through.`,
    trackedOpportunity?.nextStep
      ? `Before the interview, complete this next step: ${trackedOpportunity.nextStep}`
      : "Bring one question about team workflow and one question about success in the first 30 days.",
  ];

  const prepBrief = joinLines([
    `WORTHMATCH INTERVIEW PREP`,
    `${profile.name}`,
    `${match.title} | ${match.organization}`,
    "",
    "30-SECOND INTRO",
    intro,
    "",
    "STRONGEST ANGLES",
    strongestAngles.map((item) => `- ${item}`).join("\n"),
    "",
    "LIKELY QUESTIONS",
    likelyQuestions
      .map((item) => `${item.question}\n${item.answer}`)
      .join("\n\n"),
    "",
    "BRIDGE STATEMENTS",
    bridgeStatements.map((item) => `- ${item}`).join("\n"),
    "",
    "SALARY SCRIPT",
    salaryScript,
    "",
    "FOLLOW-UP EMAIL",
    followUpEmail,
    "",
    "CHECKLIST",
    checklist.map((item) => `- ${item}`).join("\n"),
  ]);

  return {
    intro,
    strongestAngles,
    bridgeStatements,
    likelyQuestions,
    salaryScript,
    followUpEmail,
    checklist,
    prepBrief,
  };
}
