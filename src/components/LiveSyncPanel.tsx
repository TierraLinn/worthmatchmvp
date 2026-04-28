import { startTransition, useMemo, useState } from "react";
import { Bot, ExternalLink, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useWorthMatch } from "../context/WorthMatchContext";
import { runLiveSourceSearch, type LiveSearchRun } from "../lib/liveSearch";

interface LiveSyncPanelProps {
  defaultQuery?: string;
  heading: string;
  description: string;
  compact?: boolean;
  actionTo?: string;
  actionLabel?: string;
}

function unique(values: string[], limit = 5) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

export function LiveSyncPanel({
  defaultQuery,
  heading,
  description,
  compact = false,
  actionTo = "/search",
  actionLabel = "Open AI Search Assistant",
}: LiveSyncPanelProps) {
  const { addImportedOpportunity, insight, profile } = useWorthMatch();
  const [query, setQuery] = useState(defaultQuery ?? insight.jobTitles[0] ?? "");
  const [status, setStatus] = useState(
    "Pull live matched jobs into WorthMatch without leaving the current workflow.",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LiveSearchRun | null>(null);
  const navigate = useNavigate();

  const chips = useMemo(
    () =>
      unique([
        defaultQuery ?? "",
        ...insight.jobTitles.slice(0, 3),
        ...insight.serviceOffers.slice(0, 2),
      ]),
    [defaultQuery, insight.jobTitles, insight.serviceOffers],
  );

  async function handleSync(nextQuery?: string) {
    const activeQuery = nextQuery?.trim() || query.trim() || insight.jobTitles[0] || "customer support";

    setQuery(activeQuery);
    setIsLoading(true);
    setStatus(`Searching live sources for "${activeQuery}"...`);

    try {
      const liveRun = await runLiveSourceSearch(profile, insight, activeQuery, {
        remotiveLimit: compact ? 8 : 10,
        ashbyLimit: compact ? 10 : 12,
        combinedLimit: compact ? 5 : 6,
      });

      startTransition(() => {
        setResult(liveRun);
      });

      if (liveRun.combinedMatches.length > 0) {
        setStatus(
          `Found ${liveRun.combinedMatches.length} live matched roles for "${activeQuery}". ${liveRun.notes.join(" ") || "Import the strongest ones below."}`,
        );
      } else {
        setStatus(
          `No live matched roles were found for "${activeQuery}" yet. Try another chip or open the full AI search flow.`,
        );
      }
    } catch {
      setStatus("Live sync hit an issue. Open the full AI search flow for manual follow-through.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleImportTop() {
    const matches = result?.combinedMatches.slice(0, compact ? 2 : 3) ?? [];

    if (matches.length === 0) {
      return;
    }

    matches.forEach((match) => addImportedOpportunity(match));
    setStatus(`Imported ${matches.length} top live matches into WorthMatch.`);
    navigate(`/opportunities/${matches[0].id}`);
  }

  return (
    <section className={compact ? "panel live-sync live-sync--compact" : "panel live-sync"}>
      <div className="panel__heading">
        <div>
          <span className="eyebrow">Live source sync</span>
          <h3>{heading}</h3>
        </div>
        <Bot size={18} />
      </div>

      <p>{description}</p>

      <div className="live-sync__controls">
        <label className="field-group">
          <span>Search focus</span>
          <input
            className="field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Customer support, operations coordinator, tutor..."
            value={query}
          />
        </label>
        <button
          className="button"
          disabled={isLoading}
          onClick={() => void handleSync()}
          type="button"
        >
          <Sparkles size={16} />
          {isLoading ? "Syncing..." : "Sync live matches"}
        </button>
      </div>

      <div className="live-sync__chips">
        {chips.map((chip) => (
          <button
            key={chip}
            className={chip === query ? "search-chip search-chip--active" : "search-chip"}
            onClick={() => void handleSync(chip)}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>

      {result?.combinedMatches.length ? (
        <div className="live-sync__results">
          {result.combinedMatches.slice(0, compact ? 2 : 3).map((match) => (
            <article key={match.id} className="live-sync__result">
              <div>
                <strong>{match.title}</strong>
                <p>
                  {match.organization} - {match.sourceLabel}
                </p>
              </div>

              <div className="live-sync__result-actions">
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
              </div>
            </article>
          ))}

          <div className="live-sync__footer">
            <button className="button button--secondary" onClick={handleImportTop} type="button">
              Import top matches
            </button>
            <Link className="button button--ghost" to={actionTo}>
              {actionLabel}
            </Link>
          </div>
        </div>
      ) : (
        <div className="resume-preview">
          <strong>What this pulls in</strong>
          <p>
            Remotive remote jobs plus curated live Ashby company-board roles, ranked against the active WorthMatch profile before import.
          </p>
        </div>
      )}

      <p className="status-note">{status}</p>
    </section>
  );
}
