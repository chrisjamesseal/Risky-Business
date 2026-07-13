import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Category, Difficulty } from "../types";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "warn"
  | "danger"
  | "ghost"
  | "default";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  large?: boolean;
}

export function Button({
  variant = "default",
  block,
  large,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    variant !== "default" ? `btn--${variant}` : "",
    block ? "btn--block" : "",
    large ? "btn--lg" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`diff-badge diff-${difficulty}`}>{difficulty}</span>;
}

export const CATEGORY_ICON: Record<Category, string> = {
  Truth: "💬",
  Dare: "🔥",
  Challenge: "🎯",
  "Mini Game": "🕹️",
  "Chaos Event": "💥",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  Truth: "var(--cyan)",
  Dare: "var(--pink)",
  Challenge: "var(--yellow)",
  "Mini Game": "var(--green)",
  "Chaos Event": "var(--pink)",
};

export function Toast({
  message,
  error,
}: {
  message: ReactNode;
  error?: boolean;
}) {
  return <div className={`toast${error ? " toast--error" : ""}`}>{message}</div>;
}
