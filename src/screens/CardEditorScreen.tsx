import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CARD_LOCATIONS,
  CATEGORIES,
  DIFFICULTIES,
  isScoringCategory,
  type Card,
  type Category,
} from "../types";
import {
  Button,
  CATEGORY_DESCRIPTION,
  CATEGORY_ICON,
  CATEGORY_SHORT,
  DifficultyBadge,
} from "../components/ui";
import { GameCard } from "../components/GameCard";
import { makeId, sanitizeCards } from "../storage/localStorage";

type Draft = Omit<Card, "id"> & { id?: string };

function blankDraft(category: Category): Draft {
  return {
    title: "",
    description: "",
    category,
    difficulty: "Easy",
    location: "All",
  };
}

/** A single-select row of tappable options (used instead of dropdowns). */
function ChipSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
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
          {opt}
        </button>
      ))}
    </div>
  );
}

export function CardEditorScreen({
  cards,
  onChange,
  onReset,
  onBack,
  onToast,
}: {
  cards: Card[];
  onChange: (cards: Card[]) => void;
  onReset: () => void;
  onBack: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [filter, setFilter] = useState<Category>("Truth");
  const [draft, setDraft] = useState<Draft | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => cards.filter((c) => c.category === filter),
    [cards, filter],
  );

  const upsert = (value: Draft) => {
    if (!value.title.trim() || !value.description.trim()) {
      onToast("Title and description are required", true);
      return;
    }
    if (value.id) {
      onChange(
        cards.map((c) =>
          c.id === value.id ? ({ ...value, id: value.id } as Card) : c,
        ),
      );
    } else {
      onChange([...cards, { ...value, id: makeId() } as Card]);
    }
    setDraft(null);
    onToast("Card saved");
  };

  const remove = (id: string) => {
    onChange(cards.filter((c) => c.id !== id));
    setDraft(null);
    onToast("Card deleted");
  };

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
      const parsed = sanitizeCards(JSON.parse(text));
      if (!parsed) {
        onToast("No valid cards in that file", true);
        return;
      }
      onChange(parsed);
      onToast(`Imported ${parsed.length} cards`);
    } catch {
      onToast("Could not read that file", true);
    }
  };

  if (draft) {
    return (
      <CardForm
        draft={draft}
        onSave={upsert}
        onCancel={() => setDraft(null)}
        onDelete={draft.id ? () => remove(draft.id!) : undefined}
      />
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>Card Editor</h2>
      </div>

      <div className="cat-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={"cat-tab" + (filter === cat ? " cat-tab--active" : "")}
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
          >
            <span className="cat-tab__icon">{CATEGORY_ICON[cat]}</span>
            <span className="cat-tab__label">{CATEGORY_SHORT[cat]}</span>
          </button>
        ))}
      </div>

      <p className="cat-desc">{CATEGORY_DESCRIPTION[filter]}</p>

      <Button variant="primary" block onClick={() => setDraft(blankDraft(filter))}>
        + Add {filter}
      </Button>

      <div className="stack--sm">
        {visible.length === 0 && <p className="muted">No {filter} cards yet.</p>}
        {visible.map((card) => (
          <button
            key={card.id}
            className="editor-item__main"
            onClick={() => setDraft(card)}
          >
            <span className="editor-item__body">
              <span className="editor-item__titlerow">
                <span className="editor-item__title">{card.title}</span>
                <span className="editor-item__edit">✎ Edit</span>
              </span>
              <span className="editor-item__desc">{card.description}</span>
              <span className="editor-item__meta">
                {isScoringCategory(card.category) ? (
                  <DifficultyBadge difficulty={card.difficulty} />
                ) : (
                  <span className="editor-item__nopts">No points</span>
                )}
                <span className="editor-item__loc">{card.location}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="spacer" />
      <div className="section-title">Backup</div>
      <div className="btn-row">
        <Button variant="secondary" onClick={exportCards}>
          ⇩ Export
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          ⇧ Import
        </Button>
      </div>
      <Button variant="danger" block onClick={onReset}>
        ↺ Reset Cards to Default
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

function CardForm({
  draft,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: Draft;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [value, setValue] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(key: K, v: Draft[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  // Grow the description box to fit its text so the whole prompt is visible.
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
    title: value.title.trim() || "Card title",
    description: value.description.trim() || "Card description shows here…",
    category: value.category,
    difficulty: value.difficulty,
    location: value.location,
  };

  const confirmDelete = () => {
    if (onDelete && window.confirm(`Delete "${value.title || "this card"}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ←
        </button>
        <h2>{draft.id ? "Edit Card" : "New Card"}</h2>
      </div>

      <div className="section-title">Preview</div>
      <GameCard card={preview} />

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={value.title}
          maxLength={40}
          autoFocus
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          ref={descRef}
          className="textarea--grow"
          value={value.description}
          maxLength={240}
          onChange={(e) => set("description", e.target.value)}
        />
        <span className="field__count">{value.description.length}/240</span>
      </div>

      <div className="field">
        <label>Category</label>
        <ChipSelect
          options={CATEGORIES}
          value={value.category}
          onChange={(c) => set("category", c)}
        />
        <span className="field__hint">{CATEGORY_DESCRIPTION[value.category]}</span>
      </div>

      {isScoringCategory(value.category) ? (
        <div className="field">
          <label>Difficulty</label>
          <ChipSelect
            options={DIFFICULTIES}
            value={value.difficulty}
            onChange={(d) => set("difficulty", d)}
          />
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          {value.category} cards award no points — everyone just joins in.
        </p>
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
          🗑 Delete
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
