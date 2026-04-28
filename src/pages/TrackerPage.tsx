import { motion } from "framer-motion";
import { ArrowRight, Clock3, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { applicationStageLabels, applicationStages } from "../lib/tracker";
import type { ApplicationStage } from "../types";

export function TrackerPage() {
  const {
    trackedOpportunities,
    updateTrackedOpportunity,
    removeTrackedOpportunity,
    selectOpportunity,
  } = useWorthMatch();

  const groupedByStage = applicationStages.map((stage) => ({
    stage,
    items: trackedOpportunities.filter((item) => item.stage === stage),
  }));

  const summary = {
    ready: trackedOpportunities.filter((item) => item.stage === "ready").length,
    applied: trackedOpportunities.filter((item) => item.stage === "applied").length,
    interviews: trackedOpportunities.filter((item) => item.stage === "interview")
      .length,
    offers: trackedOpportunities.filter((item) => item.stage === "offer").length,
  };

  const nextMoves = trackedOpportunities.slice(0, 4);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="page"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <SectionHeading
        body="Track opportunities from discovery through offer, keep next steps visible, and turn the search into a believable application workflow."
        eyebrow="Application tracker"
        title="Pipeline the best matches and keep momentum visible."
      />

      <div className="summary-strip">
        <article className="summary-card">
          <span className="eyebrow">Ready now</span>
          <strong>{summary.ready}</strong>
          <p>Strong fits that mainly need tailored materials.</p>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Applied</span>
          <strong>{summary.applied}</strong>
          <p>Live opportunities already in motion.</p>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Interview</span>
          <strong>{summary.interviews}</strong>
          <p>Roles worth focused storytelling prep.</p>
        </article>
        <article className="summary-card">
          <span className="eyebrow">Offer stage</span>
          <strong>{summary.offers}</strong>
          <p>Keep this lane visible for negotiation and follow-through.</p>
        </article>
      </div>

      <div className="tracker-layout">
        <section className="panel">
          <div className="tracker-board">
            {groupedByStage.map(({ stage, items }) => (
              <div key={stage} className="tracker-column">
                <div className="tracker-column__header">
                  <div>
                    <span className="eyebrow">{applicationStageLabels[stage]}</span>
                    <h3>{items.length} items</h3>
                  </div>
                </div>

                <div className="tracker-column__stack">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <article key={item.opportunityId} className="tracker-card">
                        <div className="tracker-card__header">
                          <div>
                            <strong>{item.opportunity.title}</strong>
                            <span>{item.opportunity.organization}</span>
                          </div>
                          <span className="score-pill">{item.opportunity.matchScore}</span>
                        </div>

                        <label className="field-group">
                          <span>Notes</span>
                          <textarea
                            className="field"
                            onChange={(event) =>
                              updateTrackedOpportunity(item.opportunityId, {
                                notes: event.target.value,
                              })
                            }
                            rows={3}
                            value={item.notes}
                          />
                        </label>

                        <label className="field-group">
                          <span>Next step</span>
                          <textarea
                            className="field"
                            onChange={(event) =>
                              updateTrackedOpportunity(item.opportunityId, {
                                nextStep: event.target.value,
                              })
                            }
                            rows={3}
                            value={item.nextStep}
                          />
                        </label>

                        <div className="tracker-card__controls">
                          <label className="field-group">
                            <span>Stage</span>
                            <select
                              className="field"
                              onChange={(event) =>
                                updateTrackedOpportunity(item.opportunityId, {
                                  stage: event.target.value as ApplicationStage,
                                })
                              }
                              value={item.stage}
                            >
                              {applicationStages.map((stageValue) => (
                                <option key={stageValue} value={stageValue}>
                                  {applicationStageLabels[stageValue]}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="field-group">
                            <span>Due</span>
                            <input
                              className="field"
                              onChange={(event) =>
                                updateTrackedOpportunity(item.opportunityId, {
                                  dueLabel: event.target.value,
                                })
                              }
                              value={item.dueLabel}
                            />
                          </label>
                        </div>

                        <div className="tracker-card__footer">
                          <button
                            className="button button--ghost"
                            onClick={() =>
                              removeTrackedOpportunity(item.opportunityId)
                            }
                            type="button"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                          <Link
                            className="button button--ghost"
                            onClick={() => selectOpportunity(item.opportunityId)}
                            to="/resume"
                          >
                            Open in Resume Studio
                          </Link>
                          <Link
                            className="button button--ghost"
                            onClick={() => selectOpportunity(item.opportunityId)}
                            to="/interview"
                          >
                            Interview prep
                          </Link>
                          <Link
                            className="button button--secondary"
                            onClick={() => selectOpportunity(item.opportunityId)}
                            to={`/opportunities/${item.opportunityId}`}
                          >
                            Match detail
                          </Link>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="tracker-empty">
                      <Sparkles size={18} />
                      <p>No items here yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">This week</span>
          <h3>Highest-leverage next moves</h3>
          <div className="stack">
            {nextMoves.map((item) => (
              <article key={item.opportunityId} className="timeline-card">
                <div className="timeline-card__header">
                  <strong>{item.opportunity.title}</strong>
                  <span>{applicationStageLabels[item.stage]}</span>
                </div>
                <p>{item.nextStep}</p>
                <div className="meta-pill">
                  <Clock3 size={14} />
                  {item.dueLabel}
                </div>
              </article>
            ))}
          </div>

          <Link className="button" to="/opportunities">
            Add more opportunities
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </motion.div>
  );
}
