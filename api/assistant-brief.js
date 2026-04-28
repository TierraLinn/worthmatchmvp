const DEFAULT_MODEL =
  process.env.WORTHMATCH_LLM_MODEL ||
  process.env.OPENAI_MODEL ||
  "gpt-oss-20b";
const API_STYLE =
  process.env.WORTHMATCH_LLM_API_STYLE ||
  (process.env.WORTHMATCH_LLM_BASE_URL ? "chat-completions" : "responses");
const API_BASE_URL =
  process.env.WORTHMATCH_LLM_BASE_URL || "https://api.openai.com/v1";
const API_KEY =
  process.env.WORTHMATCH_LLM_API_KEY || process.env.OPENAI_API_KEY || "";

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];

  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        textParts.push(content.text.trim());
      }
    }
  }

  return textParts.join("\n\n").trim();
}

function extractChatCompletionText(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) =>
        typeof item?.text === "string" ? item.text.trim() : "",
      )
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return "";
}

function buildPrompt(body) {
  const topMatches = body.topMatches?.length
    ? body.topMatches
        .slice(0, 3)
        .map(
          (match, index) =>
            `${index + 1}. ${match.title} at ${match.organization} via ${match.sourceLabel} (${match.matchScore} match). Why it matches: ${match.whyItMatches.join("; ") || "No reasons provided."} Missing qualifications: ${match.missingQualifications.join(", ") || "None called out."}`,
        )
        .join("\n")
    : "No live matches have been imported yet.";

  return [
    "You are WorthMatch's gpt-oss-compatible AI search coach for job seekers.",
    "Write a concise markdown brief with exactly four sections and these exact headings:",
    "## Best Fit Right Now",
    "## Search Angles",
    "## Resume Angle",
    "## Next 3 Moves",
    "Keep it under 220 words total.",
    "Use practical language, short bullets where helpful, and no extra headings.",
    "",
    `Focus term: ${body.focus || "customer support"}`,
    `Profile headline: ${body.profile?.headline || "Not provided"}`,
    `Location: ${body.profile?.location || "Not provided"}`,
    `Desired roles: ${body.profile?.desiredRoles || "Not provided"}`,
    `Work modes: ${(body.profile?.workModes || []).join(", ") || "Not provided"}`,
    `Income speed: ${body.profile?.incomeSpeed || "Not provided"}`,
    `Availability: ${body.profile?.availability || "Not provided"}`,
    `Translated skills: ${(body.insight?.marketableSkills || []).slice(0, 6).join(", ") || "Not provided"}`,
    `Suggested job titles: ${(body.insight?.jobTitles || []).slice(0, 5).join(", ") || "Not provided"}`,
    `ATS keywords: ${(body.insight?.atsKeywords || []).slice(0, 8).join(", ") || "Not provided"}`,
    `Recommended platforms: ${(body.recommendedPlatforms || []).slice(0, 5).join(", ") || "Not provided"}`,
    "",
    "Top live matches:",
    topMatches,
  ].join("\n");
}

function buildHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  return headers;
}

async function callResponsesApi(prompt) {
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/responses`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: prompt,
      max_output_tokens: 450,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Responses API request failed.");
  }

  const payload = await response.json();
  const summary = extractOutputText(payload);

  if (!summary) {
    throw new Error("Responses API did not include assistant text.");
  }

  return {
    source: "model",
    label: DEFAULT_MODEL.startsWith("gpt-oss")
      ? "gpt-oss search coach"
      : "model-backed search coach",
    summary,
    model: DEFAULT_MODEL,
    generatedAt: new Date().toISOString(),
  };
}

async function callChatCompletionsApi(prompt) {
  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are WorthMatch's gpt-oss-compatible AI search coach for job seekers.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Chat Completions request failed.");
  }

  const payload = await response.json();
  const summary = extractChatCompletionText(payload);

  if (!summary) {
    throw new Error("Chat Completions API did not include assistant text.");
  }

  return {
    source: "model",
    label: DEFAULT_MODEL.startsWith("gpt-oss")
      ? "gpt-oss search coach"
      : "model-backed search coach",
    summary,
    model: DEFAULT_MODEL,
    generatedAt: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!API_BASE_URL) {
    response.status(503).json({ error: "No model endpoint is configured." });
    return;
  }

  try {
    const prompt = buildPrompt(request.body || {});
    const result =
      API_STYLE === "chat-completions"
        ? await callChatCompletionsApi(prompt)
        : await callResponsesApi(prompt);
    response.status(200).json(result);
  } catch (error) {
    response.status(500).json({
      error: "Assistant generation failed.",
      detail: error instanceof Error ? error.message : "Unknown error.",
    });
  }
}
