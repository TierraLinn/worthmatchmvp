import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SectionHeading } from "../components/SectionHeading";
import { useWorthMatch } from "../context/WorthMatchContext";
import { translateProfile } from "../lib/translator";
import type { IncomeSpeed, UserProfile, WorkMode } from "../types";

const steps = ["Profile", "Hidden strengths", "Work preferences", "Review"];

const stepValidationMessages = [
  "Add name, location, headline, and desired roles to continue.",
  "Describe strengths, help requests, and experience notes to continue.",
  "Choose at least one work mode and add your availability to continue.",
  "Review the translated profile, then generate the dashboard.",
];

export function OnboardingPage() {
  const { demoPersonas, profile, completeOnboarding } = useWorthMatch();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const previewInsight = translateProfile(draft);
  const stepValidity = [
    [draft.name, draft.location, draft.headline, draft.desiredRoles].every((value) =>
      value.trim().length > 0,
    ),
    [draft.strengths, draft.helpRequests, draft.experienceNotes].every((value) =>
      value.trim().length > 0,
    ),
    draft.workModes.length > 0 && draft.availability.trim().length > 0,
    true,
  ];
  const currentStepValid = stepValidity[step];
  const canSubmit = stepValidity.slice(0, 3).every(Boolean);

  function updateField<K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function loadPersonaPreset(personaId: string) {
    const selectedPersona = demoPersonas.find((persona) => persona.id === personaId);

    if (!selectedPersona) {
      return;
    }

    setDraft(selectedPersona.profile);
  }

  function toggleWorkMode(mode: WorkMode) {
    setDraft((current) => ({
      ...current,
      workModes: current.workModes.includes(mode)
        ? current.workModes.filter((item) => item !== mode)
        : [...current.workModes, mode],
    }));
  }

  function submit() {
    startTransition(() => {
      completeOnboarding(draft);
      navigate("/dashboard");
    });
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
        action={<span className="meta-pill">Step {step + 1} of 4</span>}
        body="This wizard keeps the copy human. WorthMatch translates plain language into job titles, service offers, keywords, and ranked opportunities."
        eyebrow="Onboarding wizard"
        title="Describe what you are already good at."
      />

      <div className="wizard">
        <aside className="wizard__rail">
          {steps.map((label, index) => (
            <button
              key={label}
              className={
                index === step ? "wizard-step wizard-step--active" : "wizard-step"
              }
              onClick={() => setStep(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
            </button>
          ))}
        </aside>

        <div className="wizard__panel">
          {step === 0 ? (
            <div className="stack">
              <div className="field-group">
                <span>Need a quick starting point?</span>
                <div className="persona-grid persona-grid--compact">
                  {demoPersonas.map((persona) => (
                    <button
                      key={persona.id}
                      className="persona-card persona-card--interactive"
                      onClick={() => loadPersonaPreset(persona.id)}
                      type="button"
                    >
                      <div className="persona-card__header">
                        <div>
                          <span className="eyebrow">{persona.label}</span>
                          <h3>{persona.audience}</h3>
                        </div>
                      </div>
                      <p>{persona.pitch}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <label className="field-group">
                  <span>Name</span>
                  <input
                    className="field"
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your name"
                    value={draft.name}
                  />
                </label>
                <label className="field-group">
                  <span>Location</span>
                  <input
                    className="field"
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="City, State"
                    value={draft.location}
                  />
                </label>
              </div>

              <label className="field-group">
                <span>Professional headline</span>
                <input
                  className="field"
                  onChange={(event) => updateField("headline", event.target.value)}
                  placeholder="Reliable organizer who turns messy tasks into calm momentum"
                  value={draft.headline}
                />
              </label>

              <label className="field-group">
                <span>What work are you aiming for?</span>
                <textarea
                  className="field"
                  onChange={(event) => updateField("desiredRoles", event.target.value)}
                  placeholder="Customer support, operations coordinator, tutoring, local service work..."
                  rows={4}
                  value={draft.desiredRoles}
                />
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack">
              <label className="field-group">
                <span>What are you naturally good at?</span>
                <textarea
                  className="field"
                  onChange={(event) => updateField("strengths", event.target.value)}
                  placeholder="I calm people down, explain things clearly, organize details, and follow through."
                  rows={4}
                  value={draft.strengths}
                />
              </label>
              <label className="field-group">
                <span>What do people ask you for help with?</span>
                <textarea
                  className="field"
                  onChange={(event) => updateField("helpRequests", event.target.value)}
                  placeholder="People ask me to edit emails, plan schedules, tutor, troubleshoot tech, and keep projects moving."
                  rows={4}
                  value={draft.helpRequests}
                />
              </label>
              <label className="field-group">
                <span>Describe your experience, even if it feels informal.</span>
                <textarea
                  className="field"
                  onChange={(event) =>
                    updateField("experienceNotes", event.target.value)
                  }
                  placeholder="Include volunteer work, caregiving, student leadership, side gigs, or informal responsibilities."
                  rows={4}
                  value={draft.experienceNotes}
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="stack">
              <div className="field-group">
                <span>Where do you want to work?</span>
                <div className="tag-row">
                  {(["remote", "hybrid", "local"] as WorkMode[]).map((mode) => (
                    <button
                      key={mode}
                      className={
                        draft.workModes.includes(mode)
                          ? "tag tag--interactive tag--active"
                          : "tag tag--interactive"
                      }
                      onClick={() => toggleWorkMode(mode)}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <label className="field-group">
                <span>How fast do you need income?</span>
                <div className="choice-grid">
                  {([
                    ["now", "Need income quickly"],
                    ["this-month", "Want traction this month"],
                    ["flexible", "Flexible timeline"],
                  ] as [IncomeSpeed, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      className={
                        draft.incomeSpeed === value
                          ? "choice-card choice-card--active"
                          : "choice-card"
                      }
                      onClick={() => updateField("incomeSpeed", value)}
                      type="button"
                    >
                      <strong>{label}</strong>
                    </button>
                  ))}
                </div>
              </label>

              <label className="field-group">
                <span>Availability</span>
                <input
                  className="field"
                  onChange={(event) => updateField("availability", event.target.value)}
                  placeholder="20 hours a week, evenings, can start next week"
                  value={draft.availability}
                />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="review-grid">
              <div className="review-panel">
                <span className="eyebrow">Skill translator preview</span>
                <h3>Marketable skills</h3>
                <div className="tag-row">
                  {previewInsight.marketableSkills.map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
                <h3>Possible job titles</h3>
                <ul className="micro-list">
                  {previewInsight.jobTitles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </div>

              <div className="review-panel">
                <span className="eyebrow">WorthMatch positioning</span>
                <p className="review-panel__lead">
                  {previewInsight.positioningSummary}
                </p>
                <h3>Freelance / local service ideas</h3>
                <ul className="micro-list">
                  {previewInsight.serviceOffers.map((offer) => (
                    <li key={offer}>{offer}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <p className="status-note">
            {currentStepValid
              ? step === 3
                ? "WorthMatch is ready to generate the dashboard from this profile."
                : "This step is complete enough to move forward."
              : stepValidationMessages[step]}
          </p>

          <div className="wizard__actions">
            <button
              className="button button--ghost"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {step < steps.length - 1 ? (
              <button
                className="button"
                disabled={!currentStepValid}
                onClick={() =>
                  setStep((current) => Math.min(steps.length - 1, current + 1))
                }
                type="button"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button"
                disabled={isPending || !canSubmit}
                onClick={submit}
                type="button"
              >
                {isPending ? "Building dashboard..." : "Generate WorthMatch dashboard"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
