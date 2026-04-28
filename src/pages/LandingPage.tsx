import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  MapPinned,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useWorthMatch } from "../context/WorthMatchContext";

export function LandingPage() {
  const { applyDemoPersona, demoPersonas, insight, matches, startFreshWorkspace } =
    useWorthMatch();
  const navigate = useNavigate();
  const leadMatch = matches[0];

  function launchPersona(personaId: string) {
    applyDemoPersona(personaId, true);
    navigate("/dashboard");
  }

  function launchBlankFlow() {
    startFreshWorkspace();
    navigate("/onboarding");
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="page page--landing"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35 }}
    >
      <section className="hero">
        <div className="hero__content">
          <span className="eyebrow">
            Skill translator + opportunity matcher + resume studio
          </span>
          <h1>WorthMatch turns real-life ability into paid, professional momentum.</h1>
          <p>
            Help students, career changers, and underestimated talent describe
            their value, find remote or local work, and create polished
            application materials in one fast flow.
          </p>

          <div className="hero__actions">
            <button className="button" onClick={launchBlankFlow} type="button">
              Try with your profile
              <ArrowRight size={16} />
            </button>
            <Link className="button button--secondary" to="/demo">
              <PlayCircle size={16} />
              Open guided demo
            </Link>
          </div>

          <div className="hero__proof">
            <span>Real-user test mode</span>
            <span>Under-60-second demo</span>
            <span>{demoPersonas.length} seeded personas</span>
            <span>{matches.length} seeded opportunities</span>
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="signal-column">
            <div className="signal-column__headline">
              <Sparkles size={18} />
              WorthMatch signal map
            </div>
            <div className="signal-orbit">
              <div className="signal-node signal-node--large">
                <strong>Plain-English input</strong>
                <span>"People ask me to organize chaos and help with forms."</span>
              </div>
              <div className="signal-node">
                <strong>{insight.jobTitles[0]}</strong>
                <span>Suggested title</span>
              </div>
              <div className="signal-node">
                <strong>{insight.serviceOffers[0]}</strong>
                <span>Freelance angle</span>
              </div>
              <div className="signal-node signal-node--accent">
                <strong>{leadMatch.title}</strong>
                <span>{leadMatch.matchScore} match score</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="poster-grid">
        <div>
          <span className="eyebrow">Workflow</span>
          <h2>Designed for high-trust demos, not dead-end prototypes.</h2>
        </div>

        <div className="poster-grid__items">
          <article>
            <MapPinned size={18} />
            <h3>Translate lived experience</h3>
            <p>
              Turn everyday help, informal leadership, and side gigs into
              market-ready skills and titles.
            </p>
          </article>
          <article>
            <BriefcaseBusiness size={18} />
            <h3>Search and rank real opportunities</h3>
            <p>
              Use the AI search assistant, live connectors, pasted descriptions,
              imported links, uploads, and saved cards in one flow.
            </p>
          </article>
          <article>
            <FileText size={18} />
            <h3>Generate quick-apply materials</h3>
            <p>
              Build a master resume, targeted resume, cover letter, short bio,
              and fast application answers.
            </p>
          </article>
        </div>
      </section>

      <section className="feature-band">
        <div>
          <span className="eyebrow">Demo personas</span>
          <h2>Switch the story in one click and keep the product believable.</h2>
        </div>

        <div className="persona-grid">
          {demoPersonas.map((persona) => (
            <article key={persona.id} className="persona-card">
              <div className="persona-card__header">
                <div>
                  <span className="eyebrow">{persona.label}</span>
                  <h3>{persona.audience}</h3>
                </div>
              </div>
              <p>{persona.pitch}</p>
              <div className="persona-card__actions">
                <button
                  className="button button--secondary"
                  onClick={() => launchPersona(persona.id)}
                  type="button"
                >
                  Launch this persona
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-band">
        <div>
          <span className="eyebrow">Demo highlights</span>
          <h2>WorthMatch tells a better story about practical talent.</h2>
        </div>

        <div className="feature-band__layout">
          <div className="feature-band__panel">
            <p className="feature-band__lead">{insight.positioningSummary}</p>
            <div className="tag-row">
              {insight.marketableSkills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="feature-band__panel">
            <span className="eyebrow">Top current match</span>
            <h3>{leadMatch.title}</h3>
            <p>{leadMatch.summary}</p>
            <ul className="micro-list">
              {leadMatch.whyItMatches.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
