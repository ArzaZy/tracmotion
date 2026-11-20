import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "muted" | "accent";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "secondary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...props} />;
}

export function PageHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <div className="placeholder-note" role="note">
      <Badge tone="accent">Placeholder</Badge>
      <p>{children}</p>
    </div>
  );
}
