export const APP_VERSION = "1.7.0";

export interface ChangelogEntry {
  version: string;
  title: string;
  changes: string[];
}

// Newest first. Shown on the Changelog screen (reached by tapping the version).
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.7.0",
    title: "Mini Games with winners",
    changes: [
      "Mini Games are now group games with a winner: play it, then pick who won and they take the points",
      "Group Rounds are only the no-winner games now (Never Have I Ever, Would You Rather…) and still score nothing",
      "The old solo mini-games (Coaster Toss, Countdown, Staring Contest, Beatbox) moved to Challenges",
    ],
  },
  {
    version: "1.6.0",
    title: "Setup & editor overhaul",
    changes: [
      "Pick which difficulties to include in a game at setup (just Easy, just Hard, or any mix) instead of enabling cards one by one",
      "Card editor uses tappable chips instead of dropdowns; removed the Duplicate action",
      "Card Editor and How to Play now live on the home screen — the Settings menu is gone",
      "Drink Mode is set in game setup (off by default) with a clear explanation of the end-of-game drinks",
    ],
  },
  {
    version: "1.5.0",
    title: "Ongoing tasks & tidy-up",
    changes: [
      "New Ongoing category: start a task (e.g. keep an accent), then the group checks 'did you keep it up?' at your next turn and you score",
      "Removed Chaos Events — they relied on effects the game doesn't handle yet",
      "Every category now has a short description in the editor and How to Play",
      "Editor list is cleaner: card emoji removed to make room for the text",
    ],
  },
  {
    version: "1.4.0",
    title: "Double points fixes",
    changes: [
      "The 'Double Trouble' chaos card now really doubles that turn's card — it was only flavour text before",
      "Made the ×2 lifeline clearer: it's a pre-reveal gamble that locks once the card is out",
      "Card editor list now shows each card's full description without opening it",
    ],
  },
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
