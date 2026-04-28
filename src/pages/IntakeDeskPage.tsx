import { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  FolderInput,
  Link2,
  Milestone,
  ScanSearch,
  Trash2,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ImportOpportunityPanel } from "../components/ImportOpportunityPanel";
import { SectionHeading } from "../components/SectionHeading";
import { connectorModules, useWorthMatch } from "../context/WorthMatchContext";
import { applicationStageLabels } from "../lib/tracker";
import { buildIntakeDeskSummary, getIntakeLane, type IntakeLaneId } from "../lib/intake";

export function IntakeDeskPage() {
  const {
    importedMatches,
    removeImportedOpportunity,
    savedOpportunityIds,
    selectOpportunity,
    toggleSavedOpportunity,
    trackedOpportunities,
    trackOpportunity,
  } = useWorthMatch();
  const [query, setQuery] = useState("");
  const [laneFilter, setLaneFilter] = useState<IntakeLaneId | "all">("all");
  const deferredQuery = useDeferredValue(query);

  const summary = buildIntakeDeskSummary(importedMatches, connectorModules);
  const filteredImports = useMemo(
    () =>
      importedMatches.filter((match) => {
        const matchesQuery =
          deferredQuery.trim().length === 0 ||
          `${match.title} ${match.organization} ${match.summary} ${match.skills.join(" ")}`
            .toLowerCase()
            .includes(deferredQuery.toLowerCase());
        const matchesLane =
          laneFilter === "all" || getIntakeLane(match) === laneFilter;

        return matchesQuery && matchesLane;
      }),
    [deferredQuery, importedMatches, laneFilter],
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="page"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeading
        action={
          <Link className="button button--secondary" to="/opportunities">
            Open ranked board
          </Link>
        }
        body="Operate every approved intake path in one place: paste text, import links, stage screenshots or PDFs, and save manual leads without relying on risky scraping."
        eyebrow="Intake desk"
        title="Bring outside leads into WorthMatch and turn them into ranked next moves."
      />

      <div className="summary-strip summary-strip--compact">
        <article className="summary-card">
          <strong>{summary.totalImported}</strong>
          <span>imported leads in play</span>
        </article>
        <article className="summary-card">
          <strong>{summary.highFitCount}</strong>
          <span>imported leads already scoring 78+</span>
        </article>
        <article className="summary-card">
          <strong>{summary.quickActionCount}</strong>
          <span>quick-action opportunities</span>
        </article>
        <article className="summary-card">
          <strong>{summary.serviceLeadCount}</strong>
          <span>manual or service-style leads</span>
        </article>
      </div>

      <div className="intake-layout">
        <section className="stack">
          <section className="panel">
            <div className="panel__heading">
              <div>
                <span className="eyebrow">Approved intake lanes</span>
                <h3>Every safe source path is visible and ready to demo.</h3>
              </div>
              <FolderInput size={18} />
            </div>

            <div className="intake-lane-grid">
              {summary.laneSummaries.map((lane) => (
                <article key={lane.id} className="intake-lane">
                  <div className="intake-lane__header">
                    <div>
                      <strong>{lane.label}</strong>
                      <span>{lane.description}</span>
                    </div>
                    <div className="score-pill">{lane.count}</div>
                  </div>
                  <div className="intake-lane__meta">
                    <span>{lane.connectorStatus}</span>
                  </div>
                  <ul className="micro-list">
                    {lane.supportedImports.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <ImportOpportunityPanel />
        </section>

        <aside className="panel panel--sidebar results-sidebar">
          <span className="eyebrow">Source operations</span>
          <h3>Connector posture and next intake moves</h3>

          <div className="resume-preview">
            <strong>Recommended actions</strong>
            <ul className="micro-list">
              {summary.recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="resume-preview">
            <strong>Connector registry</strong>
            <div className="service-sidebar-list">
              {connectorModules.map((connector) => (
                <article key={connector.id}>
                  <div>
                    <strong>{connector.name}</strong>
                    <span>{connector.status}</span>
                  </div>
                  <p>{connector.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="resume-preview">
            <strong>Best next destination</strong>
            <p>
              Once a lead looks strong, move to the ranked board for matching,
              then use resume, compare, interview, or service flows from there.
            </p>
            <Link className="button button--ghost" to="/dashboard">
              Open dashboard
            </Link>
          </div>
        </aside>
      </div>

      <section className="panel intake-history">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Imported lead history</span>
            <h3>Search, filter, and act on every lead you pulled into the app.</h3>
          </div>
          <ScanSearch size={18} />
        </div>

        <div className="filter-bar">
          <input
            className="field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search imported titles, organizations, or keywords"
            value={query}
          />

          <div className="segment-control">
            {(["all", "paste", "link", "upload", "manual"] as const).map((value) => (
              <button
                key={value}
                className={
                  laneFilter === value
                    ? "segment-control__item segment-control__item--active"
                    : "segment-control__item"
                }
                onClick={() => setLaneFilter(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {filteredImports.length > 0 ? (
          <div className="intake-list">
            {filteredImports.map((match) => {
              const isSaved = savedOpportunityIds.includes(match.id);
              const trackedOpportunity = trackedOpportunities.find(
                (item) => item.opportunityId === match.id,
              );

              return (
                <article key={match.id} className="intake-item">
                  <div className="intake-item__header">
                    <div>
                      <span className="eyebrow">{match.sourceLabel}</span>
                      <h3>{match.title}</h3>
                      <p>
                        {match.organization} - {match.compensation}
                      </p>
                    </div>
                    <div className="score-pill">
                      <Zap size={14} />
                      {match.matchScore}
                    </div>
                  </div>

                  <div className="opportunity-card__meta">
                    <span>
                      <BriefcaseBusiness size={14} />
                      {match.kind}
                    </span>
                    <span>{match.location}</span>
                    <span>{getIntakeLane(match)}</span>
                  </div>

                  <p className="opportunity-card__summary">{match.summary}</p>

                  <div className="tag-row">
                    {match.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="intake-item__footer">
                    <div className="opportunity-card__actions">
                      <button
                        className={
                          isSaved
                            ? "button button--ghost button--saved"
                            : "button button--ghost"
                        }
                        onClick={() => toggleSavedOpportunity(match.id)}
                        type="button"
                      >
                        <Bookmark size={16} />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      <button
                        className={
                          trackedOpportunity
                            ? "button button--ghost button--saved"
                            : "button button--ghost"
                        }
                        onClick={() => trackOpportunity(match.id)}
                        type="button"
                      >
                        <Milestone size={16} />
                        {trackedOpportunity
                          ? applicationStageLabels[trackedOpportunity.stage]
                          : "Track"}
                      </button>
                      <button
                        className="button button--ghost"
                        onClick={() => removeImportedOpportunity(match.id)}
                        type="button"
                      >
                        <Trash2 size={16} />
                        Remove import
                      </button>
                      {match.link ? (
                        <a
                          className="button button--ghost"
                          href={match.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Link2 size={16} />
                          Open source
                        </a>
                      ) : null}
                    </div>

                    <Link
                      className="button button--secondary"
                      onClick={() => selectOpportunity(match.id)}
                      to={`/opportunities/${match.id}`}
                    >
                      Open detail
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="tracker-empty">
            <p>No imported leads match this filter set yet.</p>
            <p className="status-note">
              Pull in a pasted description, a saved link, a screenshot, or a
              manual lead to populate the desk.
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
