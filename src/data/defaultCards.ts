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
  c("truth-01", "Truth", "What was your honest first impression of the player to your left?", "Easy", "All"),
  c("truth-02", "Truth", "Name a song or artist you love but would be embarrassed to admit.", "Easy", "All"),
  c("truth-03", "Truth", "Read out the last thing you searched on your phone.", "Easy", "All"),
  c("truth-04", "Truth", "Read out the last thing you searched on your phone... in your private browser.", "Medium", "All"),
  c("truth-05", "Truth", "Describe your worst ever date.", "Medium", "All"),
  c("truth-06", "Truth", "What's a fear you've never told anyone here?", "Medium", "All"),
  c("truth-07", "Truth", "Tell everyone about the last white lie you told.", "Medium", "All"),
  c("truth-08", "Truth", "Rank the other players by who you'd trust with your phone unlocked.", "Easy", "All"),
  c("truth-09", "Truth", "Share a small decision you still regret.", "Easy", "All"),
  c("truth-10", "Truth", "What is your biggest regret?", "Hard", "All"),
  c("truth-11", "Truth", "What's the most you've ever spent on a night out?", "Medium", "Pub Trip"),
  c("truth-12", "Truth", "Have you ever pretended to know a song at a club? Confess.", "Easy", "Night Out"),
  c("truth-13", "Truth", "What's the weirdest story about someone that you know?", "Medium", "At Home"),
  c("truth-14", "Truth", "Tell a story about a festival or gig experience.", "Easy", "All"),
  c("truth-15", "Truth", "Tell two truths and one lie. Let the group guess the lie.", "Medium", "All"),
  c("truth-16", "Truth", "What is your go-to karaoke song?", "Easy", "All"),

  // -------------------------------------------------------------- Dares
  c("dare-01", "Dare", "Give every player a unique compliment.", "Easy", "All"),
  c("dare-02", "Dare", "Let the player on your left send a message from your phone to anyone they want.", "Hard", "All"),
  c("dare-03", "Dare", "Let the player on your right post a photo to your story with a caption of their choice.", "Hard", "All"),
  c("dare-04", "Dare", "Do an impression of another player until someone guesses who.", "Medium", "All"),
  c("dare-06", "Dare", "Cheers with a stranger nearby.", "Hard", "Pub Trip"),
  c("dare-07", "Dare", "Bust out a 15 second dance on the spot.", "Hard", "All"),
  c("dare-08", "Dare", "Start a wave and get at least two strangers to join.", "Hard", "Night Out"),
  c("dare-09", "Dare", "Walk a runway across the room like a supermodel.", "Medium", "At Home"),
  c("dare-10", "Dare", "Do a mini trust lean into a willing player's hands.", "Hard", "All"),
  c("dare-11", "Dare", "Take the ugliest selfie you can and show the group.", "Medium", "All"),
  c("dare-12", "Dare", "Do your best lion roar. The cringier the better.", "Easy", "All"),
  c("chal-01", "Dare", `Say "Red lorry, yellow lorry" five times fast.`, "Easy", "All"),
  c("chal-03", "Dare", "Talk without showing your teeth for one minute.", "Hard", "All"),
  c("chal-06", "Dare", "Rap four lines about the person to your left.", "Medium", "All"),
  c("chal-07", "Dare", "Keep a straight face while the group tries to make you laugh for 30 seconds.", "Medium", "All"),
  c("chal-08", "Dare", `Spell "onomatopoeia" correctly out loud.`, "Medium", "All"),
  c("chal-11", "Dare", "Cover your eyes and ears. The group thinks of a country. Guess it within 2 minutes to win.", "Medium", "All"),

  // -------------------------------------------------------------- Tasks
  c("dare-05", "Task", "You are now stuck on mute for 1 round.", "Easy", "All"),
  c("task-01", "Task", "Speak in a fake accent until your next turn.", "Medium", "All"),
  c("task-02", "Task", "Freeze like a statue for the next round. Your mouth can still move though if needed.", "Hard", "All"),
  c("task-03", "Task", "Speak like Donald Trump for the next round.", "Medium", "All"),
  c("task-04", "Task", "Wink at a player and get their attention without anyone else noticing.", "Hard", "All"),
  c("card-mrlbn5dw-4x8zkh", "Task", `DON’T READ THIS OUT LOUD - Don’t talk after this round until your next turn. READ THIS OUT LOUD - What’s the funniest thing that’s happened to someone you know?`, "Medium", "All"),

  // -------------------------------------------------------------- Secret
  c("card-mrqy5dkx-7dn1ji", "Secret", "Pretend to sneeze 3 times back to back without someone questioning why.", "Medium", "All", "Next round"),
];

function c(
  id: string,
  category: Card["category"],
  description: string,
  difficulty: Card["difficulty"],
  location: Card["location"],
  duration?: Card["duration"],
): Card {
  return { id, description, category, difficulty, location, ...(duration ? { duration } : {}) };
}
