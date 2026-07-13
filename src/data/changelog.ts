export const APP_VERSION = "1.3.1";

export interface ChangelogEntry {
  version: string;
  title: string;
  changes: string[];
}

// Newest first. Shown on the Changelog screen (reached by tapping the version).
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.1",
    title: "Editor tweaks",
    changes: [
      "The description box now grows to fit the whole prompt while you edit, with a character count",
    ],
  },
  {
    version: "1.3.0",
    title: "Group Rounds",
    changes: [
      "New Group Round category — whole-group games and questions that award no points, so cards like Never Have I Ever and Would You Rather aren't forced into pass/fail",
      "Moved the group-only games out of Mini Games and added new question rounds (Hot Seat, Most Likely To, This or That, Group Vote)",
      "Group Rounds and Chaos Events now appear between turns as no-points interludes",
    ],
  },
  {
    version: "1.2.0",
    title: "Balance & Editor",
    changes: [
      "Fairer points — truths now cap at Medium, so the biggest scores come from dares, challenges and mini games",
      "Added higher-difficulty dares, challenges and mini games for every location",
      "Card editor redesigned with a live, in-game style card preview",
      "Tap the version number to see this changelog",
    ],
  },
  {
    version: "1.1.0",
    title: "UX polish",
    changes: [
      "Clear pass-the-phone handoff before each turn",
      "Confirm before quitting so scores aren't lost by accident",
      "Action buttons now show the points at stake",
      "Ties are handled properly on the results screen",
      "Labelled card editor category tabs",
      "Added a How to Play screen",
    ],
  },
  {
    version: "1.0.0",
    title: "Initial release",
    changes: [
      "Offline party game for 2–8 players",
      "Home, Pub and Club/Festival card pools",
      "Five scoring turns each with a live leaderboard",
      "Swap and Double Points lifelines, Chaos Events and Drink Mode",
      "Card editor with JSON import and export",
    ],
  },
];
