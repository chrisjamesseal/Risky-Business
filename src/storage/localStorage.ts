import { DEFAULT_CARDS } from "../data/defaultCards";
import { DEFAULT_CATEGORIES } from "../data/categories";
import {
  CARD_LOCATIONS,
  CATEGORY_BEHAVIORS,
  DIFFICULTIES,
  type Card,
  type CategoryDef,
} from "../types";

const CARDS_KEY = "riskit.cards.v1";
const CATEGORIES_KEY = "riskit.categories.v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------ Categories

export function loadCategories(): CategoryDef[] {
  const stored = sanitizeCategories(
    safeParse<unknown>(localStorage.getItem(CATEGORIES_KEY)),
  );
  return stored ?? DEFAULT_CATEGORIES.map((c) => ({ ...c }));
}

export function saveCategories(categories: CategoryDef[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function resetCategories(): CategoryDef[] {
  const fresh = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  saveCategories(fresh);
  return fresh;
}

function sanitizeCategories(value: unknown): CategoryDef[] | null {
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

// ---------------------------------------------------------------- Cards

export function loadCards(categories: readonly CategoryDef[]): Card[] {
  const stored = safeParse<unknown>(localStorage.getItem(CARDS_KEY));
  const cards = sanitizeCards(stored, categoryNames(categories));
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

function categoryNames(categories: readonly CategoryDef[]): Set<string> {
  return new Set(categories.map((c) => c.name));
}

/**
 * Validate an unknown value into a Card[]. Cards referencing a category not in
 * `validNames` are dropped. Returns null if nothing usable remains. Used for
 * both stored data and JSON imports, so malformed input never corrupts things.
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
  const title = typeof v.title === "string" ? v.title.trim() : "";
  const description = typeof v.description === "string" ? v.description.trim() : "";
  if (!title || !description) return null;
  if (typeof v.category !== "string" || !validNames.has(v.category)) return null;
  if (!isOneOf(v.difficulty, DIFFICULTIES)) return null;
  if (!isOneOf(v.location, CARD_LOCATIONS)) return null;
  return {
    id: typeof v.id === "string" && v.id ? v.id : makeId(),
    title,
    description,
    category: v.category,
    difficulty: v.difficulty,
    location: v.location,
  };
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

// ---------------------------------------------------------------- Ids

export function makeId(): string {
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
