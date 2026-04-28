import { startTransition, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Copy,
  ExternalLink,
  RadioTower,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import {
  curatedAshbyBoards,
  normalizeAshbyJob,
  searchAshbyBoards,
  type AshbySearchResult,
} from "../lib/ashby";
import {
  generateAssistantBrief,
  type AssistantBriefResult,
} from "../lib/assistantBrief";
import { runLiveSourceSearch } from "../lib/liveSearch";
import { rankOpportunities } from "../lib/matcher";
import { buildPlatformSearchCards } from "../lib/platformSearch";
import { copyText } from "../lib/resume";
import { buildSearchAssistantPlan } from "../lib/searchAssistant";
import {
  fetchRemotiveJobs,
  normalizeRemotiveJob,
  type RemotiveJob,
} from "../lib/remotive";
import type { MatchResult } from "../types";

interface AssistantRunSnapshot {
  query: string;
  remotiveCount: number;
  ashbyCount: number;
  combinedCount: number;
  searchedAt: string;
}

export function PlatformSearchPage() {
  const { addImportedOpportunity, insight, profile } = useWorthMatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusFromRoute = searchParams.get("focus") ?? insight.jobTitles[0] ?? "";
  const [focusTerm, setFocusTerm] = useState(focusFromRoute);
  const [liveResults, setLiveResults] = useState<RemotiveJob[]>([]);
  const [ashbyResults, setAshbyResults] = useState<AshbySearchResult[]>([]);
  const [assistantMatches, setAssistantMatches] = useState<MatchResult[]>([]);
  const [assistantRun, setAssistantRun] = useState<AssistantRunSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAshbyLoading, setIsAshbyLoading] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [assistantBrief, setAssistantBrief] = useState<AssistantBriefResult | null>(null);
  const [status, setStatus] = useState(
    "The AI search assistant can search live sources, rank the best matches, and tee up external platform searches from one place.",
  );
  const navigate = useNavigate();

  useEffect(() => {
    setFocusTerm(focusFromRoute);
  }, [focusFromRoute]);

  const platformCards = useMemo(
    () => buildPlatformSearchCards(profile, insight, focusTerm),
    [profile, insight, focusTerm],
  );
  const assistantPlan = useMemo(
    () => buildSearchAssistantPlan(profile, insight, platformCards, focusTerm),
    [profile, insight, platformCards, focusTerm],
  );
  const rankedRemotiveResults = useMemo(
    () =>
      rankOpportunities(
        profile,
        insight,
        liveResults.map((job) => normalizeRemotiveJob(job, profile, insight)),
      ),
    [profile, insight, liveResults],
  );
  const rankedAshbyResults = useMemo(() => {
    const normalized = ashbyResults.map((result) => ({
      board: result.board,
      opportunity: normalizeAshbyJob(result.board, result.job, profile, insight),
    }));
    const ranked = rankOpportunities(
      profile,
      insight,
      normalized.map((result) => result.opportunity),
    );

    return ranked
      .map((match) => ({
        board: normalized.find((result) => result.opportunity.id === match.id)?.board,
        match,
      }))
      .filter(
        (
          result,
        ): result is {
          board: AshbySearchResult["board"];
          match: MatchResult;
        } => Boolean(result.board),
      );
  }, [ashbyResults, profile, insight]);
  const briefMatches = useMemo(
    () =>
      assistantMatches.length > 0
        ? assistantMatches.slice(0, 3)
        : [
            ...rankedRemotiveResults,
            ...rankedAshbyResults.map((result) => result.match),
          ].slice(0, 3),
    [assistantMatches, rankedAshbyResults, rankedRemotiveResults],
  );

  function persistFocusQuery(value: string) {
    const trimmedValue = value.trim();
    const nextParams = new URLSearchParams(searchParams);

    if (trimmedValue) {
      nextParams.set("focus", trimmedValue);
    } else {
      nextParams.delete("focus");
    }

    setSearchParams(nextParams, { replace: true });
  }

  async function handleCopy(value: string, label: string) {
    await copyText(value);
    setStatus(`${label} copied to clipboard.`);
  }

  async function handleAssistantSearch(queryOverride?: string) {
    const query =
      queryOverride?.trim() ||
      focusTerm.trim() ||
      assistantPlan.primaryQuery;

    setFocusTerm(query);
    persistFocusQuery(query);
    setAssistantBrief(null);
    setIsAssistantLoading(true);
    setStatus(`WorthMatch AI is searching live sources for "${query}"...`);

    try {
      const liveRun = await runLiveSourceSearch(profile, insight, query, {
        remotiveLimit: 10,
        ashbyLimit: 12,
        combinedLimit: 8,
      });

      startTransition(() => {
        setLiveResults(liveRun.remotiveJobs);
        setAshbyResults(liveRun.ashbyResults);
        setAssistantMatches(liveRun.combinedMatches);
        setAssistantRun({
          query,
          remotiveCount: liveRun.remotiveMatches.length,
          ashbyCount: liveRun.ashbyMatches.length,
          combinedCount: liveRun.combinedMatches.length,
          searchedAt: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        });
      });

      if (liveRun.combinedMatches.length > 0) {
        setStatus(
          `WorthMatch AI found ${liveRun.combinedMatches.length} strong live matches for "${query}". ${
            liveRun.notes.join(" ") || "Open the best fit or import the top three."
          }`,
        );
      } else {
        setStatus(
          `No live matches were found for "${query}" yet. Open the recommended platform searches below for broader results.`,
        );
      }
    } catch {
      setStatus(
        "The AI search assistant hit a live-search issue. Try a broader title or open the matched platform searches below.",
      );
    } finally {
      setIsAssistantLoading(false);
    }
  }

  async function handleLiveSearch() {
    const query = focusTerm.trim() || assistantPlan.primaryQuery;

    persistFocusQuery(query);
    setIsLoading(true);
    setStatus("Loading live remote roles from Remotive...");

    try {
      const jobs = await fetchRemotiveJobs(query, 8);
      setLiveResults(jobs);
      setStatus(
        jobs.length > 0
          ? `Loaded ${jobs.length} live remote roles from Remotive.`
          : "No live Remotive roles matched that search yet.",
      );
    } catch {
      setStatus("Live Remotive search failed. Try a broader role phrase.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleImportRemotive(job: RemotiveJob) {
    const normalized = normalizeRemotiveJob(job, profile, insight);
    addImportedOpportunity(normalized);
    setStatus(`${job.title} imported into WorthMatch and added to the ranked board.`);
    navigate(`/opportunities/${normalized.id}`);
  }

  async function handleAshbySearch() {
    const query = focusTerm.trim() || assistantPlan.primaryQuery;

    persistFocusQuery(query);
    setIsAshbyLoading(true);
    setStatus("Loading curated live company boards via Ashby...");

    try {
      const results = await searchAshbyBoards(query, profile, insight, curatedAshbyBoards, 10);
      setAshbyResults(results);
      setStatus(
        results.length > 0
          ? `Loaded ${results.length} live company-board roles via Ashby.`
          : "No Ashby company-board roles matched that search yet.",
      );
    } catch {
      setStatus("Live Ashby board search failed. Try a broader role phrase.");
    } finally {
      setIsAshbyLoading(false);
    }
  }

  function handleAshbyImport(result: AshbySearchResult) {
    const normalized = normalizeAshbyJob(result.board, result.job, profile, insight);
    addImportedOpportunity(normalized);
    setStatus(`${result.job.title} from ${result.board.name} imported into WorthMatch.`);
    navigate(`/opportunities/${normalized.id}`);
  }

  function handleImportAssistantMatches() {
    const topMatches = assistantMatches.slice(0, 3);

    if (topMatches.length === 0) {
      return;
    }

    topMatches.forEach((match) => addImportedOpportunity(match));
    setStatus(`Imported ${topMatches.length} top AI-selected matches into WorthMatch.`);
    navigate(`/opportunities/${topMatches[0].id}`);
  }

  async function handleGenerateBrief() {
    const query = focusTerm.trim() || assistantRun?.query || assistantPlan.primaryQuery;

    setIsBriefLoading(true);
    setStatus(`Generating a search coach brief for "${query}"...`);

    try {
      const result = await generateAssistantBrief({
        focus: query,
        profile,
        insight,
        recommendedPlatforms: assistantPlan.recommendedCards.map((card) => card.name),
        topMatches: briefMatches,
      });

      setAssistantBrief(result);
      setStatus(
        result.source === "model"
          ? `${result.label} generated a tailored search brief${result.model ? ` with ${result.model}` : ""}.`
          : "Generated a built-in search brief. Add the WorthMatch LLM environment variables in Vercel to enable the live gpt-oss-compatible coach on deployed runs.",
      );
    } finally {
      setIsBriefLoading(false);
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="page"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeading
        body="Let WorthMatch search live sources first, rank the results against the user profile, and then tee up matched platform actions for LinkedIn, Indeed, Handshake, Craigslist, Facebook, and local boards."
        eyebrow="AI search assistant"
        title="Search matched jobs across live sources and platform actions in one workflow."
      />

      <section className="panel search-assistant">
        <div className="search-assistant__header">
          <div>
            <span className="eyebrow">WorthMatch AI</span>
            <h3>Use one matched search instead of hopping between disconnected job platforms.</h3>
            <p>{assistantPlan.searchThesis}</p>
          </div>

          <div className="search-assistant__metrics">
            <div className="search-assistant__metric">
              <span>Primary query</span>
              <strong>{assistantRun?.query ?? assistantPlan.primaryQuery}</strong>
            </div>
            <div className="search-assistant__metric">
              <span>Live sources</span>
              <strong>Remotive + Ashby</strong>
            </div>
            <div className="search-assistant__metric">
              <span>Last run</span>
              <strong>{assistantRun?.searchedAt ?? "Not run yet"}</strong>
            </div>
          </div>
        </div>

        <div className="search-assistant__controls">
          <label className="field-group">
            <span>Assistant focus</span>
            <input
              className="field"
              onChange={(event) => setFocusTerm(event.target.value)}
              placeholder="Customer support, operations coordinator, tutoring..."
              value={focusTerm}
            />
          </label>

          <button
            className="button"
            disabled={isAssistantLoading}
            onClick={() => void handleAssistantSearch()}
            type="button"
          >
            <Bot size={16} />
            {isAssistantLoading ? "Searching..." : "Run AI search"}
          </button>

          <button
            className="button button--secondary"
            disabled={assistantMatches.length === 0}
            onClick={handleImportAssistantMatches}
            type="button"
          >
            <Sparkles size={16} />
            Import best 3
          </button>
        </div>

        <div className="search-assistant__chips">
          {assistantPlan.queryChips.map((query) => (
            <button
              key={query}
              className={
                query === focusTerm
                  ? "search-chip search-chip--active"
                  : "search-chip"
              }
              onClick={() => void handleAssistantSearch(query)}
              type="button"
            >
              {query}
            </button>
          ))}
        </div>

        <div className="search-assistant__grid">
          <article className="search-assistant__card search-assistant__card--brief">
            <div className="search-assistant__brief-header">
              <div>
                <strong>Search coach brief</strong>
                <p className="status-note">
                  Generate a concise strategy read before you open outside platforms or import the first live role.
                </p>
              </div>

              <div className="search-assistant__actions">
                <button
                  className="button"
                  disabled={isBriefLoading}
                  onClick={() => void handleGenerateBrief()}
                  type="button"
                >
                  <Bot size={16} />
                  {isBriefLoading ? "Thinking..." : "Generate brief"}
                </button>
                <button
                  className="button button--ghost"
                  disabled={!assistantBrief}
                  onClick={() =>
                    assistantBrief
                      ? void handleCopy(assistantBrief.summary, "Search coach brief")
                      : undefined
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
            </div>

            {assistantBrief ? (
              <div className="search-assistant__brief">
                <div className="meta-pill">
                  <Bot size={14} />
                  <span>
                    {assistantBrief.source === "model"
                      ? `${assistantBrief.label}${assistantBrief.model ? ` • ${assistantBrief.model}` : ""}`
                      : assistantBrief.label}
                  </span>
                </div>
                <pre>{assistantBrief.summary}</pre>
              </div>
            ) : (
              <div className="resume-preview">
                <strong>gpt-oss-compatible, fallback-safe</strong>
                <p>
                  When a gpt-oss-compatible endpoint is configured in Vercel, WorthMatch can turn the
                  current profile, live matches, and platform plan into a real model-backed search brief.
                  Without it, the built-in strategy engine still generates a usable coaching summary.
                </p>
              </div>
            )}
          </article>

          <article className="search-assistant__card">
            <strong>What the assistant is doing</strong>
            <ul className="micro-list">
              {assistantPlan.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>

          <article className="search-assistant__card">
            <strong>Best platform actions next</strong>
            <div className="search-assistant__platforms">
              {assistantPlan.recommendedCards.map((card) => (
                <div key={card.id} className="search-assistant__platform">
                  <div>
                    <span className="eyebrow">{card.mode}</span>
                    <h4>{card.name}</h4>
                    <p>{card.description}</p>
                  </div>
                  <div className="search-assistant__actions">
                    <a
                      className="button button--secondary"
                      href={card.openUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={16} />
                      Open
                    </a>
                    <button
                      className="button button--ghost"
                      onClick={() => void handleCopy(card.searchText, `${card.name} query`)}
                      type="button"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="search-assistant__card search-assistant__card--results">
            <strong>Strongest live matches</strong>
            {assistantMatches.length > 0 ? (
              <div className="search-assistant__result-list">
                {assistantMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="search-assistant__result">
                    <div>
                      <h4>{match.title}</h4>
                      <p>
                        {match.organization} - {match.sourceLabel}
                      </p>
                    </div>
                    <div className="search-assistant__result-meta">
                      <span className="score-pill">{match.matchScore} match</span>
                      {match.link ? (
                        <a
                          className="button button--ghost"
                          href={match.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink size={16} />
                          Source
                        </a>
                      ) : null}
                      <button
                        className="button button--secondary"
                        onClick={() => {
                          addImportedOpportunity(match);
                          setStatus(`${match.title} imported into WorthMatch.`);
                          navigate(`/opportunities/${match.id}`);
                        }}
                        type="button"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tracker-empty">
                <p>No assistant-ranked live results yet.</p>
                <p className="status-note">
                  Run the AI assistant above to search current live sources.
                </p>
              </div>
            )}

            <div className="resume-preview">
              <strong>Search coverage</strong>
              <p>
                {assistantRun
                  ? `${assistantRun.combinedCount} combined live matches found from ${assistantRun.remotiveCount} Remotive results and ${assistantRun.ashbyCount} Ashby board results.`
                  : "The assistant will combine live remote API results with curated company-board results before you decide what to import."}
              </p>
            </div>
          </article>
        </div>

        <p className="status-note">{status}</p>
      </section>

      <div className="platform-layout">
        <section className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Platform search pack</span>
              <h3>Open matched searches for LinkedIn, Indeed, Handshake, Craigslist, Facebook, and local boards.</h3>
            </div>
            <Search size={18} />
          </div>

          <div className="field-row">
            <label className="field-group">
              <span>Focus role or search phrase</span>
              <input
                className="field"
                onChange={(event) => setFocusTerm(event.target.value)}
                placeholder="Customer support, operations coordinator, tutoring..."
                value={focusTerm}
              />
            </label>
            <div className="resume-preview">
              <strong>How to use this</strong>
              <p>
                Open a platform-specific search, review results on that platform,
                then import the best listing via the Intake Desk or a live connector.
              </p>
            </div>
          </div>

          <div className="platform-card-grid">
            {platformCards.map((card) => (
              <article key={card.id} className="platform-card">
                <div className="platform-card__header">
                  <div>
                    <span className="eyebrow">{card.mode}</span>
                    <h3>{card.name}</h3>
                  </div>
                  <div className="score-pill">{card.mode}</div>
                </div>

                <p>{card.description}</p>

                <div className="service-script">
                  <strong>Search text</strong>
                  <p>{card.searchText}</p>
                </div>

                <ul className="micro-list">
                  {card.supportText.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <div className="opportunity-card__actions">
                  <a
                    className="button button--secondary"
                    href={card.openUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} />
                    Open search
                  </a>
                  <button
                    className="button button--ghost"
                    onClick={() => void handleCopy(card.searchText, `${card.name} query`)}
                    type="button"
                  >
                    <Copy size={16} />
                    Copy query
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel panel--sidebar platform-sidebar">
          <span className="eyebrow">Compliant workflow</span>
          <h3>External platform search, internal matching workflow.</h3>

          <div className="resume-preview">
            <strong>Why this route exists</strong>
            <p>
              Named platforms like LinkedIn, Indeed, Handshake, Craigslist, and
              Facebook Marketplace are handled as search packs and user imports,
              not fragile scraping.
            </p>
          </div>

          <div className="resume-preview">
            <strong>Best next move</strong>
            <p>
              Run the AI search assistant once, then use the platform cards below
              for any extra breadth you want beyond the live connectors.
            </p>
          </div>
        </aside>
      </div>

      <section className="panel platform-live">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Live remote feed</span>
            <h3>Official remote-job search via Remotive public API.</h3>
          </div>
          <RadioTower size={18} />
        </div>

        <div className="resume-toolbar">
          <label className="field-group">
            <span>Live remote search</span>
            <input
              className="field"
              onChange={(event) => setFocusTerm(event.target.value)}
              placeholder="Try customer support, operations, recruiter, tutor..."
              value={focusTerm}
            />
          </label>

          <div className="resume-toolbar__actions">
            <button
              className="button"
              disabled={isLoading}
              onClick={() => void handleLiveSearch()}
              type="button"
            >
              <Sparkles size={16} />
              {isLoading ? "Loading..." : "Search live remote jobs"}
            </button>
          </div>
        </div>

        <p className="status-note">
          Remotive source attribution is preserved and every live result links
          back to the original Remotive listing before application.
        </p>

        {rankedRemotiveResults.length > 0 ? (
          <div className="platform-live-grid">
            {rankedRemotiveResults.map((match) => (
              <article key={match.id} className="platform-live-card">
                <div className="platform-card__header">
                  <div>
                    <span className="eyebrow">Remotive source</span>
                    <h3>{match.title}</h3>
                    <p>
                      {match.organization} - {match.compensation}
                    </p>
                  </div>
                  <div className="score-pill">{match.matchScore} match</div>
                </div>

                <div className="opportunity-card__meta">
                  <span>{match.location || "Remote"}</span>
                  <span>{match.kind}</span>
                  <span>{match.category}</span>
                </div>

                <p className="opportunity-card__summary">{match.summary}</p>

                <ul className="micro-list">
                  {match.whyItMatches.slice(0, 2).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>

                <div className="tag-row">
                  {match.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="opportunity-card__actions">
                  <a
                    className="button button--secondary"
                    href={match.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} />
                    Open source
                  </a>
                  <button
                    className="button"
                    onClick={() =>
                      handleImportRemotive(
                        liveResults.find((job) => `remotive-${job.id}` === match.id)!,
                      )
                    }
                    type="button"
                  >
                    Import into WorthMatch
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="tracker-empty">
            <p>No live remote roles loaded yet.</p>
            <p className="status-note">
              Run a live Remotive search above to pull in current remote jobs.
            </p>
          </div>
        )}

        <p className="status-note">{status}</p>
      </section>

      <section className="panel platform-live">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Live company boards</span>
            <h3>Curated public company boards via Ashby API.</h3>
          </div>
          <RadioTower size={18} />
        </div>

        <div className="resume-preview">
          <strong>Included boards</strong>
          <p>
            {curatedAshbyBoards.map((board) => board.name).join(", ")}.
            These are public company boards with browser-usable Ashby endpoints.
          </p>
        </div>

        <div className="resume-toolbar">
          <label className="field-group">
            <span>Search curated company boards</span>
            <input
              className="field"
              onChange={(event) => setFocusTerm(event.target.value)}
              placeholder="Try operations, support, sales, coordinator..."
              value={focusTerm}
            />
          </label>

          <div className="resume-toolbar__actions">
            <button
              className="button"
              disabled={isAshbyLoading}
              onClick={() => void handleAshbySearch()}
              type="button"
            >
              <Sparkles size={16} />
              {isAshbyLoading ? "Loading..." : "Search live company boards"}
            </button>
          </div>
        </div>

        {rankedAshbyResults.length > 0 ? (
          <div className="platform-live-grid">
            {rankedAshbyResults.map(({ board, match }) => (
              <article key={match.id} className="platform-live-card">
                <div className="platform-card__header">
                  <div>
                    <span className="eyebrow">{board.name} board</span>
                    <h3>{match.title}</h3>
                    <p>
                      {match.location || "See source"} - {match.compensation}
                    </p>
                  </div>
                  <div className="score-pill">{match.matchScore} match</div>
                </div>

                <div className="opportunity-card__meta">
                  <span>{match.remotePolicy}</span>
                  <span>{match.category}</span>
                  <span>{board.focus}</span>
                </div>

                <p className="opportunity-card__summary">{match.summary}</p>

                <ul className="micro-list">
                  {match.whyItMatches.slice(0, 2).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>

                <div className="tag-row">
                  {match.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="opportunity-card__actions">
                  <a
                    className="button button--secondary"
                    href={match.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={16} />
                    Open source
                  </a>
                  <button
                    className="button"
                    onClick={() =>
                      handleAshbyImport(
                        ashbyResults.find(
                          (result) =>
                            `ashby-${result.board.id}-${result.job.id}` === match.id,
                        )!,
                      )
                    }
                    type="button"
                  >
                    Import into WorthMatch
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="tracker-empty">
            <p>No company-board roles loaded yet.</p>
            <p className="status-note">
              Search the curated Ashby boards above to pull in live company postings.
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
