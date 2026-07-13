import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CategoryBehavior, CategoryDef } from "../types";

interface CategoriesContextValue {
  categories: CategoryDef[];
  byName: (name: string) => CategoryDef | undefined;
}

const FALLBACK: CategoryDef = {
  name: "Card",
  behavior: "standard",
  icon: "🎴",
  color: "var(--cyan)",
  description: "",
};

const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  byName: () => undefined,
});

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: CategoryDef[];
  children: ReactNode;
}) {
  const value = useMemo<CategoriesContextValue>(
    () => ({
      categories,
      byName: (name) => categories.find((c) => c.name === name),
    }),
    [categories],
  );
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}

/** A category's definition, falling back to sensible defaults if unknown. */
export function useCategory(name: string): CategoryDef {
  const { byName } = useCategories();
  return byName(name) ?? { ...FALLBACK, name };
}

export function behaviorOf(
  categories: CategoryDef[],
  name: string,
): CategoryBehavior {
  return categories.find((c) => c.name === name)?.behavior ?? "standard";
}
