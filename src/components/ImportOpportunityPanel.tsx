import { useState, type ChangeEvent } from "react";
import { FileUp, Link2, NotebookPen, PlusCircle, WandSparkles } from "lucide-react";

import { useWorthMatch } from "../context/WorthMatchContext";

const modes = [
  { id: "paste", label: "Paste text", icon: NotebookPen },
  { id: "link", label: "Import link", icon: Link2 },
  { id: "upload", label: "Upload asset", icon: FileUp },
  { id: "manual", label: "Save card", icon: PlusCircle },
] as const;

type ModeId = (typeof modes)[number]["id"];

export function ImportOpportunityPanel() {
  const { importOpportunity } = useWorthMatch();
  const [mode, setMode] = useState<ModeId>("paste");
  const [textInput, setTextInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualOrg, setManualOrg] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualPay, setManualPay] = useState("");
  const [manualSummary, setManualSummary] = useState("");
  const [status, setStatus] = useState("Ready for pasted descriptions, imported links, screenshots, and saved leads.");

  function handlePasteSubmit() {
    if (!textInput.trim()) {
      return;
    }

    importOpportunity({
      mode: "paste",
      content: textInput.trim(),
      extra: "Imported from pasted job description or community board copy.",
    });
    setTextInput("");
    setStatus("Pasted description turned into a ranked opportunity.");
  }

  function handleLinkSubmit() {
    if (!linkInput.trim()) {
      return;
    }

    importOpportunity({
      mode: "link",
      content: linkInput.trim(),
      extra: "Imported from a user-supplied listing URL.",
    });
    setLinkInput("");
    setStatus("Link imported without scraping the destination platform.");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    importOpportunity({
      mode: "upload",
      content: file.name,
      extra: `Uploaded ${file.type || "asset"} for later OCR / parser review.`,
    });
    setStatus(`Created an imported opportunity card from ${file.name}.`);
    event.target.value = "";
  }

  function handleManualSave() {
    if (!manualTitle.trim() || !manualOrg.trim()) {
      return;
    }

    importOpportunity({
      mode: "manual",
      content: JSON.stringify({
        title: manualTitle.trim(),
        organization: manualOrg.trim(),
        location: manualLocation.trim(),
        pay: manualPay.trim(),
        summary: manualSummary.trim(),
      }),
      extra: manualSummary.trim() || `${manualTitle.trim()} manually saved for follow-up.`,
    });

    setManualTitle("");
    setManualOrg("");
    setManualLocation("");
    setManualPay("");
    setManualSummary("");
    setStatus("Saved opportunity card added to the matching queue.");
  }

  return (
    <section className="import-panel">
      <div className="import-panel__header">
        <div>
          <span className="eyebrow">Approved intake</span>
          <h3>Import opportunities without risky scraping</h3>
        </div>
        <div className="meta-pill">
          <WandSparkles size={16} />
          Connector-ready
        </div>
      </div>

      <div className="segment-control">
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={mode === item.id ? "segment-control__item segment-control__item--active" : "segment-control__item"}
              onClick={() => setMode(item.id)}
              type="button"
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {mode === "paste" ? (
        <div className="stack">
          <textarea
            className="field"
            onChange={(event) => setTextInput(event.target.value)}
            placeholder="Paste a job description, Craigslist post, community board listing, or copied opportunity text."
            rows={7}
            value={textInput}
          />
          <button className="button" onClick={handlePasteSubmit} type="button">
            Translate description
          </button>
        </div>
      ) : null}

      {mode === "link" ? (
        <div className="stack">
          <input
            className="field"
            onChange={(event) => setLinkInput(event.target.value)}
            placeholder="Paste an approved or user-supplied listing URL"
            type="url"
            value={linkInput}
          />
          <button className="button" onClick={handleLinkSubmit} type="button">
            Import link
          </button>
        </div>
      ) : null}

      {mode === "upload" ? (
        <label className="upload-dropzone">
          <input accept=".pdf,image/*" onChange={handleUpload} type="file" />
          <FileUp size={20} />
          <div>
            <strong>Upload a screenshot or PDF</strong>
            <span>WorthMatch creates a parser-ready opportunity card now and keeps room for deeper extraction later.</span>
          </div>
        </label>
      ) : null}

      {mode === "manual" ? (
        <div className="stack">
          <input
            className="field"
            onChange={(event) => setManualTitle(event.target.value)}
            placeholder="Opportunity title"
            value={manualTitle}
          />
          <input
            className="field"
            onChange={(event) => setManualOrg(event.target.value)}
            placeholder="Organization or client"
            value={manualOrg}
          />
          <div className="field-row">
            <input
              className="field"
              onChange={(event) => setManualLocation(event.target.value)}
              placeholder="Location"
              value={manualLocation}
            />
            <input
              className="field"
              onChange={(event) => setManualPay(event.target.value)}
              placeholder="Pay or project estimate"
              value={manualPay}
            />
          </div>
          <textarea
            className="field"
            onChange={(event) => setManualSummary(event.target.value)}
            placeholder="Why this lead matters"
            rows={4}
            value={manualSummary}
          />
          <button className="button" onClick={handleManualSave} type="button">
            Save opportunity card
          </button>
        </div>
      ) : null}

      <p className="status-note">{status}</p>
    </section>
  );
}
