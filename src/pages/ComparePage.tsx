import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  ArrowUpRight,
  Copy,
  Download,
  Scale,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import {
  buildComparisonHighlights,
  buildLensRecommendation,
  comparisonLenses,
  getComparisonLensLabel,
  getSavedComparisons,
  type ComparisonLens,
} from "../lib/compare";
import { copyText, downloadTextFile } from "../lib/resume";

export function ComparePage() {
  const { matches, savedOpportunityIds, selectOpportunity } = useWorthMatch();
  const [lens, setLens] = useState<ComparisonLens>("best-fit");
  const [status, setStatus] = useState(
    "Choose a decision lens to see which saved path should come first.",
  );
  const savedMatches = getSavedComparisons(matches, savedOpportunityIds).slice(0, 4);
  const highlights = buildComparisonHighlights(savedMatches);
  const recommendation = buildLensRecommendation(savedMatches, lens);

  async function handleCopyBrief() {
    await copyText(recommendation.decisionBrief);
    setStatus("Decision brief copied to clipboard.");
  }

  function handleDownloadBrief() {
    downloadTextFile("worthmatch-decision-brief.txt", recommendation.decisionBrief);
    setStatus("Decision brief downloaded.");
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
        body="Saved opportunities can be compared side by side so WorthMatch helps users choose the right move, not just gather options."
        eyebrow="Opportunity compare"
        title="Choose between your strongest paths with clear tradeoffs."
      />

      {savedMatches.length < 2 ? (
        <section className="panel compare-empty">
          <Scale size={20} />
          <div>
            <h3>Save at least two opportunities to compare them.</h3>
            <p>
              Use the opportunity board to save high-fit jobs or service leads,
              then come back here for side-by-side recommendations.
            </p>
          </div>
          <Link className="button" to="/opportunities">
            Open opportunity board
          </Link>
        </section>
      ) : (
        <>
          <section className="panel compare-decision">
            <div className="panel__heading">
              <div>
                <span className="eyebrow">Decision lens</span>
                <h3>Pick the priority that matters most right now.</h3>
              </div>
              <Trophy size={18} />
            </div>

            <div className="segment-control">
              {comparisonLenses.map((value) => (
                <button
                  key={value}
                  className={
                    lens === value
                      ? "segment-control__item segment-control__item--active"
                      : "segment-control__item"
                  }
                  onClick={() => setLens(value)}
                  type="button"
                >
                  {getComparisonLensLabel(value)}
                </button>
              ))}
            </div>

            <div className="compare-decision__grid">
              <article className="workbench-card compare-decision-card compare-decision-card--accent">
                <div className="workbench-card__header">
                  <strong>Recommended path</strong>
                  <span className="score-pill">
                    {recommendation.winner?.score ?? "--"}
                  </span>
                </div>
                <h3>{recommendation.winner?.match.title ?? "Waiting for saved paths"}</h3>
                <p>{recommendation.description}</p>
                <p>{recommendation.winner?.rationale}</p>
                <div className="compare-decision__actions">
                  {recommendation.winner ? (
                    <>
                      <Link
                        className="button"
                        onClick={() =>
                          selectOpportunity(recommendation.winner?.match.id ?? "")
                        }
                        to={`/opportunities/${recommendation.winner.match.id}`}
                      >
                        <ArrowUpRight size={16} />
                        Open winner
                      </Link>
                      <Link
                        className="button button--secondary"
                        onClick={() =>
                          selectOpportunity(recommendation.winner?.match.id ?? "")
                        }
                        to="/resume"
                      >
                        Target resume
                      </Link>
                    </>
                  ) : null}
                </div>
              </article>

              <article className="workbench-card compare-decision-card">
                <div className="workbench-card__header">
                  <strong>Runner-up</strong>
                  <span className="score-pill">
                    {recommendation.runnerUp?.score ?? "--"}
                  </span>
                </div>
                <h3>{recommendation.runnerUp?.match.title ?? "No runner-up yet"}</h3>
                <p>
                  {recommendation.runnerUp?.rationale ??
                    "Add more saved opportunities to create a stronger decision set."}
                </p>
                <div className="compare-decision__actions">
                  <button
                    className="button button--ghost"
                    onClick={handleCopyBrief}
                    type="button"
                  >
                    <Copy size={16} />
                    Copy brief
                  </button>
                  <button
                    className="button button--secondary"
                    onClick={handleDownloadBrief}
                    type="button"
                  >
                    <Download size={16} />
                    Download brief
                  </button>
                </div>
                <p className="status-note">{status}</p>
              </article>
            </div>
          </section>

          <div className="summary-strip">
            {highlights.map((highlight) => (
              <article key={highlight.label} className="summary-card">
                <span className="eyebrow">{highlight.label}</span>
                <strong>{highlight.opportunity?.title ?? "Waiting"}</strong>
                <p>{highlight.reason}</p>
              </article>
            ))}
          </div>

          <section className="panel compare-table-wrap">
            <div className="panel__heading">
              <div>
                <span className="eyebrow">Saved side-by-side view</span>
                <h3>Top saved opportunities</h3>
              </div>
              <ArrowRightLeft size={18} />
            </div>

            <div className="compare-table">
              <div className="compare-table__row compare-table__row--head">
                <div>Metric</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.title}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Organization</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.organization}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Lens score</div>
                {recommendation.ranked.map((item) => (
                  <div key={item.match.id}>{item.score}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Overall fit</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.matchScore}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Compensation</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.compensation}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Work mode</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.remotePolicy}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Urgency</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.urgency}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Skill fit</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.skillFit}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Top missing qualification</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>
                    {match.missingQualifications[0] ?? "No major gap flagged"}
                  </div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Best next move</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>{match.recommendedActions[0]}</div>
                ))}
              </div>

              <div className="compare-table__row">
                <div>Open</div>
                {savedMatches.map((match) => (
                  <div key={match.id}>
                    <Link
                      className="button button--ghost"
                      onClick={() => selectOpportunity(match.id)}
                      to={`/opportunities/${match.id}`}
                    >
                      <ArrowUpRight size={16} />
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
