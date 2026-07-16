import type { Card } from "../types";

// The starter card library. Users can edit, add, delete, import and export
// cards from the Card Editor; this set is what a fresh install (or "Reset to
// Default") loads. Cards with location "All" are available in every location.
//
// Cards have no title - the player's name is shown in that spot in-game, so
// every card reads as if it's speaking directly to whoever is up.
//
// A description may include the token "{opponent}", which is replaced at
// reveal time with a random other player's name.

export const DEFAULT_CARDS: Card[] = [
  // -------------------------------------------------------------- Truths
  t("truth-01", "What was your honest first impression of the player to your left?", "Easy", "All"),
  t("truth-02", "Name a song or artist you love but would be embarrassed to admit.", "Easy", "All"),
  t("truth-03", "Read out the last thing you searched on your phone.", "Easy", "All"),
  t("truth-04", "Read out the last thing you searched in your private browser.", "Medium", "All"),
  t("truth-05", "Describe your worst ever date.", "Medium", "All"),
  t("truth-06", "What's a fear you've never told anyone here?", "Medium", "All"),
  t("truth-07", "Tell everyone about the last white lie you told.", "Medium", "All"),
  t("truth-08", "Rank the other players by who you'd trust with your phone unlocked.", "Easy", "All"),
  t("truth-09", "Share a small decision you still regret.", "Easy", "All"),
  t("truth-10", "What is your biggest regret?", "Hard", "All"),
  t("truth-11", "What's the most you've ever spent on a night out?", "Medium", "Pub"),
  t("truth-12", "Have you ever pretended to know a song at a club? Confess.", "Easy", "Club/Festival"),
  t("truth-13", "What's the weirdest story about someone that you know?", "Medium", "Home"),
  t("truth-14", "Tell a story about a festival or gig experience.", "Easy", "All"),
  t("truth-15", "Tell two truths and one lie. Let the group guess the lie.", "Medium", "All"),
  t("truth-16", "What is your go to karaoke song?", "Easy", "All"),
  t("truth-17", "Answer a brutal would you rather question from the group.", "Medium", "All"),

  // -------------------------------------------------------------- Tasks
  k("task-01", "Speak in a fake accent until your next turn.", "Medium", "All"),
  k("task-02", "Freeze like a statue until your next round. Your mouth can still move though.", "Hard", "All"),
  k("task-03", "Speak like Donald Trump until your next turn.", "Medium", "All"),
  k("task-04", "Wink at a player without anyone else noticing.", "Hard", "All"),
  k("task-05", "You are now mute until your next turn.", "Hard", "All"),
  k("task-06", "Talk without showing your teeth for one minute.", "Hard", "All"),

  // -------------------------------------------------------------- Dares
  d("dare-01", "Give every player a unique compliment.", "Easy", "All"),
  d("dare-02", "Let the player on your left send a message from your phone to anyone they want.", "Hard", "All"),
  d("dare-03", "Let the player on your right post a photo to your story with a caption of their choice.", "Hard", "All"),
  d("dare-04", "Do an impression of another player until someone guesses who.", "Medium", "All"),
  d("dare-06", "Cheers with a stranger nearby.", "Hard", "Pub"),
  d("dare-07", "Bust out a 15 second dance on the spot.", "Hard", "All"),
  d("dare-08", "Start a wave and get at least two strangers to join.", "Hard", "Club/Festival"),
  d("dare-09", "Walk a runway across the room like a supermodel.", "Medium", "Home"),
  d("dare-10", "Do a mini trust lean into a willing player's hands.", "Hard", "All"),
  d("dare-12", "Do your best lion roar. The cringier the better.", "Easy", "All"),
  d("chal-06", "Rap four lines about the person to your left.", "Medium", "All"),
  d("chal-07", "Keep a straight face while the group tries to make you laugh for 30 seconds.", "Medium", "All"),
  d("chal-11", "Put fingers in your ears. The group thinks of a country. Guess it within 20 questions to win.", "Medium", "All"),

  // -------------------------------------------------------------- 1v1 (only the reader can score)
  v("dare-11", `You and ${"{opponent}"} take the ugliest selfie you can and show the group.`, "Medium", "All"),
  v("chal-02", `Hold a plank against ${"{opponent}"} to see who can hold it the longest.`, "Medium", "All"),
  v("chal-04", `Flip and catch a beer mat against ${"{opponent}"}. First to 3 wins.`, "Medium", "Pub"),
  v("chal-10", `Do a staring contest against ${"{opponent}"}.`, "Easy", "All"),
  v("chal-13", `Take turns with ${"{opponent}"} saying a word at the same time. Try new words until you say the same one - get it within 5 tries to win.`, "Medium", "All"),

  // -------------------------------------------------------------- Group (no points, just for fun)
  g("chal-09", "Frisbee a coaster so it lands on top of a glass at least 3 feet away. Person who does it quickest wins.", "Medium", "Pub"),
  g("mini-01", "Choose a Never Have I Ever question. Everyone reveals with hands up.", "Easy", "All"),
  g("mini-03", "Make the longest word possible from seven random letters in 30 seconds.", "Hard", "All"),
];

// --- tiny builders to keep the list above readable --------------------------

function make(
  id: string,
  category: Card["category"],
  description: string,
  difficulty: Card["difficulty"],
  location: Card["location"],
): Card {
  return { id, description, category, difficulty, location };
}

function t(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Truth", description, difficulty, location);
}
function d(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Dare", description, difficulty, location);
}
function v(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "1v1", description, difficulty, location);
}
function k(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Task", description, difficulty, location);
}
function g(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Group", description, difficulty, location);
}
