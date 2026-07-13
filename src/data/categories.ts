import type { CategoryDef } from "../types";

// The starter set of categories. Users can add, edit and remove categories in
// the Card Editor; this is what a fresh install (or "Reset Cards") loads.
export const DEFAULT_CATEGORIES: CategoryDef[] = [
  {
    name: "Truth",
    behavior: "standard",
    icon: "💬",
    color: "var(--cyan)",
    description: "Answer honestly for the points, or bottle it for none.",
  },
  {
    name: "Dare",
    behavior: "standard",
    icon: "🔥",
    color: "var(--pink)",
    description: "Do it right now to bank the points.",
  },
  {
    name: "Challenge",
    behavior: "standard",
    icon: "🎯",
    color: "var(--yellow)",
    description: "A quick skill or feat to pull off on the spot.",
  },
  {
    name: "Mini Game",
    behavior: "mini",
    icon: "🕹️",
    color: "var(--green)",
    description:
      "A group game with a winner — play it, then pick who won for the points.",
  },
  {
    name: "Ongoing",
    behavior: "ongoing",
    icon: "⏳",
    color: "var(--orange)",
    description:
      "Keep a task going until your next turn — the group checks then.",
  },
  {
    name: "Group Round",
    behavior: "group",
    icon: "🎉",
    color: "var(--purple)",
    description: "A random game or question with no winner. Just for fun, no points.",
  },
];
