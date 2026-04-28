import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Link2, Milestone, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MatchBreakdown } from "../components/MatchBreakdown";
import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { buildOutreachMessage } from "../lib/resume";
import { applicationStageLabels, applicationStages } from "../lib/tracker";
import type { ApplicationStage } from "../types";

export function OpportunityDetailPage() {
  const { id } = useParams();
  const {
    insight,
    matches,
    profile,
    removeImportedOpportunity,
    selectOpportunity,
    selectedOpportunityId,
    trackedOpportunities,
    trackOpportunity,
    updateTrackedOpportunity,
  } = useWorthMatch();
  const match = matches.find((item) => item.id === id) ?? matches[0];

  useEffect(() => {
    if (match && selectedOpportunityId !== match.id) {
      selectOpportunity(match.id);
    }
  }, [match, selectOpportunity, selectedOpportunityId]);

  if (!match) {
    return null;
  }

  const trackedOpportunity = trackedOpportunities.find(
    (item) => item.opportunityId === match.id,
  );
  const outreach = buildOutreachMessage(profile, match, insight);
  const canRemoveImportedMatch =
    match.sourceType === "manual" ||
    match.sourceType === "imported" ||
    match.sourceId === "remotive-api";

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
            <ArrowLeft size={16} />
            Back to rankings
          </Link>
        }
        body={`${match.organization} - ${match.location} - ${match.compensation}`}
        eyebrow="Opportunity detail"
        title={match.title}
      />

      <div className="detail-grid">
        <section className="panel">
          <div className="detail-hero">
            <div>
              <span className="eyebrow">Why it matches</span>
              <h3>{match.matchScore} overall fit score</h3>
            </div>
            <div className="score-pill score-pill--large">{match.matchScore}</div>
          </div>
          <MatchBreakdown match={match} />

          <div className="detail-columns">
            <div>
              <strong>Strengths WorthMatch sees</strong>
              <ul className="micro-list">
                {match.whyItMatches.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Missing qualifications to answer</strong>
              <ul className="micro-list">
                {match.missingQualifications.map((qualification) => (
                  <li key={qualification}>{qualification}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="detail-columns">
            <div>
              <strong>Responsibilities</strong>
              <ul className="micro-list">
                {match.responsibilities.map((responsibility) => (
                  <li key={responsibility}>{responsibility}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Qualifications</strong>
              <ul className="micro-list">
                {match.qualifications.map((qualification) => (
                  <li key={qualification}>{qualification}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-actions">
            <div>
              <span className="eyebrow">Recommended next steps</span>
              <ul className="micro-list">
                {match.recommendedActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>

            <div className="detail-actions__buttons">
              <button
                className={
                  trackedOpportunity
                    ? "button button--secondary"
                    : "button button--ghost"
                }
                onClick={() => trackOpportunity(match.id)}
                type="button"
              >
                <Milestone size={16} />
                {trackedOpportunity ? "Tracked" : "Add to tracker"}
              </button>
              <Link className="button" to="/resume">
                Build targeted materials
                <ArrowRight size={16} />
              </Link>
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
              {canRemoveImportedMatch ? (
                <button
                  className="button button--ghost"
                  onClick={() => removeImportedOpportunity(match.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                  Remove import
                </button>
              ) : null}
              <Link className="button button--secondary" to="/interview">
                Interview prep
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {trackedOpportunity ? (
        <section className="panel">
          <span className="eyebrow">Tracker status</span>
          <div className="detail-columns">
            <label className="field-group">
              <span>Stage</span>
              <select
                className="field"
                onChange={(event) =>
                  updateTrackedOpportunity(match.id, {
                    stage: event.target.value as ApplicationStage,
                  })
                }
                value={trackedOpportunity.stage}
              >
                {applicationStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {applicationStageLabels[stage]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Due</span>
              <input
                className="field"
                onChange={(event) =>
                  updateTrackedOpportunity(match.id, {
                    dueLabel: event.target.value,
                  })
                }
                value={trackedOpportunity.dueLabel}
              />
            </label>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <span className="eyebrow">Generated outreach</span>
        <div className="copy-panel">
          <pre>{outreach}</pre>
        </div>
      </section>
    </motion.div>
  );
}
