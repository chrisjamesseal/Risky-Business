import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BEHAVIOR_LABEL,
  CARD_LOCATIONS,
  CATEGORY_BEHAVIORS,
  CATEGORY_COLORS,
  DIFFICULTIES,
  DURATIONS,
  isScoringBehavior,
  type Card,
  type CategoryBehavior,
  type CategoryDef,
} from "../types";
import { Button, DifficultyBadge } from "../components/ui";
import { GameCard } from "../components/GameCard";
import { CategoriesProvider } from "../state/CategoriesContext";
import { makeId, sanitizeCards } from "../storage/localStorage";

type Draft = Omit<Card, "id"> & { id?: string };

function blankDraft(category: string): Draft {
  return { description: "", category, difficulty: "Easy", location: "All" };
}

/** A single-select row of tappable options (used instead of dropdowns). */
function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="chip-row">
      {options.map((opt) => (
        <button
          key={opt}
          className={"chip" + (value === opt ? " chip--active" : "")}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

export function CardEditorScreen({
  cards,
  categories,
  onChange,
  onChangeCategories,
  onReset,
  onBack,
  onToast,
}: {
  cards: Card[];
  categories: CategoryDef[];
  onChange: (cards: Card[]) => void;
  onChangeCategories: (categories: CategoryDef[]) => void;
  onReset: () => void;
  onBack: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [filterName, setFilterName] = useState(categories[0]?.name ?? "");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [catDraft, setCatDraft] = useState<CatDraft | null>(null);
  const [search, setSearch] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Keep the active tab valid if categories change underneath us.
  const filter =
    categories.find((c) => c.name === filterName)?.name ??
    categories[0]?.name ??
    "";
  const activeCategory = categories.find((c) => c.name === filter);

  const searching = search.trim().length > 0;
  const visible = useMemo(() => {
    if (searching) {
      const term = search.trim().toLowerCase();
      return cards.filter((c) => c.description.toLowerCase().includes(term));
    }
    return cards.filter((c) => c.category === filter);
  }, [cards, filter, search, searching]);

  const upsert = (value: Draft) => {
    if (!value.description.trim()) {
      onToast("Description is required", true);
      return;
    }
    if (value.id) {
      onChange(
        cards.map((c) => (c.id === value.id ? ({ ...value, id: value.id } as Card) : c)),
      );
    } else {
      onChange([...cards, { ...value, id: makeId() } as Card]);
    }
    setDraft(null);
    onToast("Card saved");
  };

  const removeCard = (id: string) => {
    onChange(cards.filter((c) => c.id !== id));
    setDraft(null);
    onToast("Card deleted");
  };

  // --- category management --------------------------------------------------

  const saveCategory = (value: CatDraft) => {
    const name = value.name.trim();
    if (!name) {
      onToast("Category needs a name", true);
      return;
    }
    const clash = categories.some(
      (c) => c.name === name && c.name !== value.originalName,
    );
    if (clash) {
      onToast("A category with that name already exists", true);
      return;
    }
    const def: CategoryDef = {
      name,
      behavior: value.behavior,
      icon: value.icon.trim() || "🎴",
      color: value.color,
      description: value.description.trim(),
    };

    if (value.originalName) {
      onChangeCategories(
        categories.map((c) => (c.name === value.originalName ? def : c)),
      );
      // Re-point existing cards if the category was renamed.
      if (name !== value.originalName) {
        onChange(
          cards.map((c) =>
            c.category === value.originalName ? { ...c, category: name } : c,
          ),
        );
      }
    } else {
      onChangeCategories([...categories, def]);
    }
    setFilterName(name);
    setCatDraft(null);
    onToast("Category saved");
  };

  const deleteCategory = (name: string) => {
    const count = cards.filter((c) => c.category === name).length;
    if (categories.length <= 1) {
      onToast("Keep at least one category", true);
      return;
    }
    if (
      !window.confirm(
        `Delete the "${name}" category and its ${count} card${count === 1 ? "" : "s"}?`,
      )
    ) {
      return;
    }
    const remaining = categories.filter((c) => c.name !== name);
    onChangeCategories(remaining);
    onChange(cards.filter((c) => c.category !== name));
    setFilterName(remaining[0]?.name ?? "");
    setCatDraft(null);
    onToast("Category deleted");
  };

  const newCategory = () => {
    const used = new Set(categories.map((c) => c.color));
    const color = CATEGORY_COLORS.find((c) => !used.has(c)) ?? CATEGORY_COLORS[0];
    setCatDraft({
      name: "",
      behavior: "standard",
      icon: "🎴",
      color,
      description: "",
    });
  };

  // --- backup ---------------------------------------------------------------

  const exportCards = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-it-cards.json";
    a.click();
    URL.revokeObjectURL(url);
    onToast("Cards exported");
  };

  const importCards = async (file: File) => {
    try {
      const text = await file.text();
      const names = new Set(categories.map((c) => c.name));
      const parsed = sanitizeCards(JSON.parse(text), names);
      if (!parsed) {
        onToast("No cards matching your categories in that file", true);
        return;
      }
      onChange(parsed);
      onToast(`Imported ${parsed.length} cards`);
    } catch {
      onToast("Could not read that file", true);
    }
  };

  if (catDraft) {
    return (
      <CategoryForm
        draft={catDraft}
        onSave={saveCategory}
        onCancel={() => setCatDraft(null)}
        onDelete={
          catDraft.originalName
            ? () => deleteCategory(catDraft.originalName!)
            : undefined
        }
      />
    );
  }

  if (draft) {
    return (
      <CategoriesProvider categories={categories}>
        <CardForm
          draft={draft}
          categories={categories}
          onSave={upsert}
          onCancel={() => setDraft(null)}
          onDelete={draft.id ? () => removeCard(draft.id!) : undefined}
        />
      </CategoriesProvider>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ⬅️
        </button>
        <h2>Card Editor</h2>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search all cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {!searching && (
        <>
          <div className="cat-tabs">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={"cat-tab" + (filter === cat.name ? " cat-tab--active" : "")}
                onClick={() => setFilterName(cat.name)}
                aria-pressed={filter === cat.name}
              >
                <span className="cat-tab__icon">{cat.icon}</span>
                <span className="cat-tab__label">{cat.name}</span>
              </button>
            ))}
          </div>

          {activeCategory && <p className="cat-desc">{activeCategory.description}</p>}

          <div className="btn-row">
            <Button variant="outline" onClick={() => activeCategory && setCatDraft({ ...activeCategory, originalName: activeCategory.name })}>
              ✏️ Edit Category
            </Button>
            <Button variant="outline" onClick={newCategory}>
              ➕ New Category
            </Button>
          </div>

          <Button variant="primary" block onClick={() => setDraft(blankDraft(filter))}>
            ➕ Add {filter} card
          </Button>
        </>
      )}

      <div className="stack--sm">
        {searching && (
          <p className="muted" style={{ fontSize: 11 }}>
            {visible.length} result{visible.length === 1 ? "" : "s"} across all categories
          </p>
        )}
        {visible.length === 0 && (
          <p className="muted">{searching ? "No cards match your search." : `No ${filter} cards yet.`}</p>
        )}
        {visible.map((card) => {
          const cardCategory = categories.find((c) => c.name === card.category);
          return (
            <button
              key={card.id}
              className="editor-item__main"
              onClick={() => setDraft(card)}
            >
              <span className="editor-item__body">
                <span className="editor-item__titlerow">
                  <span className="editor-item__desc editor-item__desc--main">
                    {card.description}
                  </span>
                  <span className="editor-item__edit">✏️ Edit</span>
                </span>
                <span className="editor-item__meta">
                  {searching && cardCategory && (
                    <span className="editor-item__cat">
                      {cardCategory.icon} {cardCategory.name}
                    </span>
                  )}
                  {cardCategory && isScoringBehavior(cardCategory.behavior) ? (
                    <DifficultyBadge difficulty={card.difficulty} />
                  ) : (
                    <span className="editor-item__nopts">No points</span>
                  )}
                  <span className="editor-item__loc">{card.location}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="spacer" />
      <div className="section-title">Backup</div>
      <div className="btn-row">
        <Button variant="secondary" onClick={exportCards}>
          ⬇️ Export
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          ⬆️ Import
        </Button>
      </div>
      <Button variant="danger" block onClick={onReset}>
        ♻️ Reset to Default
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importCards(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// --------------------------------------------------------------- Category form

interface CatDraft extends CategoryDef {
  originalName?: string;
}

function CategoryForm({
  draft,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: CatDraft;
  onSave: (draft: CatDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [value, setValue] = useState<CatDraft>(draft);
  const set = <K extends keyof CatDraft>(key: K, v: CatDraft[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ⬅️
        </button>
        <h2>{draft.originalName ? "Edit Category" : "New Category"}</h2>
      </div>

      <div className="field">
        <label htmlFor="cname">Name</label>
        <input
          id="cname"
          type="text"
          value={value.name}
          maxLength={20}
          autoFocus
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="cicon">Icon (emoji)</label>
        <input
          id="cicon"
          type="text"
          value={value.icon}
          maxLength={2}
          onChange={(e) => set("icon", e.target.value)}
        />
      </div>

      <div className="field">
        <label>How it plays</label>
        <div className="chip-col">
          {CATEGORY_BEHAVIORS.map((b) => (
            <button
              key={b}
              className={"chip" + (value.behavior === b ? " chip--active" : "")}
              onClick={() => set("behavior", b as CategoryBehavior)}
              aria-pressed={value.behavior === b}
            >
              {BEHAVIOR_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="cdesc">Description</label>
        <input
          id="cdesc"
          type="text"
          value={value.description}
          maxLength={120}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      {onDelete && (
        <Button variant="danger" onClick={onDelete}>
          🗑️ Delete category &amp; its cards
        </Button>
      )}

      <div className="spacer" />
      <div className="btn-row">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(value)}>
          Save
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- Card form

function CardForm({
  draft,
  categories,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: Draft;
  categories: CategoryDef[];
  onSave: (draft: Draft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [value, setValue] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(key: K, v: Draft[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  const behavior =
    categories.find((c) => c.name === value.category)?.behavior ?? "standard";
  const scoring = isScoringBehavior(behavior);
  const categoryNames = categories.map((c) => c.name);

  const descRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + borders}px`;
  }, [value.description]);

  const preview: Card = {
    id: value.id ?? "preview",
    description: value.description.trim() || "Card description shows here...",
    category: value.category,
    difficulty: value.difficulty,
    location: value.location,
    duration: value.duration,
  };

  const confirmDelete = () => {
    if (onDelete && window.confirm("Delete this card?")) {
      onDelete();
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ⬅️
        </button>
        <h2>{draft.id ? "Edit Card" : "New Card"}</h2>
      </div>

      <div className="section-title">Preview</div>
      <GameCard card={preview} playerName="Player Name" />

      <div className="field">
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          ref={descRef}
          className="textarea--grow"
          value={value.description}
          maxLength={240}
          autoFocus
          onChange={(e) => set("description", e.target.value)}
        />
        <span className="field__count">{value.description.length}/240</span>
        <span className="field__hint">
          Tip: use {"{opponent}"} to insert a random other player's name, e.g.
          "Arm wrestle {"{opponent}"}."
        </span>
      </div>

      <div className="field">
        <label>Category</label>
        <ChipSelect
          options={categoryNames}
          value={value.category}
          onChange={(c) => set("category", c)}
        />
      </div>

      {scoring ? (
        <div className="field">
          <label>Difficulty</label>
          <div className="chip-row">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={
                  "chip chip--diff-" +
                  d +
                  (value.difficulty === d ? " chip--active" : "")
                }
                onClick={() => set("difficulty", d)}
                aria-pressed={value.difficulty === d}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          {value.category} cards award no points.
        </p>
      )}

      {behavior === "ongoing" && (
        <div className="field">
          <label>Duration</label>
          <ChipSelect
            options={DURATIONS}
            value={value.duration ?? "Until next turn"}
            onChange={(dur) => set("duration", dur)}
          />
        </div>
      )}

      <div className="field">
        <label>Location</label>
        <ChipSelect
          options={CARD_LOCATIONS}
          value={value.location}
          onChange={(l) => set("location", l)}
        />
      </div>

      {onDelete && (
        <Button variant="danger" onClick={confirmDelete}>
          🗑️ Delete
        </Button>
      )}

      <div className="spacer" />
      <div className="btn-row">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(value)}>
          Save
        </Button>
      </div>
    </div>
  );
}
