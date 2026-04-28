import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  FileUp,
  RefreshCcw,
  Settings2,
  UserRoundPen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { copyText, downloadTextFile } from "../lib/resume";

export function WorkspacePage() {
  const {
    exportWorkspace,
    hasCompletedOnboarding,
    importedMatches,
    insight,
    matches,
    profile,
    resetWorkspace,
    restoreWorkspace,
    savedOpportunityIds,
    startFreshWorkspace,
    trackedOpportunities,
  } = useWorthMatch();
  const [restoreInput, setRestoreInput] = useState("");
  const [status, setStatus] = useState(
    "Back up your workspace, restore it on this device, or start with a blank profile.",
  );
  const navigate = useNavigate();

  const snapshot = exportWorkspace();

  async function handleCopyBackup() {
    await copyText(snapshot);
    setStatus("Workspace backup copied to clipboard.");
  }

  async function handleFileRestore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const content = await file.text();
    const restored = restoreWorkspace(content);
    setStatus(
      restored
        ? "Workspace restored from uploaded backup."
        : "Backup could not be restored. Check that the file came from WorthMatch.",
    );
    event.target.value = "";
  }

  function handlePasteRestore() {
    const restored = restoreWorkspace(restoreInput);
    setStatus(
      restored
        ? "Workspace restored from pasted backup."
        : "Backup could not be restored. Check that the pasted JSON is complete.",
    );
  }

  function handleStartFresh() {
    startFreshWorkspace();
    navigate("/onboarding");
  }

  function handleResetDemo() {
    resetWorkspace();
    setRestoreInput("");
    setStatus("Workspace reset to the default seeded demo state.");
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
          <Link className="button button--secondary" to="/onboarding">
            <UserRoundPen size={16} />
            Edit profile
          </Link>
        }
        body="Manage the real user workspace: update the profile, back up local data, restore a saved session, or start from a blank onboarding flow."
        eyebrow="Workspace"
        title="Own the data and keep WorthMatch usable beyond the demo."
      />

      <div className="summary-strip summary-strip--compact">
        <article className="summary-card">
          <strong>{matches.length}</strong>
          <span>ranked opportunities</span>
        </article>
        <article className="summary-card">
          <strong>{importedMatches.length}</strong>
          <span>imported leads</span>
        </article>
        <article className="summary-card">
          <strong>{trackedOpportunities.length}</strong>
          <span>tracked opportunities</span>
        </article>
        <article className="summary-card">
          <strong>{savedOpportunityIds.length}</strong>
          <span>saved comparisons</span>
        </article>
      </div>

      <div className="resume-layout workspace-layout">
        <section className="stack">
          <section className="panel">
            <div className="panel__heading">
              <div>
                <span className="eyebrow">Profile status</span>
                <h3>
                  {hasCompletedOnboarding && profile.name.trim()
                    ? profile.name
                    : "Profile still needs personal input"}
                </h3>
              </div>
              <Settings2 size={18} />
            </div>

            <p>
              {hasCompletedOnboarding
                ? `${profile.headline || "Your profile is active."} Based in ${profile.location || "your chosen location"} with ${profile.workModes.join(", ")} preferences.`
                : "The app can already be explored, but onboarding should be completed with real user details before final use."}
            </p>

            <div className="workbench-grid">
              <article className="workbench-card">
                <strong>Current goals</strong>
                <p>{profile.desiredRoles || "Add desired roles in onboarding to sharpen matching."}</p>
              </article>
              <article className="workbench-card">
                <strong>Top translated strengths</strong>
                <div className="tag-row">
                  {insight.marketableSkills.slice(0, 6).map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            </div>

            <div className="resume-toolbar__actions">
              <Link className="button" to="/onboarding">
                <UserRoundPen size={16} />
                Edit onboarding profile
              </Link>
              <button className="button button--secondary" onClick={handleStartFresh} type="button">
                <RefreshCcw size={16} />
                Start fresh onboarding
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel__heading">
              <div>
                <span className="eyebrow">Backup and restore</span>
                <h3>Move this workspace or keep a safety copy before submission.</h3>
              </div>
              <Download size={18} />
            </div>

            <div className="resume-toolbar__actions">
              <button
                className="button button--secondary"
                onClick={() =>
                  downloadTextFile("worthmatch-workspace-backup.json", snapshot)
                }
                type="button"
              >
                <Download size={16} />
                Download backup
              </button>
              <button className="button" onClick={handleCopyBackup} type="button">
                <Copy size={16} />
                Copy backup JSON
              </button>
            </div>

            <label className="upload-dropzone">
              <input accept=".json" onChange={handleFileRestore} type="file" />
              <FileUp size={20} />
              <div>
                <strong>Restore from backup file</strong>
                <span>Upload a previously exported WorthMatch JSON snapshot.</span>
              </div>
            </label>

            <label className="field-group">
              <span>Or paste a workspace snapshot</span>
              <textarea
                className="field"
                onChange={(event) => setRestoreInput(event.target.value)}
                placeholder="Paste exported WorthMatch JSON here"
                rows={8}
                value={restoreInput}
              />
            </label>

            <div className="resume-toolbar__actions">
              <button
                className="button button--secondary"
                onClick={handlePasteRestore}
                type="button"
              >
                Restore pasted backup
              </button>
            </div>
          </section>
        </section>

        <aside className="panel panel--sidebar">
          <span className="eyebrow">Workspace controls</span>
          <h3>Local-first controls for real use</h3>

          <div className="resume-preview">
            <strong>What persists</strong>
            <ul className="micro-list">
              <li>Profile and onboarding answers</li>
              <li>Imported leads and saved comparisons</li>
              <li>Tracker notes, stages, and due labels</li>
              <li>Resume edits and targeted drafts</li>
            </ul>
          </div>

          <div className="resume-preview">
            <strong>Quick reset options</strong>
            <div className="stack">
              <button className="button button--ghost" onClick={handleStartFresh} type="button">
                Start blank onboarding
              </button>
              <button className="button button--ghost" onClick={handleResetDemo} type="button">
                Restore seeded demo
              </button>
            </div>
          </div>

          <div className="resume-preview">
            <strong>Best next move</strong>
            <p>
              Finish onboarding with the real user profile, then use intake,
              opportunities, resume, and tracker as the main operational loop.
            </p>
            <Link className="button button--ghost" to="/dashboard">
              Back to dashboard
            </Link>
          </div>

          <p className="status-note">{status}</p>
        </aside>
      </div>
    </motion.div>
  );
}
