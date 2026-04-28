import { useDeferredValue, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { ImportOpportunityPanel } from "../components/ImportOpportunityPanel";
import { LiveSyncPanel } from "../components/LiveSyncPanel";
import { OpportunityCard } from "../components/OpportunityCard";
import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import type { SourceType, WorkMode } from "../types";

export function OpportunitiesPage() {
  const { insight, matches, savedOpportunityIds } = useWorthMatch();
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<WorkMode | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<SourceType | "all">("all");
  const deferredQuery = useDeferredValue(query);

  const filteredMatches = matches.filter((match) => {
    const matchesQuery =
      deferredQuery.trim().length === 0 ||
      `${match.title} ${match.organization} ${match.category} ${match.skills.join(" ")}`
        .toLowerCase()
        .includes(deferredQuery.toLowerCase());

    const matchesMode = modeFilter === "all" || match.remotePolicy === modeFilter;
    const matchesSource = sourceFilter === "all" || match.sourceType === sourceFilter;

    return matchesQuery && matchesMode && matchesSource;
  });

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="page"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeading
        body="Ranked opportunities blend starter listings with safe imports from pasted descriptions, uploaded files, user links, and manually saved cards."
        eyebrow="Opportunity matcher"
        title="Review the ranked board and pull in new leads."
      />

      <div className="results-layout">
        <section className="panel">
          <div className="filter-bar">
            <input
              className="field"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, categories, or keywords"
              value={query}
            />

            <div className="segment-control">
              {(["all", "remote", "hybrid", "local"] as const).map((value) => (
                <button
                  key={value}
                  className={modeFilter === value ? "segment-control__item segment-control__item--active" : "segment-control__item"}
                  onClick={() => setModeFilter(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="segment-control">
              {(["all", "official", "imported", "manual", "community"] as const).map((value) => (
                <button
                  key={value}
                  className={sourceFilter === value ? "segment-control__item segment-control__item--active" : "segment-control__item"}
                  onClick={() => setSourceFilter(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="stack results-stack">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <OpportunityCard key={match.id} match={match} />
              ))
            ) : (
              <div className="tracker-empty">
                <p>No matches for this filter set yet.</p>
                <p className="status-note">
                  Try clearing a source or work-mode filter, or import a new lead to widen
                  the board.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="results-sidebar">
          <LiveSyncPanel
            actionLabel="Open full AI search"
            compact
            defaultQuery={insight.jobTitles[0] ?? insight.serviceOffers[0]}
            description="Need fresh jobs without jumping away from the ranked board? Sync live matched roles here, then import the best ones."
            heading="Sync live sources directly into the opportunity board."
          />
          <section className="panel">
            <span className="eyebrow">Saved compare set</span>
            <h3>{savedOpportunityIds.length} opportunities saved</h3>
            <p>
              Save strong paths from the board, then compare them side by side to
              decide what to apply to first.
            </p>
            <Link className="button button--secondary" to="/compare">
              <ArrowRightLeft size={16} />
              Open compare
            </Link>
          </section>
          <section className="panel">
            <span className="eyebrow">Intake operations</span>
            <h3>Need to pull in a new lead first?</h3>
            <p>
              Use the dedicated intake desk to manage pasted descriptions, links,
              uploads, and manual cards in one place.
            </p>
            <Link className="button button--secondary" to="/intake">
              Open intake desk
            </Link>
          </section>
          <section className="panel">
            <span className="eyebrow">AI search assistant</span>
            <h3>Need wider platform coverage first?</h3>
            <p>
              Generate profile-aware searches for LinkedIn, Indeed, Handshake,
              Craigslist, Facebook Marketplace, local boards, and live official connectors.
            </p>
            <Link className="button button--secondary" to="/search">
              Open AI search assistant
            </Link>
          </section>
          <ImportOpportunityPanel />
        </aside>
      </div>
    </motion.div>
  );
}
