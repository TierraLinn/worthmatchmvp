import type {
  MatchResult,
  QuickAnswer,
  ResumeArtifacts,
  SkillInsight,
  TrackedOpportunityView,
  UserProfile,
} from "../types";

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

function selectedRoleLabel(match?: MatchResult) {
  return match ? `${match.title} at ${match.organization}` : "high-fit support and coordination roles";
}

export function buildResumeArtifacts(
  profile: UserProfile,
  insight: SkillInsight,
  selectedMatch?: MatchResult,
): ResumeArtifacts {
  const masterResume = joinLines([
    `${profile.name}`,
    `${profile.location} | ${profile.headline}`,
    "",
    "PROFESSIONAL SUMMARY",
    `${profile.headline} Experienced in turning informal responsibilities into dependable support across admin, customer-facing, and community-oriented work.`,
    "",
    "CORE SKILLS",
    insight.marketableSkills.map((skill) => `- ${skill}`).join("\n"),
    "",
    "TARGET AREAS",
    insight.jobTitles.map((title) => `- ${title}`).join("\n"),
    "",
    "RELEVANT EXPERIENCE",
    `- Translated everyday support into professional value by helping with ${profile.helpRequests}.`,
    `- Built trust through ${profile.experienceNotes}.`,
    `- Comfortable in ${profile.workModes.join(", ")} environments and able to start ${profile.availability.toLowerCase()}.`,
  ]);

  const targetedResume = joinLines([
    `${profile.name}`,
    `${profile.location} | Best match: ${selectedRoleLabel(selectedMatch)}`,
    "",
    "TARGETED SUMMARY",
    `${profile.headline} Especially strong for ${selectedRoleLabel(selectedMatch)} because of experience with ${selectedMatch?.whyItMatches[0].toLowerCase() ?? "organized support work"}.`,
    "",
    "KEYWORDS TO MIRROR",
    (selectedMatch?.skills ?? insight.atsKeywords.slice(0, 6)).map((keyword) => `- ${keyword}`).join("\n"),
    "",
    "PROOF POINTS",
    `- Delivered calm, clear communication while juggling responsibilities like ${profile.helpRequests}.`,
    `- Stayed organized and reliable across ${profile.experienceNotes}.`,
    `- Ready to support ${selectedMatch?.organization ?? "teams"} through ${selectedMatch?.responsibilities[0]?.toLowerCase() ?? "documentation, coordination, and follow-through"}.`,
  ]);

  const coverLetter = joinLines([
    `Dear ${selectedMatch?.organization ?? "Hiring Team"},`,
    "",
    `I am excited to apply for the ${selectedMatch?.title ?? "opportunity"} role. WorthMatch translated my everyday experience into a professional story that fits the way your team works: strong communication, dependable organization, and the ability to support people while keeping details moving.`,
    "",
    `In past responsibilities, I have handled ${profile.helpRequests.toLowerCase()} and built trust through ${profile.experienceNotes.toLowerCase()}. That makes me especially prepared to contribute to ${selectedRoleLabel(selectedMatch)}.`,
    "",
    `I would bring a calm working style, fast learning, and a practical bias toward follow-through. Thank you for your time and consideration.`,
    "",
    `Sincerely,`,
    profile.name,
  ]);

  const shortBio = `${profile.name} is a reliable support professional who translates informal experience into polished operations, customer support, and community-facing work. Strongest in ${insight.marketableSkills.slice(0, 3).join(", ")}.`;

  const quickAnswers: QuickAnswer[] = [
    {
      question: "Tell us about yourself.",
      answer: `${profile.name} brings real-world experience helping people, organizing moving parts, and communicating clearly. That mix makes me effective in support, coordination, and community-facing roles.`,
    },
    {
      question: "Why are you interested in this role?",
      answer: `This opportunity fits my strengths in ${selectedMatch?.skills.slice(0, 3).join(", ") ?? insight.marketableSkills.slice(0, 3).join(", ")} and gives me a way to turn practical experience into measurable results.`,
    },
    {
      question: "What makes you a strong fit?",
      answer: `I learn quickly, stay dependable, and can translate everyday responsibilities like ${profile.helpRequests.toLowerCase()} into professional, well-organized support.`,
    },
  ];

  return {
    masterResume,
    targetedResume,
    coverLetter,
    shortBio,
    plainTextResume: targetedResume,
    quickAnswers,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPrintableContent(content: string) {
  const lines = content.split("\n");
  const firstLine = lines.find((line) => line.trim().length > 0) ?? "";
  const secondLine =
    lines.slice(lines.indexOf(firstLine) + 1).find((line) => line.trim().length > 0) ??
    "";
  const bodyLines = lines.slice(lines.indexOf(secondLine) + 1);

  let html = `<header class="print-header"><h1>${escapeHtml(firstLine)}</h1>${
    secondLine ? `<p class="print-subtitle">${escapeHtml(secondLine)}</p>` : ""
  }</header>`;
  let currentList: string[] = [];

  function flushList() {
    if (currentList.length === 0) {
      return;
    }

    html += `<ul>${currentList
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
    currentList = [];
  }

  for (const rawLine of bodyLines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (/^[A-Z][A-Z\s/&-]+$/.test(line) && line.length < 48) {
      flushList();
      html += `<h2>${escapeHtml(line)}</h2>`;
      continue;
    }

    if (line.startsWith("- ")) {
      currentList.push(line.slice(2));
      continue;
    }

    flushList();
    html += `<p>${escapeHtml(line)}</p>`;
  }

  flushList();

  return html;
}

export function openPrintableResume(title: string, content: string) {
  const printable = window.open("", "_blank", "noopener,noreferrer,width=960,height=1200");

  if (!printable) {
    return false;
  }

  const renderedContent = renderPrintableContent(content);

  printable.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            font-family: Georgia, 'Times New Roman', serif;
            margin: 0;
            color: #172033;
            background: #f6f1e8;
          }
          main {
            max-width: 860px;
            margin: 0 auto;
            padding: 48px;
            background: white;
          }
          .print-header {
            border-bottom: 2px solid #d9e4e3;
            margin-bottom: 24px;
            padding-bottom: 16px;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 30px;
            line-height: 1.05;
          }
          .print-subtitle {
            margin: 0;
            color: #4f5e71;
            font-size: 15px;
          }
          h2 {
            margin: 28px 0 12px;
            color: #0b6f67;
            font-size: 13px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          p, li {
            font-size: 14px;
            line-height: 1.6;
          }
          p {
            margin: 0 0 12px;
          }
          ul {
            margin: 0 0 14px 18px;
            padding: 0;
          }
          li {
            margin-bottom: 6px;
          }
          @media print {
            body {
              background: white;
            }
            main {
              padding: 0;
              max-width: none;
            }
          }
        </style>
      </head>
      <body>
        <main>${renderedContent}</main>
        <script>window.print();</script>
      </body>
    </html>
  `);
  printable.document.close();
  return true;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

export function buildOutreachMessage(
  profile: UserProfile,
  match: MatchResult,
  insight: SkillInsight,
) {
  return `Hi ${match.organization},\n\nI am reaching out about the ${match.title} opportunity. My background includes ${profile.helpRequests.toLowerCase()} and I am especially strong in ${insight.marketableSkills.slice(0, 3).join(", ")}. I would love to bring that energy to ${match.organization}, particularly around ${match.responsibilities[0].toLowerCase()}.\n\nBest,\n${profile.name}`;
}

export function buildApplicationKit(
  profile: UserProfile,
  insight: SkillInsight,
  artifacts: ResumeArtifacts,
  selectedMatch: MatchResult,
  trackedOpportunity?: TrackedOpportunityView,
) {
  return joinLines([
    "WORTHMATCH APPLICATION KIT",
    `${profile.name}`,
    `${selectedMatch.title} | ${selectedMatch.organization}`,
    "",
    "MATCH SUMMARY",
    `Overall score: ${selectedMatch.matchScore}`,
    ...selectedMatch.whyItMatches.map((reason) => `- ${reason}`),
    "",
    "TOP KEYWORDS",
    insight.atsKeywords.slice(0, 10).map((keyword) => `- ${keyword}`).join("\n"),
    "",
    "NEXT STEP",
    trackedOpportunity?.nextStep ??
      "Tailor the resume, review missing qualifications, and submit.",
    "",
    "SHORT BIO",
    artifacts.shortBio,
    "",
    "TARGETED RESUME",
    artifacts.targetedResume,
    "",
    "COVER LETTER",
    artifacts.coverLetter,
    "",
    "OUTREACH",
    buildOutreachMessage(profile, selectedMatch, insight),
    "",
    "QUICK ANSWERS",
    artifacts.quickAnswers
      .map((item) => `${item.question}\n${item.answer}`)
      .join("\n\n"),
  ]);
}
