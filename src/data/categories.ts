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
    name: "1v1",
    behavior: "duel",
    icon: "🥊",
    color: "var(--red)",
    description:
      "Face off against another player - only you can win the points. Lose, and nobody scores.",
  },
  {
    name: "Task",
    behavior: "ongoing",
    icon: "⏳",
    color: "var(--orange)",
    description:
      "Keep a task going until your next turn - the group checks then.",
  },
  {
    name: "Mini Game",
    behavior: "group",
    icon: "🕹️",
    color: "var(--green)",
    description: "A quick group game or question. Just for fun, no points.",
  },
  {
    name: "Group",
    behavior: "group",
    icon: "🎉",
    color: "var(--purple)",
    description: "A social or knockout group game. Just for fun, no points.",
  },
];
