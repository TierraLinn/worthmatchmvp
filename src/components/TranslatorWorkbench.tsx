import { useState } from "react";
import { Copy, Search, Sparkles, Target } from "lucide-react";

import { copyText } from "../lib/resume";
import { buildSearchPlaybook } from "../lib/playbook";
import type {
  MatchResult,
  SkillInsight,
  TrackedOpportunityView,
  UserProfile,
} from "../types";

interface TranslatorWorkbenchProps {
  profile: UserProfile;
  insight: SkillInsight;
  matches: MatchResult[];
  trackedOpportunities: TrackedOpportunityView[];
}

export function TranslatorWorkbench({
  profile,
  insight,
  matches,
  trackedOpportunities,
}: TranslatorWorkbenchProps) {
  const [status, setStatus] = useState(
    "Copy ATS keywords, search strings, service-offer copy, or the action plan.",
  );
  const playbook = buildSearchPlaybook(
    profile,
    insight,
    matches,
    trackedOpportunities,
  );

  async function handleCopy(value: string, label: string) {
    await copyText(value);
    setStatus(`${label} copied to clipboard.`);
  }

  return (
    <section className="panel translator-workbench">
      <div className="panel__heading">
        <div>
          <span className="eyebrow">Skill translator workbench</span>
          <h3>Turn the profile into practical search and pitch material.</h3>
        </div>
        <Target size={18} />
      </div>

      <div className="workbench-grid">
        <article className="workbench-card">
          <div className="workbench-card__header">
            <strong>ATS keyword bank</strong>
            <button
              className="button button--ghost"
              onClick={() => handleCopy(playbook.keywordLine, "ATS keyword bank")}
              type="button"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
          <div className="tag-row">
            {insight.atsKeywords.slice(0, 12).map((keyword) => (
              <span key={keyword} className="tag">
                {keyword}
              </span>
            ))}
          </div>
        </article>

        <article className="workbench-card">
          <div className="workbench-card__header">
            <strong>Search query pack</strong>
            <button
              className="button button--ghost"
              onClick={() =>
                handleCopy(playbook.searchQueries.join("\n"), "Search query pack")
              }
              type="button"
            >
              <Search size={16} />
              Copy
            </button>
          </div>
          <ul className="micro-list">
            {playbook.searchQueries.map((query) => (
              <li key={query}>{query}</li>
            ))}
          </ul>
        </article>

        <article className="workbench-card">
          <div className="workbench-card__header">
            <strong>Local service pitch</strong>
            <button
              className="button button--ghost"
              onClick={() => handleCopy(playbook.servicePitch, "Service pitch")}
              type="button"
            >
              <Sparkles size={16} />
              Copy
            </button>
          </div>
          <p>{playbook.servicePitch}</p>
          <ul className="micro-list">
            {playbook.localServiceQueries.map((query) => (
              <li key={query}>{query}</li>
            ))}
          </ul>
        </article>

        <article className="workbench-card">
          <div className="workbench-card__header">
            <strong>7-day action plan</strong>
            <button
              className="button button--ghost"
              onClick={() =>
                handleCopy(playbook.actionPlan.join("\n"), "7-day action plan")
              }
              type="button"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
          <p>{playbook.openingSummary}</p>
          <ul className="micro-list">
            {playbook.actionPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>
      </div>

      <p className="status-note">{status}</p>
    </section>
  );
}
