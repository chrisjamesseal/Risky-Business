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
  t("truth-04", "Read out the last thing you searched on your phone... in your private browser.", "Medium", "All"),
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
  t("truth-16", "What is your go-to karaoke song?", "Easy", "All"),

  // -------------------------------------------------------------- Dares
  d("dare-01", "Give every player a unique compliment.", "Easy", "All"),
  d("dare-02", "Let the player on your left send a message from your phone to anyone they want.", "Hard", "All"),
  d("dare-03", "Let the player on your right post a photo to your story with a caption of their choice.", "Hard", "All"),
  d("dare-04", "Do an impression of another player until someone guesses who.", "Medium", "All"),
  d("dare-05", "You are now mute until your next turn.", "Hard", "All"),
  d("dare-06", "Cheers with a stranger nearby.", "Hard", "Pub"),
  d("dare-07", "Bust out a 15 second dance on the spot.", "Hard", "All"),
  d("dare-08", "Start a wave and get at least two strangers to join.", "Hard", "Club/Festival"),
  d("dare-09", "Walk a runway across the room like a supermodel.", "Medium", "Home"),
  d("dare-10", "Do a mini trust lean into a willing player's hands.", "Hard", "All"),
  d("dare-11", "Take the ugliest selfie you can and show the group.", "Medium", "All"),
  d("dare-12", "Do your best lion roar. The cringier the better.", "Easy", "All"),

  // -------------------------------------------------------------- Tasks
  k("task-01", "Speak in a fake accent until your next turn.", "Medium", "All"),
  k("task-02", "Freeze like a statue until your next round. Your mouth can still move though.", "Hard", "All"),
  k("task-03", "Speak like Donald Trump until your next turn.", "Medium", "All"),
  k("task-04", "Wink at a player without anyone else noticing - keep it secret.", "Hard", "All"),

  // -------------------------------------------------------------- Challenges
  c("chal-01", "Say \"Red lorry, yellow lorry\" five times fast.", "Easy", "All"),
  c("chal-02", "Hold a plank while the group counts to 20.", "Medium", "All"),
  c("chal-03", "Talk without showing your teeth for one minute.", "Hard", "All"),
  c("chal-04", `Flip and catch a beer mat against ${"{opponent}"}. First to 3 wins.`, "Medium", "Pub"),
  c("chal-05", "List 10 animals in a single breath.", "Medium", "All"),
  c("chal-06", "Rap four lines about the person to your left.", "Medium", "All"),
  c("chal-07", "Keep a straight face while the group tries to make you laugh for 30 seconds.", "Medium", "All"),
  c("chal-08", "Spell \"onomatopoeia\" correctly out loud.", "Medium", "All"),
  c("chal-09", "Land a coaster onto an empty glass at least 3 feet away. 5 attempts.", "Medium", "Pub"),
  c("chal-10", "Do a staring contest against a player of your choice.", "Easy", "All"),
  c("chal-11", "Put fingers in your ears. The group thinks of a country. Guess it within 20 questions to win.", "Medium", "All"),
  c("chal-12", "Answer a brutal \"Would You Rather\" from the group.", "Hard", "All"),

  // -------------------------------------------------------------- Mini Games (no points, just for fun)
  m("mini-01", "Choose a Never Have I Ever question. Everyone reveals with hands up.", "Easy", "All"),
  m("mini-02", "Last player to get their feet off the floor loses a point.", "Easy", "Home"),
  m("mini-03", "Make the longest word possible from seven random letters in 30 seconds.", "Hard", "All"),

  // -------------------------------------------------------------- Group (no points, just for fun)
  g("group-01", "Name a category. Everyone names something for that category starting with A. Players are knocked out if they don't give an answer in 5 seconds.", "Hard", "All"),
  g("group-02", "Choose a category and say how many things you can name in that category. Next person either calls a lie or says that they can name more. When someone is called out, they try, with 2 seconds allowed per answer.", "Medium", "All"),
  g("group-03", "Take turns saying words that rhyme. Player knocked out if they can't think of anything within 5 seconds. Choose new words until there is a winner.", "Medium", "All"),
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
function c(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Challenge", description, difficulty, location);
}
function k(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Task", description, difficulty, location);
}
function m(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Mini Game", description, difficulty, location);
}
function g(id: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Group", description, difficulty, location);
}
