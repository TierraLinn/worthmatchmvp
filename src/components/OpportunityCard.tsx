import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Milestone,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useWorthMatch } from "../context/WorthMatchContext";
import { applicationStageLabels } from "../lib/tracker";
import type { MatchResult } from "../types";

interface OpportunityCardProps {
  match: MatchResult;
}

export function OpportunityCard({ match }: OpportunityCardProps) {
  const {
    savedOpportunityIds,
    selectOpportunity,
    toggleSavedOpportunity,
    trackedOpportunities,
    trackOpportunity,
  } = useWorthMatch();
  const isSaved = savedOpportunityIds.includes(match.id);
  const trackedOpportunity = trackedOpportunities.find(
    (item) => item.opportunityId === match.id,
  );

  return (
    <article className="opportunity-card">
      <div className="opportunity-card__header">
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
          <MapPin size={14} />
          {match.location}
        </span>
        <span>
          <BriefcaseBusiness size={14} />
          {match.kind}
        </span>
        <span>{match.category}</span>
      </div>

      <p className="opportunity-card__summary">{match.summary}</p>

      <div className="tag-row">
        {match.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <ul className="micro-list">
        {match.whyItMatches.slice(0, 2).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      <div className="opportunity-card__footer">
        <div className="opportunity-card__actions">
          <button
            className={
              isSaved ? "button button--ghost button--saved" : "button button--ghost"
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
        </div>

        <Link
          className="button button--secondary"
          onClick={() => selectOpportunity(match.id)}
          to={`/opportunities/${match.id}`}
        >
          Why it matches
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
