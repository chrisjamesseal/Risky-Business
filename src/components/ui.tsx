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
  Ongoing: "⏳",
  "Group Round": "🎉",
};

export const CATEGORY_SHORT: Record<Category, string> = {
  Truth: "Truth",
  Dare: "Dare",
  Challenge: "Chal",
  "Mini Game": "Mini",
  Ongoing: "Ongoing",
  "Group Round": "Group",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  Truth: "var(--cyan)",
  Dare: "var(--pink)",
  Challenge: "var(--yellow)",
  "Mini Game": "var(--green)",
  Ongoing: "var(--orange)",
  "Group Round": "var(--purple)",
};

export const CATEGORY_DESCRIPTION: Record<Category, string> = {
  Truth: "Answer honestly for the points, or bottle it for none.",
  Dare: "Do it right now to bank the points.",
  Challenge: "A quick skill or feat to pull off on the spot.",
  "Mini Game": "A group game with a winner — play it, then pick who won for the points.",
  Ongoing: "Keep a task going until your next turn — the group checks then.",
  "Group Round": "A random game or question with no winner. Just for fun, no points.",
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
