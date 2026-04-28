import type { MatchResult } from "../types";

const scoreRows = [
  { key: "skillFit", label: "Skill fit" },
  { key: "preferenceFit", label: "Remote / local fit" },
  { key: "payPotential", label: "Pay potential" },
  { key: "urgency", label: "Urgency" },
  { key: "experienceFit", label: "Experience match" },
] as const;

interface MatchBreakdownProps {
  match: MatchResult;
}

export function MatchBreakdown({ match }: MatchBreakdownProps) {
  return (
    <div className="score-breakdown">
      {scoreRows.map((row) => (
        <div key={row.key} className="score-breakdown__row">
          <div>
            <span>{row.label}</span>
            <strong>{match[row.key]}</strong>
          </div>
          <div className="score-breakdown__track">
            <span style={{ width: `${match[row.key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
