import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers3,
  Link2,
  Milestone,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { OpportunityCard } from "../components/OpportunityCard";
import { SectionHeading } from "../components/SectionHeading";
import { TranslatorWorkbench } from "../components/TranslatorWorkbench";
import { LiveSyncPanel } from "../components/LiveSyncPanel";
import { connectorModules, useWorthMatch } from "../context/WorthMatchContext";

export function DashboardPage() {
  const {
    artifacts,
    hasCompletedOnboarding,
    insight,
    matches,
    profile,
    savedOpportunityIds,
    trackedOpportunities,
  } = useWorthMatch();
  const topMatches = matches.slice(0, 3);
  const trackerSnapshot = trackedOpportunities.slice(0, 3);
  const topCategories = Array.from(
    matches.reduce((accumulator, match) => {
      accumulator.set(match.category, (accumulator.get(match.category) ?? 0) + 1);
      return accumulator;
    }, new Map<string, number>()),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

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
            Open full ranking
            <ArrowRight size={16} />
          </Link>
        }
        body={`${profile.name} is positioned for ${insight.jobTitles.slice(0, 3).join(", ")} with opportunities spanning remote roles and local paid services.`}
        eyebrow="Results dashboard"
        title="WorthMatch made the candidate story legible and actionable."
      />

      {!hasCompletedOnboarding ? (
        <div className="banner-note">
          Viewing the starter profile. Run the onboarding wizard to tailor the entire dashboard in under a minute.
          <Link to="/onboarding">Open onboarding</Link>
        </div>
      ) : null}

      <LiveSyncPanel
        defaultQuery={insight.jobTitles[0] ?? insight.serviceOffers[0]}
        description="Search live sources right from the dashboard, pull in the strongest matched jobs, and move straight into ranking or application work."
        heading="Bring live matched jobs into the dashboard without leaving your main workspace."
      />

      <div className="dashboard-grid">
        <section className="panel panel--hero">
          <span className="eyebrow">Skill translator</span>
          <h3>{insight.positioningSummary}</h3>
          <div className="insight-cluster">
            <div>
              <strong>Marketable skills</strong>
              <div className="tag-row">
                {insight.marketableSkills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Possible job titles</strong>
              <ul className="micro-list">
                {insight.jobTitles.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Freelance / service offers</strong>
              <ul className="micro-list">
                {insight.serviceOffers.map((offer) => (
                  <li key={offer}>{offer}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel panel--sidebar">
          <span className="eyebrow">Recommended next steps</span>
          <ul className="micro-list">
            {matches[0].recommendedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          <div className="resume-preview">
            <strong>Ready-to-export materials</strong>
            <p>{artifacts.shortBio}</p>
            <Link className="button button--ghost" to="/resume">
              Open Resume Studio
            </Link>
          </div>
          <div className="resume-preview">
            <strong>Pipeline snapshot</strong>
            <p>
              {trackedOpportunities.length} opportunities are currently being
              tracked across discovery, application, and interview stages.
            </p>
            <Link className="button button--ghost" to="/tracker">
              Open tracker
            </Link>
          </div>
          <div className="resume-preview">
            <strong>Saved compare set</strong>
            <p>
              {savedOpportunityIds.length} opportunities are saved for side-by-side
              comparison and prioritization.
            </p>
            <Link className="button button--ghost" to="/compare">
              Open compare
            </Link>
          </div>
          <div className="resume-preview">
            <strong>Direct service path</strong>
            <p>
              Package {insight.serviceOffers[0]?.toLowerCase() ?? "local support work"} into
              starter pricing, listing copy, and outreach for quick local or freelance income.
            </p>
            <Link className="button button--ghost" to="/services">
              Open Service Studio
            </Link>
          </div>
          <div className="resume-preview">
            <strong>AI search assistant</strong>
            <p>
              Run one matched search across live sources, then open LinkedIn,
              Indeed, Handshake, Craigslist, Facebook, and other boards with
              profile-aware queries already prepared.
            </p>
            <Link
              className="button button--ghost"
              to={`/search?focus=${encodeURIComponent(
                insight.jobTitles[0] ?? insight.serviceOffers[0] ?? "customer support",
              )}`}
            >
              Open AI Search Assistant
            </Link>
          </div>
          <div className="resume-preview">
            <strong>Workspace controls</strong>
            <p>
              Export the current session, restore a backup, or start a blank
              onboarding flow for a real user.
            </p>
            <Link className="button button--ghost" to="/workspace">
              Open workspace
            </Link>
          </div>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid--secondary">
        <section className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Top skill matches</span>
              <h3>Best-fit opportunities right now</h3>
            </div>
            <WandSparkles size={18} />
          </div>
          <div className="stack">
            {topMatches.map((match) => (
              <OpportunityCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Opportunity categories</span>
              <h3>Where the profile is strongest</h3>
            </div>
            <Layers3 size={18} />
          </div>
          <div className="ranked-list">
            {topCategories.map(([category, count]) => (
              <div key={category} className="ranked-list__item">
                <div>
                  <strong>{category}</strong>
                  <span>{count} viable paths in the current workspace</span>
                </div>
                <span>{count}</span>
              </div>
            ))}
          </div>

          <div className="panel__heading panel__heading--spaced">
            <div>
              <span className="eyebrow">Connector architecture</span>
              <h3>Source modules ready for later expansion</h3>
            </div>
            <Link2 size={18} />
          </div>
          <div className="connector-list">
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
        </section>
      </div>

      <TranslatorWorkbench
        insight={insight}
        matches={matches}
        profile={profile}
        trackedOpportunities={trackedOpportunities}
      />

      <section className="panel dashboard-tracker">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Application tracker</span>
            <h3>Work already in motion</h3>
          </div>
          <Milestone size={18} />
        </div>
        <div className="stack">
          {trackerSnapshot.map((item) => (
            <div key={item.opportunityId} className="timeline-card">
              <div className="timeline-card__header">
                <strong>{item.opportunity.title}</strong>
                <span>{item.stage}</span>
              </div>
              <p>{item.nextStep}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
