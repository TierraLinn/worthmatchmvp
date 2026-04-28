import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  FileText,
  Printer,
  RotateCcw,
} from "lucide-react";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import {
  buildApplicationKit,
  copyText,
  downloadTextFile,
  openPrintableResume,
} from "../lib/resume";
import type { ResumeDraftField } from "../types";

type EditableTab = ResumeDraftField | "quickAnswers";

const tabLabels: Record<EditableTab, string> = {
  masterResume: "Master resume",
  targetedResume: "Targeted resume",
  coverLetter: "Cover letter",
  shortBio: "Short bio",
  quickAnswers: "Quick apply",
};

export function ResumeStudioPage() {
  const {
    artifacts,
    insight,
    matches,
    profile,
    selectedOpportunityId,
    selectOpportunity,
    trackedOpportunities,
    updateResumeDraft,
    resetResumeDraft,
  } = useWorthMatch();
  const [activeTab, setActiveTab] = useState<EditableTab>("targetedResume");
  const [status, setStatus] = useState(
    "PDF, plain text, and copyable outputs are ready.",
  );

  const selectedMatch =
    matches.find((match) => match.id === selectedOpportunityId) ?? matches[0];
  const trackedOpportunity = trackedOpportunities.find(
    (item) => item.opportunityId === selectedMatch?.id,
  );

  async function handleCopy(content: string, label: string) {
    await copyText(content);
    setStatus(`${label} copied to clipboard.`);
  }

  function activeDocument() {
    if (activeTab === "quickAnswers") {
      return artifacts.quickAnswers
        .map((item) => `${item.question}\n${item.answer}`)
        .join("\n\n");
    }

    return artifacts[activeTab];
  }

  function activeDocumentLabel() {
    return activeTab === "quickAnswers" ? "Quick apply answers" : tabLabels[activeTab];
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
        body="Edit the generated materials, switch target opportunities, then export a PDF-friendly resume, plain text version, and copy-ready application copy."
        eyebrow="Resume studio"
        title="Professional materials with targeted quick-apply output."
      />

      <div className="resume-layout">
        <section className="panel">
          <div className="resume-toolbar">
            <label className="field-group">
              <span>Targeted opportunity</span>
              <select
                className="field"
                onChange={(event) => selectOpportunity(event.target.value)}
                value={selectedMatch?.id}
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
                  openPrintableResume(
                    `WorthMatch ${activeDocumentLabel()}`,
                    activeDocument(),
                  )
                }
                type="button"
              >
                <Printer size={16} />
                Print active PDF
              </button>
              <button
                className="button button--secondary"
                onClick={() =>
                  downloadTextFile(
                    `worthmatch-${activeDocumentLabel()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}.txt`,
                    activeDocument(),
                  )
                }
                type="button"
              >
                <Download size={16} />
                Download text
              </button>
              <button
                className="button button--secondary"
                onClick={() =>
                  downloadTextFile(
                    "worthmatch-application-kit.txt",
                    buildApplicationKit(
                      profile,
                      insight,
                      artifacts,
                      selectedMatch,
                      trackedOpportunity,
                    ),
                  )
                }
                type="button"
              >
                <Download size={16} />
                Download apply kit
              </button>
              <button
                className="button"
                onClick={() => handleCopy(activeDocument(), tabLabels[activeTab])}
                type="button"
              >
                <Copy size={16} />
                Copy active tab
              </button>
              {activeTab !== "quickAnswers" ? (
                <button
                  className="button button--ghost"
                  onClick={() => resetResumeDraft(activeTab)}
                  type="button"
                >
                  <RotateCcw size={16} />
                  Reset active draft
                </button>
              ) : null}
            </div>
          </div>

          <div className="segment-control">
            {(Object.keys(tabLabels) as EditableTab[]).map((tab) => (
              <button
                key={tab}
                className={
                  activeTab === tab
                    ? "segment-control__item segment-control__item--active"
                    : "segment-control__item"
                }
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {activeTab !== "quickAnswers" ? (
            <textarea
              className="editor-surface"
              onChange={(event) => updateResumeDraft(activeTab, event.target.value)}
              rows={26}
              value={artifacts[activeTab]}
            />
          ) : (
            <div className="quick-answer-stack">
              {artifacts.quickAnswers.map((item) => (
                <article key={item.question} className="quick-answer-card">
                  <strong>{item.question}</strong>
                  <p>{item.answer}</p>
                  <button
                    className="button button--ghost"
                    onClick={() => handleCopy(item.answer, item.question)}
                    type="button"
                  >
                    <Copy size={16} />
                    Copy answer
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">Selected opportunity</span>
          <h3>{selectedMatch.title}</h3>
          <p>{selectedMatch.summary}</p>

          <div className="tag-row">
            {selectedMatch.skills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>

          <div className="resume-preview">
            <strong>Short bio</strong>
            <p>{artifacts.shortBio}</p>
            <button
              className="button button--ghost"
              onClick={() => handleCopy(artifacts.shortBio, "Short bio")}
              type="button"
            >
              <FileText size={16} />
              Copy short bio
            </button>
          </div>

          <div className="resume-preview">
            <strong>Application kit</strong>
            <p>
              Bundles the targeted resume, cover letter, outreach copy, quick
              answers, and current next step into one text export.
            </p>
            <button
              className="button button--ghost"
              onClick={() =>
                handleCopy(
                  buildApplicationKit(
                    profile,
                    insight,
                    artifacts,
                    selectedMatch,
                    trackedOpportunity,
                  ),
                  "Application kit",
                )
              }
              type="button"
            >
              <Copy size={16} />
              Copy application kit
            </button>
          </div>

          <p className="status-note">{status}</p>
        </aside>
      </div>
    </motion.div>
  );
}
