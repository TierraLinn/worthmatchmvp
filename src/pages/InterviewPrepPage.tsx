import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, Mic2, Send, ShieldCheck } from "lucide-react";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { buildInterviewKit } from "../lib/interview";
import { copyText, downloadTextFile } from "../lib/resume";

export function InterviewPrepPage() {
  const {
    insight,
    matches,
    profile,
    selectOpportunity,
    selectedOpportunityId,
    trackedOpportunities,
  } = useWorthMatch();
  const selectedMatch =
    matches.find((match) => match.id === selectedOpportunityId) ??
    trackedOpportunities[0]?.opportunity ??
    matches[0];
  const trackedOpportunity = trackedOpportunities.find(
    (item) => item.opportunityId === selectedMatch?.id,
  );
  const [status, setStatus] = useState(
    "Copy or download the prep brief, talking points, and follow-up note.",
  );
  const kit = buildInterviewKit(
    profile,
    insight,
    selectedMatch,
    trackedOpportunity,
  );

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
        body="Turn a saved or selected opportunity into a practical interview-prep kit with talking points, bridge statements, and a follow-up note."
        eyebrow="Interview prep"
        title="Practice the conversation, not just the application."
      />

      <div className="resume-layout">
        <section className="panel">
          <div className="resume-toolbar">
            <label className="field-group">
              <span>Target opportunity</span>
              <select
                className="field"
                onChange={(event) => selectOpportunity(event.target.value)}
                value={selectedMatch.id}
              >
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.title} - {match.organization}
                  </option>
                ))}
              </select>
            </label>

            <div className="resume-toolbar__actions">
              <button
                className="button button--secondary"
                onClick={() =>
                  downloadTextFile("worthmatch-interview-prep.txt", kit.prepBrief)
                }
                type="button"
              >
                <Download size={16} />
                Download prep brief
              </button>
              <button
                className="button"
                onClick={() => handleCopy(kit.prepBrief, "Interview prep brief")}
                type="button"
              >
                <Copy size={16} />
                Copy prep brief
              </button>
            </div>
          </div>

          <div className="prep-grid">
            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>30-second intro</strong>
                <button
                  className="button button--ghost"
                  onClick={() => handleCopy(kit.intro, "30-second intro")}
                  type="button"
                >
                  <Mic2 size={16} />
                  Copy
                </button>
              </div>
              <p>{kit.intro}</p>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Strongest angles</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(kit.strongestAngles.join("\n"), "Strongest angles")
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <ul className="micro-list">
                {kit.strongestAngles.map((angle) => (
                  <li key={angle}>{angle}</li>
                ))}
              </ul>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Likely questions</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      kit.likelyQuestions
                        .map((item) => `${item.question}\n${item.answer}`)
                        .join("\n\n"),
                      "Likely questions",
                    )
                  }
                  type="button"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <div className="quick-answer-stack">
                {kit.likelyQuestions.map((item) => (
                  <article key={item.question} className="quick-answer-card">
                    <strong>{item.question}</strong>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="workbench-card">
              <div className="workbench-card__header">
                <strong>Bridge statements</strong>
                <button
                  className="button button--ghost"
                  onClick={() =>
                    handleCopy(
                      kit.bridgeStatements.join("\n"),
                      "Bridge statements",
                    )
                  }
                  type="button"
                >
                  <ShieldCheck size={16} />
                  Copy
                </button>
              </div>
              <ul className="micro-list">
                {kit.bridgeStatements.map((statement) => (
                  <li key={statement}>{statement}</li>
                ))}
              </ul>
            </article>
          </div>

          <p className="status-note">{status}</p>
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">Selected opportunity</span>
          <h3>{selectedMatch.title}</h3>
          <p>{selectedMatch.summary}</p>

          <div className="resume-preview">
            <strong>Salary script</strong>
            <p>{kit.salaryScript}</p>
          </div>

          <div className="resume-preview">
            <strong>Follow-up email</strong>
            <p>{kit.followUpEmail}</p>
            <button
              className="button button--ghost"
              onClick={() => handleCopy(kit.followUpEmail, "Follow-up email")}
              type="button"
            >
              <Send size={16} />
              Copy follow-up
            </button>
          </div>

          <div className="resume-preview">
            <strong>Checklist</strong>
            <ul className="micro-list">
              {kit.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
