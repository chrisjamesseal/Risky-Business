import { DEFAULT_CARDS } from "../data/defaultCards";
import { DEFAULT_CATEGORIES } from "../data/categories";
import {
  CARD_LOCATIONS,
  CATEGORY_BEHAVIORS,
  DIFFICULTIES,
  DURATIONS,
  type Card,
  type CardLocation,
  type CategoryDef,
  type Duration,
} from "../types";

/** Maps old location names to their current equivalents, so libraries
 * customised before the rename keep working without losing cards. */
const LEGACY_LOCATIONS: Record<string, CardLocation> = {
  Home: "At Home",
  Pub: "Pub Trip",
  "Club/Festival": "Night Out",
};

/** Maps old minute-based durations to their round-based equivalents. */
const LEGACY_DURATIONS: Record<string, Duration> = {
  "1 min": "1 round",
  "2 min": "2 rounds",
  "5 min": "3 rounds",
  "Until next turn": "Next round",
};

const CARDS_KEY = "riskit.cards.v1";
const CATEGORIES_KEY = "riskit.categories.v1";
const META_KEY = "riskit.library.meta.v1";

/**
 * Bump this whenever the default cards or categories change. Devices that
 * haven't customised their library will pull in the new defaults automatically
 * on the next load; customised libraries are left untouched.
 */
export const LIBRARY_VERSION = 9;

interface LibraryMeta {
  version: number;
  customized: boolean;
}

export interface Library {
  cards: Card[];
  categories: CategoryDef[];
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function defaults(): Library {
  return {
    cards: DEFAULT_CARDS.map((c) => ({ ...c })),
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
  };
}

function persist(lib: Library, meta: LibraryMeta): Library {
  localStorage.setItem(CARDS_KEY, JSON.stringify(lib.cards));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(lib.categories));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  return lib;
}

/**
 * Load the card library, auto-updating to the latest defaults when the app has
 * shipped new default questions and the player hasn't customised their set.
 */
export function loadLibrary(): Library {
  const meta = safeParse<Partial<LibraryMeta>>(localStorage.getItem(META_KEY));
  const hasStored =
    localStorage.getItem(CARDS_KEY) !== null ||
    localStorage.getItem(CATEGORIES_KEY) !== null;

  // Fresh install.
  if (!hasStored) {
    return persist(defaults(), { version: LIBRARY_VERSION, customized: false });
  }

  const customized = meta?.customized === true;

  // Not customised and the defaults have moved on -> refresh to the latest.
  if (!customized && meta?.version !== LIBRARY_VERSION) {
    return persist(defaults(), { version: LIBRARY_VERSION, customized: false });
  }

  // Otherwise keep the player's stored library.
  const categories =
    sanitizeCategories(safeParse<unknown>(localStorage.getItem(CATEGORIES_KEY))) ??
    defaults().categories;
  const cards =
    sanitizeCards(
      safeParse<unknown>(localStorage.getItem(CARDS_KEY)),
      new Set(categories.map((c) => c.name)),
    ) ?? defaults().cards;
  return { cards, categories };
}

/** Mark the library as user-customised so it won't be auto-overwritten. */
export function markCustomized(): void {
  localStorage.setItem(
    META_KEY,
    JSON.stringify({ version: LIBRARY_VERSION, customized: true }),
  );
}

export function saveCards(cards: Card[]): void {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function saveCategories(categories: CategoryDef[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

/** Restore the default cards and categories, clearing the customised flag. */
export function resetLibrary(): Library {
  return persist(defaults(), { version: LIBRARY_VERSION, customized: false });
}

// ---------------------------------------------------------- Sanitisers

export function sanitizeCategories(value: unknown): CategoryDef[] | null {
  if (!Array.isArray(value)) return null;
  const out: CategoryDef[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const cat = sanitizeCategory(item);
    if (cat && !seen.has(cat.name)) {
      seen.add(cat.name);
      out.push(cat);
    }
  }
  return out.length > 0 ? out : null;
}

function sanitizeCategory(value: unknown): CategoryDef | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const name = typeof v.name === "string" ? v.name.trim() : "";
  if (!name) return null;
  if (!isOneOf(v.behavior, CATEGORY_BEHAVIORS)) return null;
  return {
    name,
    behavior: v.behavior,
    icon: typeof v.icon === "string" && v.icon ? v.icon : "🎴",
    color: typeof v.color === "string" && v.color ? v.color : "var(--cyan)",
    description: typeof v.description === "string" ? v.description : "",
  };
}

/**
 * Validate an unknown value into a Card[]. Cards referencing a category not in
 * `validNames` are dropped. Returns null if nothing usable remains.
 */
export function sanitizeCards(
  value: unknown,
  validNames: Set<string>,
): Card[] | null {
  if (!Array.isArray(value)) return null;
  const cards: Card[] = [];
  for (const item of value) {
    const card = sanitizeCard(item, validNames);
    if (card) cards.push(card);
  }
  return cards.length > 0 ? cards : null;
}

function sanitizeCard(value: unknown, validNames: Set<string>): Card | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const description = typeof v.description === "string" ? v.description.trim() : "";
  if (!description) return null;
  if (typeof v.category !== "string" || !validNames.has(v.category)) return null;
  if (!isOneOf(v.difficulty, DIFFICULTIES)) return null;
  const rawLocation =
    typeof v.location === "string" && v.location in LEGACY_LOCATIONS
      ? LEGACY_LOCATIONS[v.location]
      : v.location;
  if (!isOneOf(rawLocation, CARD_LOCATIONS)) return null;
  const card: Card = {
    id: typeof v.id === "string" && v.id ? v.id : makeId(),
    description,
    category: v.category,
    difficulty: v.difficulty,
    location: rawLocation,
  };
  const rawDuration =
    typeof v.duration === "string" && v.duration in LEGACY_DURATIONS
      ? LEGACY_DURATIONS[v.duration]
      : v.duration;
  if (isOneOf(rawDuration, DURATIONS)) card.duration = rawDuration;
  return card;
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function makeId(): string {
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
