import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
