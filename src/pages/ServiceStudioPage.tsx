import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, HandCoins, Send, Store } from "lucide-react";
import { Link } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { buildSearchPlaybook } from "../lib/playbook";
import { copyText, downloadTextFile } from "../lib/resume";
import { buildServiceLaunchKit, buildServiceStudio } from "../lib/services";

export function ServiceStudioPage() {
  const { insight, matches, profile, trackedOpportunities } = useWorthMatch();
  const studio = buildServiceStudio(profile, insight, matches);
  const playbook = buildSearchPlaybook(
    profile,
    insight,
    matches,
    trackedOpportunities,
  );
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(
    studio.blueprints[0]?.id ?? "",
  );
  const [status, setStatus] = useState(
    "Copy or download the offer kit, pricing, and outreach copy.",
  );

  const activeBlueprint =
    studio.blueprints.find((blueprint) => blueprint.id === selectedBlueprintId) ??
    studio.blueprints[0];

  if (!activeBlueprint) {
    return null;
  }

  const launchKit = buildServiceLaunchKit(profile, activeBlueprint);

  async function handleCopy(value: string, label: string) {
    await copyText(value);
    setStatus(`${label} copied to clipboard.`);
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
        action={
          <Link className="button button--secondary" to="/opportunities">
            See matched opportunities
          </Link>
        }
        body="Package everyday helpfulness into clear paid offers, starter pricing, launch copy, and outreach that can be used immediately."
        eyebrow="Service studio"
        title="Turn translated skills into services people can actually buy."
      />

      <div className="summary-strip summary-strip--compact">
        <article className="summary-card">
          <strong>{studio.blueprints.length}</strong>
          <span>packaged service paths</span>
        </article>
        <article className="summary-card">
          <strong>{studio.quickIncomeCount}</strong>
          <span>quick-income matches in the current mix</span>
        </article>
        <article className="summary-card">
          <strong>{studio.localPathCount}</strong>
          <span>local or hybrid paths to mirror</span>
        </article>
        <article className="summary-card">
          <strong>{activeBlueprint.pricingTiers[0]?.price ?? "Ready"}</strong>
          <span>starter offer to test first</span>
        </article>
      </div>

      <div className="resume-layout services-layout">
        <section className="panel">
          <div className="resume-toolbar">
            <label className="field-group">
              <span>Service offer</span>
              <select
                className="field"
                onChange={(event) => setSelectedBlueprintId(event.target.value)}
                value={activeBlueprint.id}
              >
                {studio.blueprints.map((blueprint) => (
                  <option key={blueprint.id} value={blueprint.id}>
                    {blueprint.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="resume-toolbar__actions">
              <button
                className="button button--secondary"
                onClick={() =>
                  downloadTextFile(
                    `worthmatch-${activeBlueprint.id}-service-kit.txt`,
                    launchKit,
                  )
                }
                type="button"
              >
                <Download size={16} />
                Download service kit
              </button>
              <button
                className="button"
                onClick={() => handleCopy(launchKit, "Service launch kit")}
                type="button"
              >
                <Copy size={16} />
                Copy full kit
              </button>
            </div>
          </div>

          <div className="segment-control">
            {studio.blueprints.map((blueprint) => (
              <button
                key={blueprint.id}
                className={
                  blueprint.id === activeBlueprint.id
                    ? "segment-control__item segment-control__item--active"
                    : "segment-control__item"
                }
                onClick={() => setSelectedBlueprintId(blueprint.id)}
                type="button"
              >
                {blueprint.title}
              </button>
            ))}
          </div>

          <div className="service-hero">
            <div>
              <span className="eyebrow">Offer positioning</span>
              <h3>{activeBlueprint.title}</h3>
              <p>{activeBlueprint.promise}</p>
            </div>

            <div className="service-hero__meta">
              <div className="score-pill">
                <HandCoins size={16} />
                {activeBlueprint.modeLabel}
              </div>
              <div className="meta-pill">
                <Store size={16} />
                {activeBlueprint.audience}
              </div>
            </div>
          </div>

          <p className="status-note service-note">{activeBlueprint.pricingNote}</p>

          <div className="pricing-grid">
            {activeBlueprint.pricingTiers.map((tier) => (
              <article key={tier.name} className="pricing-card">
                <span className="eyebrow">{tier.name}</span>
                <strong className="pricing-card__price">{tier.price}</strong>
                <p>{tier.description}</p>
                <ul className="micro-list">
                  {tier.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="workbench-grid">
            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>What is included</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      activeBlueprint.included.join("\n"),
                      "Included deliverables",
                    )
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <p>{activeBlueprint.positioning}</p>
              <ul className="micro-list">
                {activeBlueprint.included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Why clients can trust it</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      activeBlueprint.proofPoints.join("\n"),
                      "Proof points",
                    )
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <ul className="micro-list">
                {activeBlueprint.proofPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Listing copy</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      `${activeBlueprint.listingHeadline}\n\n${activeBlueprint.listingDescription}`,
                      "Listing copy",
                    )
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <div className="service-listing">
                <strong>{activeBlueprint.listingHeadline}</strong>
                <p>{activeBlueprint.listingDescription}</p>
              </div>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Outreach scripts</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      `${activeBlueprint.outreachDm}\n\n${activeBlueprint.outreachEmail}`,
                      "Outreach scripts",
                    )
                  }
                  type="button"
                >
                  <Send size={16} />
                  Copy
                </button>
              </div>
              <div className="service-script">
                <strong>Warm intro DM</strong>
                <p>{activeBlueprint.outreachDm}</p>
              </div>
              <div className="service-script">
                <strong>Email version</strong>
                <p>{activeBlueprint.outreachEmail}</p>
              </div>
            </article>
          </div>

          <p className="status-note">{status}</p>
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">Launch plan</span>
          <h3>{studio.openingSummary}</h3>

          <div className="resume-preview">
            <strong>7-day launch moves</strong>
            <ul className="micro-list">
              {activeBlueprint.launchPlan.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="resume-preview">
            <strong>Search and outreach strings</strong>
            <ul className="micro-list">
              {Array.from(
                new Set([
                  ...activeBlueprint.searchQueries,
                  ...playbook.localServiceQueries,
                ]),
              )
                .slice(0, 6)
                .map((query) => (
                  <li key={query}>{query}</li>
                ))}
            </ul>
          </div>

          <div className="resume-preview">
            <strong>Client intake checklist</strong>
            <ul className="micro-list">
              {activeBlueprint.intakeChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="resume-preview">
            <strong>Related paid paths</strong>
            <div className="service-sidebar-list">
              {activeBlueprint.relatedMatches.map((match) => (
                <article key={match.id}>
                  <div>
                    <strong>{match.title}</strong>
                    <span>{match.matchScore} match</span>
                  </div>
                  <p>{match.organization}</p>
                  <Link className="button button--ghost" to={`/opportunities/${match.id}`}>
                    Open detail
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
