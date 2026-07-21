export const APP_VERSION = "2.6.0";

export interface ChangelogEntry {
  version: string;
  title: string;
  changes: string[];
}

// Newest first. Shown on the Changelog screen (reached by tapping the version).
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.6.0",
    title: "A real app icon",
    changes: [
      "Added a proper app icon and favicon: a pixel-block R in the homepage logo's pink/cyan/black style on a dark background",
      "Added an apple-touch-icon and web app manifest so Risk It can be added to your home screen with the new icon",
    ],
  },
  {
    version: "2.5.0",
    title: "Card sync & rounds tweak",
    changes: [
      "Synced the default card library with the latest set: refreshed Truth/Dare/Task wording, new Secret category for covert tasks",
      "1v1 and Group now ship with zero default cards for now; add your own any time in the Card Editor",
      "Rounds chips now just show the number; the time estimate is a single summary line below",
    ],
  },
  {
    version: "2.4.0",
    title: "Editor polish & UX review",
    changes: [
      "Reset to Default now uses a clearer icon",
      "Category description is now a full-size box instead of a cramped single line",
      "Fixed the category icon field cutting off some emoji",
      "The in-game location switcher now uses a clearer tap-to-change icon",
      "Replaced the last plain arrows with real emoji for consistency",
      "Setup now warns immediately in red if no cards match your location and difficulty, instead of waiting until you hit Start",
      "Disabled buttons (like removing a player below the minimum) now actually look disabled",
    ],
  },
  {
    version: "2.3.0",
    title: "Longer games & editor tweaks",
    changes: [
      "Rounds options are now 3, 5 or 10 per player (default 5), each with an average time estimate",
      "Task durations are now round-based (1, 2, 3 rounds, or Next round) instead of minutes",
      "Difficulty picker in setup is now just Easy/Medium/Hard, no clutter",
      "Back and cancel buttons no longer sit in a boxed background",
      "Card Editor search has a clear button to reset back to the category view",
      "The Card Editor's card preview now shows location (and duration, for Task cards) so you can see every custom setting while editing",
    ],
  },
  {
    version: "2.2.0",
    title: "Rounds, locations & polish",
    changes: [
      "Pick 1, 3 or 5 scoring cards per player at setup, with a rough time estimate for each",
      "Change location mid game (e.g. you head home) without losing scores",
      "Renamed locations: Home is now At Home, Pub is Pub Trip, Club/Festival is Night Out, each with its own emoji",
      "Task cards now have a duration so you know how long to keep it up",
      "Fixed {opponent} not resolving to a real player's name in some cases",
      "Search cards by text in the Card Editor across every category",
      "Swapped icons for genuine emoji throughout: 2️⃣ for Double Points, 🔁 for Swap",
      "Leaderboard now shows x1 or x0 next to each power-up",
      "Reveal Card now sits above Double Points so it's the clear next step",
      "Renamed Done to Complete and Fail to Failed, both shown in colour",
      "Fixed Drink Mode showing its own name twice in setup; drinks now show as a x2 style count",
      "The browser back button now steps back one screen instead of leaving the app",
      "Mini Game's winner prompt is now a bold WHO WON? instead of small print",
      "Removed remaining long dashes and tightened up copy across the app",
    ],
  },
  {
    version: "2.1.0",
    title: "1v1 category & layout fixes",
    changes: [
      "New 1v1 category replaces Challenge: face off against another player, only you can win the points, and if you lose nobody scores",
      "Card editor: Edit Category and New Category are now proper buttons",
      "Card editor category tabs use a fixed 3-column layout so labels like 'Mini Game' always fit",
      "Synced the latest card updates and fixed a broken opponent-name token on one card",
    ],
  },
  {
    version: "2.0.0",
    title: "Full card refresh",
    changes: [
      "Brand new card set with updated wording throughout",
      "Cards no longer have a title, your name shows on the card instead, so every card reads like it's talking to you",
      "Difficulty is now fully random each game instead of ramping up, so you can't save your ×2 for a guaranteed big card",
      "Removed the Extreme difficulty; those cards moved to Hard",
      "Difficulty pickers are now colour-coded across the whole button (green Easy, cyan Medium, yellow Hard)",
      "Mini Game is now a no-points, just-for-fun category (like Group); the old winner-picking mechanic is still available for custom categories",
      "Renamed Ongoing to Task and Group Round to Group",
      "Some challenge cards can name a random other player automatically",
      "Swapping a card now cancels an armed ×2; the button warns you before you tap it",
      "Added a power-up icon to ×2 Double Points",
    ],
  },
  {
    version: "1.10.0",
    title: "Auto-updating cards & polish",
    changes: [
      "The default questions now update automatically when the app updates, unless you've customised your own cards",
      "Difficulty colour codes (green Easy, cyan Medium, yellow Hard, pink Extreme) on the difficulty pickers",
      "Swap now costs 50 points (was 100)",
      "×2 Double Points is now an outlined button; removed the long dashes across the app",
    ],
  },
  {
    version: "1.9.0",
    title: "Lifeline tweaks",
    changes: [
      "Swapping a card now costs 100 points",
      "The leaderboard shows each player's ×2 and 🔄 lifelines and whether they're used",
      "×2 Double Points is now a big button on the pass-the-phone screen; Swap sits under Complete/Fail",
    ],
  },
  {
    version: "1.8.0",
    title: "Custom categories",
    changes: [
      "Create your own card categories and delete ones you don't want in the Card Editor",
      "Each category has a behaviour: do-it-now scoring, group game with a winner, ongoing task, or a no-points round",
      "Editing a category updates its cards; deleting one removes its cards",
    ],
  },
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
      "Card Editor and How to Play now live on the home screen; the Settings menu is gone",
      "Drink Mode is set in game setup (off by default) with a clear explanation of the end-of-game drinks",
    ],
  },
  {
    version: "1.5.0",
    title: "Ongoing tasks & tidy-up",
    changes: [
      "New Ongoing category: start a task (e.g. keep an accent), then the group checks 'did you keep it up?' at your next turn and you score",
      "Removed Chaos Events; they relied on effects the game doesn't handle yet",
      "Every category now has a short description in the editor and How to Play",
      "Editor list is cleaner: card emoji removed to make room for the text",
    ],
  },
  {
    version: "1.4.0",
    title: "Double points fixes",
    changes: [
      "The 'Double Trouble' chaos card now really doubles that turn's card; it was only flavour text before",
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
      "New Group Round category: whole-group games and questions that award no points, so cards like Never Have I Ever and Would You Rather aren't forced into pass/fail",
      "Moved the group-only games out of Mini Games and added new question rounds (Hot Seat, Most Likely To, This or That, Group Vote)",
      "Group Rounds and Chaos Events now appear between turns as no-points interludes",
    ],
  },
  {
    version: "1.2.0",
    title: "Balance & Editor",
    changes: [
      "Fairer points: truths now cap at Medium, so the biggest scores come from dares, challenges and mini games",
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
      "Offline party game for 2-8 players",
      "Home, Pub and Club/Festival card pools",
      "Five scoring turns each with a live leaderboard",
      "Swap and Double Points lifelines, Chaos Events and Drink Mode",
      "Card editor with JSON import and export",
    ],
  },
];
