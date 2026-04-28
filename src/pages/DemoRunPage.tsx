import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Timer,
  UserRoundPen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";

const demoSteps = [
  {
    step: "01",
    title: "Pick a persona",
    body: "Choose a student, career changer, or community helper story in one click.",
    target: "/dashboard",
  },
  {
    step: "02",
    title: "Search live or named platforms",
    body: "Use platform search to show compliant external search packs plus live Remotive and Ashby results.",
    target: "/search",
  },
  {
    step: "03",
    title: "Show the top match",
    body: "Import a live lead or jump to the ranked board to show the matcher in action.",
    target: "/opportunities",
  },
  {
    step: "04",
    title: "Open targeted materials",
    body: "Jump into the resume studio and show a tailored resume, cover letter, and quick answers.",
    target: "/resume",
  },
  {
    step: "05",
    title: "Close with pipeline momentum",
    body: "Finish in the tracker or workspace to show follow-through and real-user control over the session.",
    target: "/tracker",
  },
];

export function DemoRunPage() {
  const {
    activePresetId,
    applyDemoPersona,
    artifacts,
    demoPersonas,
    insight,
    matches,
    resetWorkspace,
    startFreshWorkspace,
    trackedOpportunities,
  } = useWorthMatch();
  const navigate = useNavigate();
  const leadMatch = matches[0];

  function handlePersonaSelect(personaId: string) {
    applyDemoPersona(personaId, true);
  }

  function handleLaunch(personaId: string) {
    applyDemoPersona(personaId, true);
    navigate("/dashboard");
  }

  function handleBlankLaunch() {
    startFreshWorkspace();
    navigate("/onboarding");
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
        action={<span className="meta-pill"><Timer size={16} /> Under 60 seconds</span>}
        body="This mode makes the pitch easier to show live: switch personas instantly, follow a judge-friendly narrative, and jump straight into the strongest workflow moments."
        eyebrow="Guided demo run"
        title="A competition-ready walkthrough for WorthMatch."
      />

      <div className="demo-layout">
        <section className="panel panel--hero">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Demo personas</span>
              <h3>Tell different user stories without rebuilding the app.</h3>
            </div>
            <Sparkles size={18} />
          </div>

          <div className="persona-grid">
            {demoPersonas.map((persona) => {
              const isActive = persona.id === activePresetId;

              return (
                <article
                  key={persona.id}
                  className={isActive ? "persona-card persona-card--active" : "persona-card"}
                >
                  <div className="persona-card__header">
                    <div>
                      <span className="eyebrow">{persona.label}</span>
                      <h3>{persona.audience}</h3>
                    </div>
                    <span className="meta-pill">{persona.heroStat}</span>
                  </div>

                  <p>{persona.pitch}</p>

                  <ul className="micro-list">
                    {persona.quickWins.map((win) => (
                      <li key={win}>{win}</li>
                    ))}
                  </ul>

                  <div className="persona-card__actions">
                    <button
                      className={isActive ? "button button--secondary" : "button button--ghost"}
                      onClick={() => handlePersonaSelect(persona.id)}
                      type="button"
                    >
                      {isActive ? "Loaded" : "Preview persona"}
                    </button>
                    <button
                      className="button"
                      onClick={() => handleLaunch(persona.id)}
                      type="button"
                    >
                      <PlayCircle size={16} />
                      Launch this story
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">Live snapshot</span>
          <h3>{leadMatch.title}</h3>
          <p>{leadMatch.summary}</p>

          <div className="tag-row">
            {insight.marketableSkills.slice(0, 6).map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>

          <div className="resume-preview">
            <strong>Fast demo proof</strong>
            <p>{artifacts.shortBio}</p>
          </div>

          <div className="resume-preview">
            <strong>Real-user testing</strong>
            <p>
              Start with a blank workspace to test WorthMatch as an actual user
              instead of a seeded persona.
            </p>
            <button className="button button--ghost" onClick={handleBlankLaunch} type="button">
              <UserRoundPen size={16} />
              Start blank user test
            </button>
          </div>

          <div className="summary-strip summary-strip--compact">
            <article className="summary-card">
              <span className="eyebrow">Matches</span>
              <strong>{matches.length}</strong>
            </article>
            <article className="summary-card">
              <span className="eyebrow">Tracked</span>
              <strong>{trackedOpportunities.length}</strong>
            </article>
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Recommended script</span>
            <h3>Use this sequence when demo time is tight.</h3>
          </div>
          <Timer size={18} />
        </div>

        <div className="demo-script">
          {demoSteps.map((step) => (
            <article key={step.step} className="demo-script__step">
              <span>{step.step}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
              <Link className="button button--secondary" to={step.target}>
                Open
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <div className="demo-script__footer">
          <button className="button button--secondary" onClick={handleBlankLaunch} type="button">
            <UserRoundPen size={16} />
            Try your own profile
          </button>
          <button className="button button--ghost" onClick={resetWorkspace} type="button">
            <RotateCcw size={16} />
            Reset to default workspace
          </button>
          <Link className="button" to="/dashboard">
            Start the full run
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
