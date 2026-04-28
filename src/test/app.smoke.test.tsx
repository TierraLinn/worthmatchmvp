import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "../App";
import { connectorModules } from "../data/connectors";
import { demoOpportunities, demoProfile } from "../data/demo";
import { buildAssistantBriefFallback } from "../lib/assistantBrief";
import { buildIntakeDeskSummary } from "../lib/intake";
import { rankOpportunities } from "../lib/matcher";
import { buildPlatformSearchCards } from "../lib/platformSearch";
import { buildSearchAssistantPlan } from "../lib/searchAssistant";
import { buildServiceStudio } from "../lib/services";
import { translateProfile } from "../lib/translator";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function renderRoute(pathname: string) {
  window.history.pushState({}, "", pathname);
  render(<App />);
}

describe("WorthMatch submission smoke tests", () => {
  it("renders the landing page and key CTA", async () => {
    renderRoute("/");

    expect(
      await screen.findByText(/WorthMatch turns real-life ability into paid, professional momentum/i),
    ).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Try with your profile/i })).toBeInTheDocument();
  });

  it("renders the new intake desk route", async () => {
    renderRoute("/intake");

    expect(
      await screen.findByText(/Bring outside leads into WorthMatch and turn them into ranked next moves/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Imported lead history/i)).toBeInTheDocument();
  });

  it("renders the workspace route and data-control UI", async () => {
    renderRoute("/workspace");

    expect(
      await screen.findByText(/Own the data and keep WorthMatch usable beyond the demo/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Backup and restore/i)).toBeInTheDocument();
  });

  it("renders the platform search route", async () => {
    renderRoute("/search");

    expect(
      await screen.findByText(/Search matched jobs across live sources and platform actions in one workflow/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Use one matched search instead of hopping between disconnected job platforms/i),
    ).toBeInTheDocument();
  });

  it("renders the opportunities route with direct live sync", async () => {
    renderRoute("/opportunities");

    expect(await screen.findByText(/Review the ranked board and pull in new leads/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sync live sources directly into the opportunity board/i)).toBeInTheDocument();
  });

  it("redirects unknown routes back to the home experience", async () => {
    renderRoute("/this-route-does-not-exist");

    expect(
      await screen.findByText(/WorthMatch turns real-life ability into paid, professional momentum/i),
    ).toBeInTheDocument();
  });

  it("builds service offers and intake summaries from demo data", () => {
    const insight = translateProfile(demoProfile);
    const matches = rankOpportunities(demoProfile, insight, demoOpportunities);
    const importedMatches = matches.filter(
      (match) => match.sourceType === "imported" || match.sourceType === "manual",
    );

    const studio = buildServiceStudio(demoProfile, insight, matches);
    const intakeSummary = buildIntakeDeskSummary(importedMatches, connectorModules);

    expect(studio.blueprints.length).toBeGreaterThan(0);
    expect(studio.blueprints[0]?.pricingTiers.length).toBeGreaterThan(0);
    expect(intakeSummary.totalImported).toBeGreaterThan(0);
    expect(intakeSummary.laneSummaries.some((lane) => lane.id === "manual")).toBe(true);
  });

  it("builds an AI search plan from the current profile", () => {
    const insight = translateProfile(demoProfile);
    const cards = buildPlatformSearchCards(demoProfile, insight, insight.jobTitles[0]);
    const plan = buildSearchAssistantPlan(
      demoProfile,
      insight,
      cards,
      insight.jobTitles[0],
    );

    expect(plan.primaryQuery.length).toBeGreaterThan(0);
    expect(plan.recommendedCards.length).toBe(3);
    expect(plan.nextSteps.length).toBeGreaterThan(0);
  });

  it("builds a fallback assistant brief when no live OpenAI coach is configured", () => {
    const insight = translateProfile(demoProfile);
    const matches = rankOpportunities(demoProfile, insight, demoOpportunities);
    const cards = buildPlatformSearchCards(demoProfile, insight, insight.jobTitles[0]);
    const brief = buildAssistantBriefFallback({
      focus: insight.jobTitles[0],
      profile: demoProfile,
      insight,
      recommendedPlatforms: cards.slice(0, 3).map((card) => card.name),
      topMatches: matches.slice(0, 2).map((match) => ({
        title: match.title,
        organization: match.organization,
        sourceLabel: match.sourceLabel,
        matchScore: match.matchScore,
        whyItMatches: match.whyItMatches,
        missingQualifications: match.missingQualifications,
      })),
    });

    expect(brief.source).toBe("local");
    expect(brief.summary).toMatch(/Best Fit Right Now/i);
    expect(brief.summary).toMatch(/Next 3 Moves/i);
  });
});
