import { DEFAULT_CARDS } from "../data/defaultCards";
import {
  CARD_LOCATIONS,
  CATEGORIES,
  DIFFICULTIES,
  type Card,
  type Settings,
} from "../types";

const CARDS_KEY = "riskit.cards.v1";
const SETTINGS_KEY = "riskit.settings.v1";

const DEFAULT_SETTINGS: Settings = { drinkModeDefault: false };

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- Cards

export function loadCards(): Card[] {
  const stored = safeParse<unknown>(localStorage.getItem(CARDS_KEY));
  const cards = sanitizeCards(stored);
  return cards ?? DEFAULT_CARDS.map((c) => ({ ...c }));
}

export function saveCards(cards: Card[]): void {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function resetCards(): Card[] {
  const fresh = DEFAULT_CARDS.map((c) => ({ ...c }));
  saveCards(fresh);
  return fresh;
}

/**
 * Validate an unknown value into a Card[]. Returns null if it isn't a usable
 * array of cards. Used for both stored data and JSON imports, so malformed
 * input never corrupts the library.
 */
export function sanitizeCards(value: unknown): Card[] | null {
  if (!Array.isArray(value)) return null;
  const cards: Card[] = [];
  for (const item of value) {
    const card = sanitizeCard(item);
    if (card) cards.push(card);
  }
  return cards.length > 0 ? cards : null;
}

function sanitizeCard(value: unknown): Card | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const title = typeof v.title === "string" ? v.title.trim() : "";
  const description = typeof v.description === "string" ? v.description.trim() : "";
  if (!title || !description) return null;
  if (!isOneOf(v.category, CATEGORIES)) return null;
  if (!isOneOf(v.difficulty, DIFFICULTIES)) return null;
  if (!isOneOf(v.location, CARD_LOCATIONS)) return null;
  return {
    id: typeof v.id === "string" && v.id ? v.id : makeId(),
    title,
    description,
    category: v.category,
    difficulty: v.difficulty,
    location: v.location,
    enabled: v.enabled !== false,
    ...(v.doublesNext === true ? { doublesNext: true } : {}),
  };
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

// ---------------------------------------------------------------- Settings

export function loadSettings(): Settings {
  const stored = safeParse<Partial<Settings>>(localStorage.getItem(SETTINGS_KEY));
  return {
    drinkModeDefault:
      typeof stored?.drinkModeDefault === "boolean"
        ? stored.drinkModeDefault
        : DEFAULT_SETTINGS.drinkModeDefault,
  };
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ---------------------------------------------------------------- Ids

export function makeId(): string {
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
