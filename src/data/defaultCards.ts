import type { Card } from "../types";

// The starter card library. Users can edit, add, delete, import and export
// cards from the Card Editor; this set is what a fresh install (or "Reset
// Cards") loads. Cards with location "All" are available in every location.

export const DEFAULT_CARDS: Card[] = [
  // ---------------------------------------------------------------- Truths
  t("truth-01", "First Impression", "What was your honest first impression of the player to your left?", "Easy", "All"),
  t("truth-02", "Guilty Pleasure", "Name a song you love but would be embarrassed to admit.", "Easy", "All"),
  t("truth-03", "Last Search", "Read out the last thing you searched on your phone.", "Medium", "All"),
  t("truth-04", "Worst Date", "Describe your worst ever date in one sentence.", "Medium", "All"),
  t("truth-05", "Secret Talent", "Reveal a talent nobody in this room knows you have.", "Easy", "All"),
  t("truth-06", "Biggest Fear", "What's a fear you've never told anyone here?", "Medium", "All"),
  t("truth-07", "White Lie", "Tell everyone about the last white lie you told.", "Medium", "All"),
  t("truth-08", "Group Ranking", "Rank the other players by who you'd trust with your phone unlocked.", "Medium", "All"),
  t("truth-09", "Regret", "Share a small decision you still regret.", "Medium", "All"),
  t("truth-10", "Pub Confession", "What's the most you've ever spent on a night out?", "Medium", "Pub"),
  t("truth-11", "Dance Floor", "Have you ever pretended to know a song at a club? Confess.", "Easy", "Club/Festival"),
  t("truth-12", "House Rules", "What's the weirdest thing in your home right now?", "Easy", "Home"),
  t("truth-13", "Overshare", "What's a story you tell that always gets exaggerated?", "Medium", "All"),
  t("truth-14", "Two Truths", "Tell two truths and one lie. Let the group guess the lie.", "Medium", "All"),

  // ------------------------------------------------------------------ Dares
  d("dare-02", "Compliment Storm", "Give every player a genuine compliment right now.", "Easy", "All"),
  d("dare-03", "Text Roulette", "Send a single wave emoji to the 5th contact in your phone.", "Medium", "All"),
  d("dare-04", "Statue", "Freeze like a statue for a full 30 seconds.", "Easy", "All"),
  d("dare-05", "Impression", "Do an impression of another player until someone guesses who.", "Medium", "All"),
  d("dare-06", "Serenade", "Sing the chorus of a song chosen by the group.", "Medium", "All"),
  d("dare-07", "Bar Shout", "Order the next round using only gestures.", "Hard", "Pub"),
  d("dare-08", "Stranger Cheers", "Cheers with a stranger nearby (with a smile).", "Hard", "Pub"),
  d("dare-09", "Dance Solo", "Bust out a 15 second dance move on the spot.", "Medium", "Club/Festival"),
  d("dare-10", "Crowd Wave", "Start a wave and get at least two strangers to join.", "Extreme", "Club/Festival"),
  d("dare-11", "Home Catwalk", "Walk a runway across the room like a supermodel.", "Easy", "Home"),
  d("dare-12", "Phone Swap", "Let the player on your right post an emoji as your status.", "Extreme", "All"),
  d("dare-14", "Trust Fall", "Do a mini trust-lean into a willing player's hands.", "Hard", "All"),
  d("dare-15", "Selfie Face", "Take the ugliest selfie you can and show the group.", "Easy", "All"),
  d("dare-16", "Group's Choice", "The group sets you a dare right now. You have to attempt it.", "Hard", "All"),
  d("dare-17", "Camera Roll", "Show the group the most recent photo on your phone.", "Extreme", "All"),
  d("dare-18", "Festival Anthem", "Sing a full verse loud enough for people nearby to hear.", "Extreme", "Club/Festival"),
  d("dare-19", "Table Toast", "Stand and give a 20 second toast to the whole table.", "Hard", "Pub"),
  d("dare-20", "Slow-Mo Entrance", "Leave and re-enter the room in dramatic slow motion for the group to score.", "Hard", "Home"),

  // -------------------------------------------------------------- Challenges
  c("chal-01", "Tongue Twister", "Say 'red lorry, yellow lorry' five times fast.", "Easy", "All"),
  c("chal-02", "Plank Off", "Hold a plank while the group counts to 20.", "Medium", "All"),
  c("chal-03", "Balance Act", "Balance an object on your head for 20 seconds.", "Medium", "Home"),
  c("chal-04", "No Teeth", "Talk without showing your teeth for one minute.", "Hard", "All"),
  c("chal-05", "Beer Mat Flip", "Flip and catch a beer mat three times in a row.", "Medium", "Pub"),
  c("chal-06", "Alphabet Names", "Name a person for each of A, B, C, D, E in 15 seconds.", "Hard", "All"),
  c("chal-07", "One Breath", "List 10 animals in a single breath.", "Medium", "All"),
  c("chal-08", "Wink Murder", "Wink at a player without anyone else noticing.", "Hard", "All"),
  c("chal-09", "Freestyle", "Rap four lines about the person to your left.", "Extreme", "All"),
  c("chal-10", "Keepy Uppy", "Keep a balloon or cushion in the air for 20 seconds.", "Easy", "Home"),
  c("chal-11", "Straight Face", "Keep a straight face while the group tries to make you laugh.", "Hard", "All"),
  c("chal-12", "Speed Spell", "Spell 'onomatopoeia' correctly out loud.", "Extreme", "All"),
  c("chal-13", "Total Recall", "Name every card played so far this game, in order.", "Hard", "All"),
  c("chal-14", "Plank Quiz", "Hold a plank while the group asks you three quick questions.", "Extreme", "All"),
  c("chal-15", "Mat Stack", "Stack five beer mats and cap them with one hand.", "Hard", "Pub"),
  c("chal-16", "Wall Handstand", "Kick up to a wall handstand and hold it for 10 seconds.", "Extreme", "Home"),

  // ---- former solo mini games, now solo Challenges -------------------------
  c("chal-17", "Coaster Toss", "Land a coaster onto an empty glass from a step away.", "Hard", "Pub"),
  c("chal-18", "Countdown", "Make the longest word from 7 random letters in 30 seconds.", "Hard", "All"),
  c("chal-19", "Staring Contest", "Win a staring contest against the player of your choice.", "Easy", "All"),
  c("chal-20", "Beatbox Battle", "Keep a beat going while the group raps over it for 20 seconds.", "Hard", "Club/Festival"),

  // ---- Mini Games (whole group plays, then pick the winner for the points) --
  m("mini-01", "Categories", "Pick a category and name things round the group. Last one who can keep going wins.", "Medium", "All"),
  m("mini-02", "Rhyme Time", "Pick a word and rhyme it round the group. Last one still rhyming wins.", "Medium", "All"),
  m("mini-03", "Word Chain", "Category word chain round the group. Last one who hasn't blanked or repeated wins.", "Hard", "All"),
  m("mini-04", "RPS Champion", "Rock-paper-scissors knockout round the group. The champion wins.", "Easy", "All"),
  m("mini-05", "Thumb War", "Best-of-three thumb war between two willing players. The winner takes it.", "Easy", "All"),
  m("mini-06", "The Floor Is Lava", "On three, feet off the floor. Group picks who got up cleanest.", "Easy", "Home"),
  m("mini-07", "Freeze Dance", "Everyone dances; freeze on command. Group picks the best.", "Medium", "Club/Festival"),

  // ---- Group Rounds (no winner - just for fun, no points) -------------------
  g("group-01", "Never Have I Ever", "One round: everyone puts a finger down for things they've done.", "Easy", "All"),
  g("group-02", "Would You Rather", "The group hits the table with a brutal 'would you rather'. Everyone answers.", "Easy", "All"),
  g("group-04", "20 Questions", "The group thinks of something; everyone guesses it in 20 questions.", "Easy", "All"),
  g("group-06", "Most Likely To", "On three, everyone points at who's most likely to do a thing the group names.", "Easy", "All"),
  g("group-07", "Hot Seat", "The group fires quick questions at the phone-holder for 30 seconds.", "Medium", "All"),
  g("group-08", "This or That", "Rapid-fire: the group shouts pairs, everyone calls out their pick.", "Easy", "All"),
  g("group-09", "Group Vote", "Vote on a silly superlative for the table. Majority wins the title.", "Easy", "All"),

  // ---- Ongoing (start now, keep it up until your next turn, checked then) ---
  o("ongoing-01", "Accent", "Speak in a fake accent until your next turn.", "Easy", "All"),
  o("ongoing-02", "Whisper Only", "Only whisper until your next turn.", "Easy", "All"),
  o("ongoing-03", "One-Word Answers", "Answer only in single words until your next turn.", "Medium", "All"),
  o("ongoing-04", "Slow Motion", "Do everything in slow motion until your next turn.", "Medium", "All"),
  o("ongoing-05", "No Names", "Don't say anyone's name until your next turn.", "Hard", "All"),
  o("ongoing-06", "Third Person", "Refer to yourself in the third person until your next turn.", "Medium", "All"),
  o("ongoing-07", "Stand to Speak", "Stand up every time you speak until your next turn.", "Medium", "Home"),
  o("ongoing-08", "Posh Voice", "Speak in your poshest voice until your next turn.", "Easy", "Pub"),
  o("ongoing-09", "Hype Master", "Hype up every song that plays until your next turn.", "Medium", "Club/Festival"),
];

// --- tiny builders to keep the list above readable --------------------------

function make(
  id: string,
  category: Card["category"],
  title: string,
  description: string,
  difficulty: Card["difficulty"],
  location: Card["location"],
): Card {
  return { id, title, description, category, difficulty, location };
}

function t(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Truth", title, description, difficulty, location);
}
function d(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Dare", title, description, difficulty, location);
}
function c(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Challenge", title, description, difficulty, location);
}
function m(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Mini Game", title, description, difficulty, location);
}
function g(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Group Round", title, description, difficulty, location);
}
function o(id: string, title: string, description: string, difficulty: Card["difficulty"], location: Card["location"]) {
  return make(id, "Ongoing", title, description, difficulty, location);
}
